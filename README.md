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

### 4. Membuat Routes & Validation Schema

Template ini menggunakan **Zod** untuk validation schema yang kuat dan type-safe. Bagian ini menjelaskan cara membuat dan menggunakan validation schema.

#### 4.1. Membuat Validation Schema

Buat file schema di folder `src/schemas/`. Contoh `product.schema.ts`:

```typescript
// src/schemas/product.schema.ts
import { z } from "zod";

// Schema untuk create product
export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nama minimal 3 karakter" })
    .max(100, { message: "Nama maksimal 100 karakter" }),
  price: z
    .number({ required_error: "Price wajib diisi" })
    .positive({ message: "Price harus lebih dari 0" }),
  description: z
    .string()
    .max(500, { message: "Deskripsi maksimal 500 karakter" })
    .optional(), // Field opsional
  stock: z
    .number()
    .int({ message: "Stock harus bilangan bulat" })
    .min(0, { message: "Stock tidak boleh negatif" })
    .default(0), // Default value
});

// Export type untuk digunakan di service/controller
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Schema untuk update product (semua field optional)
export const updateProductSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Nama minimal 3 karakter" })
      .optional(),
    price: z.number().positive().optional(),
    description: z.string().max(500).optional(),
    stock: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi untuk update",
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

#### 4.2. Jenis-Jenis Validasi Zod

**String Validations:**

```typescript
z.string() // String biasa
  .min(3, { message: "Minimal 3 karakter" })
  .max(100, { message: "Maksimal 100 karakter" })
  .nonempty({ message: "Tidak boleh kosong" })
  .email({ message: "Format email tidak valid" })
  .url({ message: "Format URL tidak valid" })
  .regex(/^[A-Z]/, { message: "Harus diawali huruf kapital" })
  .trim() // Hapus whitespace di awal/akhir
  .toLowerCase() // Convert ke lowercase
  .toUpperCase() // Convert ke uppercase
  .transform((str) => str.toLowerCase()) // Custom transform
  .optional() // Field opsional
  .nullable() // Bisa null
  .default("default value"); // Default value
```

**Number Validations:**

```typescript
z.number() // Number biasa
  .int({ message: "Harus bilangan bulat" })
  .positive({ message: "Harus positif" })
  .negative({ message: "Harus negatif" })
  .min(0, { message: "Minimal 0" })
  .max(100, { message: "Maksimal 100" })
  .multipleOf(5, { message: "Harus kelipatan 5" })
  .finite() // Tidak boleh Infinity
  .safe() // Harus dalam range Number.MIN_SAFE_INTEGER dan MAX_SAFE_INTEGER
  .optional()
  .default(0);
```

**Boolean, Date, dan Enum:**

```typescript
// Boolean
z.boolean({ required_error: "Status wajib diisi" });

// Date
z.date({ required_error: "Tanggal wajib diisi" })
  .min(new Date("2024-01-01"), { message: "Minimal 1 Jan 2024" })
  .max(new Date(), { message: "Tidak boleh melebihi hari ini" });

// Enum
z.enum(["PENDING", "PROCESSING", "COMPLETED"], {
  errorMap: () => ({ message: "Status tidak valid" }),
});

// Native Enum
enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}
z.nativeEnum(Role);
```

**Array dan Object:**

```typescript
// Array
z.array(z.string()) // Array of strings
  .min(1, { message: "Minimal 1 item" })
  .max(10, { message: "Maksimal 10 item" })
  .nonempty({ message: "Array tidak boleh kosong" });

// Object
z.object({
  name: z.string(),
  age: z.number(),
});

// Nested object
z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  tags: z.array(z.string()),
});
```

**Custom Validation dengan `.refine()`:**

```typescript
// Validasi custom password
export const registerSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"], // Error akan muncul di field confirmPassword
  });

// Validasi age range
export const userSchema = z.object({
  age: z.number().refine((age) => age >= 18 && age <= 100, {
    message: "Umur harus antara 18-100 tahun",
  }),
});

// Multiple refine
export const productSchema = z
  .object({
    price: z.number(),
    discount: z.number(),
  })
  .refine((data) => data.discount < data.price, {
    message: "Discount tidak boleh lebih besar dari price",
    path: ["discount"],
  })
  .refine((data) => data.discount >= 0, {
    message: "Discount tidak boleh negatif",
    path: ["discount"],
  });
```

**Transform Data:**

```typescript
// Transform email ke lowercase
z.string().email().transform((email) => email.toLowerCase());

// Transform string number ke number
z.string().transform((val) => parseInt(val, 10));

// Transform date string ke Date object
z.string().transform((str) => new Date(str));

// Conditional transform
z.string()
  .optional()
  .transform((str) => (str ? str.trim() : str));
