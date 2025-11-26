
import { Router } from "express";
import { validateSchema } from "@/middleware/zod.middleware";
import {
    createUserSchema,
    updateUserSchema
} from "@/schemas/user.schema";
import { loginSchema } from "@/schemas/user.schema";
import { checkEmailExists } from "@/validators/user.validator";
import authMiddleware from "@/middleware/auth.middleware";
import { UserController } from "@/controller/user.controller";

const userRouter = Router()

// Public routes - tidak perlu authentication
userRouter.post(
    "/register",
    validateSchema(createUserSchema),
    checkEmailExists,
    UserController.createUser);

userRouter.post('/login', validateSchema(loginSchema), UserController.login);

// Protected routes - perlu authentication
userRouter.use(authMiddleware)

userRouter.post('/logout', UserController.logout);

userRouter.get("/", UserController.getAllUser);

userRouter.get(
    "/:userId",
    UserController.getUserById);

userRouter.delete(
    "/:userId",
    UserController.deleteUser);

userRouter.patch(
    "/:userId",
    validateSchema(updateUserSchema),
    checkEmailExists,
    UserController.updateUser);

export default userRouter