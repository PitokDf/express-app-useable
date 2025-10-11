import jwt from 'jsonwebtoken';
import { config } from '@/config';

export type JwtPayload = {
    user_id: string | number;
    email: string;
    name: string;

    // tambahkan yang lainnya jika dibutuhkan
}

export const JwtUtil = {
    generate(payload: JwtPayload, expiresIn: any = '1D'): string {
        return jwt.sign(payload, config.JWT_SECRET, {
            algorithm: "HS256",
            expiresIn,
            issuer: config.JWT_ISSUER
        });
    },

    verify(token: string): jwt.JwtPayload & JwtPayload {
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ["HS256"],
            issuer: config.JWT_ISSUER
        }) as jwt.JwtPayload & JwtPayload;
    },

    decode(token: string): jwt.JwtPayload {
        return jwt.decode(token) as jwt.JwtPayload;
    }
};
