# UPDATEYUK - Portal Informasi & Berita Terkini Indonesia

Portal media digital modern, cepat, SEO-first, dan mobile-first yang dirancang untuk menjaring trafik organik masif dari Google Search serta berkembang menjadi portal dengan puluhan ribu artikel.

---

## 🚀 Fitur Unggulan & Arsitektur

### 1. SEO-First Architecture (Topical Authority)
- **Struktur URL Bersih & Semantik**: `/[category]/[slug]` (contoh: `/teknologi/revolusi-kecerdasan-buatan-di-indonesia-adopsi-ai-generatif`).
- **Single Canonical URL**: Setiap artikel dan halaman arsip memiliki tag kanonikal unik untuk mencegah duplikasi konten.
- **Dynamic JSON-LD Structured Data**:
  - `NewsArticle` (untuk liputan berita aktual).
  - `Article` (untuk artikel evergreen / panduan).
  - `BreadcrumbList` (breadcrumbs interaktif).
  - `WebSite` dengan `SearchAction`.
  - `NewsMediaOrganization` lengkap dengan kontak redaksi dan kebijakan koreksi.
  - `Person` (profil penulis/jurnalis terverifikasi).
- **Dynamic XML Sitemaps & RSS 2.0**:
  - `/sitemap.xml` (Sitemap Index).
  - `/sitemap-articles.xml` (Semua artikel terbit).
  - `/sitemap-categories.xml` (Semua kanal dan subkategori).
  - `/sitemap-pages.xml` (Halaman statis).
  - `/rss.xml` (Umpan RSS berkala untuk Google News & pembaca).
  - `/robots.txt` (Pengaturan crawl bot otomatis).

### 2. 20 Kanal Kategori Utama
1. **Berita Terkini** (`/berita`)
2. **Nasional** (`/nasional`)
3. **Daerah** (`/daerah`)
4. **Teknologi** (`/teknologi`)
5. **Bisnis** (`/bisnis`)
6. **Keuangan** (`/keuangan`)
7. **Lifestyle** (`/lifestyle`)
8. **Kesehatan** (`/kesehatan`)
9. **Otomotif** (`/otomotif`)
10. **Pendidikan** (`/pendidikan`)
11. **Travel** (`/travel`)
12. **Kuliner** (`/kuliner`)
13. **Tips & Tutorial** (`/tips`)
14. **Fakta & Pengetahuan** (`/fakta`)
15. **Viral** (`/viral`)
16. **Trending** (`/trending`)
17. **Entertainment** (`/entertainment`)
18. **Olahraga** (`/olahraga`)
19. **Islam & Religi** (`/religi`)
20. **Home & Living** (`/home-living`)

### 3. Halaman Redaksi & Kredibilitas (Dewan Pers Standar)
- `/about` (Profil Media, Visi & Misi)
- `/editorial-policy` (Pedoman Pemberitaan Media Siber & Larangan Clickbait/AI Spam)
- `/correction-policy` (Pedoman Hak Jawab, Ralat & Koreksi Cepat)
- `/contact` (Kontak Redaksi, Alamat Kantor & Form Kirim Berita)
- `/privacy-policy` (Kepatuhan UU PDP No. 27/2022)
- `/terms` (Ketentuan Layanan)
- `/disclaimer` (Sangkalan Hukum Umum/Kesehatan/Finansial)

### 4. CMS Redaksi & Admin Dashboard
- **URL Login Admin**: `/admin/login`
  - **Email**: `admin@updateyuk.com`
  - **Password**: `admin123`
- **Dashboard Metrik**: Total artikel, artikel tayang, draf, total views, top artikel, top kanal.
- **Editor Naskah**:
  - Auto-slug generator dari judul (dapat disunting manual).
  - Live Google SERP preview (judul & meta deskripsi).
  - Rich Markdown editor (H2, H3, quotes, bullet points, numbering).
  - Pilihan status: `PUBLISHED`, `DRAFT`, `SCHEDULED`.
  - Flags: `Featured Headline`, `Trending Ticker`, `NewsArticle Schema`.
  - Tag & topik penghubung otomatis (*content discovery*).

### 5. Monetisasi Terintegrasi Google AdSense
- Siap digunakan untuk Google AdSense tanpa merusak User Experience (UX):
  - Top Leaderboard Banner (728x90)
  - In-Article Ad Container (responsive)
  - Desktop Sticky Sidebar Ad (300x250 / 300x600)
  - Feed / Between-cards Native Ad
  - Bottom Banner Ad

---

## 🛠️ Menjalankan Proyek Secara Lokal

### Kebutuhan Sistem:
- Node.js v18+ (Rekomendasi v20 LTS)
- npm atau pnpm

### Langkah Menjalankan:
```bash
# 1. Masuk ke direktori
cd "c:\Users\admin\Documents\website info"

# 2. Pastikan file dependensi terpasang
npm install

# 3. Sinkronisasi skema database SQLite dan isi 20 artikel demo realistis
npx prisma db push
node prisma/seed.js

# 4. Jalankan mode pengembangan
npm run dev
# Buka http://localhost:3000 di browser

# Atau jalankan build produksi
npm run build
npm run start
```

---

## 🌐 Migrasi ke PostgreSQL (Produksi Skala Besar)

Secara default, aplikasi menggunakan database **SQLite** (`dev.db`) agar dapat langsung dijalankan tanpa instalasi server database eksternal.

Untuk berpindah ke PostgreSQL di server produksi:
1. Buka file `prisma/schema.prisma`.
2. Ubah `provider = "sqlite"` menjadi `provider = "postgresql"`.
3. Buka file `.env`, perbarui `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/updateyuk_db?schema=public"
   ```
4. Jalankan:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

---

## 🎨 Menyesuaikan Branding (Mengganti Nama Portal)

Nama `UPDATEYUK` dan identitas merek dapat diubah dengan mudah dari:
1. **File `.env`**:
   ```env
   NEXT_PUBLIC_SITE_NAME="NAMA_BARU"
   NEXT_PUBLIC_SITE_TAGLINE="Tagline Portal Anda"
   NEXT_PUBLIC_SITE_DESCRIPTION="Deskripsi portal..."
   ```
2. **File konfigurasi terpusat**: `src/lib/siteConfig.ts`
   Mengatur nama perusahaan, alamat redaksi, akun media sosial, nomor telepon, dan pendaftaran Dewan Pers.

