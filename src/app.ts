import express from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import { config } from "./config"
import { generalLimiter } from "./middleware/rate-limit.middleware"
import compression from "compression"
import { requestLogger } from "./middleware/logging.middleware"
import { errorHandler, notFound } from "./middleware/error.middleware"
import { App } from "./constants/app"
import apiRouter from "./routes/index.routes"
import morgan from "morgan"
import { frameworkInitializer } from "./utils/framework-initializer"
import { prisma } from "./config/prisma"
import logger from "./utils/winston.logger"

const app = express()

// Initialize framework services
let frameworkServices: any = null;

const initializeFramework = async () => {
    try {
        logger.frameworkInit('services', 'starting', {
            components: ['database', 'cache', 'email', 'jobs', 'health']
        });

        frameworkServices = await frameworkInitializer.initialize(prisma);
        logger.frameworkInit('services', 'success');

        // Setup job processors
        logger.frameworkInit('job-processors', 'starting');
        frameworkInitializer.setupJobProcessors();
        logger.frameworkInit('job-processors', 'success');

        // Register custom health checks
        logger.frameworkInit('health-checks', 'starting');
        frameworkInitializer.registerCustomHealthChecks();
        logger.frameworkInit('health-checks', 'success');

        logger.info('🚀 All framework services initialized successfully');
    } catch (error) {
        logger.frameworkInit('initialization', 'error', {
            error: error instanceof Error ? error.message : error
        });
        // Don't crash the app, just log the error
    }
};

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
    origin: config.NODE_ENV === "production" ? config.CLIENT_URL : "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Metode HTTP yang diizinkan
    allowedHeaders: config.NODE_ENV === "production"
        ? ['Content-Type', 'Authorization', 'X-Requested-With']
        : ['Content-Type', 'Authorization', 'X-Requested-With', 'ngrok-skip-browser-warning'],
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

// Middleware logging permintaan (Morgan)
if (config.NODE_ENV === "development") {
    app.use(morgan('dev')); // Output ringkas dengan warna berdasarkan status respons untuk development
}

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

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Express Framework with Advanced Features",
        version: "2.0.0",
        features: [
            "Cache Management",
            "Email Service",
            "File Upload",
            "Pagination",
            "Database Transactions",
            "Background Jobs",
            "Health Checks",
            "API Versioning"
        ],
        endpoints: {
            health: "/health",
            framework: "/api/framework",
            users: "/api/users"
        }
    })
})

app.use(App.API_PREFIX, apiRouter)

app.use(notFound)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('🛑 Received SIGINT, shutting down gracefully...');

    if (frameworkServices) {
        logger.info('🔄 Shutting down framework services...');
        await frameworkInitializer.shutdown();
        logger.info('✅ Framework services shut down complete');
    }

    logger.database('disconnecting');
    await prisma.$disconnect();
    logger.database('disconnected');

    logger.info('👋 Application shutdown complete');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('🛑 Received SIGTERM, shutting down gracefully...');

    if (frameworkServices) {
        logger.info('🔄 Shutting down framework services...');
        await frameworkInitializer.shutdown();
        logger.info('✅ Framework services shut down complete');
    }

    logger.database('disconnecting');
    await prisma.$disconnect();
    logger.database('disconnected');

    logger.info('👋 Application shutdown complete');
    process.exit(0);
});

export default app