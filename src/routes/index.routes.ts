import { Router } from "express";
import userRouter from "./user.route";
import frameworkRouter from "./framework.route";

const apiRouter = Router()

apiRouter.use('/users', userRouter)
apiRouter.use('/framework', frameworkRouter)

export default apiRouter