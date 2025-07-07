import { HttpStatus } from "../constants/http-status";
import { Messages } from "../constants/message";
import { AppError } from "../errors/app-error";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserInput, UpdateUserInput } from "../schemas/user.schema";
import { BcryptUtil } from "../utils";

export async function getAllUserService() {
    const users = await UserRepository.findAll();
    return users.map(user => ({ ...user, password: '[REDACTED]' }))
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

    return { ...user, password: '[REDACTED]' }
}

export async function updateUserService(userId: string, data: UpdateUserInput) {
    await getUserByIdService(userId)
    if (data && data.password) {
        data.password = (await BcryptUtil.hash(data.password))!
    }

    const user = await UserRepository.update(userId, data)

    return { ...user, password: '[REDACTED]' }
}

export async function deleteUserService(userId: string) {
    await getUserByIdService(userId)

    const user = await UserRepository.delete(userId)

    return { ...user, password: '[REDACTED]' }
}