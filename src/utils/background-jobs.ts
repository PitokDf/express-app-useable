import Bull, { Queue, Job, JobOptions } from 'bull';
import logger from './winston.logger';
import { config } from '@/config';

export interface JobData {
    [key: string]: any;
}

export interface JobResult {
    [key: string]: any;
}

export interface QueueConfig {
    name: string;
    concurrency?: number;
    attempts?: number;
    backoff?: {
        type: 'fixed' | 'exponential';
        delay: number;
    };
    removeOnComplete?: number;
    removeOnFail?: number;
}

export interface JobProgress {
    percentage: number;
    message?: string;
    data?: any;
}

type JobHandler<T = JobData, R = JobResult> = (job: Job<T>, done?: Bull.DoneCallback) => Promise<R> | R;

class BackgroundJobService {
    private queues: Map<string, Queue> = new Map();
    private redisConfig: Bull.QueueOptions;

    constructor() {
        this.redisConfig = {
            redis: {
                host: config.REDIS_HOST || 'localhost',
                port: parseInt(config.REDIS_PORT || '6379'),
                password: config.REDIS_PASSWORD,
                db: parseInt(config.REDIS_DB || '0'),
            },
            defaultJobOptions: {
                removeOnComplete: 10,
                removeOnFail: 5,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            },
        };
    }

    /**
     * Create or get existing queue
     */
    createQueue(config: QueueConfig): Queue {
        if (this.queues.has(config.name)) {
            return this.queues.get(config.name)!;
        }

        const queue = new Bull(config.name, {
            ...this.redisConfig,
            defaultJobOptions: {
                ...this.redisConfig.defaultJobOptions,
                attempts: config.attempts || 3,
                backoff: config.backoff || { type: 'exponential', delay: 2000 },
                removeOnComplete: config.removeOnComplete || 10,
                removeOnFail: config.removeOnFail || 5,
            },
        });

        // Set up event listeners
        this.setupEventListeners(queue, config.name);

        this.queues.set(config.name, queue);
        // Reduced logging verbosity - queue creation is now silent
        // logger.info(`Queue "${config.name}" created`);

        return queue;
    }