```

#### 4.3. Menggunakan Schema di Routes

**Routes** menghubungkan URL dengan controllers dan menggunakan `validateSchema` middleware:

```typescript
// src/routes/product.route.ts
import { Router } from "express";
import {
  getAllProductController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
} from "@/controller/product.controller";
import { validateSchema } from "@/middleware/zod.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "@/schemas/product.schema";
import authMiddleware from "@/middleware/auth.middleware";

const productRouter = Router();

// Public routes - tidak perlu authentication
productRouter.get("/", getAllProductController);
productRouter.get("/:productId", getProductByIdController);

// Protected routes - perlu authentication
productRouter.use(authMiddleware);

// POST /products - dengan validation schema
productRouter.post(
  "/",
  validateSchema(createProductSchema), // Validate req.body
  createProductController
);

// PATCH /products/:productId - dengan validation schema
productRouter.patch(
  "/:productId",
  validateSchema(updateProductSchema), // Validate req.body
  updateProductController
);

// DELETE /products/:productId
productRouter.delete("/:productId", deleteProductController);

export default productRouter;
```

**Cara Kerja `validateSchema` Middleware:**

```typescript
// src/middleware/zod.middleware.ts (sudah tersedia)
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validateSchema = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse dan validate req.body dengan schema
      schema.parse(req.body);
      next(); // Lanjutkan jika validasi berhasil
    } catch (error: any) {
      if (error instanceof ZodError) {
        // Error akan di-handle oleh error middleware
        return next(error);
      }
      next(new AppError("Kesalahan tak terduga saat validasi input."));
    }
  };
};
```

**Error Response dari Validation:**

Ketika validasi gagal, user akan menerima response seperti ini:

```json
{
  "success": false,
  "message": "Invalid input data.",
  "errors": [
    {
      "path": "name",
      "message": "Nama minimal 3 karakter"
    },
    {
      "path": "price",
      "message": "Price harus lebih dari 0"
    }
  ],
  "timestamp": "2025-10-12T10:30:00.000Z",
  "path": "/api/v1/products"
}
```

#### 4.4. Contoh Lengkap Schema untuk Use Case Umum

**User Registration Schema:**

```typescript
// src/schemas/user.schema.ts
import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Nama minimal 3 karakter" })
      .max(100, { message: "Nama maksimal 100 karakter" }),
    email: z
      .string()
      .email({ message: "Format email tidak valid" })
      .transform((email) => email.toLowerCase()),
    password: z
      .string()
      .min(6, { message: "Password minimal 6 karakter" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "Password harus mengandung huruf besar, kecil, dan angka",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Format email tidak valid" })
    .transform((email) => email.toLowerCase()),
  password: z.string().nonempty({ message: "Password wajib diisi" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

**Query Parameters Validation:**

```typescript
// src/schemas/query.schema.ts
import { z } from "zod";

// Schema untuk pagination query
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: "Page harus lebih dari 0" }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit harus antara 1-100",
    }),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "price"]).optional(),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

// Gunakan di controller:
// const query = paginationSchema.parse(req.query);
```

**File Upload Validation:**

```typescript
// src/schemas/upload.schema.ts
import { z } from "zod";

export const uploadImageSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["profile", "product", "banner"]),
  // File akan di-handle oleh Multer, validasi file di middleware
});
```

#### 4.5. Best Practices

✅ **DO:**

- Buat schema terpisah untuk setiap use case (create, update, dll)
- Gunakan custom error messages yang jelas dan informatif
- Gunakan `.transform()` untuk normalize data (lowercase email, trim string)
- Gunakan `.refine()` untuk validasi kompleks
- Export types dengan `z.infer<>` untuk type safety
- Gunakan `.optional()` untuk field yang tidak wajib
- Berikan default value dengan `.default()` jika diperlukan

❌ **DON'T:**

- Jangan validasi di controller (gunakan schema)
- Jangan hardcode error messages yang sama berulang kali
- Jangan lupa handle edge cases (null, undefined, empty string)
- Jangan skip validation untuk "internal" endpoints
- Jangan gunakan `.any()` - selalu spesifik dengan type

#### 4.6. Register Routes

**Register di routes utama** (`src/routes/index.routes.ts`):

```typescript
import { Router } from "express";
import userRouter from "./user.route";
import productRouter from "./product.route";

const apiRouter = Router();

apiRouter.use("/users", userRouter);
apiRouter.use("/products", productRouter);

export default apiRouter;
```

#### 4.7. Update Prisma Schema

Jangan lupa update database schema di `prisma/schema.prisma`:

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  price       Float
  description String?
  stock       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Lalu jalankan:

```bash
npm run db:migrate   # Create migration
npm run db:generate  # Generate Prisma Client
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
