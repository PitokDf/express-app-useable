import { Response, Request } from "express"
import { ApiResponse, PaginatedResponse } from "@/types/response";
import { HttpStatus } from "@/constants/http-status";
import { MessageCode, MessageCodes, getMessageByCode } from "@/constants/message";

export class ResponseUtil {
    private static base<T>(
        res: Response,
        success: boolean,
        message: string,
        data: T | null = null,
        statusCode: HttpStatus,
        errors?: any[],
        extra?: Record<string, any>,
        messageCode?: MessageCode
    ): Response<ApiResponse> {
        const response: any = {
            success,
            message,
            ...(data !== null ? { data } : {}),
            ...(errors ? { errors } : {}),
            ...extra,
            timestamp: new Date().toISOString(),
            path: res.req.originalUrl
        };

        // Add messageCode if provided
        if (messageCode) {
            response.messageCode = messageCode;
        }

        return res.status(statusCode).json(response);
    }

    static success<T>(
        res: Response,
        data: T,
        statusCode?: HttpStatus,
        message?: string
    ): Response<ApiResponse<T>>;
    static success<T>(
        res: Response,
        data: T,
        statusCode: HttpStatus,
        messageCode: MessageCode
    ): Response<ApiResponse<T>>;
    static success<T>(
        res: Response,
        data: T,
        statusCode: HttpStatus = HttpStatus.OK,
        messageOrCode?: string | MessageCode
    ): Response<ApiResponse<T>> {
        if (typeof messageOrCode === 'string' && Object.values(MessageCodes).includes(messageOrCode as MessageCode)) {
            // Using message code
            const message = getMessageByCode(messageOrCode as MessageCode);
            return this.base(res, true, message, data, statusCode, undefined, undefined, messageOrCode as MessageCode);
        } else if (messageOrCode && typeof messageOrCode === 'string') {
            // Using message text
            return this.base(res, true, messageOrCode, data, statusCode);
        } else {
            // Default success
            return this.base(res, true, "Success", data, statusCode);
        }
    }

    static error(
        res: Response,
        message?: string,
        errors?: any[],
        statusCode?: HttpStatus
    ): Response<ApiResponse<null>>;
    static error(
        res: Response,
        messageCode: MessageCode,
        errors?: any[],
        statusCode?: HttpStatus
    ): Response<ApiResponse<null>>;
    static error(
        res: Response,
        messageOrCode?: string | MessageCode,
        errors?: any[],
        statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
    ): Response<ApiResponse<null>> {
        if (typeof messageOrCode === 'string' && Object.values(MessageCodes).includes(messageOrCode as MessageCode)) {
            // Using message code
            const message = getMessageByCode(messageOrCode as MessageCode);
            return this.base(res, false, message, null, statusCode, errors, undefined, messageOrCode as MessageCode);
        } else if (messageOrCode && typeof messageOrCode === 'string') {
            // Using message text
            return this.base(res, false, messageOrCode, null, statusCode, errors);
        } else {
            // Default error
            const message = getMessageByCode(MessageCodes.INTERNAL_ERROR);
            return this.base(res, false, message, null, statusCode, errors, undefined, MessageCodes.INTERNAL_ERROR);
        }
    }

    static validationError(
        res: Response,
        errors: any[],
        message = 'Validation failed'
    ): Response<ApiResponse<null>> {
        return this.base(res, false, message, null, HttpStatus.BAD_REQUEST, errors);
    }

    static unprocessableEntity(
        res: Response,
        message = 'Unprocessable Entity',
        errors?: any[]
    ): Response<ApiResponse<null>> {
        return this.base(res, false, message, null, HttpStatus.UNPROCESSABLE_ENTITY, errors);
    }

    static unauthorized(
        res: Response,
        message = 'Unauthorized'
    ): Response<ApiResponse<null>> {
        return this.base(res, false, message, null, HttpStatus.UNAUTHORIZED);
    }

