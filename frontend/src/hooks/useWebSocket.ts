import { useState, useEffect, useRef, useCallback } from "react";
import type { Message, WSMessage } from "../types";

export const useWebSocket = (token: string | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [conId, setConId] = useState<string | null>(null);
    const ws = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (!token) return;

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';
        ws.current = new WebSocket(`${wsUrl}?token=${token}`);

        ws.current.onopen = () => {
            console.log('Connected Successfully');
            setIsConnected(true);
        };

        ws.current.onmessage = (event) => {
            const data: WSMessage = JSON.parse(event.data);

            switch (data.type) {
                case 'conversation_started':
                    setConId(data.conId || null);
                    break;
                case 'ai_message':
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now().toString(),
                            sender: 'ai',
                            content: data.content || '',
                            timestamp: data.timestamp || new Date().toISOString(),
                        },
                    ]);
                    setIsTyping(false);
                    break;
                case 'ai_typing':
                    setIsTyping(data.isTyping || false);
                    break;
                case 'conversation_ended':
                    console.log('Conversation ended:', data);
                    break;
                case 'error':
                    console.error('Websocket error:', data);
                    break;
            }
        };

        ws.current.onclose = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        ws.current.onerror = (error) => {
            console.error('Websocket error:', error);
        };
    }, [token]);

    const disconnect = useCallback(() => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
    }, []);

    const startConversation = useCallback((scenario?: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            setMessages([]);
            ws.current.send(JSON.stringify({ type: 'start', scenario }));
        }
    }, []);

    const sendMessage = useCallback((content: string) => {
        if (ws.current?.readyState === WebSocket.OPEN && conId) {
            const userMessage: Message = {
                id: Date.now().toString(),
                sender: 'user',
                content,
                timestamp: new Date().toISOString(),
            };

        setMessages((prev) => [...prev, userMessage]);
        ws.current.send(JSON.stringify({ type: 'message', content }));
        }
    }, [conId]);

    const endConversation = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN && conId) {
            ws.current.send(JSON.stringify({ type: 'end' }));
            setConId(null);
        }
    }, [conId]);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return {
        messages, 
        isConnected, 
        isTyping,
        conId,
        startConversation,
        sendMessage,
        endConversation,
    };
}