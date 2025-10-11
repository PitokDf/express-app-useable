import { HttpStatus } from '@/constants/http-status';

export type PrismaErrorInfo = {
    code: string;
    message: string;
    commonCause?: string;
    httpStatus?: number;
    suggestion?: string;
};

export const prismaErrorCodes: PrismaErrorInfo[] = [
    {
        code: 'P2002',
        message: 'Unique constraint failed',
        commonCause: 'Mencoba membuat data dengan nilai unik yang sudah ada (misalnya, email duplikat).',
        httpStatus: HttpStatus.CONFLICT,
        suggestion: 'Periksa nilai unik (mis. email) dan kembalikan pesan yang menjelaskan field duplikat.'
    },
    {
        code: 'P2025',
        message: 'Record to update or delete does not exist',
        commonCause: 'Mencoba mengupdate atau menghapus data yang tidak ditemukan berdasarkan ID atau kondisi `where`.',
        httpStatus: HttpStatus.NOT_FOUND,
        suggestion: 'Pastikan resource ada sebelum melakukan update/delete.'
    },
    {
        code: 'P2003',
        message: 'Foreign key constraint failed',
        commonCause: 'Mencoba membuat atau mengupdate data dengan foreign key yang tidak merujuk ke record yang ada di tabel lain.',
        httpStatus: HttpStatus.BAD_REQUEST,
        suggestion: 'Validasi relasi yang direferensikan sebelum menyimpan.'
    },
    {
        code: 'P1001',
        message: "Can't reach database server",
        commonCause: 'Aplikasi tidak bisa terhubung ke database. Bisa karena kredensial salah, server database mati, atau masalah jaringan/firewall.',
        httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
        suggestion: 'Periksa koneksi database dan konfigurasi environment.'
    },
    {
        code: 'P1000',
        message: 'Authentication failed against database server',
        commonCause: 'Kredensial (username/password) pada URL koneksi database salah.',
        httpStatus: HttpStatus.UNAUTHORIZED,
        suggestion: 'Periksa DATABASE_URL dan kredensial.'
    },
    {
        code: 'P1012',
        message: 'Schema validation error',
        commonCause: 'Terdapat kesalahan sintaks atau logika dalam file `schema.prisma` Anda.',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        suggestion: 'Perbaiki file schema.prisma dan jalankan kembali migrasi/generate.'
    },
    {
        code: 'P1017',
        message: 'Server has closed the connection',
        commonCause: 'Koneksi ke database terputus secara tidak terduga oleh server.',
        httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
        suggestion: 'Periksa stabilitas koneksi database dan timeout.'
    },
    {
        code: 'P2000',
        message: 'The provided value for the column is too long',
        commonCause: 'Nilai string yang dimasukkan lebih panjang dari batas yang diizinkan oleh kolom di database.',
        httpStatus: HttpStatus.BAD_REQUEST,
        suggestion: 'Validasi panjang input sebelum menyimpan.'
    },
    {
        code: 'P2011',
        message: 'Null constraint violation',
        commonCause: 'Mencoba memasukkan nilai `null` pada kolom yang wajib diisi (NOT NULL).',
        httpStatus: HttpStatus.BAD_REQUEST,
        suggestion: 'Tambahkan validasi untuk memastikan field wajib diisi.'
    },
    {
        code: 'P3001',
        message: 'Migration failed to apply',
        commonCause: 'Gagal saat menjalankan file migrasi SQL, biasanya disertai detail error dari database.',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        suggestion: 'Periksa script migrasi dan error yang muncul dari database.'
    },
    {
        code: 'P3006',
        message: 'Migration failed due to a drift in the database schema',
        commonCause: 'Struktur database diubah secara manual (di luar Prisma Migrate), menyebabkan konflik. Perlu reset atau membuat migrasi baru.',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        suggestion: 'Pertimbangkan reset migrasi pada development atau perbaiki skema di produksi dengan hati-hati.'
    }
];

export function findErrorDetails(errorCode?: string): PrismaErrorInfo | undefined {
    if (!errorCode) return undefined;
    return prismaErrorCodes.find(e => e.code === errorCode);
}

export function mapPrismaError(err: any) {
    const code: string | undefined = err?.code;
    const details = findErrorDetails(code);

    if (details) {
        return {
            code: details.code,
            message: details.message,
            commonCause: details.commonCause,
            suggestion: details.suggestion,
            httpStatus: details.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR,
            meta: err?.meta ?? undefined
        } as const;
    }

    // Fallback for unknown Prisma errors
    return {
        code: code ?? 'PRISMA_UNKNOWN',
        message: err?.message ?? 'Database error',
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        meta: err?.meta ?? undefined
    } as const;
}

export function isPrismaError(err: any): boolean {
    return !!err && typeof err.code === 'string' && /^P\d{3,4}$/.test(err.code);
}
