import { resolve } from "path";

interface AIResponse {
    content: string;
    feedback?: string;
}

export class AIService {
    async generateResponse(
        userMsg: string,
        convoHistory: { role: string; content: string }[],
        scenario?: string
    ): Promise<AIResponse> {
        await this.delay(800 + Math.random() * 1200);

        const responses = this.getMockResponses(scenario);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        return {
            content: randomResponse,
        };
    }

    async generateSummary (
        messages: { sender: string, content: string }[]
    ): Promise<{ summary: string, feedback: string }> {
        await this.delay(500);

        const userMessages = messages.filter((m) => m.sender === 'user');
        const aiMessages = messages.filter((m) => m.sender === 'ai');

        const summary = `Convo completed with ${messages.length} messages exchanged. User messaged ${userMessages.length}.`;

        const feedback = this.generateMockFeedback(userMessages.length);

        return { summary, feedback };
    }

    private getMockResponses(scenario?: string): string[] {
        const scenarioResponses: Record<string, string[]> = {
            'job-interview': [
                "That's a great point. Can you tell me more about your experience with team collaboration?",
                "I see. How would you handle a situation where you disagree with your manager?",
                "Interesting approach! What's your biggest professional achievement so far?",
                "Can you walk me through a challenging project you've worked on?",
            ],
            'coffee-shop': [
                "Sure! Would you like that hot or iced?",
                "Great choice! What size would you prefer - small, medium, or large?",
                "Would you like to add any flavors or extra shots?",
                "Perfect! Your total comes to $4.50. Will that be cash or card?",
            ],
            'travel-planning': [
                "That sounds like an amazing destination! How long are you planning to stay?",
                "Have you considered the best time of year to visit?",
                "What kind of activities are you most interested in?",
                "Would you like some recommendations for accommodations?",
            ],
            default: [
                "That's interesting! Can you elaborate on that?",
                "I understand. What makes you think that way?",
                "Could you provide more details about your perspective?",
                "That's a thoughtful point. How would you approach this differently?",
            ],
        };

        return scenarioResponses[scenario || 'default'] || scenarioResponses.default;
    }

    private generateMockFeedback(messageCt: number): string {
        if (messageCt < 3) {
            return 'Good start! Try to engage more in the conversation to get better practice.';
        } else if (messageCt < 6) {
            return 'Nice work! You maintained a good conversation flow. Keep practicing to improve further.';
        } else {
            return 'Excellent! You showed great engagement and communication skills. Well done!';
        }
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