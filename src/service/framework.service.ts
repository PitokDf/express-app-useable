import { cacheManager } from "@/utils/cache";
import { JobTypes } from "@/utils/background-jobs";
import { DatabaseTransactionService } from "@/utils/database-transaction";
import { prisma } from "@/config/prisma";
import logger from "@/utils/winston.logger";
import { AppError } from "@/errors/app-error";
import { HttpStatus } from "@/constants/http-status";
import { frameworkInitializer } from "@/app";

const transactionService = new DatabaseTransactionService(prisma);

interface EmailTestPayload {
    to: string;
    subject: string;
    type?: 'welcome' | 'reset' | 'verification' | 'custom';
    body?: string;
}

interface BackgroundJobPayload {
    to?: string;
    subject?: string;
    body?: string;
    message?: string;
    delay?: number;
}

interface TransactionTestPayload {
    shouldFail?: boolean;
}

export async function cacheTestService() {
    const key = 'test-cache-key';
    const testData = {
        message: 'This is cached data',
        timestamp: new Date().toISOString(),
        random: Math.random()
    };

    logger.cache('setting', key, { ttl: 30 });
    // Set cache
    cacheManager.set(key, testData, 30); // 30 seconds TTL

    logger.cache('getting', key);
    // Get from cache
    const cachedData = cacheManager.get(key);

    const stats = cacheManager.getStats();
    logger.cache('stats retrieved', undefined, stats);

    return {
        original: testData,
        cached: cachedData,
        stats
    };
}

export async function emailTestService(payload: EmailTestPayload) {
    const { to, subject, type = 'welcome', body } = payload;

    if (!to || !subject) {
        logger.error('❌ Email test failed - missing required fields', { to, subject });
        throw new AppError('Missing required fields: to, subject', HttpStatus.BAD_REQUEST);
    }

    logger.email('sending test email', to, { type, subject });

    // Get email service lazily
    const emailSvc = await frameworkInitializer.getEmailService();

    let result;
    switch (type) {
        case 'welcome':
            result = await emailSvc.sendWelcomeEmail(to, 'Test User');
            break;
        case 'reset':
            result = await emailSvc.sendPasswordResetEmail(to, 'Test User', 'https://example.com/reset?token=test');
            break;
        case 'verification':
            result = await emailSvc.sendVerificationEmail(to, 'Test User', 'https://example.com/verify?token=test');
            break;
        case 'custom':
            result = await emailSvc.sendEmail({
                to,
                subject,
                text: body || 'This is a test email'
            });
            break;
        default:
            result = await emailSvc.sendEmail({
                to,
                subject,
                text: 'This is a test email'
            });
    }

    logger.email('test email completed', to, { result, type, subject });

    return { sent: result, to, subject, type };
}

export async function fileUploadTestService(file: Express.Multer.File | undefined) {
    if (!file) {
        throw new AppError('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    return {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path
    };
}

export async function paginationTestService(query: any) {
    // Parse query parameters using simple logic
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || '';

    // Simulate total data count
    const totalItems = 150;

    // Simulate paginated data
    const mockData = Array.from({ length: limit }, (_, i) => ({
        id: (page - 1) * limit + i + 1,
        name: `Item ${(page - 1) * limit + i + 1}`,
        description: `Description for item ${(page - 1) * limit + i + 1}`,
        ...(search && { searchTerm: search })
    }));

    return {
        data: mockData,
        pagination: {
            page,
            limit,
            total: totalItems
        }
    };
}

export async function backgroundJobsTestService(payload: BackgroundJobPayload) {
    const { to, subject, body, message, delay = 0 } = payload;

    // Get background job service lazily
    const bgJobSvc = await frameworkInitializer.getBackgroundJobService();

    // Determine job type and data based on payload
    let queueName: string;
    let jobType: string;
    let jobData: any;

    if (to && subject && body) {
        // Email job
        queueName = JobTypes.EMAIL;
        jobType = 'send-email';
        jobData = { to, subject, body };
        logger.job('creating email job', undefined, queueName, { to, subject });
    } else if (message) {
        // Notification job
        queueName = JobTypes.NOTIFICATION;
        jobType = 'send-notification';
        jobData = {
            message,
            scheduledFor: new Date(Date.now() + delay * 1000).toISOString()
        };
        logger.job('creating notification job', undefined, queueName, { message, delay });
    } else {
        logger.error('❌ Invalid job payload - missing required fields');
        throw new AppError('Invalid job payload', HttpStatus.BAD_REQUEST);
    }

    let job;
    if (delay > 0) {
        logger.job('scheduling delayed job', undefined, queueName, { delay });
        job = await bgJobSvc.addJob(queueName, jobType, jobData, {
            delay: delay * 1000 // Convert to milliseconds
        });
    } else {
        logger.job('queuing immediate job', undefined, queueName);
        job = await bgJobSvc.addJob(queueName, jobType, jobData);
    }

    logger.job('job created successfully', job.id?.toString(), queueName, { type: jobType });

    return {
        jobId: job.id,
        queue: queueName,
        type: jobType,
        data: jobData,
        delay: delay
    };
} export async function transactionTestService(payload: TransactionTestPayload) {
    const { shouldFail = false } = payload;

    const result = await transactionService.executeTransaction(async (tx) => {
        // Simulate some database operations
        logger.info('Transaction: Starting database operations');

        // Simulate first operation
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.info('Transaction: First operation completed');

        // Simulate second operation
        await new Promise(resolve => setTimeout(resolve, 100));
        logger.info('Transaction: Second operation completed');

        if (shouldFail) {
            throw new Error('Simulated transaction failure');
        }

        return {
            operation1: 'success',
            operation2: 'success',
            timestamp: new Date().toISOString()
        };
    });

    return result;
}

export async function frameworkStatusService() {
    return {
        framework: 'Express Advanced Framework',
        version: '1.0.0',
        features: {
            cache: 'enabled',
            email: 'enabled',
            fileUpload: 'enabled',
            pagination: 'enabled',
            backgroundJobs: 'enabled',
            healthCheck: 'enabled',
            apiVersioning: 'enabled',
            databaseTransaction: 'enabled'
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };
}
