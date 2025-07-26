import { PrismaClient } from '@prisma/client';
import { DatabaseTransactionService } from './database-transaction';
import { HealthCheckService } from './health-check';
import { ApiVersioningService, VersionConfig } from './api-versioning';
import { backgroundJobService, QueueConfigs } from './background-jobs';
import { emailService } from './email';
import { cacheManager } from './cache';
import { fileUploadService } from './file-upload';
import logger from './winston.logger';
import { config } from '../config';

export interface FrameworkServices {
    database: DatabaseTransactionService;
    health: HealthCheckService;
    versioning: ApiVersioningService;
    backgroundJobs: typeof backgroundJobService;
    email: typeof emailService;
    cache: typeof cacheManager;
    fileUpload: typeof fileUploadService;
}

class FrameworkInitializer {
    private services: Partial<FrameworkServices> = {};
    private initialized = false;

    /**
     * Initialize all framework services
     */
    async initialize(prismaClient: PrismaClient): Promise<FrameworkServices> {
        if (this.initialized) {
            logger.warn('Framework already initialized, returning existing services');
            return this.services as FrameworkServices;
        }

        logger.info('Initializing Express Framework Services...');

        try {
            // Initialize Database Transaction Service
            this.services.database = new DatabaseTransactionService(prismaClient);
            logger.info('✓ Database Transaction Service initialized');

            // Initialize Health Check Service
            this.services.health = new HealthCheckService(prismaClient);
            logger.info('✓ Health Check Service initialized');

            // Initialize API Versioning Service
            const versionConfigs: VersionConfig[] = [
                { version: '1.0' },
                { version: '1.1' },
                {
                    version: '2.0',
                    deprecated: false
                }
            ];

            this.services.versioning = new ApiVersioningService({
                defaultVersion: config.API_DEFAULT_VERSION,
                supportedVersions: versionConfigs,
                versionHeader: config.API_VERSION_HEADER,
                deprecationWarnings: true
            });
            logger.info('✓ API Versioning Service initialized');

            // Initialize Background Job Service
            this.services.backgroundJobs = backgroundJobService;

            // Create default queues
            backgroundJobService.createQueue(QueueConfigs.DEFAULT);
            backgroundJobService.createQueue(QueueConfigs.EMAIL);
            backgroundJobService.createQueue(QueueConfigs.HIGH_PRIORITY);
            backgroundJobService.createQueue(QueueConfigs.LOW_PRIORITY);
            logger.info('✓ Background Job Service initialized with default queues');

            // Initialize Email Service
            this.services.email = emailService;

            // Verify email connection in development
            if (config.NODE_ENV === 'development' && config.EMAIL_USER) {
                try {
                    await emailService.verifyConnection();
                    logger.info('✓ Email Service initialized and verified');
                } catch (error) {
                    logger.warn('⚠ Email Service initialized but connection failed:', error);
                }
            } else {
                logger.info('✓ Email Service initialized (connection not verified)');
            }

            // Initialize Cache Manager
            this.services.cache = cacheManager;
            logger.info('✓ Cache Manager initialized');

            // Initialize File Upload Service
            this.services.fileUpload = fileUploadService;
            logger.info('✓ File Upload Service initialized');

            this.initialized = true;
            logger.info('🚀 All Framework Services initialized successfully!');

            return this.services as FrameworkServices;

        } catch (error) {
            logger.error('Failed to initialize framework services:', error);
            throw error;
        }
    }

    /**
     * Get initialized services
     */
    getServices(): FrameworkServices {
        if (!this.initialized) {
            throw new Error('Framework services not initialized. Call initialize() first.');
        }
        return this.services as FrameworkServices;
    }

