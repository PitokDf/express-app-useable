# Template Express.js TypeScript Prisma

Template backend yang kuat dan skalabel yang dibangun dengan Express.js, TypeScript, dan Prisma ORM. Proyek ini menyediakan fondasi yang solid untuk membangun RESTful API dengan autentikasi, manajemen database, caching, dan banyak lagi.

## 🚀 Fitur

- **Dukungan TypeScript**: Integrasi TypeScript penuh untuk keamanan tipe
- **Prisma ORM**: Toolkit database modern dengan akses database yang aman tipe
- **Autentikasi & Otorisasi**: Autentikasi berbasis JWT dengan hashing password bcrypt
- **Rate Limiting**: Perlindungan terhadap serangan brute-force
- **Konfigurasi CORS**: Setup cross-origin resource sharing
- **Upload File**: Integrasi Multer untuk menangani upload file
- **Caching**: Dukungan Redis dan caching in-memory
- **Logging**: Winston logger dengan rotasi harian
- **Penanganan Error**: Middleware penanganan error yang komprehensif
- **Validasi**: Validasi schema Zod untuk data request
- **Keamanan**: Helmet untuk header keamanan, kompresi, dan lainnya
- **Testing**: Setup Jest dengan integration tests
- **Dukungan Docker**: Multi-stage Docker build untuk production
- **Database Seeding**: Seeding database otomatis dengan data sampel

## 🛠 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js 5

## Installation & Usage (ringkas)

Dokumentasi ini menampilkan cara instalasi, perintah penting, dan contoh cepat membuat struktur: controller → service → repository → route → pendaftaran di `index.routes.ts`.

Catatan: semua contoh berasumsi Anda bekerja di folder proyek dan sudah menjalankan `npm install`.

### Perintah penting

- `npm run dev` — jalankan server dalam mode development (ts-node-dev)
- `npm run build` — kompilasi TypeScript ke `dist` dan jalankan `tsc-alias`
- `npm start` — jalankan versi produksi dari `dist`
- `npm run lint` / `npm run lint:fix` — linting proyek
- `npm test` — jalankan test dengan Jest
- `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, `npm run db:studio` — perintah Prisma

### Instalasi singkat

```bash
git clone https://github.com/PitokDf/express-app-useable.git
cd express-app-useable
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Cara membuat fitur baru (pattern recommended)

Berikut contoh langkah singkat membuat resource "Product" dengan pola controller → service → repository → route.

# Template Express.js TypeScript + Prisma

Template backend yang ringkas dan dapat diperluas, dibangun menggunakan Express.js, TypeScript, dan Prisma. Cocok sebagai fondasi RESTful API dengan autentikasi, validasi, logging, dan pola arsitektur repository → service → controller.

## Daftar isi