    /**
     * Register job processor
     */
    registerProcessor<T = JobData, R = JobResult>(
        queueName: string,
        jobType: string,
        handler: JobHandler<T, R>,
        concurrency?: number
    ): void {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue "${queueName}" not found. Create it first.`);
        }

        queue.process(jobType, concurrency || 1, async (job: Job<T>) => {
            // Reduced logging verbosity - processor registration is now silent
            // logger.info(`Processing job ${job.id} of type ${jobType} in queue ${queueName}`);

            try {
                const result = await handler(job);
                logger.info(`Job ${job.id} completed successfully`);
                return result;
            } catch (error) {
                logger.error(`Job ${job.id} failed:`, error);
                throw error;
            }
        });

        // Reduced logging verbosity - processor registration is now silent
        // logger.info(`Processor registered for job type "${jobType}" in queue "${queueName}"`);
    }

    /**
     * Add job to queue
     */
    async addJob<T = JobData>(
        queueName: string,
        jobType: string,
        data: T,
        options: JobOptions = {}
    ): Promise<Job<T>> {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue "${queueName}" not found. Create it first.`);
        }

        const job = await queue.add(jobType, data, options);
        logger.info(`Job ${job.id} of type ${jobType} added to queue ${queueName}`);

        return job;
    }

    /**
     * Add delayed job
     */
    async addDelayedJob<T = JobData>(
        queueName: string,
        jobType: string,
        data: T,
        delay: number,
        options: JobOptions = {}
    ): Promise<Job<T>> {
        return this.addJob(queueName, jobType, data, {
            ...options,
            delay,
        });
    }

    /**
     * Add recurring job (cron-like)
     */
    async addRecurringJob<T = JobData>(
        queueName: string,
        jobType: string,
        data: T,
        cronExpression: string,
        options: JobOptions = {}
    ): Promise<Job<T>> {
        return this.addJob(queueName, jobType, data, {
            ...options,
            repeat: { cron: cronExpression },
        });
    }

    /**
     * Get job by ID
     */
    async getJob(queueName: string, jobId: string): Promise<Job | null> {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue "${queueName}" not found`);
        }

        return queue.getJob(jobId);
    }

    /**
     * Cancel job
     */
    async cancelJob(queueName: string, jobId: string): Promise<boolean> {
        const job = await this.getJob(queueName, jobId);
        if (!job) {
            return false;
        }

        try {
            await job.remove();
            logger.info(`Job ${jobId} cancelled`);
            return true;
        } catch (error) {
            logger.error(`Failed to cancel job ${jobId}:`, error);
            return false;
        }
    }

    /**
     * Retry failed job
     */
    async retryJob(queueName: string, jobId: string): Promise<boolean> {
        const job = await this.getJob(queueName, jobId);
        if (!job) {
            return false;
        }

        try {
            await job.retry();
            logger.info(`Job ${jobId} retried`);
            return true;
        } catch (error) {
            logger.error(`Failed to retry job ${jobId}:`, error);
            return false;
        }
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(queueName: string) {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue "${queueName}" not found`);
        }

        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaiting(),
            queue.getActive(),
            queue.getCompleted(),
            queue.getFailed(),
            queue.getDelayed(),
        ]);

        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            delayed: delayed.length,
            total: waiting.length + active.length + completed.length + failed.length + delayed.length,
        };
    }

    /**
     * Get all queues statistics
     */
    async getAllQueuesStats() {
        const stats: Record<string, any> = {};

        for (const [name, queue] of this.queues) {
            stats[name] = await this.getQueueStats(name);
        }

        return stats;
    }

    /**
     * Clean queue (remove completed/failed jobs)
     */
    async cleanQueue(
        queueName: string,
        grace: number = 0,
        status: 'completed' | 'failed' | 'active' | 'waiting' = 'completed'
    ): Promise<Job[]> {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue "${queueName}" not found`);
        }

        const cleaned = await queue.clean(grace, status as any);
        logger.info(`Cleaned ${cleaned.length} ${status} jobs from queue ${queueName}`);

        return cleaned;
    }

    /**
     * Pause queue
     */
    async pauseQueue(queueName: string): Promise<void> {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue "${queueName}" not found`);
        }

        await queue.pause();
        logger.info(`Queue ${queueName} paused`);
    }

    /**
     * Resume queue
     */
    async resumeQueue(queueName: string): Promise<void> {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue "${queueName}" not found`);
        }

        await queue.resume();
        logger.info(`Queue ${queueName} resumed`);
    }

    /**
     * Close queue
     */
    async closeQueue(queueName: string): Promise<void> {
        const queue = this.queues.get(queueName);
        if (!queue) {
            return;
        }

        await queue.close();
        this.queues.delete(queueName);
        logger.info(`Queue ${queueName} closed`);
    }

    /**
     * Close all queues
     */
    async closeAllQueues(): Promise<void> {
        const closePromises = Array.from(this.queues.keys()).map(name => this.closeQueue(name));
        await Promise.all(closePromises);
        logger.info('All queues closed');
    }

    /**
     * Setup event listeners for queue
     */
    private setupEventListeners(queue: Queue, queueName: string): void {
        queue.on('completed', (job: Job, result: any) => {
            logger.info(`Job ${job.id} in queue ${queueName} completed`);
        });

        queue.on('failed', (job: Job, err: Error) => {
            logger.error(`Job ${job.id} in queue ${queueName} failed:`, err);
        });

        queue.on('progress', (job: Job, progress: any) => {
            logger.debug(`Job ${job.id} in queue ${queueName} progress: ${progress}%`);
        });

        queue.on('stalled', (job: Job) => {
            logger.warn(`Job ${job.id} in queue ${queueName} stalled`);
        });

        queue.on('error', (error: Error) => {
            logger.error(`Queue ${queueName} error:`, error);
        });
    }

    /**
     * Get queue instance
     */
    getQueue(queueName: string): Queue | undefined {
        return this.queues.get(queueName);
    }

    /**
     * List all queue names
     */
    getQueueNames(): string[] {
        return Array.from(this.queues.keys());
    }
}

// Pre-defined job types for common tasks
export const JobTypes = {
    EMAIL: 'email',
    IMAGE_PROCESSING: 'image_processing',
    DATA_EXPORT: 'data_export',
    BACKUP: 'backup',
    CLEANUP: 'cleanup',
    NOTIFICATION: 'notification',
    REPORT_GENERATION: 'report_generation',
} as const;

// Pre-defined queue configurations
export const QueueConfigs = {
    DEFAULT: {
        name: 'default',
        concurrency: 5,
        attempts: 3,
        removeOnComplete: 10,
        removeOnFail: 5,
    },
    EMAIL: {
        name: 'email',
        concurrency: 10,
        attempts: 5,
        removeOnComplete: 20,
        removeOnFail: 10,
    },
    HIGH_PRIORITY: {
        name: 'high_priority',
        concurrency: 2,
        attempts: 5,
        removeOnComplete: 5,
        removeOnFail: 10,
    },
    LOW_PRIORITY: {
        name: 'low_priority',
        concurrency: 1,
        attempts: 2,
        removeOnComplete: 5,
        removeOnFail: 3,
    },
} as const;

// Export singleton instance
export const backgroundJobService = new BackgroundJobService();
