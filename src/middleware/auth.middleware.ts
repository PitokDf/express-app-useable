import { config } from "@/config";
import { JwtPayload, JwtUtil, ResponseUtil } from "@/utils";
import { Auth } from "@/utils/auth";
import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Request {
            auth_user?: JwtPayload;
        }
    }
}

/**
 * Auth middleware:
 * - expects Authorization: Bearer <token>
 * - verifies JWT and attaches decoded payload to req.user
 */
export default function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authCookie = req.cookies
    const authHeader = req.headers.authorization;

    if ((!authCookie && config.TOKEN_SET_IN == "cookie") || ((!authHeader || !authHeader?.startsWith("Bearer ")) && config.TOKEN_SET_IN == "header")) {
        return ResponseUtil.unauthorized(res, "Unauthorized");
    }

    try {
        let token: string

        switch (config.TOKEN_SET_IN) {
            case "cookie": token = authCookie.token; break;
            case "header": token = authHeader?.split(" ")[1]!; break;
        }

        const today = Math.floor(new Date().getTime() / 1000)
        const decoded = JwtUtil.verify(token);
        const isExpirytoken = today > decoded.exp!

        if (isExpirytoken) Auth.clearTokenCookieHttpOnly(res)
        req.auth_user = decoded;
        return next();
    } catch (err) {
        return ResponseUtil.unauthorized(res, "Invalid or expired token");
    }
}