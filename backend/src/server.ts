import express, { Application, Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from "http";
import authRoutes from './routes/auth';
import conRoutes from './routes/conversations';
import subRoutes from './routes/subscriptions';
import websocketService from "./services/websocketService";
import usageServices from "./services/usageServices";
import { logger } from "./middleware/logger";
import { rateLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

app.use(cors());
app.use(express.json());
app.use(logger);

app.use(rateLimiter(100, 60000));

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.post('/api/admin/reset-usage', async (req: Request, res: Response) => {
    try {
        await usageServices.resetDailyUsage();
        res.json({ message: 'Daily usage reset successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset usage' });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conRoutes);
app.use('/api/subscriptions', subRoutes);

app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

websocketService.initialize(httpServer);

const dailyReset = () => {
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
    );
    const msToMidnight = night.getTime() - now.getTime();

    setTimeout(() => {
        usageServices.resetDailyUsage();
        dailyReset();
    }, msToMidnight);
};

// dailyReset();

process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`MODE: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`WebSocket: ws://localhost:${PORT}/ws`);
});