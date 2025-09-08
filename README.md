# Express Framework - Production Ready

Template backend enterprise-grade menggunakan Express.js, TypeScript, dan Prisma ORM. Framework ini dirancang untuk membangun REST API yang scalable dan siap production dengan berbagai fitur canggih.

## Fitur Utama

### Core Features

- **TypeScript** - Type safety dan developer experience yang lebih baik
- **Prisma ORM** - Database abstraction dengan query yang type-safe
- **Express.js** - Framework web yang minimalis dan powerful
- **Winston Logger** - Professional logging dengan daily rotation
- **JWT Authentication** - Siap untuk implementasi autentikasi
- **Rate Limiting** - Perlindungan dari brute-force attacks
- **Input Validation** - Validasi request menggunakan Zod
- **Error Handling** - Centralized error handling dengan custom error classes

### Advanced Features

- **In-Memory Caching** - Cache management dengan NodeCache
- **Email Service** - Kirim email dengan template
- **File Upload** - Upload file dengan validasi dan multiple file support
- **Database Transactions** - Transaction helper dengan retry logic
- **Background Jobs** - Queue system dengan Bull untuk background processing
- **Health Checks** - Monitoring sistem dengan endpoint health check
- **API Versioning** - Manajemen versi API dengan deprecation warnings
- **Import Alias** - Path alias menggunakan @ seperti Next.js
- **Cache Warming** - Pre-populate cache saat startup untuk performance optimal

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan konfigurasi:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
SERVICE_NAME=express-framework

# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email (optional)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Server akan start di `http://localhost:3000` dengan output:

```
🚀 EXPRESS SERVER READY
📍 Environment: DEVELOPMENT
🌐 Service: express-framework
🔗 URLs:
   • http://localhost:3000
   • http://192.168.1.100:3000
```

### 5. Build for Production

```bash
npm run build
npm start
```

## Struktur Project

```
├── src/
│   ├── app.ts                 # Express app initialization
│   ├── index.ts              # Server entry point
│   ├── config/               # Configuration files
│   │   ├── index.ts          # Main config
│   │   └── prisma.ts         # Database config
│   ├── constants/            # Global constants
│   ├── controller/           # Request handlers
│   ├── middleware/           # Express middlewares
│   ├── repositories/         # Database queries
│   ├── routes/               # API routes
│   ├── schemas/              # Zod validation schemas
│   ├── service/              # Business logic
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
│       ├── winston.logger.ts # Logging system
│       ├── cache.ts          # Cache management
│       ├── email.ts          # Email service
│       └── ...
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── db/seed.ts           # Database seeding
├── tests/                    # Test files
├── logs/                     # Log files (auto-generated)
└── uploads/                  # File uploads (auto-generated)
```

## Import Alias (@)

Framework ini menggunakan import alias seperti Next.js untuk memudahkan import:

```typescript
// Sebelum (relative path)
import { config } from "../../config";
import logger from "../../utils/winston.logger";

// Sesudah (dengan alias)
import { config } from "@/config";
import logger from "@/utils/winston.logger";
```

**Konfigurasi:**

- Development: Alias mengarah ke `src/`
- Production: Alias mengarah ke `dist/src/` (setelah build)

## Database & ORM

### Prisma Setup

Framework menggunakan Prisma sebagai ORM dengan support untuk:

- SQLite (development)
- PostgreSQL (production)
- MySQL

### Schema Example

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Basic Queries

```typescript
import { prisma } from "@/config/prisma";

// Create
const user = await prisma.user.create({
  data: { email: "user@example.com", name: "John" },
});

// Read
const users = await prisma.user.findMany();
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
});

// Update
const updatedUser = await prisma.user.update({
  where: { id: "user-id" },
  data: { name: "John Doe" },
});

// Delete
await prisma.user.delete({
  where: { id: "user-id" },
});
```

## Caching System

Framework dilengkapi dengan in-memory caching untuk performance optimal:

```typescript
import { cacheManager } from "@/utils/cache";

// Basic caching
cacheManager.set("key", data, 3600); // TTL 1 hour
const cachedData = cacheManager.get("key");

// Cache with service layer
const users = await getAllUserService(); // Auto-cache with TTL
// Response time: ~2-5ms (from cache)
```

### Cache Warming

Cache otomatis di-warm saat startup untuk menghilangkan cold start:

```typescript
// Automatic cache warming on startup
[info] 🔥 Warming up cache for frequently accessed data...
[info] ✅ Cache warmed up with 1 users
```