- [Fitur utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Instalasi singkat](#instalasi-singkat)
- [Perintah penting](#perintah-penting)
- [Contoh cepat: resource Product](#contoh-cepat-resource-product)
- [Validasi (Zod) — contoh](#validasi-zod---contoh)
- [Middleware autentikasi — contoh](#middleware-autentikasi---contoh)
- [Response helper](#response-helper)
- [Testing](#testing)
- [Struktur proyek](#struktur-proyek)
- [Checklist pra-produksi](#checklist-pra-produksi)
- [Deployment singkat](#deployment-singkat)

## Fitur utama

- TypeScript untuk keamanan tipe
- Prisma ORM untuk akses database yang ter-typed
- Autentikasi JWT dengan opsi penyimpanan token di cookie atau header
- Validasi input menggunakan Zod
- Rate limiting, CORS, file upload (Multer)
- Caching (Redis/in-memory) dan logging (Winston)
- Docker multi-stage build

## Teknologi

- Node.js 20
- TypeScript
- Express 5
- Prisma
- Zod
- jsonwebtoken, bcryptjs
- Jest (testing)

## Instalasi singkat

1. Clone repository

```bash
git clone https://github.com/PitokDf/express-app-useable.git
cd express-app-useable
```

2. Instal dependency dan siapkan environment

```bash
npm install
cp .env.example .env
# sesuaikan .env (DATABASE_URL, JWT_SECRET, TOKEN_SET_IN, dsb.)
```

3. Setup database (Prisma)

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Jalankan development server

```bash
npm run dev
```

Server default: http://localhost:6789 (base API: /api/v1)

## Perintah penting

- npm run dev — development (ts-node-dev)
- npm run build — build TypeScript ke dist + tsc-alias
- npm start — jalankan build produksi
- npm run lint / npm run lint:fix — linting
- npm test — jalankan test
- npm run db:generate / db:migrate / db:seed / db:studio — Prisma

## Contoh cepat: resource Product

Langkah singkat untuk membuat resource Product (pattern repository → service → controller → route).

1. Tambah model di `prisma/schema.prisma` lalu migrate:

```prisma
model Product {
   id    String @id @default(uuid())
   name  String
   price Int
}
```

2. Repository — `src/repositories/product.repository.ts`

```ts
import { db } from "@/config/prisma";

export class ProductRepository {
  static findAll() {
    return db.product.findMany();
  }
  static findById(id: string) {
    return db.product.findUnique({ where: { id } });
  }
  static create(data: { name: string; price: number }) {
    return db.product.create({ data });
  }
  static update(id: string, data: Partial<{ name: string; price: number }>) {
    return db.product.update({ where: { id }, data });
  }
  static delete(id: string) {
    return db.product.delete({ where: { id } });
  }
}
```

3. Service — `src/service/product.service.ts`

```ts
import { ProductRepository } from "@/repositories/product.repository";

export const getAllProducts = async () => ProductRepository.findAll();

export const createProduct = async (payload: { name: string; price: number }) =>
  ProductRepository.create(payload);
```

4. Controller — `src/controller/product.controller.ts`

```ts
import { Request, Response } from "express";
import { getAllProducts, createProduct } from "@/service/product.service";
import { ResponseUtil } from "@/utils/response";

export const listProducts = async (req: Request, res: Response) => {
  const products = await getAllProducts();
  return ResponseUtil.success(res, products);
};

export const addProduct = async (req: Request, res: Response) => {
  const payload = req.body;
  const product = await createProduct(payload);
  return ResponseUtil.success(res, product, 201);
};
```

5. Route — `src/routes/product.route.ts`

```ts
import { Router } from "express";
import { listProducts, addProduct } from "@/controller/product.controller";

const router = Router();

router.get("/", listProducts);
router.post("/", addProduct);

export default router;
```

6. Daftarkan pada `src/routes/index.routes.ts`:

```ts
import { Router } from "express";
import productRouter from "./product.route";

const apiRouter = Router();

apiRouter.use("/products", productRouter);

export default apiRouter;
```

Endpoints: GET /api/v1/products, POST /api/v1/products

## Validasi (Zod) — contoh

Contoh schema Zod yang umum digunakan untuk endpoint pembuatan Product dan autentikasi user.

1. Product schema — `src/schemas/product.schema.ts`

```ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  price: z.number().int().nonnegative("Harga harus angka dan >= 0"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

2. Auth (user) schema — `src/schemas/user.schema.ts`

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

Cara pakai: gunakan `zod.middleware` atau middleware kustom untuk mem-parse dan memvalidasi request body sebelum controller dipanggil. Pada project ini tersedia `src/middleware/zod.middleware.ts` sebagai contoh integrasi.

## Middleware autentikasi — contoh

Contoh middleware ringkas yang membaca token dari cookie atau header (sesuai env TOKEN_SET_IN) dan memverifikasinya menggunakan util JWT (contoh: `src/utils/jwt.ts`).

```ts
import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "@/utils/jwt";
import config from "@/config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      config.TOKEN_SET_IN === "cookie"
        ? req.cookies?.access_token
        : req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const payload = JwtUtil.verify(token);
    // Pasang data user ke req (opsional)
    (req as any).user = payload;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: "error", message: "Token tidak valid" });
  }
};
```

Pemasangan di route:

```ts
import { Router } from "express";
import { authMiddleware } from "@/middleware/auth.middleware";
import productRouter from "./product.route";

const apiRouter = Router();

apiRouter.use("/products", authMiddleware, productRouter);
```

Catatan: login endpoint biasanya tidak diproteksi; setelah login, token dikembalikan dan dapat disimpan di cookie atau lokal storage sesuai kebijakan keamanan.

## Response helper

Gunakan util `ResponseUtil.success(res, data, status?, message?)` untuk konsistensi response.

## Testing

Jalankan test unit/integrasi:

```bash
npm test
npm run test:coverage
```

## Struktur proyek (singkat)

```
src/
├─ config/
├─ controller/
├─ middleware/
├─ routes/
├─ service/
├─ repositories/
├─ schemas/
└─ utils/
prisma/
├─ schema.prisma
└─ db/seed.ts
```

## Checklist pra-produksi

Praktik minimal sebelum deploy ke production:

- [ ] Gunakan JWT_SECRET yang kuat dan simpan di secret manager
- [ ] Pastikan DATABASE_URL mengarah ke database production (hindari SQLite file)
- [ ] Batasi ALLOWED_ORIGINS untuk CORS
- [ ] Konfigurasi HTTPS/TLS di reverse-proxy (NGINX, Cloud, dsb.)
- [ ] Nonaktifkan logging debug dan kurangi log level
- [ ] Audit dependensi (npm audit / Snyk / Dependabot)
- [ ] Backup & migration strategy untuk database
- [ ] Rate-limit yang sesuai untuk endpoint sensitif
- [ ] Pastikan environment variables sensitif tidak ter-commit

## Deployment singkat

- Vercel: konfigurasi build dan environment variables di dashboard
- Docker: gunakan docker-compose untuk menggabungkan layanan seperti Redis, Postgres

## Kredensial seed (default)

- Email: admin@example.com
- Password: admin123

> Catatan keamanan: ubah kredensial seed dan kunci sebelum production.

## Kontribusi

Silakan fork, buat branch fitur, dan buka PR. Sertakan deskripsi perubahan dan testing singkat.

## Lisensi

MIT — Pito Desri Pauzi
