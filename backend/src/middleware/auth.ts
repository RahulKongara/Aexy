import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import prisma from "../db/prisma";

interface JwtPayload {
    userId: string;
}

export const auth = async (
    req: Request, res: Response, next: NextFunction
) : Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error : 'No token provided' });
            return;
        }

        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET not configged');
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            res.status(401).json({ error: 'User not found!' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        res.status(500).json({ error: 'Auth failed' });
    }
};