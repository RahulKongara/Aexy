import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const dur = Date.now() - start;
        const logMsg = `${req.method} ${req.path} ${res.statusCode} - ${dur}ms`;

        if (res.statusCode >= 400) {
            console.error(`Did not ${logMsg}`);
        } else {
            console.log(`${logMsg}`);
        }
    });

    next();
}