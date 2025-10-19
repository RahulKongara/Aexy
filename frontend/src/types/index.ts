export interface User {
    id: string;
    email: string;
    tier: 'FREE' | 'STANDARD' | 'PREMIUM';
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ConversationLimit {
    allowed: boolean;
    used: number;
    limit: number;
    tier: string;
    streak: number;
}

export interface Subscription {
    id: string;
    tier: string;
    status: string;
    startDate: string;
    endDate: string;
}

export interface Message {
    id: string,
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    scenario: string | null;
    startTime: string;
    endTime: string | null;
    summary: string | null;
    feedback: string | null;
}

export interface WSMessage {
    type: string;
    content?: string;
    conId?: string;
    userId?: string;
    scenario?: string;
    summary?: string;
    feedback?: string;
    message?: string;
    messageCt?: number;
    timestamp?: string;
    isTyping?: boolean;
}

export interface Scenario {
    id: string;
    title: string;
    description: string;
    icon: string;
}