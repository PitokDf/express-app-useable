import { networkInterfaces } from "node:os";
import app from "./app";
import { config } from "./config";
import logger from "./utils/winston.logger";

let activeServer: any = null;
let serverStarted = false;
let startupTimeout: NodeJS.Timeout | null = null;

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
    if (serverStarted) {
        return;
    }

    const server = app.listen(port, () => {
        // Set timeout to wait for potential errors
        startupTimeout = setTimeout(() => {
            serverStarted = true;

            const networks = getNetworkAdresses();
            const urls = [
                `http://localhost:${port}`,
                ...networks.map(addr => `http://${addr}:${port}`)
            ];

            activeServer = server;

            logger.serverStartup(port, config.NODE_ENV);
            logger.serverReady(port, urls);

            // Show professional startup banner in development
            if (!config.isProduction) {
                console.log('\n   ═══════════════════════════════════════════════════════════════');
                console.log('   🚀 EXPRESS SERVER READY');
                console.log('   ═══════════════════════════════════════════════════════════════');
                console.log(`   📍 Environment: ${config.NODE_ENV.toUpperCase()}`);
                console.log(`   🌐 Service: ${config.SERVICE}`);
                console.log(`   🔗 URLs:`);
                urls.forEach(url => console.log(`      • ${url}`));
                console.log('   ═══════════════════════════════════════════════════════════════\n');
            }
        }, 100); // Wait 100ms for potential errors
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
        // Clear the startup timeout since we got an error
        if (startupTimeout) {
            clearTimeout(startupTimeout);
            startupTimeout = null;
        }

        if (err.code === "EADDRINUSE") {
            logger.warn(`🔄 Port ${port} is busy, trying port ${port + 1}...`);
            // Close the failed server before trying the next port
            server.close(() => {
                startServer(port + 1);
            });
        } else {
            logger.error("❌ Server startup failed", {
                error: err.message,
                code: err.code,
                stack: err.stack
            });
            process.exit(1);
        }
    });

    return server;
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

// Graceful shutdown handlers
process.on('SIGINT', () => {
    logger.info('🛑 Received SIGINT, shutting down gracefully...');
    // Clear any pending startup timeout
    if (startupTimeout) {
        clearTimeout(startupTimeout);
        startupTimeout = null;
    }
    if (activeServer) {
        activeServer.close(() => {
            logger.info('👋 Server closed. Process exiting...');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', () => {
    logger.info('🛑 Received SIGTERM, shutting down gracefully...');
    // Clear any pending startup timeout
    if (startupTimeout) {
        clearTimeout(startupTimeout);
        startupTimeout = null;
    }
    if (activeServer) {
        activeServer.close(() => {
            logger.info('👋 Server closed. Process exiting...');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

startServer(config.PORT);
