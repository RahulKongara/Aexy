import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const identifier = req.user?.id || req.ip || 'anonymous';
        const now = Date.now();

        if (!store[identifier] || now > store[identifier].resetTime) {
            store[identifier] = {
                count: 1,
                resetTime: now + windowMs,
            };
            return next();
        }
        store[identifier].count++;

        if (store[identifier].count > maxRequests) {
            const resetIn = Math.ceil((store[identifier].resetTime - now) / 1000);
            res.status(429).json({
                error: 'Too many requests',
                message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
                retryAfter: resetIn,
            });
            return;
        }
        next();
    };
};

setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
        if (now > store[key].resetTime) {
            delete store[key];
        }
    });
}, 300000);