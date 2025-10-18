import prisma from "../db/prisma";
import { TIER_LIMIT ,TierType } from "../utils/constants";

export class UsageService {
    async getDailyUsage(userId: string, date: Date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        let usage = await prisma.dailyUsage.findUnique({
            where: {
                userId_date: {
                    userId, 
                    date: startOfDay,
                },
            },
        });

        if (!usage) {
            usage = await prisma.dailyUsage.create({
                data: {
                    userId,
                    date: startOfDay,
                    conversationsCt: 0,
                },
            });
        }
        return usage;
    }

    async canStartConvo(userId: string): Promise<{
        allowed: boolean;
        used: number;
        limit: number;
        tier: string;
    }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found!');
        }

        const usage = await this.getDailyUsage(userId);
        const limit = TIER_LIMIT[user.tier as TierType] || TIER_LIMIT.FREE;
        const allowed = usage.conversationsCt < limit;

        return { 
            allowed,
            used: usage.conversationsCt, 
            limit,
            tier: user.tier,
        };
    }

    async incrementUsage(userId: string): Promise<void> {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        await prisma.dailyUsage.upsert({
            where: {
                userId_date: {
                    userId,
                    date: today,
                },
            },
            update: {
                conversationsCt: {
                    increment: 1,
                }
            },
            create: {
                userId,
                date: today,
                conversationsCt: 1,
            },
        });
    }

    async resetDailyUsage(): Promise<void> {
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        yesterday.setUTCHours(0, 0, 0, 0);

        console.log('Daily usage reset completed');
    }

    async getUserStreak(userId: string): Promise<number> {
        const usageRecords = await prisma.dailyUsage.findMany({
            where: {
                userId,
                conversationsCt: {
                    gt: 0,
                },
            },
            orderBy: {
                date: 'desc',
            },
            take: 365,
        });

        if (usageRecords.length == 0) return 0;

        let streak = 0;
        let currDate = new Date();
        currDate.setUTCHours(0, 0, 0, 0);
        
        for (const record of usageRecords) {
            const recDate = new Date(record.date);
            recDate.setUTCHours(0, 0, 0, 0);

            const daysDiff = Math.floor((currDate.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff === streak) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }
}

export default new UsageService();