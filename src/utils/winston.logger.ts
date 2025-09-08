import winston from "winston"
import { config } from "@/config"
import path from "path"
import fs from "fs"
import DailyRotateFile from "winston-daily-rotate-file"

// Path yang lebih robust - selalu mengarah ke root project
const LOG_DIR = path.resolve(process.cwd(), 'logs')

// Buat folder logs jika belum ada
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Custom format untuk console logging yang lebih readable
const consoleFormat = winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, service }) => {
        const serviceName = service === 'express-framework' ? 'FRAMEWORK' : ((service as string).toUpperCase().replace("-", "_") || 'APP');
        return `[${level}][${serviceName}] ${message}`;
    })
);

// Format untuk file logging yang lebih structured
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: config.isProduction ? 'info' : 'debug',
    format: fileFormat,
    defaultMeta: {
        service: config.SERVICE,
        environment: config.NODE_ENV,
        pid: process.pid
    },
    transports: [
        new DailyRotateFile({
            filename: path.join(LOG_DIR, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: "error",
            maxFiles: '14d',
            maxSize: '10m',
            zippedArchive: true
        }),
        new DailyRotateFile({
            filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m',
            maxFiles: '14d',
            zippedArchive: true,
        }),
    ]
})

if (!config.isProduction) {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

// Add custom logging methods untuk framework
const frameworkLogger = {
    // Expose all winston methods
    info: logger.info.bind(logger),
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    debug: logger.debug.bind(logger),
    verbose: logger.verbose.bind(logger),
    silly: logger.silly.bind(logger),

    // Server startup logs
    serverStartup: (port: number, env: string) => {
        logger.info(`🚀 Server successfully started on port ${port}`, {
            port,
            environment: env,
            nodeVersion: process.version,
            timestamp: new Date().toISOString()
        });
    },

    serverReady: (port: number, urls: string[]) => {
        logger.info(`🌐 Server accessible at ${urls.length} endpoint(s)`, {
            port,
            urls,
            timestamp: new Date().toISOString()
        });
    },

    // Framework initialization logs
    frameworkInit: (component: string, status: 'starting' | 'success' | 'error', details?: any) => {
        const icon = status === 'starting' ? '⚙️' : status === 'success' ? '✅' : '❌';
        const level = status === 'error' ? 'error' : 'info';

        logger[level](`${icon} Framework ${component} ${status}`, {
            component,
            status,
            ...details
        });
    },

    // Database logs
    database: (action: string, details?: any) => {
        logger.info(`🗄️  Database ${action}`, {
            action,
            ...details
        });
    },

    // Cache logs
    cache: (action: string, key?: string, details?: any) => {
        logger.debug(`💾 Cache ${action}`, {
            action,
            key,
            ...details
        });
    },

    // Email logs
    email: (action: string, to?: string, details?: any) => {
        logger.info(`📧 Email ${action}`, {
            action,
            to,
            ...details
        });
    },

    // Background job logs
    job: (action: string, jobId?: string, queue?: string, details?: any) => {
        logger.info(`⚡ Job ${action}`, {
            action,
            jobId,
            queue,
            ...details
        });
    },

    // Request logs
    request: (method: string, url: string, statusCode: number, duration: number, details?: any) => {
        const level = statusCode >= 400 ? 'warn' : 'info';

        logger[level](`${method} ${url} ${statusCode} - ${duration}ms`, {
            method,
            url,
            statusCode,
            duration,
            ...details
        });
    },

    // Health check logs
    health: (status: string, checks?: any) => {
        logger.info(` Health check ${status}`, {
            status,
            checks
        });
    },

    // Security logs
    security: (event: string, details?: any) => {
        logger.warn(`🔐 Security event: ${event}`, {
            event,
            ...details
        });
    }
};

export default frameworkLogger;
