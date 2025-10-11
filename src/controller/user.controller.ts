
import { Request, Response } from "express";
import { createUserService, deleteUserService, getAllUserService, getUserByIdService, updateUserService } from "@/service/user.service";
import { loginService } from "@/service/user.service";
import { ResponseUtil } from "@/utils/response";
import { asyncHandler } from "@/middleware/error.middleware";
import { HttpStatus } from "@/constants/http-status";
import { MessageCodes } from "@/constants/message";
import { Auth } from "@/utils/auth";

export const getAllUserController = asyncHandler(async (req: Request, res: Response) => {
    const users = await getAllUserService()
    const authUser = req.auth_user
    console.log(authUser);
    return ResponseUtil.success(res, users, HttpStatus.OK, MessageCodes.SUCCESS)
})

export const getUserByIdController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId
    const user = await getUserByIdService(userId)

    return ResponseUtil.success(res, user)
})

export const createUserController = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body
    const user = await createUserService(payload)

    return ResponseUtil.success(res, user, HttpStatus.CREATED, MessageCodes.CREATED)
})

export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body
    const userId = req.params.userId
    const user = await updateUserService(userId, payload)

    return ResponseUtil.success(res, user, HttpStatus.OK, MessageCodes.UPDATED)
})

export const deleteUserController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId
    const user = await deleteUserService(userId)

    return ResponseUtil.success(res, user, HttpStatus.OK, MessageCodes.DELETED)
})

export const loginController = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await loginService(payload.email, payload.password);
    Auth.setTokenCookieHttpOnly(res, result.token, { duration: 3, unit: "d" })

    return ResponseUtil.success(res, result.user, HttpStatus.OK, "Login berhasil");
});