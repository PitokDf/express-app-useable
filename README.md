# Express TypeScript Starter Template

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)

Template production-ready untuk membangun REST API menggunakan Express.js, TypeScript, dan Prisma ORM dengan arsitektur yang scalable dan maintainable.

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Instalasi](#-instalasi)
- [Scripts yang Tersedia](#-scripts-yang-tersedia)
- [Struktur Proyek](#-struktur-proyek)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Response Format](#-response-format)
- [Keunggulan Template](#-keunggulan-template)

## ✨ Fitur Utama

- ⚡ **TypeScript** - Full type safety dengan strict mode
- 🗄️ **Prisma ORM** - Type-safe database access dengan migrations
- 🔐 **JWT Authentication** - Token-based auth (Bearer header / HTTP-only cookie)
- 🛡️ **Security First** - Helmet, CORS, Rate Limiting, Bcrypt
- ✅ **Zod Validation** - Runtime type checking & validation
- 🚀 **Caching System** - Built-in node-cache dengan pattern matching
- 📝 **Winston Logger** - Daily rotating file logs
- 🏗️ **Clean Architecture** - Repository → Service → Controller pattern
- 🔥 **Hot Reload** - Fast development dengan ts-node-dev
- 🧪 **Testing Ready** - Jest configuration untuk unit & integration tests
- 📦 **Docker Support** - Container-ready dengan Dockerfile
- 📤 **File Upload** - Multer integration
- 🎨 **Code Quality** - ESLint + Prettier configured

## 📥 Instalasi

### Menggunakan NPX (Recommended)

```bash
npx install-express create <nama-project>
cd <nama-project>
npm install
```

### Manual Installation

```bash
# Clone repository
git clone https://github.com/PitokDf/express-app-useable.git <nama-project>
cd <nama-project>

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit file .env sesuai kebutuhan

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

## 📜 Scripts yang Tersedia

### Development

| Script          | Fungsi             | Deskripsi                                                         |
| --------------- | ------------------ | ----------------------------------------------------------------- |
| `npm run dev`   | Development server | Jalankan server dengan hot-reload, auto-restart saat file berubah |
| `npm run build` | Build production   | Compile TypeScript → JavaScript ke folder `dist/`                 |
| `npm start`     | Run production     | Jalankan compiled code dari `dist/` (perlu build dulu)            |

### Code Quality

| Script             | Fungsi     | Deskripsi                                             |
| ------------------ | ---------- | ----------------------------------------------------- |
| `npm run lint`     | Check code | Analyze code dengan ESLint untuk error & style issues |
| `npm run lint:fix` | Fix code   | Auto-fix linting issues (format, unused imports, dll) |

### Testing

| Script                  | Fungsi          | Deskripsi                                      |
| ----------------------- | --------------- | ---------------------------------------------- |
| `npm test`              | Run tests       | Jalankan semua Jest test suites                |
| `npm run test:watch`    | Watch mode      | Re-run tests otomatis saat file berubah (TDD)  |
| `npm run test:coverage` | Coverage report | Generate coverage report di folder `coverage/` |

### Database (Prisma)

| Script                | Fungsi           | Deskripsi                                                   |
| --------------------- | ---------------- | ----------------------------------------------------------- |
| `npm run db:generate` | Generate client  | Generate Prisma Client (run setelah update schema)          |
| `npm run db:migrate`  | Apply migrations | Create & apply migration dari schema changes                |
| `npm run db:seed`     | Seed data        | Populate database dengan data awal dari `prisma/db/seed.ts` |
| `npm run db:studio`   | Database GUI     | Buka Prisma Studio di `http://localhost:5555`               |
| `npm run db:reset`    | Reset database   | ⚠️ DESTRUCTIVE: Drop DB, re-apply migrations & seed         |
| `npm run db:prepare`  | Prepare client   | Generate client tanpa migration (untuk CI/CD)               |

## 📁 Struktur Proyek

```
express-app-useable/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── db/
│       └── seed.ts            # Database seeding script
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts               # Application entry point
│   ├── config/                # Configuration files
│   │   ├── cors.ts           # CORS configuration
│   │   ├── index.ts          # Config exports
│   │   └── prisma.ts         # Prisma client instance
│   ├── constants/             # Application constants
│   │   ├── app.ts
│   │   ├── http-status.ts    # HTTP status codes
│   │   ├── message.ts        # Response messages
│   │   ├── regex.ts          # Regex patterns
│   │   └── time.ts           # Time constants
│   ├── controller/            # Route controllers
│   │   └── user.controller.ts
│   ├── errors/                # Custom error classes
│   │   ├── app-error.ts
│   │   └── prisma-error.ts
│   ├── middleware/            # Express middlewares
│   │   ├── auth.middleware.ts        # JWT authentication
│   │   ├── error.middleware.ts       # Error handling
│   │   ├── logging.middleware.ts     # Request logging
│   │   ├── rate-limit.middleware.ts  # Rate limiting
│   │   └── zod.middleware.ts         # Schema validation
│   ├── repositories/          # Data access layer
│   │   └── user.repository.ts
│   ├── routes/                # API routes
│   │   ├── index.routes.ts   # Main router
│   │   └── user.route.ts     # User routes
│   ├── schemas/               # Zod validation schemas
│   │   └── user.schema.ts
│   ├── service/               # Business logic layer
│   │   └── user.service.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── response.ts
│   ├── utils/                 # Utility functions
│   │   ├── app-utils.ts
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── bcrypt.ts         # Password hashing
│   │   ├── cache.ts          # Caching utilities
│   │   ├── code-generator.ts # Unique code generation
│   │   ├── database-transaction.ts
│   │   ├── date.ts           # Date utilities
│   │   ├── file-upload.ts    # File upload handling
│   │   ├── health-check.ts   # Health check utilities
│   │   ├── jwt.ts            # JWT utilities
│   │   ├── response.ts       # Response formatting
│   │   ├── string.ts         # String utilities
│   │   └── winston.logger.ts # Logger configuration
│   └── validators/            # Custom validators
│       └── user.validator.ts
├── tests/                     # Test files
│   └── user.integration.test.ts
├── uploads/                   # Uploaded files directory
├── logs/                      # Application logs
├── .env                       # Environment variables
├── .env.example              # Environment variables template
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose configuration
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
├── eslint.config.cjs         # ESLint configuration
├── package.json              # Dependencies dan scripts
└── README.md                 # Documentation
```

## 📚 Panduan Penggunaan

Template ini menggunakan **Clean Architecture** dengan pattern: **Repository → Service → Controller**

### 1. Membuat Service Baru

Service layer berisi **business logic** aplikasi. Contoh `product.service.ts`:

```typescript
// src/service/product.service.ts
import { HttpStatus } from "@/constants/http-status";
import { Messages } from "@/constants/message";
import { AppError } from "@/errors/app-error";
import { ProductRepository } from "@/repositories/product.repository";
import { CreateProductInput } from "@/schemas/product.schema";
import { cacheManager } from "@/utils/cache";
import logger from "@/utils/winston.logger";

// Get all products dengan pagination & caching
export async function getAllProductService(query?: {
  page?: number;
  limit?: number;
}) {
  const page = query?.page || 1;
  const limit = query?.limit || 10;
  const skip = (page - 1) * limit;

  const cacheKey = `products:all:page:${page}:limit:${limit}`;

  // Cek cache dulu
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  // Ambil dari database
  const [products, total] = await Promise.all([
    ProductRepository.findAllOptimized({ skip, take: limit }),
    ProductRepository.count(),
  ]);

  const result = {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };

  // Simpan ke cache (5 menit)
  cacheManager.set(cacheKey, result, 300);
  return result;
}

// Get product by ID
export async function getProductByIdService(id: string) {
  const product = await ProductRepository.findById(id);
  if (!product) throw new AppError(Messages.NOT_FOUND, HttpStatus.NOT_FOUND);
  return product;
}

// Create product
export async function createProductService(data: CreateProductInput) {
  // Business logic: validasi price
  if (data.price <= 0) {
    throw new AppError("Price must be greater than 0", HttpStatus.BAD_REQUEST);
  }

  const product = await ProductRepository.create(data);

  // Invalidate cache setelah create
  cacheManager.delPattern("products:all:page:");

  logger.info("Product created", { productId: product.id });
  return product;
}

// Update & Delete service... (similar pattern)
```

**Key Points:**

- ✅ Business logic & validation di sini
- ✅ Gunakan Repository untuk database access
- ✅ Throw `AppError` untuk error handling
- ✅ Implement caching untuk performa
- ✅ Invalidate cache saat data berubah
- ✅ Log actions penting

---

### 2. Membuat Repository Baru

Repository layer untuk **database operations** saja (no business logic). Contoh `product.repository.ts`:

```typescript
// src/repositories/product.repository.ts
import { Product } from "@prisma/client";
import { db } from "@/config/prisma";

export class ProductRepository {
  static async findById(id: string): Promise<Product | null> {
    return db.product.findUnique({ where: { id } });
  }

  // Optimized: select specific fields only
  static async findAllOptimized(options?: { skip?: number; take?: number }) {
    return db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: "desc" },
    });
  }

  static async count(): Promise<number> {
    return db.product.count();
  }

  static async create(
    data: Pick<Product, "name" | "price" | "description">
  ): Promise<Product> {
    return db.product.create({ data });
  }

  static async update(
    id: string,
    data: Partial<Pick<Product, "name" | "price">>
  ): Promise<Product> {
    return db.product.update({ where: { id }, data });
  }

  static async delete(id: string): Promise<Product> {
    return db.product.delete({ where: { id } });
  }
}
```

**Key Points:**

- ✅ Pure database operations (CRUD only)
- ✅ Use static methods
- ✅ Type-safe dengan Prisma types
- ✅ Optimized queries (select specific fields)
- ✅ No business logic di sini

---

### 3. Membuat Controller Baru

Controller menangani **HTTP requests dan responses**. Contoh `product.controller.ts`:

```typescript
// src/controller/product.controller.ts
import { Request, Response } from "express";
import {
  getAllProductService,
  getProductByIdService,
  createProductService,
} from "@/service/product.service";
import { ResponseUtil } from "@/utils/response";
import { asyncHandler } from "@/middleware/error.middleware";
import { HttpStatus } from "@/constants/http-status";
import { MessageCodes } from "@/constants/message";

// Get all products
export const getAllProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await getAllProductService({ page, limit });

    return ResponseUtil.success(
      res,
      result,
      HttpStatus.OK,
      MessageCodes.SUCCESS
    );
  }
);

// Get product by ID
export const getProductByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await getProductByIdService(req.params.productId);
    return ResponseUtil.success(res, product);
  }
);

// Create product
export const createProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await createProductService(req.body);
    return ResponseUtil.created(res, product, MessageCodes.CREATED);
  }
);
```

**Key Points:**

- ✅ Use `asyncHandler` untuk auto error handling
- ✅ Extract data dari request (params, query, body)
- ✅ Call service layer
- ✅ Return response dengan `ResponseUtil`
- ✅ Keep thin - no business logic di sini

---

### 4. Membuat Routes & Schema

**Routes** menghubungkan URL dengan controllers:

```typescript
// src/routes/product.route.ts
import { Router } from "express";
import {
  getAllProductController,
  createProductController,
} from "@/controller/product.controller";
import { validateSchema } from "@/middleware/zod.middleware";
import { createProductSchema } from "@/schemas/product.schema";
import authMiddleware from "@/middleware/auth.middleware";

const productRouter = Router();

// Public routes
productRouter.get("/", getAllProductController);
productRouter.get("/:productId", getProductByIdController);

// Protected routes (perlu auth)
productRouter.use(authMiddleware);
productRouter.post(
  "/",
  validateSchema(createProductSchema),
  createProductController
);

export default productRouter;
```

**Validation Schema** dengan Zod:

```typescript
// src/schemas/product.schema.ts
import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    price: z.number().positive(),
    description: z.string().max(500).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
```

**Register di routes utama** (`src/routes/index.routes.ts`):

```typescript
import productRouter from "./product.route";
apiRouter.use("/products", productRouter);
```

**Update Prisma Schema** (`prisma/schema.prisma`):

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  price       Float
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Lalu jalankan:

```bash
npm run db:migrate
npm run db:generate
```

---

## � Response Format

Template ini menggunakan **standardized response format** dengan `ResponseUtil`:

### Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "messageCode": "SUCCESS",
  "timestamp": "2025-10-12T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Not found",
  "messageCode": "NOT_FOUND",
  "errors": [ ... ],
  "timestamp": "2025-10-12T10:30:00.000Z",
  "path": "/api/v1/users/123"
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false,
    "nextPage": 2,
    "prevPage": null
  },
  "timestamp": "2025-10-12T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

### Response Methods

```typescript
import { ResponseUtil } from "@/utils/response";
import { HttpStatus } from "@/constants/http-status";
import { MessageCodes } from "@/constants/message";

// Success
ResponseUtil.success(res, data, HttpStatus.OK, MessageCodes.SUCCESS);
ResponseUtil.success(res, data, HttpStatus.OK, "Custom message");

// Created
ResponseUtil.created(res, data, MessageCodes.CREATED);

// Error
ResponseUtil.error(res, MessageCodes.INTERNAL_ERROR);
ResponseUtil.error(
  res,
  "Custom error message",
  undefined,
  HttpStatus.BAD_REQUEST
);

// Not Found
ResponseUtil.notFound(res, MessageCodes.NOT_FOUND);

// Unauthorized / Forbidden
ResponseUtil.unauthorized(res);
ResponseUtil.forbidden(res);

// Validation Error
ResponseUtil.validationError(res, errors);

// Paginated
ResponseUtil.paginated(res, data, page, limit, total);
```

### Message Codes

Available message codes di `src/constants/message.ts`:

```typescript
MessageCodes.SUCCESS; // "Success"
MessageCodes.CREATED; // "Created successfully"
MessageCodes.UPDATED; // "Updated successfully"
MessageCodes.DELETED; // "Deleted successfully"
MessageCodes.NOT_FOUND; // "Not found"
MessageCodes.UNAUTHORIZED; // "Unauthorized"
MessageCodes.FORBIDDEN; // "Forbidden"
MessageCodes.BAD_REQUEST; // "Bad request"
MessageCodes.CONFLICT; // "Conflict occurred"
MessageCodes.VALIDATION_FAILED; // "Validation failed"
MessageCodes.INVALID_CREDENTIALS; // "Email or password is incorrect"
MessageCodes.INTERNAL_ERROR; // "Internal server error"
```

---

## 🌟 Keunggulan Template

### 🏗️ Clean Architecture

- **Separation of Concerns**: Repository → Service → Controller
- **Maintainable**: Easy to understand dan modify
- **Scalable**: Siap untuk project besar
- **Testable**: Mudah untuk unit testing

### 🔒 Security & Performance

- **JWT Authentication** dengan dual mode (header/cookie)
- **Helmet.js** untuk security headers
- **Rate Limiting** protection
- **Bcrypt** password hashing
- **Zod Validation** untuk input validation
- **Caching System** dengan pattern matching
- **Response Compression** untuk faster transfer

### 💻 Developer Experience

- **TypeScript** dengan strict mode
- **Hot Reload** development
- **Module Aliases** (`@/`) untuk clean imports
- **ESLint + Prettier** configured
- **Winston Logger** dengan daily rotate
- **Prisma Studio** untuk database GUI
- **Centralized Error Handling**

### 📦 Production Ready

- **Docker Support** dengan Dockerfile
- **Environment Config** via `.env`
- **Database Migrations** dengan Prisma
- **Health Check Endpoint**
- **Standardized API Responses**
- **File Upload** support dengan Multer
- **Testing Setup** dengan Jest

### 🚀 Built-in Utilities

- JWT & Bcrypt utilities
- Cache manager dengan pattern deletion
- Code generator helpers
- Date utilities (date-fns)
- Database transaction helpers
- File upload handlers
- Comprehensive logger

---

## 📄 Lisensi

MIT License - lihat file [LICENSE](LICENSE)

## 👨‍💻 Author

**Pito Desri Pauzi**

- GitHub: [@PitokDf](https://github.com/PitokDf)

---

**Happy Coding! 🚀**
