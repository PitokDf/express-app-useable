import prisma from "@/config/prisma";
import { User } from "@prisma/client";

export class UserRepository {
    static async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        })
    }

    static async findByEmail(email: string, ignoreUserId?: string): Promise<User | null> {
        return prisma.user.findFirst({
            where: {
                email,
                ...(ignoreUserId ?
                    { NOT: { id: ignoreUserId } }
                    : {}),
            }
        })
    }

    static async create(data: Pick<User, 'name' | 'email' | 'password'>): Promise<User> {
        return prisma.user.create({
            data,
        });
    }

    static async update(id: string, data: Partial<Pick<User, 'name' | 'password'>>): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    static async delete(id: string): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    }

    static async findAll(): Promise<User[]> {
        return prisma.user.findMany();
    }

    // Optimized version - select only needed fields
    static async findAllOptimized(options?: {
        skip?: number;
        take?: number
    }): Promise<Pick<User, 'id' | 'name' | 'email'>[]> {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                // Exclude password field for better performance
            },
            skip: options?.skip,
            take: options?.take,
        });
    }

    static async count(): Promise<number> {
        return prisma.user.count();
    }
}