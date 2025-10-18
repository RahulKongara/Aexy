import { Request, Response } from "express";
import prisma from "../db/prisma";
import usageServices from "../services/usageServices";
import { stat } from "fs";

export class ConversationController {
    // GET call /api/conversations/check
    async checkLimit(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const status = await usageServices.canStartConvo(userId);
            const streak = await usageServices.getUserStreak(userId);

            res.json({
                ...status,
                streak,
            });
        } catch (e) {
            console.error('Chack limit error:', e);
            res.status(500).json({ error: 'Failed to check conversation limit' });
        }
    }

    // POST call /api/conversations/start
    async start(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { scenario } = req.body;

            const status = await usageServices.canStartConvo(userId);

            if (!status.allowed) {
                res.status(403).json({
                    error: 'Daily conversation limit reached',
                    ...status,
                });
                return;
            }

            const convo = await prisma.conversation.create({
                data: {
                    userId,
                    scenario: scenario || null,
                }
            });

            await usageServices.incrementUsage(userId);

            res.status(201).json({
                id: convo.id,
                scenario: convo.scenario,
                startTime: convo.startTime,
            });
        } catch(e) {
            console.error('Start conversation error:', e);
            res.status(500).json({ error: 'Failed to start conversation' });
        }
    }

    // Post call /api/conversations/:id/end
    async end(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const convo = await prisma.conversation.findFirst({
                where: {
                    id,
                    userId,
                },
            });

            if (!convo) {
                res.status(404).json({ error: 'Convo no found '});
                return;
            }

            if (convo.endTime) {
                res.status(400).json({ error: 'Convo already ended' });
                return;
            }

            const updated = await prisma.conversation.update({
                where: { id },
                data: { endTime: new Date() },
            });

            res.json({
                id: updated.id,
                endTime: updated.endTime,
                summary: updated.summary,
                feedback: updated.feedback,
            });
        } catch (e) {
            console.error('End of convo error', e);
            res.status(500).json({ error: 'Failed to end conversation' });
        }
    }

    // Get call /api/conversations/:id/messages
    async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const convo = await prisma.conversation.findFirst({
                where: {
                    id,
                    userId,
                },
                include: {
                    messages: {
                        orderBy: {
                            timestamp: 'asc',
                        },
                    },
                },
            });

            if (!convo) {
                res.status(404).json({ error: 'Conversation not found' });
                return;
            }

            res.json({
                conId: convo.id,
                scenario: convo.scenario,
                messages: convo.messages,
            });
        } catch(e) {
            console.error('Get messages error:', e);
            res.status(500).json({ error: 'Failed to fetch msgs' });
        }
    }

    // get call /api/conversations
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;

            const convos = await prisma.conversation.findMany({
                where: { userId },
                orderBy: { startTime: 'desc' },
                include: {
                    _count: {
                        select: { messages: true },
                    },
                },
            });

            res.json(convos);
        } catch (e) {
            console.error('Get conversations error', e);
            res.status(500).json({ error: 'Failed to fetch conversations '});
        }
    }
}

export default new ConversationController();