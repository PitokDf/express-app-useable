# Express Framework dengan Fitur Advanced

Template backend enterprise-grade menggunakan **Express.js**, **TypeScript**, dan **Prisma ORM**. Dilengkapi dengan berbagai fitur canggih untuk membangun REST API yang scalable dan production-ready.

---

## ✨ Fitur Utama

### Core Features

- **TypeScript**: Kode lebih aman & maintainable
- **Prisma ORM**: Query database SQLite/PostgreSQL dengan mudah
- **Express 5**: Framework web minimalis & powerful
- **Rate Limiting**: Perlindungan dari brute-force
- **JWT Auth**: Siap untuk implementasi autentikasi
- **Professional Winston Logger**: Logging harian otomatis dengan rotation & structured output
- **Testing**: Sudah terintegrasi dengan Jest & Supertest
- **Dockerized**: Siap deploy dengan Docker

### Advanced Features 🚀

- **Professional Logging**: Winston logger dengan daily rotation, structured output, dan custom methods
- **Cache Management**: In-memory caching dengan NodeCache
- **Email Service**: Kirim email dengan template (welcome, reset password, dll)
- **File Upload**: Upload file dengan validasi dan multiple file support
- **Pagination**: Pagination otomatis dengan metadata lengkap
- **Database Transactions**: Transaction helper dengan retry logic
- **Background Jobs**: Queue system dengan Bull untuk background processing
- **Health Checks**: Monitoring sistem dengan endpoint health check
- **API Versioning**: Manajemen versi API dengan deprecation warnings
- **Professional Startup**: Banner startup dengan network interfaces dan graceful shutdown

---

## 📁 Struktur Folder

```
├── src/
│   ├── app.ts                      # Inisialisasi express & middleware
│   ├── index.ts                    # Entry point server
│   ├── config/                     # Konfigurasi environment & prisma
│   ├── constants/                  # Konstanta global (status, message, dsb)
│   ├── controller/                 # Handler request
│   ├── errors/                     # Custom error
│   ├── middleware/                 # Middleware (logging, rate-limit, error)
│   ├── repositories/               # Query ke database
│   ├── routes/                     # Routing API
│   │   ├── framework.route.ts      # Route untuk testing framework features
│   │   └── ...
│   ├── schemas/                    # Validasi skema request/response (zod)
│   ├── service/                    # Bisnis logic
│   ├── types/                      # TypeScript types
│   └── utils/                      # Helper utilities
│       ├── winston.logger.ts       # Professional logging system
│       ├── cache.ts                # Cache management
│       ├── email.ts                # Email service
│       ├── file-upload.ts          # File upload service
│       ├── pagination.ts           # Pagination utility
│       ├── database-transaction.ts # Database transaction helper
│       ├── background-jobs.ts      # Background job queue
│       ├── health-check.ts         # Health check system
│       ├── api-versioning.ts       # API versioning
│       └── framework-initializer.ts # Framework services initializer
├── prisma/                         # Schema & migration database
├── tests/                          # Testing
├── logs/                           # File log aplikasi
├── uploads/                        # Upload directory (auto-created)
```

---

## 🛠 Script yang Tersedia

| Script            | Perintah                | Deskripsi                                   |
| ----------------- | ----------------------- | ------------------------------------------- |
| Start Development | `npm run dev`           | Menjalankan server dalam mode development   |
| Build             | `npm run build`         | Build project TypeScript ke JavaScript      |
| Start Production  | `npm start`             | Menjalankan server hasil build (production) |
| Test              | `npm test`              | Menjalankan seluruh unit test               |
| Test Watch        | `npm run test:watch`    | Menjalankan test dengan mode watch          |
| Test Coverage     | `npm run test:coverage` | Menampilkan laporan coverage test           |
| DB Migrate        | `npm run db:migrate`    | Menjalankan migrasi database Prisma         |
| DB Generate       | `npm run db:generate`   | Generate client Prisma                      |
| DB Seed           | `npm run db:seed`       | Mengisi database dengan data awal (seeding) |
| DB Studio         | `npm run db:studio`     | Membuka Prisma Studio (GUI database)        |
| DB Reset          | `npm run db:reset`      | Reset database dan migrasi ulang            |
| DB Prepare        | `npm run db:prepare`    | Generate ulang Prisma client                |

## Quick Start

### 1. Clone & Install