## Logging System

Professional logging menggunakan Winston dengan fitur:

- Daily log rotation
- Structured JSON output
- Multiple log levels
- Console dan file output

```typescript
import logger from "@/utils/winston.logger"

// Basic logging
logger.info("Server started", { port: 3000 })
logger.error("Database error", { error: "Connection failed" })

// Request logging (automatic)
GET /api/users 200 - 2.67ms
```

### Log Files

```
logs/
├── combined-2025-09-08.log    # All logs
├── error-2025-09-08.log       # Error logs only
└── combined-2025-09-07.log.gz # Compressed old logs
```

## API Routes

### Basic Route Structure

```typescript
import { Router } from "express";
import { getAllUsers, createUser } from "@/controllers/user.controller";

const router = Router();

router.get("/users", getAllUsers);
router.post("/users", createUser);

export default router;
```

### Controller Example

```typescript
import { Request, Response } from "express";
import { getAllUserService } from "@/service/user.service";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await getAllUserService();
    res.json({
      success: true,
      message: "Success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
```

## Validation

Input validation menggunakan Zod schema:

```typescript
import { z } from "zod";

// Schema definition
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(6),
});

// Usage in controller
import { validateSchema } from "@/middleware/zod.middleware";

router.post("/users", validateSchema(createUserSchema), createUser);
```

## Error Handling

Centralized error handling dengan custom error classes:

```typescript
import { AppError } from "@/errors/app-error"
import { HttpStatus } from "@/constants/http-status"

// Throw custom error
throw new AppError("User not found", HttpStatus.NOT_FOUND)

// Automatic error response
{
  "success": false,
  "message": "User not found",
  "statusCode": 404
}
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Database
npm run db:generate # Generate Prisma client
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database
npm run db:studio   # Open Prisma Studio
npm run db:reset    # Reset database
npm run db:prepare  # Prepare Prisma client

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Environment Variables

### Required

```bash
NODE_ENV=development
SERVICE_NAME=your-service-name
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
```

### Optional

```bash
PORT=3000
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourapp.com
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
REDIS_HOST=localhost
CACHE_TTL=3600
```

## CORS Configuration

Framework menggunakan konfigurasi CORS yang fleksibel dan aman:

### Development

```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

- Mengizinkan multiple origins untuk development
- Semua request akan di-log untuk debugging

### Production

```bash
ALLOWED_ORIGINS=https://yourapp.com,https://admin.yourapp.com,https://api.yourapp.com
```

- Hanya mengizinkan origins yang terdaftar
- Requests dari origins yang tidak diizinkan akan ditolak

### Fitur CORS

- ✅ **Function-based validation** - Validasi origins secara dinamis
- ✅ **Credentials support** - Mendukung cookies dan authorization headers
- ✅ **Preflight caching** - Cache OPTIONS requests selama 24 jam
- ✅ **Legacy browser support** - Kompatibel dengan browser lama
- ✅ **Security-first** - Tidak ada wildcard + credentials conflict

## Testing

Framework menggunakan Jest untuk testing:

```typescript
import request from "supertest";
import app from "@/app";

describe("GET /api/users", () => {
  it("should return users list", async () => {
    const response = await request(app).get("/api/users").expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## Docker Support

### Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Build & Run

```bash
docker build -t express-app .
docker run -p 3000:3000 --env-file .env express-app
```

## Performance Features

### Cache Performance

- **Response Time**: 2-5ms (cached) vs 50-100ms (database)
- **Cache Hit Rate**: 95%+ untuk frequently accessed data
- **Memory Usage**: Efficient in-memory storage

### Database Optimization

- **Query Optimization**: Selective field fetching
- **Connection Pooling**: Prisma built-in connection management
- **Transaction Support**: ACID compliance untuk complex operations

## Monitoring & Health Checks

### Health Endpoints

```bash
GET /health      # Overall health status
GET /health/ready # Readiness probe
GET /health/live  # Liveness probe
```

### Log Monitoring

```bash
# Monitor real-time logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Monitor errors only
tail -f logs/error-$(date +%Y-%m-%d).log
```

## Production Deployment

### Environment Setup

```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_HOST=redis-production-host
EMAIL_USER=production-email@example.com
```

### Process Management

Gunakan PM2 untuk production:

```bash
npm install -g pm2
pm2 start dist/src/index.js --name "express-app"
```

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

MIT License - feel free to use this project for your applications.

## Author

Pito Desri Pauzi
