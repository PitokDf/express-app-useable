# Template Express.js + TypeScript + Prisma

Template backend yang ringkas, aman, dan dapat dikembangkan, dibangun dengan Express.js, TypeScript, dan Prisma ORM. Dokumen ini disusun untuk memudahkan pengguna memulai, mengonfigurasi, dan menerapkan proyek berbasis template ini.

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
  - [Opsi A — Menggunakan npx (direkomendasikan)](#opsi-a--menggunakan-npx-direkomendasikan)
  - [Opsi B — Instalasi manual](#opsi-b--instalasi-manual)
- [Menjalankan aplikasi](#menjalankan-aplikasi)
- [API singkat (contoh)](#api-singkat-contoh)
- [Testing](#testing)
- [Struktur proyek](#struktur-proyek)
- [Checklist pra-produksi](#checklist-pra-produksi)
- [Deployment singkat](#deployment-singkat)
- [Kontribusi](#kontribusi)
- [Lisensi dan penulis](#lisensi-dan-penulis)

## Fitur

- Integrasi TypeScript penuh
- Prisma ORM untuk akses database yang bertipe
- Autentikasi JWT dan hashing password (bcrypt)
- Rate limiting, CORS, helmet, kompresi
- Upload file (multer), caching (Redis / in-memory)
- Logging (Winston), validasi request (Zod)
- Multi-stage Dockerfile dan seed database

## Teknologi

Node.js 20 | Express 5 | TypeScript 5 | Prisma 6 | SQLite (default)

## Prasyarat

- Node.js 20+ dan npm atau yarn
- Docker (opsional)
- Jika menggunakan database lain, siapkan `DATABASE_URL` sesuai provider

## Instalasi

### Opsi A — Menggunakan npx (direkomendasikan)

Jika paket generator template ini tersedia di npm, Anda dapat membuat proyek baru dengan perintah:

```bash
npx install-express create <nama-project>
```

Perintah ini akan menyalin struktur proyek dan konfigurasi dasar ke direktori `./<nama-project>`.

> Catatan: Jika Anda menerbitkan paket ini ke npm, pastikan dokumentasi paket npm juga mengacu pada cara ini.

### Opsi B — Instalasi manual

1. Clone repository

```bash
git clone https://github.com/PitokDf/express-app-useable.git
cd express-app-useable
```

2. Pasang dependensi

```bash
npm install
```

3. Siapkan environment

```bash
cp .env.example .env
# sesuaikan nilai di .env — terutama DATABASE_URL dan JWT_SECRET
```

4. Inisialisasi database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

**Kredensial default (setelah seed):**

- Email: `admin@example.com`
- Password: `admin123`

> Keamanan: Jangan pernah commit file `.env` ke repository publik. Gunakan nilai `JWT_SECRET` yang kuat di lingkungan produksi.

## Menjalankan aplikasi

### Mode development

```bash
npm run dev
```

Server default: `http://localhost:6789`

### Build untuk production

```bash
npm run build
npm start
```

### Jalankan dengan Docker (contoh sederhana)

```bash
docker build -t express-app .

docker run -p 6789:6789 \
  -e DATABASE_URL="file:./dev.db" \
  -e JWT_SECRET="(isi-secret-anda)" \
  express-app
```

## API singkat (contoh)

Base URL: `http://localhost:6789/api/v1`

Contoh permintaan login:

```bash
curl -X POST http://localhost:6789/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Contoh respon sukses (ringkasan):

```json
{
  "status": "success",
  "data": {
    "token": "<jwt>",
    "user": {
      /* ... */
    }
  }
}
```

> Catatan: Template memiliki opsi menyimpan token di cookie (`TOKEN_SET_IN=cookie`) atau di header (`TOKEN_SET_IN=header`). Sesuaikan `.env` sesuai kebutuhan keamanan aplikasi Anda.

## Testing

Jalankan test unit/integrasi dengan:

```bash
npm test
npm run test:coverage
```

## Struktur proyek

Lebih ringkas:

```
src/
├─ config/
├─ controller/
├─ middleware/
├─ routes/
├─ service/
└─ utils/
prisma/
├─ schema.prisma
└─ db/seed.ts
```

## Checklist pra-produksi (singkat)

- [ ] Gunakan `JWT_SECRET` yang kuat
- [ ] Pastikan `DATABASE_URL` mengarah ke production DB (jangan gunakan file SQLite untuk production)
- [ ] Set `ALLOWED_ORIGINS` CORS secara spesifik
- [ ] Aktifkan HTTPS / TLS pada layer reverse-proxy
- [ ] Nonaktifkan logging debug di production
- [ ] Audit dependensi dan security scan

## Deployment singkat

- Vercel: pastikan build target dan env vars dikonfigurasi di dashboard Vercel
- Docker: gunakan `docker-compose` jika perlu menggabungkan Redis atau database

## Kontribusi

Silakan fork, buat branch fitur, dan buka PR. Sertakan deskripsi perubahan dan testing singkat.

## Lisensi & penulis

MIT — Pito Desri Pauzi

---

Jika Anda setuju, saya akan:

- A: Ganti `README.md` dengan versi ini, atau
- B: Terapkan versi ini ke `README.md` tetapi simpan versi lama sebagai `README.orig.md`.

Pilih A atau B, atau minta perubahan tambahan sebelum saya mengganti file asli.
