import express from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import { config } from "./config"
import { generalLimiter } from "./middleware/rate-limit.middleware"
import compression from "compression"
import { errorHandler, notFound } from "./middleware/error.middleware"
import { App } from "./constants/app"
import apiRouter from "./routes/index.routes"
import { frameworkInitializer } from "./utils/framework-initializer"
import { prisma } from "./config/prisma"
import logger from "./utils/winston.logger"
import { requestLogger } from "./middleware/logging.middleware"

const app = express()

// Initialize framework services
let frameworkServices: any = null;

const initializeFramework = async () => {
    try {
        logger.info('🚀 Initializing Express Advanced Framework...');

        frameworkServices = await frameworkInitializer.initialize(prisma);

        // Only register custom health checks for core services
        frameworkInitializer.registerCustomHealthChecks();

        logger.info('✅ Framework initialization completed successfully');
    } catch (error) {
        logger.error('❌ Framework initialization failed:', {
            error: error instanceof Error ? error.message : error
        });
        // Don't crash the app, just log the error
    }
};

// Export framework initializer for lazy loading services
export { frameworkInitializer };

// Initialize framework asynchronously
initializeFramework();

// Helmet untuk mengatur berbagai header HTTP guna melindungi aplikasi dari kerentanan web yang umum.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}))

// Konfigurasi CORS - Menangani Berbagi Sumber Daya Lintas-Origin
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (config.NODE_ENV === "production") {
            // In production, only allow specific origins from environment
            if (config.ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        } else {
            // In development, allow all origins but log them
            logger.debug(`CORS request from origin: ${origin}`);
            return callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        ...(config.NODE_ENV !== "production" ? ['ngrok-skip-browser-warning'] : [])
    ],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    maxAge: 86400 // Cache preflight for 24 hours
}))

//Rate limiting untuk melindungi dari serangan brute-force dan penyalahgunaan
app.use(generalLimiter)

// Middleware pengurai body - Mengurai payload JSON dan URL-encoded
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Cookie parser middleware
app.use(cookieParser())

// Middleware kompresi - Mengompres body respons untuk pemuatan yang lebih cepat
app.use(compression());
app.use(requestLogger)

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Health check endpoints
app.get('/health', async (req, res) => {
    if (frameworkServices?.health) {
        return frameworkServices.health.middleware()(req, res);
    }

    // Fallback health check
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    };

    logger.health('healthy', healthData);
    res.json(healthData);
});

app.get('/health/ready', async (req, res) => {
    if (frameworkServices?.health) {
        return frameworkServices.health.readinessCheck()(req, res);
    }

    const readyData = { status: 'ready' };
    logger.health('ready', readyData);
    res.json(readyData);
});

app.get('/health/live', (req, res) => {
    if (frameworkServices?.health) {
        return frameworkServices.health.livenessCheck()(req, res);
    }

    const liveData = { status: 'alive' };
    logger.health('alive', liveData);
    res.json(liveData);
});

app.use(App.API_PREFIX, apiRouter)

app.use(notFound)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
    if (frameworkServices) {
        await frameworkInitializer.shutdown();
    }

    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    if (frameworkServices) {
        await frameworkInitializer.shutdown();
    }

    await prisma.$disconnect();
    process.exit(0);
});

export default app