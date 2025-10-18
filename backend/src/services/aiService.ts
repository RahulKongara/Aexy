import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIResponse {
    content: string;
    feedback?: string;
}

export class AIService {
    private useRealAI: boolean;
    private genAI: GoogleGenerativeAI | null = null;

    constructor() {
        this.useRealAI = process.env.USE_REAL_AI === 'true';

        if (this.useRealAI && process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            console.log('Gemini AI initialized');
        } else {
            console.log('Using mock AI responses');
        }
    }

    async generateResponse(
        userMsg: string,
        convoHistory: { role: string; content: string }[],
        scenario?: string
    ): Promise<AIResponse> {
        if (this.useRealAI) {
            return this.generateResponseWithGemini(userMsg, convoHistory, scenario);
        } else {
            return this.generateMockResponse(userMsg, convoHistory, scenario);
        }
    }

    private async generateResponseWithGemini(
        userMsg: string,
        convoHistory: { role: string; content: string }[],
        scenario?: string
    ): Promise<AIResponse> {
        try {
            // Uncomment when Gemini is installed
            if (!this.genAI) {
                throw new Error('Gemini AI not initialized');
            }

            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const systemPrompt = this.getSystemPrompt(scenario);
            const historyText = convoHistory
                .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
                .join('\n');

            const prompt = `${systemPrompt}\n\nConversation history:\n${historyText}\n\nUser: ${userMsg}\n\nAI (respond naturally and helpfully):`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return { content: text };

            // Fallback to mock for now
            return this.generateMockResponse(userMsg, convoHistory, scenario);
        } catch (error) {
            console.error('Gemini API error:', error);
            // Fallback to mock on error
            return this.generateMockResponse(userMsg, convoHistory, scenario);
        }
    }

    private getSystemPrompt(scenario?: string): string {
        const prompts: Record<string, string> = {
            'job-interview':
                'You are a professional job interviewer. Ask thoughtful questions about the candidate\'s experience, skills, and goals. Be encouraging but professional.',
            'coffee-shop':
                'You are a friendly barista at a coffee shop. Help customers order drinks, suggest options, and be warm and welcoming.',
            'travel-planning':
                'You are a knowledgeable travel advisor. Help plan trips, suggest destinations, discuss accommodations and activities.',
            'small-talk':
                'You are a friendly conversation partner. Engage in casual, natural small talk about everyday topics.',
        };

        return prompts[scenario || ''] ||
            'You are a helpful AI assistant for conversation practice. Be natural, encouraging, and conversational.';
    }

    private async generateMockResponse(
        userMessage: string,
        conversationHistory: { role: string; content: string }[],
        scenario?: string
    ): Promise<AIResponse> {
        await this.delay(800 + Math.random() * 1200);

        const responses = this.getMockResponses(scenario);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        return { content: randomResponse };
    }

    async generateSummary(
        messages: { sender: string, content: string }[]
    ): Promise<{ summary: string, feedback: string }> {
        await this.delay(500);

        const userMessages = messages.filter((m) => m.sender === 'user');
        const aiMessages = messages.filter((m) => m.sender === 'ai');

        const avgUserMessageLength = userMessages.length > 0
            ? Math.round(userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length)
            : 0;

        const summary = `Convo completed with ${messages.length} messages exchanged. User messaged ${userMessages.length}.`;

        const feedback = this.generateMockFeedback(userMessages.length, avgUserMessageLength);

        return { summary, feedback };
    }

    private getMockResponses(scenario?: string): string[] {
        const scenarioResponses: Record<string, string[]> = {
            'job-interview': [
                "That's a great point. Can you tell me more about your experience with team collaboration?",
                "I see. How would you handle a situation where you disagree with your manager?",
                "Interesting approach! What's your biggest professional achievement so far?",
                "Can you walk me through a challenging project you've worked on?",
                "That's impressive. What motivates you in your work?",
                "How do you stay updated with industry trends?",
            ],
            'coffee-shop': [
                "Sure! Would you like that hot or iced?",
                "Great choice! What size would you prefer - small, medium, or large?",
                "Would you like to add any flavors or extra shots?",
                "Perfect! Your total comes to $4.50. Will that be cash or card?",
                "That's one of our most popular drinks! Any dietary restrictions I should know about?",
                "Would you like to try our seasonal special today?",
            ],
            'travel-planning': [
                "That sounds like an amazing destination! How long are you planning to stay?",
                "Have you considered the best time of year to visit?",
                "What kind of activities are you most interested in?",
                "Would you like some recommendations for accommodations?",
                "Are you traveling solo or with companions?",
                "What's your approximate budget for this trip?",
            ],
            default: [
                "That's interesting! Can you elaborate on that?",
                "I understand. What makes you think that way?",
                "Could you provide more details about your perspective?",
                "That's a thoughtful point. How would you approach this differently?",
                "I see what you mean. What's your experience with this?",
                "Good question! Let me think about that for a moment.",
            ],
        };

        return scenarioResponses[scenario || 'default'] || scenarioResponses.default;
    }

    private generateMockFeedback(messageCt: number, avgLength: number): string {
        let feedback = '';
        if (messageCt < 3) {
            feedback += 'Try to engage more in the conversation to get better practice. ';
        } else if (messageCt < 6) {
            feedback += 'Good engagement! You maintained a decent conversation flow. ';
        } else if (messageCt < 10) {
            feedback += 'Excellent engagement! You showed great communication skills. ';
        } else {
            feedback += 'Outstanding! You had a very thorough conversation. ';
        }

        if (avgLength < 20) {
            feedback += 'Try to elaborate more in your responses to make the conversation richer. ';
        } else if (avgLength < 50) {
            feedback += 'Your message length is good - clear and concise. ';
        } else if (avgLength < 100) {
            feedback += 'Great detail in your responses! You express yourself well. ';
        } else {
            feedback += 'Very detailed responses! Make sure to stay focused on the topic. ';
        }

        
        feedback += 'Keep practicing to improve further!';

        return feedback;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // async generateResponseWithGemini(prompt: string): Promise<string> {
    //   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    //   const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    //   const result = await model.generateContent(prompt);
    //   return result.response.text();
    // }
}

export default new AIService();