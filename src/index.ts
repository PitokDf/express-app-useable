import { networkInterfaces } from "node:os";
import app from "./app";
import { config } from "./config";
import logger from "./utils/winston.logger";

function getNetworkAdresses(): string[] {
    const nets = networkInterfaces();
    const results: string[] = []

    for (const name of Object.keys(nets)) {
        const netsInterface = nets[name]!;
        for (const net of netsInterface) {
            if (net.family === "IPv4" && !net.internal) {
                results.push(net.address)
            }
        }
    }
    return results
}

function startServer(port: number) {
    // Log server startup
    logger.serverStartup(port, config.NODE_ENV);

    const server = app.listen(port, () => {
        const networks = getNetworkAdresses();
        const urls = [
            `http://localhost:${port}`,
            ...networks.map(addr => `http://${addr}:${port}`)
        ];

        // Log server ready with URLs
        logger.serverReady(port, urls);

        // Show professional startup banner in development
        if (!config.isProduction) {
            console.log('\n   ═══════════════════════════════════════════════════════════════');
            console.log('   🚀 EXPRESS ADVANCED FRAMEWORK - SERVER READY');
            console.log('   ═══════════════════════════════════════════════════════════════');
            console.log(`   📍 Environment: ${config.NODE_ENV.toUpperCase()}`);
            console.log(`   🌐 Service: ${config.SERVICE}`);
            console.log(`   🔗 URLs:`);
            urls.forEach(url => console.log(`      • ${url}`));
            console.log('   ─────────────────────────────────────────────────────────────────');
            console.log(`   ├─ 🏥 Health:     http://localhost:${port}/health`);
            console.log(`   ├─ 👥 Users:      http://localhost:${port}/api/v1/users`);
            console.log(`   └─ ⚙️  Framework: http://localhost:${port}/api/v1/framework`);
            console.log('   ═══════════════════════════════════════════════════════════════\n');
        }
    })

    server.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
            logger.warn(`🔄 Port ${port} in use, trying ${port + 1}...`, {
                originalPort: port,
                nextPort: port + 1,
                error: err.code
            });
            startServer(port + 1)
        } else {
            logger.error("❌ Server startup failed", {
                error: err.message,
                code: err.code,
                stack: err.stack
            });
            process.exit(1)
        }
    })

    // Graceful shutdown handlers
    process.on('SIGINT', () => {
        logger.info('🛑 Received SIGINT, shutting down gracefully...');
        server.close(() => {
            logger.info('👋 Server closed. Process exiting...');
            process.exit(0);
        });
    });

    process.on('SIGTERM', () => {
        logger.info('🛑 Received SIGTERM, shutting down gracefully...');
        server.close(() => {
            logger.info('👋 Server closed. Process exiting...');
            process.exit(0);
        });
    });
}

// Handle uncaught exceptions
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

startServer(config.PORT)
