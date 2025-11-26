
import { Request, Response } from "express";
import { createUserService, deleteUserService, getAllUserService, getUserByIdService, updateUserService, loginService } from "@/service/user.service";
import { ResponseUtil } from "@/utils/response";
import { asyncHandler } from "@/middleware/error.middleware";
import { HttpStatus } from "@/constants/http-status";
import { MessageCodes } from "@/constants/message";
import { Auth } from "@/utils/auth";
import logger from "@/utils/winston.logger";

export class UserController {
    public static getAllUser = asyncHandler(async (req: Request, res: Response) => {
        const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

        const result = await getAllUserService({ page, limit });
        const authUser = req.auth_user;

        logger.debug('Get all users request', { user: authUser, page, limit });

        return ResponseUtil.success(res, result, HttpStatus.OK, MessageCodes.SUCCESS);
    })

    public static getUserById = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.userId
        const user = await getUserByIdService(userId)

        return ResponseUtil.success(res, user)
    })

    public static createUser = asyncHandler(async (req: Request, res: Response) => {
        const payload = req.body
        const user = await createUserService(payload)

        return ResponseUtil.success(res, user, HttpStatus.CREATED, MessageCodes.CREATED)
    })

    public static updateUser = asyncHandler(async (req: Request, res: Response) => {
        const payload = req.body
        const userId = req.params.userId
        const user = await updateUserService(userId, payload)

        return ResponseUtil.success(res, user, HttpStatus.OK, MessageCodes.UPDATED)
    })

    public static deleteUser = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.userId
        const user = await deleteUserService(userId)

        return ResponseUtil.success(res, user, HttpStatus.OK, MessageCodes.DELETED)
    })

    public static login = asyncHandler(async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await loginService(payload.email, payload.password);
        Auth.setTokenCookieHttpOnly(res, result.token, { duration: 3, unit: "d" })

        return ResponseUtil.success(res, result.user, HttpStatus.OK, "Login berhasil");
    });

    public static logout = asyncHandler(async (req: Request, res: Response) => {
        Auth.clearTokenCookieHttpOnly(res)

        return ResponseUtil.success(res, null, HttpStatus.OK, "Logout berhasil");
    });
}