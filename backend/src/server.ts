import express, { Application } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from "http";
import authRoutes from './routes/auth';
import conRoutes from './routes/conversations';
import subRoutes from './routes/subscriptions';
import websocketService from "./services/websocketService";
import usageServices from "./services/usageServices";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

app.use(cors());
app.use(express.json());



app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/')

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`MODE: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});