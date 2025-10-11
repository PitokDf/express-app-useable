import { config } from "./config";
import logger from "./utils/winston.logger";
import { startServer } from "./utils/app-utils";

process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught exception occurred', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled promise rejection', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : undefined,
        promise
    });
    process.exit(1);
});

startServer(config.PORT);
