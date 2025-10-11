import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from './winston.logger';
import { config } from '@/config';
import { cacheManager } from './cache';

export interface HealthCheckResult {
    name: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    message?: string;
    responseTime?: number;
    timestamp: string;
    details?: Record<string, any>;
}

export interface SystemHealth {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
    checks: HealthCheckResult[];
    summary: {
        total: number;
        healthy: number;
        unhealthy: number;
        degraded: number;
    };
}

type HealthChecker = () => Promise<HealthCheckResult>;

class HealthCheckService {
    private checkers: Map<string, HealthChecker> = new Map();
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
        this.registerDefaultCheckers();
    }

    /**
     * Register a custom health checker
     */
    registerChecker(name: string, checker: HealthChecker): void {
        this.checkers.set(name, checker);
        // Reduced logging verbosity - health checker registration is now silent
        // logger.info(`Health checker "${name}" registered`);
    }

    /**
     * Remove a health checker
     */
    removeChecker(name: string): boolean {
        const removed = this.checkers.delete(name);
        if (removed) {
            logger.info(`Health checker "${name}" removed`);
        }
        return removed;
    }

    /**
     * Run all health checks
     */
    async runAllChecks(): Promise<SystemHealth> {
        const startTime = Date.now();
        const checks: HealthCheckResult[] = [];

        // Run all health checks in parallel
        const checkPromises = Array.from(this.checkers.entries()).map(async ([name, checker]) => {
            try {
                const result = await checker();
                return { name, result };
            } catch (error) {
                logger.error(`Health check "${name}" failed:`, error);
                return {
                    name,
                    result: {
                        name,
                        status: 'unhealthy' as const,
                        message: error instanceof Error ? error.message : 'Unknown error',
                        responseTime: 0,
                        timestamp: new Date().toISOString(),
                    }
                };
            }
        });

        const checkResults = await Promise.allSettled(checkPromises);

        // Process results
        for (const result of checkResults) {
            if (result.status === 'fulfilled') {
                checks.push(result.value.result);
            } else {
                checks.push({
                    name: 'unknown',
                    status: 'unhealthy',
                    message: 'Health check failed to execute',
                    timestamp: new Date().toISOString(),
                });
            }
        }

        // Calculate summary
        const summary = {
            total: checks.length,
            healthy: checks.filter(c => c.status === 'healthy').length,
            unhealthy: checks.filter(c => c.status === 'unhealthy').length,
            degraded: checks.filter(c => c.status === 'degraded').length,
        };

        // Determine overall status
        let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
        if (summary.unhealthy > 0) {
            overallStatus = 'unhealthy';
        } else if (summary.degraded > 0) {
            overallStatus = 'degraded';
        }

        const totalResponseTime = Date.now() - startTime;
        logger.info(`Health check completed in ${totalResponseTime}ms - Status: ${overallStatus}`);

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: config.NODE_ENV || 'development',
            checks,
            summary,
        };
    }

    /**
     * Run a specific health check
     */
    async runCheck(name: string): Promise<HealthCheckResult | null> {
        const checker = this.checkers.get(name);
        if (!checker) {
            logger.warn(`Health checker "${name}" not found`);
            return null;
        }

        try {
            return await checker();
        } catch (error) {
            logger.error(`Health check "${name}" failed:`, error);
            return {
                name,
                status: 'unhealthy',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            };
        }
    }

    /**
     * Express middleware for health check endpoint
     */
    middleware() {
        return async (req: Request, res: Response) => {
            try {
                const health = await this.runAllChecks();

                // Set appropriate HTTP status code
                let httpStatus = 200;
                if (health.status === 'degraded') {
                    httpStatus = 200; // Still considered OK but with warnings
                } else if (health.status === 'unhealthy') {
                    httpStatus = 503; // Service Unavailable
                }

                res.status(httpStatus).json(health);
            } catch (error) {
                logger.error('Health check endpoint failed:', error);
                res.status(500).json({
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    message: 'Health check system failure',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };
    }

    /**
     * Simple readiness check (for Kubernetes readiness probe)
     */
    readinessCheck() {
        return async (req: Request, res: Response) => {
            try {
                // Run only critical checks for readiness
                const criticalChecks = ['database', 'cache'];
                const results = await Promise.all(
                    criticalChecks.map(name => this.runCheck(name))
                );

                const hasUnhealthy = results.some(result =>
                    result && result.status === 'unhealthy'
                );

                if (hasUnhealthy) {
                    res.status(503).json({ status: 'not ready' });
                } else {
                    res.status(200).json({ status: 'ready' });
                }
            } catch (error) {
                res.status(503).json({ status: 'not ready', error: error });
            }
        };
    }

    /**
     * Simple liveness check (for Kubernetes liveness probe)
     */
    livenessCheck() {
        return (req: Request, res: Response) => {
            // Simple check - if the process is running, it's alive
            res.status(200).json({
                status: 'alive',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        };
    }

    /**
     * Register default health checkers
     */
    private registerDefaultCheckers(): void {
        // Database health check
        this.registerChecker('database', async (): Promise<HealthCheckResult> => {
            const startTime = Date.now();
            try {
                await this.prisma.$queryRaw`SELECT 1`;
                const responseTime = Date.now() - startTime;

                return {
                    name: 'database',
                    status: responseTime < 1000 ? 'healthy' : 'degraded',
                    message: `Database connection ${responseTime < 1000 ? 'healthy' : 'slow'}`,
                    responseTime,
                    timestamp: new Date().toISOString(),
                    details: {
                        responseTime: `${responseTime}ms`,
                        threshold: '1000ms'
                    }
                };
            } catch (error) {
                return {
                    name: 'database',
                    status: 'unhealthy',
                    message: `Database connection failed: ${error}`,
                    responseTime: Date.now() - startTime,
                    timestamp: new Date().toISOString(),
                };
            }
        });

        // Memory health check
        this.registerChecker('memory', async (): Promise<HealthCheckResult> => {
            const memUsage = process.memoryUsage();
            const totalMemory = memUsage.heapTotal;
            const usedMemory = memUsage.heapUsed;
            const memoryUsagePercent = (usedMemory / totalMemory) * 100;

            let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
            let message = 'Memory usage normal';

            if (memoryUsagePercent > 90) {
                status = 'unhealthy';
                message = 'Critical memory usage';
            } else if (memoryUsagePercent > 75) {
                status = 'degraded';
                message = 'High memory usage';
            }

            return {
                name: 'memory',
                status,
                message,
                timestamp: new Date().toISOString(),
                details: {
                    usagePercent: `${memoryUsagePercent.toFixed(2)}%`,
                    heapUsed: `${Math.round(usedMemory / 1024 / 1024)}MB`,
                    heapTotal: `${Math.round(totalMemory / 1024 / 1024)}MB`,
                    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
                }
            };
        });

        // Cache health check
        this.registerChecker('cache', async (): Promise<HealthCheckResult> => {
            const startTime = Date.now();
            try {
                const testKey = 'health_check_test';
                const testValue = Date.now().toString();

                // Test cache write
                cacheManager.set(testKey, testValue, 10); // 10 seconds TTL

                // Test cache read
                const cachedValue = cacheManager.get(testKey);

                // Cleanup
                cacheManager.del(testKey);

                const responseTime = Date.now() - startTime;

                if (cachedValue === testValue) {
                    return {
                        name: 'cache',
                        status: responseTime < 100 ? 'healthy' : 'degraded',
                        message: `Cache ${responseTime < 100 ? 'healthy' : 'slow response'}`,
                        responseTime,
                        timestamp: new Date().toISOString(),
                        details: {
                            responseTime: `${responseTime}ms`,
                            stats: cacheManager.getStats()
                        }
                    };
                } else {
                    return {
                        name: 'cache',
                        status: 'unhealthy',
                        message: 'Cache read/write test failed',
                        responseTime,
                        timestamp: new Date().toISOString(),
                    };
                }
            } catch (error) {
                return {
                    name: 'cache',
                    status: 'unhealthy',
                    message: `Cache error: ${error}`,
                    responseTime: Date.now() - startTime,
                    timestamp: new Date().toISOString(),
                };
            }
        });

        // Disk space health check
        this.registerChecker('disk', async (): Promise<HealthCheckResult> => {
            try {
                const fs = await import('fs');
                fs.statSync(process.cwd());

                // This is a simplified check - in production, you might want to use a more sophisticated disk space check
                return {
                    name: 'disk',
                    status: 'healthy',
                    message: 'Disk space check completed',
                    timestamp: new Date().toISOString(),
                    details: {
                        workingDirectory: process.cwd(),
                        note: 'Basic disk access check only'
                    }
                };
            } catch (error) {
                return {
                    name: 'disk',
                    status: 'unhealthy',
                    message: `Disk access failed: ${error}`,
                    timestamp: new Date().toISOString(),
                };
            }
        });

        // Reduced logging verbosity - default health checkers registration is now silent
        // logger.info('Default health checkers registered');
    }
}

export { HealthCheckService };
