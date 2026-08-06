# Sistem Pemilihan Ketua Karang Taruna (E-Voting Multi-Organisasi)

Aplikasi Web E-Voting modern dan real-time untuk pemilihan ketua Karang Taruna, mendukung multi-acara/organisasi (tenant), manajemen kandidat, pemungutan suara aman, real-time quick count, serta pengunduhan laporan PDF/Excel.

## 🚀 Fitur Utama

- **Multi-Organisasi / Multi-Acara (`?org=KARTA-XX`)**:
  - Setiap Karang Taruna memiliki acara, kandidat, DPT (Daftar Pemilih Tetap), dan hasil pemungutan suara terisolasi.
- **Master Admin & Panitia**:
  - Kelola acara pemilihan baru, edit data kandidat, atur waktu pelaksanaan, serta bagikan tautan unik ke pengurus/penyewa.
- **Pemungutan Suara Real-time**:
  - Sistem token/PIN sekali pakai untuk pemilih, visualisasi quick count transparan.
- **Export Laporan**:
  - Cetak hasil akhir dan rekapitulasi suara dalam bentuk PDF atau spreadsheet.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express.js.
- **Database**: Firebase Firestore & Backup Disk Lokal.
- **Build Tool**: Vite, ESBuild.

## 📦 Cara Memulai (Local Development)

1. Clone repositori ini:
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd <NAMA_FOLDER>
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
4. Buka browser di `http://localhost:3000`.

---
*Dibuat menggunakan Google AI Studio.*
