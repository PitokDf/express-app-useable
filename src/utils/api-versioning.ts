import { Router, Request, Response, NextFunction } from 'express';
import logger from './winston.logger';

export interface VersionConfig {
    version: string;
    deprecated?: boolean;
    deprecatedSince?: string;
    sunsetDate?: string;
    replacedBy?: string;
}

export interface ApiVersionOptions {
    defaultVersion?: string;
    supportedVersions: VersionConfig[];
    versionHeader?: string;
    versionParam?: string;
    versionQuery?: string;
    deprecationWarnings?: boolean;
}

export interface VersionedRequest extends Request {
    apiVersion?: string;
    isDeprecatedVersion?: boolean;
    versionConfig?: VersionConfig;
}

class ApiVersioningService {
    private versions: Map<string, VersionConfig> = new Map();
    private routes: Map<string, Map<string, Router>> = new Map(); // version -> route pattern -> router
    private options: Required<ApiVersionOptions>;

    constructor(options: ApiVersionOptions) {
        this.options = {
            defaultVersion: options.defaultVersion || '1.0',
            supportedVersions: options.supportedVersions,
            versionHeader: options.versionHeader || 'API-Version',
            versionParam: options.versionParam || 'version',
            versionQuery: options.versionQuery || 'v',
            deprecationWarnings: options.deprecationWarnings ?? true,
        };

        this.initializeVersions();
    }

    /**
     * Initialize supported versions
     */
    private initializeVersions(): void {
        this.options.supportedVersions.forEach(config => {
            this.versions.set(config.version, config);
        });

        logger.info(`API Versioning initialized with versions: ${Array.from(this.versions.keys()).join(', ')}`);
    }

    /**
     * Version detection middleware
     */
    versionMiddleware() {
        return (req: VersionedRequest, res: Response, next: NextFunction): void => {
            const version = this.extractVersion(req);
            const versionConfig = this.versions.get(version);

            if (!versionConfig) {
                res.status(400).json({
                    error: 'Unsupported API version',
                    message: `Version ${version} is not supported`,
                    supportedVersions: Array.from(this.versions.keys()),
                });
                return;
            }

            // Attach version info to request
            req.apiVersion = version;
            req.versionConfig = versionConfig;
            req.isDeprecatedVersion = versionConfig.deprecated || false;

            // Add version info to response headers
            res.set('API-Version', version);
            res.set('Supported-Versions', Array.from(this.versions.keys()).join(', '));

            // Handle deprecated versions
            if (versionConfig.deprecated && this.options.deprecationWarnings) {
                const warning = this.buildDeprecationWarning(versionConfig);
                res.set('Warning', warning);
                res.set('Deprecation', 'true');

                if (versionConfig.sunsetDate) {
                    res.set('Sunset', versionConfig.sunsetDate);
                }

                logger.warn(`Deprecated API version ${version} used`, {
                    userAgent: req.get('User-Agent'),
                    ip: req.ip,
                    path: req.path
                });
            }

            next();
        };
    }

    /**
     * Extract version from request
     */
    private extractVersion(req: Request): string {
        // Check header first
        let version = req.get(this.options.versionHeader);

        // Check URL parameter
        if (!version && req.params[this.options.versionParam]) {
            version = req.params[this.options.versionParam];
        }

        // Check query parameter
        if (!version && req.query[this.options.versionQuery]) {
            version = req.query[this.options.versionQuery] as string;
        }

        // Use default version if none specified
        return version || this.options.defaultVersion;
    }

    /**
     * Build deprecation warning message
     */
    private buildDeprecationWarning(config: VersionConfig): string {
        let warning = `API version ${config.version} is deprecated`;

        if (config.deprecatedSince) {
            warning += ` since ${config.deprecatedSince}`;
        }

        if (config.replacedBy) {
            warning += `. Use version ${config.replacedBy} instead`;
        }

        if (config.sunsetDate) {
            warning += `. Will be removed on ${config.sunsetDate}`;
        }

        return warning;
    }

    /**
     * Create versioned router
     */
    createVersionedRouter(pattern: string): {
        router: Router;
        version: (version: string, handler: Router) => void;
    } {
        const mainRouter = Router();
        const versionRouters = new Map<string, Router>();

        // Store version routers for this pattern
        this.routes.set(pattern, versionRouters);

        const version = (version: string, handler: Router) => {
            if (!this.versions.has(version)) {
                throw new Error(`Version ${version} is not configured`);
            }

            versionRouters.set(version, handler);
            // Reduced logging verbosity - version router registration is now silent
            // logger.info(`Version ${version} router registered for pattern ${pattern}`);
        };

        // Main router that delegates to version-specific routers
        mainRouter.use((req: VersionedRequest, res: Response, next: NextFunction): void => {
            const requestVersion = req.apiVersion || this.options.defaultVersion;
            const versionRouter = versionRouters.get(requestVersion);

            if (!versionRouter) {
                // Try to find a compatible version (fallback strategy)
                const compatibleRouter = this.findCompatibleVersion(versionRouters, requestVersion);

                if (compatibleRouter) {
                    logger.debug(`Using compatible version router for ${requestVersion}`);
                    compatibleRouter(req, res, next);
                    return;
                }

                res.status(400).json({
                    error: 'Version not implemented',
                    message: `Version ${requestVersion} is not implemented for this endpoint`,
                    availableVersions: Array.from(versionRouters.keys()),
                });
                return;
            }

            versionRouter(req, res, next);
        });

        return { router: mainRouter, version };
    }

