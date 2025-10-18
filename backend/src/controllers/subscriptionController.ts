import { Request, Response } from "express"; 
import prisma from "../db/prisma";
import { emit } from "process";
import { start } from "repl";

export class SubscriptionController {
    // Get /api/subscriptions/me
    async getMySubscription(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;

            const user = await prisma.user.findUnique({
                where: {id: userId },
                include: {
                    subscriptions: {
                        where: {status: 'active' },
                        orderBy: {startDate: 'desc' },
                        take: 1,
                    },
                },
            });

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const activeSub = user.subscriptions[0] || null;

            res.json({
                userId: user.id,
                email: user.email,
                tier: user.tier,
                subscription: activeSub 
                ? {
                    id: activeSub.id, 
                    tier: activeSub.tier,
                    status: activeSub.status,
                    startDate: activeSub.startDate,
                    endDate: activeSub.endDate,
                }
                : null,
            });
        } catch(e) {
            console.error('Get Sub error', e);
            res.status(500).json({ error: 'Failed to fetch sub' });
        }
    }

    // post /api/subscription/upgrade
    async upgrade(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { tier } = req.body;

            if (!['STANDARD', 'PREMIUM'].includes(tier)) {
                res.status(400).json({ error: 'Invalid tier' });
                return;
            }

            const user = await prisma.user.update({
                where: { id: userId },
                data: { tier },
            });

            const sub = await prisma.subscription.create({
                data: {
                    userId,
                    tier,
                    status: 'active',
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });

            res.json({
                message: 'Subscription upgraded successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    tier: user.tier,
                },
                sub,
            });
        } catch (e) {
            console.error('Upgrade sub error:', e);
            res.status(500).json({ error: 'Failed to upgrade subscription' });
        }
    }
}

export default new SubscriptionController();