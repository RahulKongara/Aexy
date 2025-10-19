import { Router, Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from "../db/prisma";

const router = Router();


router.post('/register', async (req: Request, res: Response) : Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Please enter a valid email address' });
            return;
        }

        // Validate password length
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters long'});
            return;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            res.status(409).json({ error: 'An account with this email already exists. Please login instead.' });
            return;
        }

        // Hash password
        const passHash = await bcrypt.hash(password, 10);

        // Create new user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(), 
                password: passHash, 
                tier: 'FREE',
            },
        });

        // Generate JWT token
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
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

router.post('/login', async (req: Request, res: Response) : Promise<void> => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Please enter a valid email address' });
            return;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            res.status(401).json({ error: 'No account found with this email. Please register first.' });
            return;
        }

        // Verify password
        const isValidPass = await bcrypt.compare(password, user.password);

        if (!isValidPass) {
            res.status(401).json({ error: 'Incorrect password. Please try again.' });
            return;
        }

        // Generate JWT token
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
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

export default router;
