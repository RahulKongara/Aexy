import { useState, useEffect, useRef, useCallback } from "react";
import type { Message, WSMessage } from "../types";

interface ConvoSummary {
    summary: string;
    feedback: string;
    messageCt: number;
}

export const useWebSocket = (token: string | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [conId, setConId] = useState<string | null>(null);
    const [summary, setSummary] = useState<ConvoSummary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!token) return;

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';
         try {
            ws.current = new WebSocket(`${wsUrl}?token=${token}`);

            ws.current.onopen = () => {
                console.log('Connected Successfully');
                setIsConnected(true);
                setError(null);
                reconnectAttempts.current = 0;

                // No need for manual ping - WebSocket has built-in ping/pong
            };

            ws.current.onmessage = (event) => {
                const data: WSMessage = JSON.parse(event.data);
                // console.log('WS received:', data.type, data);

                switch (data.type) {
                    case 'connected':
                        // console.log('✅ Connected as user:', data.userId);
                        break;
                    case 'conversation_started':
                        // console.log('🎬 Conversation started, conId:', data.conId);
                        setConId(data.conId || null);
                        setSummary(null);
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
                        // console.log('Conversation ended:', data);
                        setSummary({
                            summary: data.summary || '',
                            feedback: data.feedback || '',
                            messageCt: data.messageCt || 0,
                        });
                        setConId(null);
                        break;
                    case 'conversation_timeout':
                        // console.log('Conversation timed out:', data);
                        setSummary({
                            summary: data.summary || 'Conversation ended due to inactivity',
                            feedback: data.feedback || '',
                            messageCt: 0,
                        });
                        setConId(null);
                        setError('Conversation ended due to inactivity');
                        break;
                    case 'error':
                        console.error('Websocket error:', data);
                        setError(data.message || 'An error occurred');
                        break;
                    case 'pong':
                        break;
                }
            };

            ws.current.onclose = (event) => {
                console.log('Socket disconnected:', event.code, event.reason);
                setIsConnected(false);

                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

                    reconnectTimeout.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        connect();
                    }, delay);
                } else {
                    setError('Connection lost. Please refresh the page.');
                }
            };

            ws.current.onerror = (error) => {
                console.error('Websocket error:', error);
                setError('Connection error occurred');
            };
        } catch (err) {
            console.error('Failed to establish WebSocket connection:', err);
            setError('Failed to connect to server');
        }
    }, [token]);

    const disconnect = useCallback(() => {
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = null;
        }

        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }

        reconnectAttempts.current = 0;
    }, []);

    const startConversation = useCallback((scenario?: string) => {
        // console.log('🚀 Starting conversation, scenario:', scenario);
        if (ws.current?.readyState === WebSocket.OPEN) {
            setMessages([]);
            setSummary(null);
            setError(null);
            // console.log('📤 Sending start message');
            ws.current.send(JSON.stringify({ type: 'start', scenario }));
        }else {
            // console.error('❌ WebSocket not open, state:', ws.current?.readyState);
            setError('Not connected. Please wait...');
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
            setError(null);
        } else {
            setError('Cannot send message. Connection lost.');
        }
    }, [conId]);

    const endConversation = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN && conId) {
            ws.current.send(JSON.stringify({ type: 'end' }));
            setError(null);
        }
    }, [conId]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return {
        messages, 
        isConnected, 
        isTyping,
        conId,
        summary,
        error,
        startConversation,
        sendMessage,
        endConversation,
        clearError,
    };
}