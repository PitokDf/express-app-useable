import { HttpStatus } from "@/constants/http-status";
import { Messages } from "@/constants/message";
import { AppError } from "@/errors/app-error";
import { UserRepository } from "@/repositories/user.repository";
import { CreateUserInput, UpdateUserInput } from "@/schemas/user.schema";
import { BcryptUtil, JwtUtil } from "@/utils";
import { cacheManager } from "@/utils/cache";
import logger from "@/utils/winston.logger";

export interface PaginationQuery {
    page?: number;
    limit?: number;
}

export interface PaginatedUserResponse {
    data: Pick<{ id: string; name: string; email: string }, 'id' | 'name' | 'email'>[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export async function getAllUserService(query?: PaginationQuery) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const cacheKey = `users:all:page:${page}:limit:${limit}`;

    // Try to get from cache first
    const cachedResult = cacheManager.get<PaginatedUserResponse>(cacheKey);
    if (cachedResult) {
        logger.debug('[CACHE] Users served from cache', { page, limit });
        return cachedResult;
    }

    logger.debug('[CACHE] Users cache miss, fetching from database', { page, limit });

    // If not in cache, fetch from database
    const [users, total] = await Promise.all([
        UserRepository.findAllOptimized({ skip, take: limit }),
        UserRepository.count()
    ]);

    const result = {
        data: users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
        }
    };

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

/**
 * Helper function to invalidate all user list cache entries
 * since we use pagination (users:all:page:X:limit:Y pattern)
 */
function invalidateUserListCache() {
    cacheManager.delPattern('users:all:page:');
}

export async function createUserService(data: CreateUserInput) {
    data.password = (await BcryptUtil.hash(data.password))!

    const user = await UserRepository.create(data);

    // Invalidate all paginated cache after create
    invalidateUserListCache();

    return { ...user, password: '[REDACTED]' }
}

export async function updateUserService(userId: string, data: UpdateUserInput) {
    await getUserByIdService(userId)
    if (data && data.password) {
        data.password = (await BcryptUtil.hash(data.password))!
    }

    const user = await UserRepository.update(userId, data)

    // Invalidate all paginated cache after update
    invalidateUserListCache();

    return { ...user, password: '[REDACTED]' }
}

export async function deleteUserService(userId: string) {
    await getUserByIdService(userId)

    const user = await UserRepository.delete(userId)

    // Invalidate all paginated cache after delete
    invalidateUserListCache();

    return { ...user, password: '[REDACTED]' }
}

export async function loginService(email: string, password: string) {
    const user = await getUserByEmailService(email);
    if (!user) throw new AppError(Messages.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);

    const ok = await BcryptUtil.compare(password, user.password);
    if (!ok) throw new AppError(Messages.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);

    const token = JwtUtil.generate({ user_id: user.id, email: user.email, name: user.name }, "3D");

    return { token, user: { ...user, password: '[REDACTED]' } };
}