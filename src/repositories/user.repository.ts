import { User } from "@prisma/client";
import { db } from "@/config/prisma";

export class UserRepository {
    static async findById(id: string): Promise<User | null> {
        return db.user.findUnique({
            where: { id }
        })
    }

    static async findByEmail(email: string, ignoreUserId?: string): Promise<User | null> {
        return db.user.findFirst({
            where: {
                email,
                ...(ignoreUserId ?
                    { NOT: { id: ignoreUserId } }
                    : {}),
            }
        })
    }

    static async create(data: Pick<User, 'name' | 'email' | 'password'>): Promise<User> {
        return db.user.create({
            data,
        });
    }

    static async update(id: string, data: Partial<Pick<User, 'name' | 'password'>>): Promise<User> {
        return db.user.update({
            where: { id },
            data,
        });
    }

    static async delete(id: string): Promise<User> {
        return db.user.delete({
            where: { id },
        });
    }

    static async findAll(): Promise<User[]> {
        return db.user.findMany();
    }

    // Optimized version - select only needed fields
    static async findAllOptimized(): Promise<Pick<User, 'id' | 'name' | 'email'>[]> {
        return db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                // Exclude password field for better performance
            }
        });
    }
}