/**
 * Generate date string based on format
 */
const generateDateString = (date: Date, format: string): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
        case 'YYYYMMDD':
            return `${year}${month}${day}`;
        case 'YYMMDD':
            return `${String(year).slice(-2)}${month}${day}`;
        case 'MMDDYY':
            return `${month}${day}${String(year).slice(-2)}`;
        case 'DDMMYY':
            return `${day}${month}${String(year).slice(-2)}`;
        default:
            return `${String(year).slice(-2)}${month}${day}`;
    }
};

/**
 * Generate time string
 */
const generateTimeString = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
};

/**
 * Generate random string
 */
const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate random number string
 */
const generateRandomNumber = (length: number): string => {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate sequential number with padding
 */
const generateSequential = (counter: number, padding: number = 4): string => {
    return String(counter).padStart(padding, '0');
};

/**
 * Validate generated code format
 */
export const validateCodeFormat = (code: string, expectedParts: number): boolean => {
    if (!code || typeof code !== 'string') return false;

    const parts = code.split('-');
    return parts.length === expectedParts && parts.every(part => part.length > 0);
};

// Export utility functions
export {
    generateDateString,
    generateTimeString,
    generateRandomString,
    generateRandomNumber,
    generateSequential
};