import express from "express"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { config } from "./config"
import { generalLimiter } from "./middleware/rate-limit.middleware"
import compression from "compression"
import { errorHandler, notFound } from "./middleware/error.middleware"
import { App } from "./constants/app"
import apiRouter from "./routes/index.routes"
import { requestLogger } from "./middleware/logging.middleware"
import { ResponseUtil } from "./utils"
import { HttpStatus } from "./constants/http-status"
import { corsConfiguration } from "./config/cors"
import prisma from "./config/prisma"

const app = express()

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
app.use(corsConfiguration)

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

app.use(App.API_PREFIX, apiRouter)

app.get("/", (req, res): void => {
    ResponseUtil.success(res, null, HttpStatus.OK, `Service ${config.SERVICE} is running`);
})
app.use(notFound)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

export default app