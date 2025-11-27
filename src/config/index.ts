// import dotenv from "dotenv"

// dotenv.config()

export const config = {
    PORT: parseInt(process.env.PORT || "6789", 10),
    NODE_ENV: process.env.NODE_ENV || "development",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    BASE_URL: process.env.BASE_URL || "http://localhost:6789",
    JWT_SECRET: process.env.JWT_SECRET || "rahasia-123-!@#",
    JWT_ISSUER: process.env.JWT_ISSUER || "localhost",
    SERVICE: process.env.SERVICE_NAME || "service-1",
    isProduction: process.env.NODE_ENV !== "development",
    COOKIES_DOMAIN: process.env.COOKIES_DOMAIN || "localhost",
    TOKEN_SET_IN: process.env.TOKEN_SET_IN as "cookie" | "header" || "cookie",

    // rate limit
    rateLimit: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "90000", 10),
        MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    },

    // File upload configuration
    UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || "10485760", 10), // 10MB default
    UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",

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