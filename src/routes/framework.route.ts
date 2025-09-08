import { Router } from "express";
import {
    cacheTestController,
    emailTestController,
    fileUploadTestController,
    paginationTestController,
    backgroundJobsTestController,
    transactionTestController,
    frameworkStatusController
} from "@/controller/framework.controller";

const frameworkRouter = Router();

// Cache testing routes
frameworkRouter.get("/cache/test", cacheTestController);

// Email testing routes  
frameworkRouter.post("/email/test", emailTestController);

// File upload testing routes (without middleware for now)
frameworkRouter.post("/upload/test", fileUploadTestController);

// Pagination testing routes
frameworkRouter.get("/pagination/test", paginationTestController);

// Background jobs testing routes
frameworkRouter.post("/jobs/email", backgroundJobsTestController);

// Transaction testing routes
frameworkRouter.post("/transaction/test", transactionTestController);

// Framework status
frameworkRouter.get("/status", frameworkStatusController);

export default frameworkRouter;
