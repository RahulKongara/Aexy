import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import aiService from './aiService';

interface AuthenticatedWS extends WebSocket {
    userId?: string;
    conId?: string;
    isAlive?: boolean;
}

interface WSMsg {
    type: 'start' | 'message' | 'end';
    conId?: string;
    scenario?: string;
    content?: string;
}

export class WebSocketService {
    private wss: WebSocketServer | null = null;
    private clients: Map<string, AuthenticatedWS> = new Map();

    initialize(server: HTTPServer): void {
        this.wss = new WebSocketServer({ server, path: '/ws' });

        this.wss.on('connection', async (ws: AuthenticatedWS, req) => {
            console.log(' + New Websocket connection attempt');

            const url = new URL(req.url!, `http://${req.headers.host}`);
            const token = url.searchParams.get('token');

            if (!token) {
                ws.close(4001, 'No token provided');
                return;
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
                ws.userId = decoded.userId;
                ws.isAlive = true;

                this.clients.set(decoded.userId, ws);
                console.log(`User ${decoded.userId} connected.`);

                ws.on('message', (data) => this.handleMsg(ws, data));
                ws.on('close', () => this.handleClose(ws));
                ws.on('pong', () => {
                    ws.isAlive = true;
                });

                ws.send(JSON.stringify({ type: 'connected', userId: decoded.userId }));
            } catch (e) {
                console.error('Websocket auth error:', e);
                ws.close(4002, 'Invalid token');
            }
        });

        const interval = setInterval(() => {
            this.wss?.clients.forEach((ws: WebSocket) => {
                const client = ws as AuthenticatedWS;
                if (client.isAlive === false) {
                    return client.terminate();
                }
                client.isAlive = false;
                client.ping();
            });
        }, 30000);

        this.wss.on('close', () => {
            clearInterval(interval);
        });

        console.log('Websocket server initialized on /ws');
    }

    private async handleMsg(ws: AuthenticatedWS, data: Buffer): Promise<void> {
        try {
            const message: WSMsg = JSON.parse(data.toString());

            switch(message.type) {
                case 'start':
                    await this.handleStartConvo(ws, message);
                    break;
                case 'message':
                    await this.handleUserMsg(ws, message);
                    break;
                case 'end':
                    await this.handleEndConvo(ws, message);
                    break;
                default:
                    ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
            }
        } catch (error) {
            console.error('Websocket message error:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    }

    private async handleStartConvo(
        ws: AuthenticatedWS,
        message: WSMsg
    ): Promise<void> {
        if (!ws.userId) return;

        try {
            const convo = await prisma.conversation.create({
                data: {
                    userId: ws.userId,
                    scenario: message.scenario || null,
                },
            });

            ws.conId = convo.id;

            ws.send(JSON.stringify({
                type: 'conversation_started',
                conId: convo.id,
                scenario: convo.scenario,

            }));

            const greeting = `Hello! I'm ready to help you practice. Let's start!`;

            await prisma.msg.create({
                data: {
                    conId: convo.id,
                    sender: 'ai',
                    content: greeting,
                },
            });

            ws.send(JSON.stringify({
                type: 'ai_message',
                content: greeting,
                timestamp: new Date().toISOString(),
            }));
        } catch (e) {
            console.error('Start Conversation error:', e);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to start conversation'
            }));
        }
    }

    private async handleUserMsg(
        ws: AuthenticatedWS,
        message: WSMsg
    ): Promise<void> {
        if (!ws.userId || !ws.conId || !message.content) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message'
            }));
            return;
        }

        try {
            await prisma.msg.create({
                data: {
                    conId: ws.conId,
                    sender: 'user',
                    content: message.content,
                },
            });

            const msgs = await prisma.msg.findMany({
                where: { conId: ws.conId },
                orderBy: {timestamp: 'asc' },
            });

            const history = msgs.map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.content,
            }));

            ws.send(JSON.stringify({ type: 'ai_typing', isTyping: true }));

            const convo = await prisma.conversation.findUnique({
                where: { id: ws.conId },
            });

            const aiResponse = await aiService.generateResponse(
                message.content,
                history,
                convo?.scenario || undefined
            );

            await prisma.msg.create({
                data: {
                    conId: ws.conId,
                    sender: 'ai',
                    content: aiResponse.content,
                },
            });

            ws.send(JSON.stringify({
                type: 'ai_message',
                content: aiResponse.content,
                timestamp: new Date().toISOString(),
            }));
        } catch (e) {
            console.error('Handle messsage error:', e);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process msg'
            }));
        }
    }

    private async handleEndConvo(
        ws: AuthenticatedWS,
        message: WSMsg
    ): Promise<void> {
        if (!ws.userId || !ws.conId) return;

        try {
            const msgs = await prisma.msg.findMany({
                where: { conId: ws.conId },
                orderBy: { timestamp: 'asc' },
            });

            const { summary, feedback } = await aiService.generateSummary(
                msgs.map((m) => ({ sender: m.sender, content: m.content }))
            );

            await prisma.conversation.update({
                where: { id: ws.conId },
                data: {
                    endTime: new Date(),
                    summary,
                    feedback,
                },
            });

            ws.send(JSON.stringify({
                type: 'conversation_ended',
                summary,
                feedback,
                messageCt: msgs.length,
            }));
            ws.conId = undefined;
        } catch(e) {
            console.error('End Conversation error:', e);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to end conversation'
            }));
        }
    }

    private handleClose(ws: AuthenticatedWS): void {
        if (ws.userId) {
            this.clients.delete(ws.userId);
            console.log(`User ${ws.userId} offline`);
        }
    }
}

export default new WebSocketService();