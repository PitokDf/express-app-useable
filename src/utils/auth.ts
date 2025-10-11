import { config } from "@/config";
import { Response } from "express";

export class Auth {
    /**
   * Menyimpan token ke cookie `HttpOnly` secara aman pada response Express.
   * 
   * @param {Response} res - Objek response Express.
   * @param {string} token - Token autentikasi (mis. JWT).
   * @param {{ duration: number, unit: "m" | "h" | "d" | "w" | "infinity" }} expiresIn - 
   * Durasi dan satuan waktu kedaluwarsa cookie.
   * 
   * @example
   * Auth.setTokenCookieHttpOnly(res, jwtToken, { duration: 1, unit: 'h' });
   */
    static setTokenCookieHttpOnly(
        res: Response,
        token: string,
        expiresIn?: { duration: number; unit: "m" | "h" | "d" | "w" | "infinity" }
    ) {
        let maxAge: number;

        switch (expiresIn?.unit) {
            case "m": maxAge = expiresIn.duration * 60 * 1000; break;
            case "h": maxAge = expiresIn.duration * 60 * 60 * 1000; break;
            case "d": maxAge = expiresIn.duration * 24 * 60 * 60 * 1000; break;
            case "w": maxAge = expiresIn.duration * 7 * 24 * 60 * 60 * 1000; break;
            case "infinity": maxAge = 10 * 365 * 24 * 60 * 60 * 1000; break;
            default: maxAge = 24 * 60 * 60 * 1000;
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: !!config.COOKIES_DOMAIN,
            sameSite: !!config.COOKIES_DOMAIN ? "none" : "lax",
            domain: config.COOKIES_DOMAIN,
            maxAge,
            path: "/",
        });
    }

    static clearTokenCookieHttpOnly(res: Response) {
        res.clearCookie("token", {
            httpOnly: true,
            secure: !!config.COOKIES_DOMAIN,
            sameSite: !!config.COOKIES_DOMAIN ? 'none' : 'lax',
            domain: config.COOKIES_DOMAIN,
            path: '/'
        });
    }

}