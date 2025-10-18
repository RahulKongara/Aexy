import { Router, Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from "../db/prisma";

const router = Router();


router.post('/register', async (req: Request, res: Response) : Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Pass must be at least 6 chars long'});
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(409).json({ error: 'User already exists '});
            return;
        }

        const passHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email, 
                password: passHash, 
                tier: 'FREE',
            },
        });

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token, 
            user: {
                id: user.id, 
                email: user.email,
                tier: user.tier,
                createdAt: user.createdAt,
            },
        });
    } catch (e) {
        console.error('Register error:', e);
        res.status(500).json({ error: 'Registration error' });
    }
});

router.post('/login', async (req: Request, res: Response) : Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and pass are required' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isValidPass = await bcrypt.compare(password, user.password);

        if (!isValidPass) {
            res.status(401).json({ error: 'Invalid creds (pass)' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!, 
            { expiresIn: '7d' } 
        );

        res.json({
            token, 
            user: {
                id: user.id,
                email: user.email,
                tier: user.tier,
                createdAt: user.createdAt,
            },
        });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
