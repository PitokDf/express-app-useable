import { PrismaClient } from '@prisma/client';
import logger from './winston.logger';

export type TransactionCallback<T> = (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>;

export interface TransactionOptions {
    maxWait?: number; // Maximum time to wait for a transaction slot (in ms)
    timeout?: number; // Maximum time the transaction can run (in ms)
    isolationLevel?: 'Serializable'; // SQLite only supports Serializable
}

export interface TransactionResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    duration: number;
}

class DatabaseTransactionService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    /**
     * Execute a function within a database transaction
     */
    async executeTransaction<T>(
        callback: TransactionCallback<T>,
        options: TransactionOptions = {}
    ): Promise<TransactionResult<T>> {
        const startTime = Date.now();

        try {
            const transactionOptions: any = {
                maxWait: options.maxWait || 5000, // 5 seconds default
                timeout: options.timeout || 10000 // 10 seconds default
            };

            // Only add isolationLevel if provided (SQLite has limited support)
            if (options.isolationLevel) {
                transactionOptions.isolationLevel = options.isolationLevel;
            }

            const result = await this.prisma.$transaction(callback, transactionOptions);

            const duration = Date.now() - startTime;
            logger.info(`Transaction completed successfully in ${duration}ms`);

            return {
                success: true,
                data: result as T,
                duration
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`Transaction failed after ${duration}ms:`, error);

            return {
                success: false,
                error: error as Error,
                duration
            };
        }
    }

    /**
     * Execute multiple operations in a single transaction
     */
    async executeBatch<T>(
        callback: TransactionCallback<T[]>,
        options: TransactionOptions = {}
    ): Promise<TransactionResult<T[]>> {
        return this.executeTransaction(callback, options);
    }

    /**
     * Execute transaction with retry logic
     */
    async executeWithRetry<T>(
        callback: TransactionCallback<T>,
        maxRetries: number = 3,
        retryDelay: number = 1000,
        options: TransactionOptions = {}
    ): Promise<TransactionResult<T>> {
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const result = await this.executeTransaction(callback, options);

            if (result.success) {
                if (attempt > 1) {
                    logger.info(`Transaction succeeded on attempt ${attempt}`);
                }
                return result;
            }

            lastError = result.error!;

            // Don't retry if it's not a retryable error
            if (!this.isRetryableError(lastError)) {
                logger.warn(`Non-retryable error, stopping retries: ${lastError.message}`);
                break;
            }

            if (attempt < maxRetries) {
                logger.warn(`Transaction failed on attempt ${attempt}, retrying in ${retryDelay}ms...`);
                await this.delay(retryDelay);

                // Exponential backoff
                retryDelay *= 2;
            }
        }

        logger.error(`Transaction failed after ${maxRetries} attempts`);
        return {
            success: false,
            error: lastError!,
            duration: 0
        };
    }

    /**
     * Create a savepoint within a transaction (for nested transactions)
     */
    async createSavepoint(name: string): Promise<void> {
        await this.prisma.$executeRaw`SAVEPOINT ${name}`;
        logger.debug(`Created savepoint: ${name}`);
    }

    /**
     * Rollback to a savepoint
     */
    async rollbackToSavepoint(name: string): Promise<void> {
        await this.prisma.$executeRaw`ROLLBACK TO SAVEPOINT ${name}`;
        logger.debug(`Rolled back to savepoint: ${name}`);
    }

    /**
     * Release a savepoint
     */
    async releaseSavepoint(name: string): Promise<void> {
        await this.prisma.$executeRaw`RELEASE SAVEPOINT ${name}`;
        logger.debug(`Released savepoint: ${name}`);
    }

    /**
     * Execute with manual transaction control
     */
    async executeManualTransaction<T>(
        callback: (prisma: PrismaClient, controls: TransactionControls) => Promise<T>
    ): Promise<TransactionResult<T>> {
        const startTime = Date.now();

        try {
            // Begin transaction
            await this.prisma.$executeRaw`BEGIN`;

            const controls: TransactionControls = {
                commit: async () => {
                    await this.prisma.$executeRaw`COMMIT`;
                    logger.debug('Transaction committed manually');
                },
                rollback: async () => {
                    await this.prisma.$executeRaw`ROLLBACK`;
                    logger.debug('Transaction rolled back manually');
                },
                createSavepoint: (name: string) => this.createSavepoint(name),
                rollbackToSavepoint: (name: string) => this.rollbackToSavepoint(name),
                releaseSavepoint: (name: string) => this.releaseSavepoint(name)
            };

            const result = await callback(this.prisma, controls);

            // Auto-commit if not manually controlled
            try {
                await controls.commit();
            } catch (error) {
                // Transaction might have been manually committed/rolled back
                logger.debug('Auto-commit skipped (transaction already completed)');
            }

            const duration = Date.now() - startTime;
            logger.info(`Manual transaction completed successfully in ${duration}ms`);

            return {
                success: true,
                data: result,
                duration
            };
        } catch (error) {
            // Auto-rollback if not manually controlled
            try {
                await this.prisma.$executeRaw`ROLLBACK`;
                logger.debug('Auto-rollback executed');
            } catch (rollbackError) {
                logger.debug('Auto-rollback skipped (transaction already completed)');
            }

            const duration = Date.now() - startTime;
            logger.error(`Manual transaction failed after ${duration}ms:`, error);

            return {
                success: false,
                error: error as Error,
                duration
            };
        }
    }

    /**
     * Get transaction statistics
     */
    async getTransactionStats(): Promise<{
        activeTransactions: number;
        waitingTransactions: number;
        maxConnections: number;
        currentConnections: number;
    }> {
        try {
            // This is PostgreSQL specific - adjust for other databases
            const result = await this.prisma.$queryRaw<Array<{
                active_transactions: number;
                waiting_transactions: number;
                max_connections: number;
                current_connections: number;
            }>>`
                SELECT 
                    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_transactions,
                    (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type = 'Lock') as waiting_transactions,
                    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
                    (SELECT count(*) FROM pg_stat_activity) as current_connections
            `;

            return {
                activeTransactions: result[0].active_transactions,
                waitingTransactions: result[0].waiting_transactions,
                maxConnections: result[0].max_connections,
                currentConnections: result[0].current_connections
            };
        } catch (error) {
            logger.error('Failed to get transaction stats:', error);
            return {
                activeTransactions: 0,
                waitingTransactions: 0,
                maxConnections: 0,
                currentConnections: 0
            };
        }
    }

    /**
     * Check if error is retryable
     */
    private isRetryableError(error: Error): boolean {
        const retryableErrors = [
            'P2034', // Transaction conflict
            'P2037', // Too many database connections
            'ECONNRESET',
            'ETIMEDOUT',
            'ENOTFOUND'
        ];

        return retryableErrors.some(code =>
            error.message.includes(code) ||
            error.name.includes(code)
        );
    }

    /**
     * Delay helper for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create transaction middleware for Express routes
     */
    middleware() {
        return (req: any, res: any, next: any) => {
            req.transaction = {
                execute: <T>(callback: TransactionCallback<T>, options?: TransactionOptions) =>
                    this.executeTransaction(callback, options),
                executeWithRetry: <T>(
                    callback: TransactionCallback<T>,
                    maxRetries?: number,
                    retryDelay?: number,
                    options?: TransactionOptions
                ) => this.executeWithRetry(callback, maxRetries, retryDelay, options),
                executeBatch: <T>(callback: TransactionCallback<T[]>, options?: TransactionOptions) =>
                    this.executeTransaction(callback, options)
            };
            next();
        };
    }
}

export interface TransactionControls {
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    createSavepoint: (name: string) => Promise<void>;
    rollbackToSavepoint: (name: string) => Promise<void>;
    releaseSavepoint: (name: string) => Promise<void>;
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            transaction?: {
                execute: <T>(callback: TransactionCallback<T>, options?: TransactionOptions) => Promise<TransactionResult<T>>;
                executeWithRetry: <T>(
                    callback: TransactionCallback<T>,
                    maxRetries?: number,
                    retryDelay?: number,
                    options?: TransactionOptions
                ) => Promise<TransactionResult<T>>;
                executeBatch: <T>(callback: TransactionCallback<T[]>, options?: TransactionOptions) => Promise<TransactionResult<T[]>>;
            };
        }
    }
}

export { DatabaseTransactionService };
