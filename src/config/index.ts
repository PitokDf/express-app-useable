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
    }
} as const