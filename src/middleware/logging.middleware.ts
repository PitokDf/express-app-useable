import { NextFunction, Request, Response } from "express";
import logger from "@/utils/winston.logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime();
    const startTime = new Date();

    res.on("finish", () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const responseTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
        const endTime = new Date();

        // Use the enhanced request logging method
        logger.request(
            req.method,
            req.originalUrl,
            res.statusCode,
            parseFloat(responseTime),
            {
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get("User-Agent"),
                contentLength: res.get("Content-Length"),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            }
        );
    });

    next();
}