```sh
git clone https://github.com/PitoDf/express-app-useable
cd express-app-useable # bisa ganti nama folder sesuai dengan kebutuhan
npm install
```

or install via npm module

```sh
npx install-express-pitok create <nama-projek>
```

### 2. Konfigurasi Environment

Salin `.env.example` ke `.env` dan sesuaikan:

```sh
cp .env.example .env
```

**Konfigurasi Penting:**

- `DATABASE_URL`: Connection string (SQLite: `file:./dev.db` atau PostgreSQL: `postgresql://user:pass@host:5432/db`)
- `REDIS_HOST`: Host Redis (untuk background jobs)
- `EMAIL_USER` & `EMAIL_PASS`: Kredensial email untuk service
- `JWT_SECRET`: Secret key untuk JWT (gunakan string yang kuat)

### 3. Setup Database & Redis

**Database (Pilihan):**

- **SQLite** (Default, mudah untuk development): Tidak perlu install apapun
- **PostgreSQL** (Production recommended): Pastikan PostgreSQL berjalan dan edit `DATABASE_URL`

**Redis (Optional):**

- Diperlukan untuk background jobs
- Edit `REDIS_*` di `.env` jika menggunakan background jobs

### 4. Migrasi & Seed Database

```sh
npm run db:migrate
npm run db:seed
```

### 5. Jalankan Server

```sh
npm run dev
```

Server akan menampilkan startup banner profesional:

```
   ═══════════════════════════════════════════════════════════════
   🚀 EXPRESS ADVANCED FRAMEWORK - SERVER READY
   ═══════════════════════════════════════════════════════════════
   📍 Environment: DEVELOPMENT
   🌐 Service: express-framework
   🔗 URLs:
      • http://localhost:6789
      • http://192.168.1.100:6789
   ─────────────────────────────────────────────────────────────────
   ├─ 🏥 Health:     http://localhost:6789/health
   ├─ 👥 Users:      http://localhost:6789/api/v1/users
   └─ ⚙️  Framework: http://localhost:6789/api/v1/framework
   ═══════════════════════════════════════════════════════════════
```

**Features:**

- ✅ **Auto Network Detection**: Menampilkan semua network interfaces tersedia
- ✅ **Port Auto-increment**: Jika port sedang digunakan, otomatis coba port berikutnya
- ✅ **Graceful Shutdown**: SIGINT/SIGTERM handling untuk shutdown yang aman
- ✅ **Error Handling**: Uncaught exception dan unhandled rejection handling
- ✅ **Professional Logging**: Semua server events di-log dengan struktur yang rapi

