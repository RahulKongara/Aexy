import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import aiService from './aiService';

interface AuthenticatedWS extends WebSocket {
    userId?: string;
    conId?: string;
    isAlive?: boolean;
    lastActivity?: number;
}

interface WSMsg {
    type: 'start' | 'message' | 'end';
    conId?: string;
    scenario?: string;
    content?: string;
}

const CONVO_TIMEOUT = 30 * 60 * 1000;
const HEARTBEAT_INTERVAL = 30000;

export class WebSocketService {
    private wss: WebSocketServer | null = null;
    private clients: Map<string, AuthenticatedWS> = new Map();
    private activityCheckInterval?: NodeJS.Timeoutl

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
                ws.lastActivity = Date.now();

                const existingWS = this.clients.get(decoded.userId);
                if (existingWS && existingWS.readyState === WebSocket.OPEN) {
                    existingWS.close(4003, 'New Connection established');
                }

                this.clients.set(decoded.userId, ws);
                console.log(`User ${decoded.userId} connected.`);

                ws.on('message', (data) => this.handleMsg(ws, data));
                ws.on('close', () => this.handleClose(ws));
                ws.on('pong', () => {
                    ws.isAlive = true;
                    ws.lastActivity = Date.now();
                });

                ws.send(JSON.stringify({ type: 'connected', userId: decoded.userId }));
            } catch (e) {
                console.error('Websocket auth error:', e);
                ws.close(4002, 'Invalid token');
            }
        });

        const heartbeatInterval = setInterval(() => {
            this.wss?.clients.forEach((ws: WebSocket) => {
                const client = ws as AuthenticatedWS;
                if (client.isAlive === false) {
                    console.log(`Terminating inactive connection for user ${client.userId}`);
                    return client.terminate();
                }
                client.isAlive = false;
                client.ping();
            });
        }, HEARTBEAT_INTERVAL);

        this.activityCheckInterval = setInterval(() => {
            this.checkConversationTimeouts();
        }, 60000);

        this.wss.on('close', () => {
            clearInterval(heartbeatInterval);
            if (this.activityCheckInterval) {
                clearInterval(this.activityCheckInterval);
            }
        });

        console.log('Websocket server initialized on /ws');
    }

    private async checkConversationTimeouts(): Promise<void> {
        const now = Date.now();

        this.clients.forEach(async (ws) => {
            if (ws.conId && ws.lastActivity) {
                const inactiveTime = now - ws.lastActivity;

                if (inactiveTime > CONVO_TIMEOUT) {
                    console.log(`Conversation ${ws.conId} timed out after ${inactiveTime}ms`);

                    try {
                        const messages = await prisma.msg.findMany({
                            where: { conId: ws.conId },
                            orderBy: { timestamp: 'asc' },
                        });

                        const { summary, feedback } = await aiService.generateSummary(
                            messages.map((m) => ({ sender: m.sender, content: m.content }))
                        );

                        await prisma.conversation.update({
                            where: { id: ws.conId },
                            data: {
                                endTime: new Date(),
                                summary: summary + ' (Auto-ended due to inactivity)',
                                feedback,
                            },
                        });

                        ws.send(JSON.stringify({
                            type: 'conversation_timeout',
                            message: 'Conversation ended due to inactivity',
                            summary,
                            feedback,
                        }));
                    } catch (err) {
                        console.error('Error ending timed-out conversation:', err);
                    }
                }
            }
        });
    }

    private async handleMsg(ws: AuthenticatedWS, data: Buffer): Promise<void> {
        try {
            const message: WSMsg = JSON.parse(data.toString());
            ws.lastActivity = Date.now();

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
            const activeConvo = await prisma.conversation.findFirst({
                where: {
                    userId: ws.userId,
                    endTime: null,
                },
            });

            if (activeConvo) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'You already have an active conversation. Please end it fiest.'
                }));
                return;
            }

            const convo = await prisma.conversation.create({
                data: {
                    userId: ws.userId,
                    scenario: message.scenario || null,
                },
            });

            ws.conId = convo.id;
            ws.lastActivity = Date.now();

            ws.send(JSON.stringify({
                type: 'conversation_started',
                conId: convo.id,
                scenario: convo.scenario,

            }));

            const greetings: Record<string, string> = {
                'job-interview': "Hello! I'm your interviewer today. Thank you for coming in. Let's start with a simple question: Can you tell me about yourself?",
                'coffee-shop': "Hi there! Welcome to our coffee shop. What can I get for you today?",
                'travel-planning': "Hello! I'm excited to help you plan your trip. Where are you thinking of traveling to?",
                'small-talk': "Hey! How's your day going? What have you been up to lately?",
            };

            const greeting = greetings[message.scenario || ''] || "Hello! I'm ready to help you practice. Let's get started!";

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
            const convo = await prisma.conversation.findUnique({
                where: { id: ws.conId },
            });

            if (!convo) {
                ws.send(JSON.stringify({ type: 'error', message: 'Conversation not found' }));
                return;
            }

            if (convo.endTime) {
                ws.send(JSON.stringify({ type: 'error', message: 'Conversation has already ended' }));
                return;
            }

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

    // manually triggerDailyReset
    // async triggerDailyReset(): Promise<void> {
    //     console.log('🔄 Manually triggering daily reset...');
    //     await prisma.dailyUsage.updateMany({
    //         data: {
    //             conversationsCt: 0,
    //         },
    //     });
    //     console.log('✅ Daily reset completed');
    // }
}

export default new WebSocketService();