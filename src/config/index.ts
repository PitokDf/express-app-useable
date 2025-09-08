import dotenv from "dotenv"

dotenv.config()

export const config = {
    PORT: parseInt(process.env.PORT || "6789", 10),
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    BASE_URL: process.env.BASE_URL || "http://localhost:6789",
    JWT_SECRET: process.env.JWT_SECRET || "rahasia-123-!@#",
    SERVICE: process.env.SERVICE_NAME || "service-1",
    isProduction: process.env.NODE_ENV !== "development",

    // rate limit
    rateLimit: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "90000", 10),
        MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    },

    // Email configuration
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "smtp", // gmail or smtp
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    EMAIL_FROM: process.env.EMAIL_FROM || "",
    SMTP_HOST: process.env.SMTP_HOST || "localhost",
    SMTP_PORT: process.env.SMTP_PORT || "587",
    SMTP_SECURE: process.env.SMTP_SECURE || "false",

    // Redis configuration (for background jobs and caching)
    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PORT: process.env.REDIS_PORT || "6379",
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
    REDIS_DB: process.env.REDIS_DB || "0",

    // File upload configuration
    UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || "10485760", 10), // 10MB default
    UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",

    // API Versioning
    API_DEFAULT_VERSION: process.env.API_DEFAULT_VERSION || "1.0",
    API_VERSION_HEADER: process.env.API_VERSION_HEADER || "API-Version",

    // Cache configuration
    CACHE_TTL: parseInt(process.env.CACHE_TTL || "3600", 10), // 1 hour default
    CACHE_CHECK_PERIOD: parseInt(process.env.CACHE_CHECK_PERIOD || "600", 10), // 10 minutes

    // CORS configuration
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : [process.env.CLIENT_URL || "http://localhost:3000"],

    // Health check configuration
    HEALTH_CHECK_TIMEOUT: parseInt(process.env.HEALTH_CHECK_TIMEOUT || "5000", 10), // 5 seconds
} as const