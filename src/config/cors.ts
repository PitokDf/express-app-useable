import cors from "cors"
import logger from "@/utils/winston.logger";
import { config } from ".";

export const corsConfiguration = cors({
    origin: (origin, callback) => {
        // Izinkan request tanpa origin (seperti dari Postman, cURL, atau mobile apps)
        if (!origin) return callback(null, true);

        if (config.NODE_ENV === "production") {
            // Di production, hanya izinkan origin yang ada di whitelist
            if (config.ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            } else {
                // Tolak origin lain
                return callback(new Error('Origin ini tidak diizinkan oleh kebijakan CORS.'));
            }
        } else {
            // Di development, izinkan semua origin untuk kemudahan development
            logger.debug(`CORS request dari origin: ${origin}`);
            return callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        // Tambahkan header khusus development jika perlu (contoh: ngrok)
        ...(config.NODE_ENV !== "production" ? ['ngrok-skip-browser-warning'] : [])
    ],
    optionsSuccessStatus: 200, // Untuk kompatibilitas dengan browser lama
    maxAge: 86400 // Cache preflight request selama 24 jam (dalam detik)
});