Server berjalan di: [http://localhost:6789](http://localhost:6789)

---

## 🚀 Fitur Advanced - Dokumentasi

### 1. Professional Logging System

Framework dilengkapi dengan sistem logging profesional menggunakan Winston:

```typescript
import logger from "./utils/winston.logger";

// Basic logging
logger.info("Application started successfully", { port: 6789 });
logger.error("Database connection failed", { error: "ECONNREFUSED" });
logger.warn("High memory usage detected", { usage: "85%" });

// Framework-specific logging methods
logger.serverStartup(6789, "development");
logger.serverReady(6789, [
  "http://localhost:6789",
  "http://192.168.1.100:6789",
]);
logger.frameworkInit("Cache service initialized");
logger.request("GET", "/api/users", 200, 150, "192.168.1.1");

// Structured logging dengan metadata
logger.info("User created", {
  userId: "user-123",
  email: "user@example.com",
  timestamp: new Date().toISOString(),
});
```

**Features Logging:**

- ✅ **Daily Log Rotation**: Log file otomatis berganti setiap hari
- ✅ **Structured JSON Output**: Format JSON untuk production, colorized untuk development
- ✅ **Multiple Transports**: Console, file (error.log, combined.log)
- ✅ **Log Compression**: File log lama dikompresi otomatis
- ✅ **Custom Log Methods**: Methods khusus untuk framework events
- ✅ **Request Logging**: Automatic request/response logging dengan performance timing

**Log Files:**

```
logs/
├── combined-2025-07-26.log      # All logs
├── error-2025-07-26.log         # Error logs only
├── combined-2025-07-25.log.gz   # Compressed old logs
└── error-2025-07-25.log.gz      # Compressed old error logs
```

### 2. Cache Management

```typescript
import { cacheManager } from "./utils/cache";

// Basic caching
cacheManager.set("key", data, 3600); // TTL 1 hour
const cachedData = cacheManager.get("key");

// Cache middleware untuk routes
router.get(
  "/api/data",
  cacheManager.middleware(60), // Cache 60 seconds
  (req, res) => {
    res.json({ data: "This will be cached" });
  }
);

// Auto-refresh cache
const data = await cacheManager.getOrSet(
  "key",
  async () => {
    return await fetchDataFromDB();
  },
  3600
);
```

### 2. Email Service

```typescript
import { emailService } from "./utils/email";

// Send welcome email
await emailService.sendWelcomeEmail("user@example.com", "John Doe");

// Send custom email
await emailService.sendEmail({
  to: "user@example.com",
  subject: "Hello!",
  html: "<h1>Hello World</h1>",
  text: "Hello World",
});

// Send password reset
await emailService.sendPasswordResetEmail(
  "user@example.com",
  "reset-token",
  "John"
);
```

### 3. File Upload

```typescript
import { fileUploadService } from "./utils/file-upload";

// Single image upload
router.post("/upload", fileUploadService.imageUpload("image"), (req, res) => {
  const fileInfo = fileUploadService.getFileInfo(req.file);
  res.json({ file: fileInfo });
});

// Multiple files
router.post(
  "/upload-multiple",
  fileUploadService.multiple("files", 5),
  (req, res) => {
    const files = req.files.map((file) => fileUploadService.getFileInfo(file));
    res.json({ files });
  }
);
```

### 4. Pagination

```typescript
import { paginationService } from "./utils/pagination";

router.get("/users", paginationService.middleware(), async (req, res) => {
  const { skip, take } = paginationService.getPrismaParams(req.pagination);

  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip, take }),
    prisma.user.count(),
  ]);

  const result = paginationService.createResult(users, total, req.pagination);
  res.json(result);
});
```

### 5. Database Transactions

```typescript
import { frameworkInitializer } from "./utils/framework-initializer";

const services = frameworkInitializer.getServices();

const result = await services.database.executeTransaction(async (prisma) => {
  const user = await prisma.user.create({ data: userData });
  const profile = await prisma.profile.create({
    data: { userId: user.id, ...profileData },
  });
  return { user, profile };
});

if (result.success) {
  console.log("Transaction completed:", result.data);
} else {
  console.error("Transaction failed:", result.error);
}
```

### 6. Background Jobs

```typescript
import { backgroundJobService } from "./utils/background-jobs";

// Add job to queue
const job = await backgroundJobService.addJob("email", "welcome", {
  email: "user@example.com",
  name: "John Doe",
});

// Add delayed job
const delayedJob = await backgroundJobService.addDelayedJob(
  "default",
  "cleanup",
  { type: "cache" },
  60000 // 1 minute delay
);

// Add recurring job
const recurringJob = await backgroundJobService.addRecurringJob(
  "default",
  "daily-report",
  { reportType: "sales" },
  "0 9 * * *" // Every day at 9 AM
);
```

### 7. Health Checks

```typescript
// Built-in health check endpoints:
// GET /health - Full health check
// GET /health/ready - Readiness probe (for Kubernetes)
// GET /health/live - Liveness probe (for Kubernetes)

// Custom health checker
const services = frameworkInitializer.getServices();
services.health.registerChecker("external-api", async () => {
  const response = await fetch("https://external-api.com/health");
  return {
    name: "external-api",
    status: response.ok ? "healthy" : "unhealthy",
    message: response.ok ? "API responding" : "API down",
    timestamp: new Date().toISOString(),
  };
});
```

### 8. API Versioning

```typescript
import { ApiVersioningService } from "./utils/api-versioning";

const versioning = new ApiVersioningService({
  defaultVersion: "1.0",
  supportedVersions: [
    { version: "1.0" },
    { version: "1.1" },
    { version: "2.0", deprecated: true, replacedBy: "2.1" },
  ],
  versionHeader: "API-Version",
});

// Apply versioning middleware
app.use(versioning.versionMiddleware());

// Version-specific routes
const { router, version } = versioning.createVersionedRouter("/api/users");

version("1.0", usersV1Router);
version("2.0", usersV2Router);

app.use(router);
```

---

## 📊 Testing Framework Features

Setelah server berjalan, test fitur-fitur dengan endpoint berikut:

```bash
# Framework Status & Logging Test
curl http://localhost:6789/api/v1/framework/framework/status

# Cache Test
curl http://localhost:6789/api/v1/framework/cache/test

# Email Test (memerlukan konfigurasi email)
curl -X POST http://localhost:6789/api/v1/framework/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "name": "Test User"}'

# File Upload Test
curl -X POST http://localhost:6789/api/v1/framework/upload/image \
  -F "image=@/path/to/image.jpg"

# Pagination Test
curl "http://localhost:6789/api/v1/framework/pagination/test?page=2&limit=10"

# Background Job Test
curl -X POST http://localhost:6789/api/v1/framework/jobs/email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "name": "Test User", "type": "welcome"}'

# Health Check
curl http://localhost:6789/health

# Health Check - Readiness & Liveness
curl http://localhost:6789/health/ready
curl http://localhost:6789/health/live
```

**Monitoring Logs:**

- Cek file `logs/combined-YYYY-MM-DD.log` untuk melihat semua activity
- Cek file `logs/error-YYYY-MM-DD.log` untuk error logs saja
- Console output akan menampilkan log real-time dengan warna

---

## 📊 Monitoring & Troubleshooting

### Log Monitoring

**Real-time Monitoring:**

```bash
# Monitor semua logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Monitor error logs saja
tail -f logs/error-$(date +%Y-%m-%d).log

# Monitor dengan filter
tail -f logs/combined-$(date +%Y-%m-%d).log | grep "ERROR\|WARN"
```

**Log Analysis:**

```bash
# Count error types
grep "ERROR" logs/error-$(date +%Y-%m-%d).log | jq '.level' | sort | uniq -c

# Find slow requests (> 1000ms)
grep "request" logs/combined-$(date +%Y-%m-%d).log | jq 'select(.responseTime > 1000)'

# Monitor specific endpoints
grep "GET /api/users" logs/combined-$(date +%Y-%m-%d).log
```

### Health Monitoring

Framework menyediakan multiple health check endpoints:

```bash
# Basic health check
curl http://localhost:6789/health

# Kubernetes readiness probe
curl http://localhost:6789/health/ready

# Kubernetes liveness probe
curl http://localhost:6789/health/live

# Detailed framework status
curl http://localhost:6789/api/v1/framework/framework/status
```

### Common Issues & Solutions

**Port already in use:**

- Framework otomatis increment port (6789 → 6790 → 6791, dst)
- Cek log untuk melihat port yang benar-benar digunakan

**Database connection issues:**

```bash
# Test database connection
npm run db:generate
npm run db:migrate
```

**Memory issues:**

- Cek health endpoint: memory usage tercantum di response
- Monitor log files, framework akan warn jika memory tinggi

---

## Testing

Jalankan semua test:

```sh
npm test
```

---

## Jalankan dengan Docker

```sh
docker build -t my-express-app .
docker run -p 6789:6789 --env-file .env my-express-app
```

---

## Tools & Library

### Core

- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [Jest](https://jestjs.io/)
- [Winston](https://github.com/winstonjs/winston) - Professional logging
- [Winston Daily Rotate](https://github.com/winstonjs/winston-daily-rotate-file) - Log rotation

### Advanced Features

- [NodeCache](https://github.com/node-cache/node-cache) - In-memory caching
- [Nodemailer](https://nodemailer.com/) - Email service
- [Multer](https://github.com/expressjs/multer) - File upload
- [Bull](https://github.com/OptimalBits/bull) - Background job queue
- [Redis](https://redis.io/) - Job queue backend

### Security & Performance

- [Helmet](https://helmetjs.github.io/)
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- [compression](https://github.com/expressjs/compression)
- [cors](https://github.com/expressjs/cors)

---

## 🔧 Production Deployment

### Environment Variables untuk Production

Pastikan mengatur variabel berikut untuk production:

```bash
NODE_ENV=production
JWT_SECRET=very-strong-secret-key
DATABASE_URL=postgresql://user:pass@prod-host:5432/dbname
REDIS_HOST=redis-prod-host
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-password
CLIENT_URL=https://your-frontend-domain.com
BASE_URL=https://your-api-domain.com
```

### Docker Compose untuk Production

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "6789:6789"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## Author

Pito Desri Pauzi

---

## License

MIT License