    static forbidden(
        res: Response,
        message = 'Forbidden'
    ): Response<ApiResponse<null>> {
        return this.base(res, false, message, null, HttpStatus.FORBIDDEN);
    }

    static notFound(
        res: Response,
        message?: string
    ): Response<ApiResponse<null>>;
    static notFound(
        res: Response,
        messageCode: MessageCode
    ): Response<ApiResponse<null>>;
    static notFound(
        res: Response,
        messageOrCode?: string | MessageCode
    ): Response<ApiResponse<null>> {
        if (typeof messageOrCode === 'string' && !Object.values(MessageCodes).includes(messageOrCode as MessageCode)) {
            return this.base(res, false, messageOrCode, null, HttpStatus.NOT_FOUND, undefined, undefined, MessageCodes.NOT_FOUND);
        } else if (messageOrCode && typeof messageOrCode === 'string') {
            const message = getMessageByCode(messageOrCode as MessageCode);
            return this.base(res, false, message, null, HttpStatus.NOT_FOUND, undefined, undefined, messageOrCode as MessageCode);
        } else {
            const message = getMessageByCode(MessageCodes.NOT_FOUND);
            return this.base(res, false, message, null, HttpStatus.NOT_FOUND, undefined, undefined, MessageCodes.NOT_FOUND);
        }
    }

    static created<T>(
        res: Response,
        data: T,
        message?: string
    ): Response<ApiResponse<T>>;
    static created<T>(
        res: Response,
        data: T,
        messageCode: MessageCode
    ): Response<ApiResponse<T>>;
    static created<T>(
        res: Response,
        data: T,
        messageOrCode?: string | MessageCode
    ): Response<ApiResponse<T>> {
        if (typeof messageOrCode === 'string' && !Object.values(MessageCodes).includes(messageOrCode as MessageCode)) {
            // Using message text
            return this.base(res, true, messageOrCode, data, HttpStatus.CREATED);
        } else if (messageOrCode && typeof messageOrCode === 'string') {
            // Using message code
            const message = getMessageByCode(messageOrCode as MessageCode);
            return this.base(res, true, message, data, HttpStatus.CREATED, undefined, undefined, messageOrCode as MessageCode);
        } else {
            // Default created
            const message = getMessageByCode(MessageCodes.CREATED);
            return this.base(res, true, message, data, HttpStatus.CREATED, undefined, undefined, MessageCodes.CREATED);
        }
    }

    static noContent(
        res: Response,
        message = 'No Content'
    ): Response<ApiResponse<null>> {
        return this.base(res, true, message, null, HttpStatus.NO_CONTENT);
    }

    static tooManyRequests(
        res: Response,
        message = 'Too Many Requests',
        retryAfter?: number
    ): Response<ApiResponse<null>> {
        const extra = retryAfter ? { retryAfter } : {};
        return this.base(res, false, message, null, HttpStatus.TOO_MANY_REQUESTS, undefined, extra);
    }

    static serviceUnavailable(
        res: Response,
        message = 'Service Unavailable'
    ): Response<ApiResponse<null>> {
        return this.base(res, false, message, null, HttpStatus.SERVICE_UNAVAILABLE);
    }

    static paginated<T>(
        res: Response,
        data: T[],
        page: number,
        limit: number,
        total: number,
        message = 'Success'
    ): Response<PaginatedResponse<T>> {
        // Validation
        if (limit <= 0) {
            throw new Error('Limit must be greater than 0');
        }
        if (page < 1) {
            throw new Error('Page must be greater than 0');
        }
        if (total < 0) {
            throw new Error('Total must be non-negative');
        }

        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return this.base(res, true, message, data, HttpStatus.OK, undefined, {
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev,
                nextPage: hasNext ? page + 1 : null,
                prevPage: hasPrev ? page - 1 : null,
            },
        });
    }
}

// Helper functions for quick responses
export const successResponse = <T>(message: string, data?: T, extra?: Record<string, any>) => ({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...extra
});

export const errorResponse = (message: string, errors?: any[], extra?: Record<string, any>) => ({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...extra
});