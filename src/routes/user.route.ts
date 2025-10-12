
import { Router } from "express";
import {
    createUserController,
    deleteUserController,
    getAllUserController,
    getUserByIdController,
    logoutController,
    updateUserController
} from "@/controller/user.controller";
import { loginController } from "@/controller/user.controller";
import { validateSchema } from "@/middleware/zod.middleware";
import {
    createUserSchema,
    updateUserSchema
} from "@/schemas/user.schema";
import { loginSchema } from "@/schemas/user.schema";
import { checkEmailExists } from "@/validators/user.validator";
import authMiddleware from "@/middleware/auth.middleware";

const userRouter = Router()

// Public routes - tidak perlu authentication
userRouter.post(
    "/register",
    validateSchema(createUserSchema),
    checkEmailExists,
    createUserController);

userRouter.post('/login', validateSchema(loginSchema), loginController);

// Protected routes - perlu authentication
userRouter.use(authMiddleware)

userRouter.post('/logout', logoutController);

userRouter.get("/", getAllUserController);

userRouter.get(
    "/:userId",
    getUserByIdController);

userRouter.delete(
    "/:userId",
    deleteUserController);

userRouter.patch(
    "/:userId",
    validateSchema(updateUserSchema),
    checkEmailExists,
    updateUserController);


export default userRouter