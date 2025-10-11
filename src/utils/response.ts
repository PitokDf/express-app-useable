import { Response } from "express";
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
            ...(messageCode ? { messageCode } : {}),
            ...extra,
            timestamp: new Date().toISOString(),
            path: res.req.originalUrl
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Helper privat untuk memproses message atau messageCode.
     * Mengembalikan objek berisi pesan final dan messageCode (jika ada).
     */
    private static _resolveMessageAndCode(
        messageOrCode?: string | MessageCode,
        defaultCode?: MessageCode
    ): { message: string; messageCode?: MessageCode } {
        // Jika inputnya adalah MessageCode yang valid
        if (typeof messageOrCode === 'string' && Object.values(MessageCodes).includes(messageOrCode as MessageCode)) {
            return {
                message: getMessageByCode(messageOrCode as MessageCode),
                messageCode: messageOrCode as MessageCode,
            };
        }

        // Jika inputnya adalah string biasa (bukan MessageCode)
        if (typeof messageOrCode === 'string') {
            return { message: messageOrCode, messageCode: undefined };
        }

        // Jika tidak ada input sama sekali, gunakan defaultCode
        if (defaultCode) {
            return {
                message: getMessageByCode(defaultCode),
                messageCode: defaultCode,
            };
        }

        return { message: "An unexpected error occurred.", messageCode: undefined };
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
        if (messageOrCode) {
            const { message, messageCode } = this._resolveMessageAndCode(messageOrCode);
            return this.base(res, true, message, data, statusCode, undefined, undefined, messageCode);
        }
        return this.base(res, true, "Success", data, statusCode);
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
        const { message, messageCode } = this._resolveMessageAndCode(messageOrCode, MessageCodes.INTERNAL_ERROR);
        return this.base(res, false, message, null, statusCode, errors, undefined, messageCode);
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
        const { message, messageCode } = this._resolveMessageAndCode(messageOrCode, MessageCodes.NOT_FOUND);
        return this.base(res, false, message, null, HttpStatus.NOT_FOUND, undefined, undefined, messageCode);
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
        const { message, messageCode } = this._resolveMessageAndCode(messageOrCode, MessageCodes.CREATED);
        return this.base(res, true, message, data, HttpStatus.CREATED, undefined, undefined, messageCode);
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
        if (limit <= 0) throw new Error('Limit must be greater than 0');
        if (page < 1) throw new Error('Page must be greater than 0');
        if (total < 0) throw new Error('Total must be non-negative');

        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return this.base(res, true, message, data, HttpStatus.OK, undefined, {
            pagination: {
                page, limit, total, totalPages, hasNext, hasPrev,
                nextPage: hasNext ? page + 1 : null,
                prevPage: hasPrev ? page - 1 : null,
            },
        });
    }
}