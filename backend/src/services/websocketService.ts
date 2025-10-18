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
        })
    }
}