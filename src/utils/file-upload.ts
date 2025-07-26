import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import logger from './winston.logger';
import { config } from '../config';

export interface FileUploadOptions {
    destination?: string;
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
    preserveOriginalName?: boolean;
}

export interface UploadedFileInfo {
    originalName: string;
    filename: string;
    path: string;
    size: number;
    mimetype: string;
    extension: string;
    url?: string;
}

class FileUploadService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.ensureUploadDir();
    }

    /**
     * Ensure upload directory exists
     */
    private ensureUploadDir(): void {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            logger.info(`Created upload directory: ${this.uploadDir}`);
        }
    }

    /**
     * Generate unique filename
     */
    private generateFilename(originalName: string, preserveOriginal: boolean = false): string {
        if (preserveOriginal) {
            return originalName;
        }

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension);

        return `${baseName}_${timestamp}_${randomString}${extension}`;
    }

    /**
     * Create multer storage configuration
     */
    private createStorage(options: FileUploadOptions = {}): multer.StorageEngine {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                const destination = options.destination
                    ? path.join(this.uploadDir, options.destination)
                    : this.uploadDir;

                // Ensure destination directory exists
                if (!fs.existsSync(destination)) {
                    fs.mkdirSync(destination, { recursive: true });
                }

                cb(null, destination);
            },
            filename: (req, file, cb) => {
                const filename = this.generateFilename(
                    file.originalname,
                    options.preserveOriginalName
                );
                cb(null, filename);
            }
        });
    }

    /**
     * File filter function
     */
    private createFileFilter(options: FileUploadOptions = {}) {
        return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
            // Check file type
            if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
                const error = new Error(`File type ${file.mimetype} not allowed`);
                return cb(error as any, false);
            }

            // Check file extension
            if (options.allowedExtensions) {
                const extension = path.extname(file.originalname).toLowerCase();
                if (!options.allowedExtensions.includes(extension)) {
                    const error = new Error(`File extension ${extension} not allowed`);
                    return cb(error as any, false);
                }
            }

            cb(null, true);
        };
    }

    /**
     * Create multer upload middleware
     */
    createUploadMiddleware(options: FileUploadOptions = {}) {
        const storage = this.createStorage(options);
        const fileFilter = this.createFileFilter(options);

        return multer({
            storage,
            fileFilter,
            limits: {
                fileSize: options.maxSize || 10 * 1024 * 1024, // 10MB default
            },
        });
    }

    /**
     * Single file upload middleware
     */
    single(fieldName: string, options: FileUploadOptions = {}) {
        return this.createUploadMiddleware(options).single(fieldName);
    }

    /**
     * Multiple files upload middleware
     */
    multiple(fieldName: string, maxCount: number = 10, options: FileUploadOptions = {}) {
        return this.createUploadMiddleware(options).array(fieldName, maxCount);
    }

    /**
     * Multiple fields upload middleware
     */
    fields(fields: multer.Field[], options: FileUploadOptions = {}) {
        return this.createUploadMiddleware(options).fields(fields);
    }

    /**
     * Image upload middleware (predefined for images)
     */
    imageUpload(fieldName: string, options: Partial<FileUploadOptions> = {}) {
        const imageOptions: FileUploadOptions = {
            destination: 'images',
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
            ...options
        };

        return this.single(fieldName, imageOptions);
    }

    /**
     * Document upload middleware (predefined for documents)
     */
    documentUpload(fieldName: string, options: Partial<FileUploadOptions> = {}) {
        const documentOptions: FileUploadOptions = {
            destination: 'documents',
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ],
            allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
            ...options
        };

        return this.single(fieldName, documentOptions);
    }

    /**
     * Get file information
     */
    getFileInfo(file: Express.Multer.File): UploadedFileInfo {
        const extension = path.extname(file.originalname);
        const baseUrl = config.BASE_URL || 'http://localhost:3000';
        const relativePath = path.relative(process.cwd(), file.path);

        return {
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            extension,
            url: `${baseUrl}/${relativePath.replace(/\\/g, '/')}`
        };
    }

    /**
     * Delete file
     */
    async deleteFile(filePath: string): Promise<boolean> {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logger.info(`File deleted: ${filePath}`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error('Error deleting file:', error);
            return false;
        }
    }

    /**
     * Delete multiple files
     */
    async deleteFiles(filePaths: string[]): Promise<{ deleted: number; failed: number }> {
        let deleted = 0;
        let failed = 0;

        for (const filePath of filePaths) {
            const success = await this.deleteFile(filePath);
            if (success) {
                deleted++;
            } else {
                failed++;
            }
        }

        return { deleted, failed };
    }

    /**
     * Get file size in human readable format
     */
    formatFileSize(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * Validate file type
     */
    isValidFileType(mimetype: string, allowedTypes: string[]): boolean {
        return allowedTypes.includes(mimetype);
    }

    /**
     * Validate file extension
     */
    isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
        const extension = path.extname(filename).toLowerCase();
        return allowedExtensions.includes(extension);
    }

    /**
     * Get upload statistics
     */
    getUploadStats(): { totalFiles: number; totalSize: number; directories: string[] } {
        try {
            const stats = this.getDirectoryStats(this.uploadDir);
            return stats;
        } catch (error) {
            logger.error('Error getting upload stats:', error);
            return { totalFiles: 0, totalSize: 0, directories: [] };
        }
    }

    private getDirectoryStats(dirPath: string): { totalFiles: number; totalSize: number; directories: string[] } {
        let totalFiles = 0;
        let totalSize = 0;
        const directories: string[] = [];

        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                directories.push(item);
                const subStats = this.getDirectoryStats(itemPath);
                totalFiles += subStats.totalFiles;
                totalSize += subStats.totalSize;
            } else {
                totalFiles++;
                totalSize += stat.size;
            }
        }

        return { totalFiles, totalSize, directories };
    }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
