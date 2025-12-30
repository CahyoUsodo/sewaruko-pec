# Management Sewa Ruko PEC

Dashboard internal untuk management Data Sewa Ruko PEC menggunakan Next.js 14, Shadcn UI, dan Prisma.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup database:
- Buat file `.env` di root directory
- Tambahkan `DATABASE_URL="postgresql://user:password@localhost:5432/sewa_ruko_pec?schema=public"`
- Jalankan migration: `npx prisma migrate dev`

3. Jalankan development server:
```bash
npm run dev
```

## Fitur

- ✅ Data table dengan sorting dan filtering
- ✅ Jatuh tempo monitor dengan filter bulan/tahun
- ✅ Conditional formatting untuk sisa waktu sewa
- ✅ CRUD operations untuk data sewa ruko
- ✅ Link ke Google Maps untuk alamat
- ✅ Badge untuk status pembayaran
- ✅ Format currency Rupiah
- ✅ Format tanggal Indonesia

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma (PostgreSQL)
- Shadcn UI
- Tanstack Table
- date-fns
- Tailwind CSS

