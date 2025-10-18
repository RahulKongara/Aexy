import axios from "axios";
import type { AxiosInstance } from "axios";
import type { AuthResponse, ConversationLimit, Subscription, Message, Conversation } from "../types";

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const { data } = await this.api.post<AuthResponse>('/api/auth/login', { email, password });
        return data;
    }

    async register(email: string, password: string): Promise<AuthResponse> {
        const { data } = await this.api.post<AuthResponse>('/api/auth/register', { email, password });
        return data;
    }

    async checkLimit(): Promise<ConversationLimit> {
        const { data } = await this.api.get<ConversationLimit>('/api/conversations/check');
        return data;
    }

    async startConvo(scenario?: string): Promise<Conversation> {
        const { data } = await this.api.post<Conversation>('/api/conversations/start', { scenario });
        return data;
    }

    async endConvo(id: string): Promise<Conversation> {
        const { data } = await this.api.post<Conversation>(`/api/conversations/${id}/end`);
        return data;
    }

    async getMessages(conId: string): Promise<{ messages: Message[] }> {
        const {data} = await this.api.get(`/api/conversations/${conId}/messages`);
        return data;
    }

    async getConvos(): Promise<Conversation[]> {
        const {data} = await this.api.get<Conversation[]>('/api/conversations');
        return data;
    }

    async getSubs(): Promise<{ tier: string; subscription: Subscription | null }> {
        const { data } = await this.api.get('/api/subscriptions/me');
        return data;
    }

    async upgradeTier(tier: 'STANDARD' | 'PREMIUM'): Promise<{ message: string }> {
        const { data } = await this.api.post('/api/subscription/upgrade', { tier });
        return data;
    }
}

export default new ApiService();