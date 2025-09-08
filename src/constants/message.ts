// Message Codes for API responses
export const MessageCodes = {
    // Success
    SUCCESS: 'SUCCESS',
    CREATED: 'CREATED',
    UPDATED: 'UPDATED',
    DELETED: 'DELETED',
    ACCEPTED: 'ACCEPTED',

    // Client Errors
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

    // Server Errors
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
} as const;

export type MessageCode = typeof MessageCodes[keyof typeof MessageCodes];

// Message mapping for actual text
export const Messages = {
    SUCCESS: 'Success',
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    ACCEPTED: 'Request accepted',

    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Not found',
    CONFLICT: 'Conflict occurred',
    VALIDATION_FAILED: 'Validation failed',
    INVALID_CREDENTIALS: 'Email or password is incorrect',
    TOO_MANY_REQUESTS: 'Too many requests',
    UNPROCESSABLE_ENTITY: 'Unprocessable entity',

    INTERNAL_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service unavailable',
} as const;

// Helper function to get message by code
export const getMessageByCode = (code: MessageCode): string => {
    return Messages[code] || Messages.INTERNAL_ERROR;
};

// Helper function to get code by message (reverse lookup)
export const getCodeByMessage = (message: string): MessageCode | null => {
    const entries = Object.entries(Messages) as [MessageCode, string][];
    const found = entries.find(([_, msg]) => msg === message);
    return found ? found[0] : null;
};
