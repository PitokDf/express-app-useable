import { Request, Response } from "express";
import { ResponseUtil } from "@/utils/response";
import { asyncHandler } from "@/middleware/error.middleware";
import { HttpStatus } from "@/constants/http-status";
import {
    cacheTestService,
    emailTestService,
    paginationTestService,
    backgroundJobsTestService,
    transactionTestService,
    frameworkStatusService
} from "@/service/framework.service";

export const cacheTestController = asyncHandler(async (req: Request, res: Response) => {
    const result = await cacheTestService();
    return ResponseUtil.success(res, result);
});

export const emailTestController = asyncHandler(async (req: Request, res: Response) => {
    const result = await emailTestService(req.body);
    return ResponseUtil.success(res, result);
});

export const fileUploadTestController = asyncHandler(async (req: Request, res: Response) => {
    return ResponseUtil.success(res, {
        message: 'File upload test endpoint - middleware needed for actual upload',
        note: 'Configure multer middleware in route for full functionality'
    });
});

export const paginationTestController = asyncHandler(async (req: Request, res: Response) => {
    const { data, pagination } = await paginationTestService(req.query);
    return ResponseUtil.paginated(res, data, pagination.page, pagination.limit, pagination.total);
});

export const backgroundJobsTestController = asyncHandler(async (req: Request, res: Response) => {
    const result = await backgroundJobsTestService(req.body);
    return ResponseUtil.success(res, result, HttpStatus.CREATED);
});

export const transactionTestController = asyncHandler(async (req: Request, res: Response) => {
    const result = await transactionTestService(req.body);
    return ResponseUtil.success(res, result);
});

export const frameworkStatusController = asyncHandler(async (req: Request, res: Response) => {
    const status = await frameworkStatusService();
    return ResponseUtil.success(res, status);
});
