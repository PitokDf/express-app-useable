import { HttpStatus } from "@/constants/http-status";
import { Messages } from "@/constants/message";
import { AppError } from "@/errors/app-error";
import { UserRepository } from "@/repositories/user.repository";
import { CreateUserInput, UpdateUserInput } from "@/schemas/user.schema";
import { BcryptUtil } from "@/utils";
import { cacheManager } from "@/utils/cache";
import logger from "@/utils/winston.logger";

export async function getAllUserService() {
    const cacheKey = 'users:all';

    // Try to get from cache first
    const cachedUsers = cacheManager.get<any[]>(cacheKey);
    if (cachedUsers) {
        logger.debug('[CACHE] Users served from cache');
        return cachedUsers;
    }

    logger.debug('[CACHE] Users cache miss, fetching from database');

    // If not in cache, fetch from database
    const users = await UserRepository.findAllOptimized();
    const result = users.map((user: any) => ({ ...user, password: '[REDACTED]' }));

    // Cache the result for 5 minutes (300 seconds)
    cacheManager.set(cacheKey, result, 300);

    return result;
}

export async function getUserByIdService(userId: string) {
    const user = await UserRepository.findById(userId)

    if (!user) throw new AppError(Messages.NOT_FOUND, HttpStatus.NOT_FOUND);

    return { ...user, password: '[REDACTED]' }
}

export async function getUserByEmailService(email: string, ignoreUserId?: string) {
    const user = await UserRepository.findByEmail(email, ignoreUserId)

    return user
}

export async function createUserService(data: CreateUserInput) {
    data.password = (await BcryptUtil.hash(data.password))!

    const user = await UserRepository.create(data);

    // Invalidate cache after create
    cacheManager.del('users:all');

    return { ...user, password: '[REDACTED]' }
}

export async function updateUserService(userId: string, data: UpdateUserInput) {
    await getUserByIdService(userId)
    if (data && data.password) {
        data.password = (await BcryptUtil.hash(data.password))!
    }

    const user = await UserRepository.update(userId, data)

    // Invalidate cache after update
    cacheManager.del('users:all');

    return { ...user, password: '[REDACTED]' }
}

export async function deleteUserService(userId: string) {
    await getUserByIdService(userId)

    const user = await UserRepository.delete(userId)

    // Invalidate cache after delete
    cacheManager.del('users:all');

    return { ...user, password: '[REDACTED]' }
}