    /**
     * Find compatible version (backwards compatibility)
     */
    private findCompatibleVersion(versionRouters: Map<string, Router>, requestedVersion: string): Router | null {
        // Simple semver-like compatibility: if requesting 2.1, try 2.0, then 1.x
        const [major, minor] = requestedVersion.split('.').map(Number);

        // Try lower minor versions in the same major version
        for (let m = minor - 1; m >= 0; m--) {
            const compatibleVersion = `${major}.${m}`;
            if (versionRouters.has(compatibleVersion)) {
                return versionRouters.get(compatibleVersion)!;
            }
        }

        // Try lower major versions
        for (let maj = major - 1; maj >= 1; maj--) {
            const compatibleVersion = `${maj}.0`;
            if (versionRouters.has(compatibleVersion)) {
                return versionRouters.get(compatibleVersion)!;
            }
        }

        return null;
    }

    /**
     * Add new version configuration
     */
    addVersion(config: VersionConfig): void {
        this.versions.set(config.version, config);
        logger.info(`Added API version ${config.version}`);
    }

    /**
     * Remove version configuration
     */
    removeVersion(version: string): boolean {
        const removed = this.versions.delete(version);
        if (removed) {
            logger.info(`Removed API version ${version}`);
        }
        return removed;
    }

    /**
     * Update version configuration
     */
    updateVersion(version: string, updates: Partial<VersionConfig>): boolean {
        const existing = this.versions.get(version);
        if (!existing) {
            return false;
        }

        const updated = { ...existing, ...updates };
        this.versions.set(version, updated);
        logger.info(`Updated API version ${version} configuration`);
        return true;
    }

    /**
     * Get all supported versions
     */
    getSupportedVersions(): VersionConfig[] {
        return Array.from(this.versions.values());
    }

    /**
     * Get version configuration
     */
    getVersionConfig(version: string): VersionConfig | undefined {
        return this.versions.get(version);
    }

    /**
     * Check if version is supported
     */
    isVersionSupported(version: string): boolean {
        return this.versions.has(version);
    }

    /**
     * Check if version is deprecated
     */
    isVersionDeprecated(version: string): boolean {
        const config = this.versions.get(version);
        return config?.deprecated || false;
    }

    /**
     * Get version statistics
     */
    getVersionStats(): {
        total: number;
        active: number;
        deprecated: number;
        versions: Array<{
            version: string;
            deprecated: boolean;
            deprecatedSince?: string;
            sunsetDate?: string;
        }>;
    } {
        const versions = Array.from(this.versions.values());
        const deprecated = versions.filter(v => v.deprecated);

        return {
            total: versions.length,
            active: versions.length - deprecated.length,
            deprecated: deprecated.length,
            versions: versions.map(v => ({
                version: v.version,
                deprecated: v.deprecated || false,
                deprecatedSince: v.deprecatedSince,
                sunsetDate: v.sunsetDate,
            })),
        };
    }

    /**
     * Create version comparison middleware
     */
    requireMinVersion(minVersion: string) {
        return (req: VersionedRequest, res: Response, next: NextFunction): void => {
            const currentVersion = req.apiVersion || this.options.defaultVersion;

            if (!this.isVersionGreaterOrEqual(currentVersion, minVersion)) {
                res.status(400).json({
                    error: 'Minimum version required',
                    message: `This endpoint requires API version ${minVersion} or higher`,
                    currentVersion,
                    requiredVersion: minVersion,
                });
                return;
            }

            next();
        };
    }

    /**
     * Simple version comparison (semver-like)
     */
    private isVersionGreaterOrEqual(current: string, required: string): boolean {
        const [currentMajor, currentMinor = 0] = current.split('.').map(Number);
        const [requiredMajor, requiredMinor = 0] = required.split('.').map(Number);

        if (currentMajor > requiredMajor) return true;
        if (currentMajor < requiredMajor) return false;

        return currentMinor >= requiredMinor;
    }

    /**
     * Create API documentation endpoint
     */
    createDocsEndpoint() {
        return (req: Request, res: Response) => {
            const stats = this.getVersionStats();
            const versions = this.getSupportedVersions();

            res.json({
                apiVersioning: {
                    defaultVersion: this.options.defaultVersion,
                    versionHeader: this.options.versionHeader,
                    versionQuery: this.options.versionQuery,
                    versionParam: this.options.versionParam,
                },
                statistics: stats,
                versions: versions.map(v => ({
                    version: v.version,
                    deprecated: v.deprecated || false,
                    deprecatedSince: v.deprecatedSince,
                    sunsetDate: v.sunsetDate,
                    replacedBy: v.replacedBy,
                })),
                usage: {
                    header: `${this.options.versionHeader}: 1.0`,
                    query: `?${this.options.versionQuery}=1.0`,
                    param: `/:${this.options.versionParam}/endpoint`,
                },
            });
        };
    }
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            apiVersion?: string;
            isDeprecatedVersion?: boolean;
            versionConfig?: VersionConfig;
        }
    }
}

export { ApiVersioningService };