    /**
     * Setup common job processors
     */
    setupJobProcessors(): void {
        const jobs = this.services.backgroundJobs;
        if (!jobs) {
            throw new Error('Background job service not initialized');
        }

        // Email job processor
        jobs.registerProcessor('email', 'send', async (job) => {
            const { to, subject, html, text } = job.data;

            job.progress(10);
            const success = await emailService.sendEmail({ to, subject, html, text });
            job.progress(100);

            return { success, timestamp: new Date().toISOString() };
        });

        // Welcome email job processor
        jobs.registerProcessor('email', 'welcome', async (job) => {
            const { email, name } = job.data;

            job.progress(20);
            const success = await emailService.sendWelcomeEmail(email, name);
            job.progress(100);

            return { success, email, timestamp: new Date().toISOString() };
        });

        // Password reset email job processor
        jobs.registerProcessor('email', 'password-reset', async (job) => {
            const { email, token, name } = job.data;

            job.progress(20);
            const success = await emailService.sendPasswordResetEmail(email, token, name);
            job.progress(100);

            return { success, email, timestamp: new Date().toISOString() };
        });

        // Cache cleanup job processor
        jobs.registerProcessor('default', 'cache-cleanup', async (job) => {
            job.progress(10);

            const stats = cacheManager.getStats();
            logger.info('Cache stats before cleanup:', stats);

            job.progress(50);
            cacheManager.flush();
            job.progress(100);

            return {
                action: 'cache-cleanup',
                statsBefore: stats,
                timestamp: new Date().toISOString()
            };
        });

        logger.info('✓ Default job processors registered');
    }

    /**
     * Register custom health checks
     */
    registerCustomHealthChecks(): void {
        const health = this.services.health;
        if (!health) {
            throw new Error('Health check service not initialized');
        }

        // Email service health check
        if (config.EMAIL_USER) {
            health.registerChecker('email', async () => {
                const startTime = Date.now();
                try {
                    await emailService.verifyConnection();
                    const responseTime = Date.now() - startTime;

                    return {
                        name: 'email',
                        status: responseTime < 2000 ? 'healthy' : 'degraded',
                        message: `Email service ${responseTime < 2000 ? 'healthy' : 'slow'}`,
                        responseTime,
                        timestamp: new Date().toISOString(),
                        details: {
                            provider: config.EMAIL_PROVIDER,
                            responseTime: `${responseTime}ms`
                        }
                    };
                } catch (error) {
                    return {
                        name: 'email',
                        status: 'unhealthy',
                        message: `Email service error: ${error}`,
                        responseTime: Date.now() - startTime,
                        timestamp: new Date().toISOString(),
                    };
                }
            });
        }

        // Background jobs health check
        if (config.REDIS_HOST) {
            health.registerChecker('background-jobs', async () => {
                const startTime = Date.now();
                try {
                    const stats = await backgroundJobService.getAllQueuesStats();
                    const responseTime = Date.now() - startTime;

                    // Check if any queue has too many failed jobs
                    const hasIssues = Object.values(stats).some((queueStats: any) =>
                        queueStats.failed > 10
                    );

                    return {
                        name: 'background-jobs',
                        status: hasIssues ? 'degraded' : 'healthy',
                        message: hasIssues ? 'Some queues have failed jobs' : 'Background jobs healthy',
                        responseTime,
                        timestamp: new Date().toISOString(),
                        details: stats
                    };
                } catch (error) {
                    return {
                        name: 'background-jobs',
                        status: 'unhealthy',
                        message: `Background jobs error: ${error}`,
                        responseTime: Date.now() - startTime,
                        timestamp: new Date().toISOString(),
                    };
                }
            });
        }

        logger.info('✓ Custom health checks registered');
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        logger.info('Shutting down framework services...');

        try {
            // Close background job queues
            if (this.services.backgroundJobs) {
                await this.services.backgroundJobs.closeAllQueues();
                logger.info('✓ Background job queues closed');
            }

            // Clear cache
            if (this.services.cache) {
                this.services.cache.flush();
                logger.info('✓ Cache cleared');
            }

            logger.info('✓ Framework services shut down successfully');
        } catch (error) {
            logger.error('Error during framework shutdown:', error);
        }
    }

    /**
     * Get service status
     */
    getStatus(): {
        initialized: boolean;
        services: string[];
        timestamp: string;
    } {
        return {
            initialized: this.initialized,
            services: Object.keys(this.services),
            timestamp: new Date().toISOString()
        };
    }
}

// Export singleton instance
export const frameworkInitializer = new FrameworkInitializer();
