# Sistem Pengelolaan Data Kendaraan (CarData System) - Kelompok 7

Sistem Pengelolaan Data Kendaraan adalah aplikasi full-stack yang mengintegrasikan frontend web modern dengan core data processing engine yang ditulis sepenuhnya dalam **Bahasa C**. Proyek ini dibuat untuk memenuhi tugas mata kuliah Bahasa C dengan arsitektur modern berkinerja tinggi.

---

## 🏛️ Arsitektur Sistem

Aplikasi ini menggunakan pendekatan hybrid:
* **Frontend**: **Next.js App Router (v15)** dengan **TypeScript** dan styled menggunakan **Tailwind CSS v4** untuk antarmuka bertema *Premium Glassmorphism Dark Mode*.
* **Backend**: **Next.js API Routes** bertindak sebagai perantara yang mengeksekusi program binary C melalui modul `child_process.execFile` bawaan Node.js.
* **Core Logic (C Engine)**: Seluruh logika manipulasi data utama (CRUD, Searching, Sorting, JSON File I/O) ditulis dalam Bahasa C murni. Data disimpan di file lokal `backend-c/data.json`.

---

## 📋 Pemenuhan Persyaratan Tugas C

Proyek ini telah memenuhi seluruh 10 persyaratan utama tugas pemrograman C secara ketat:

1. **Minimal 3 Fungsi**: Terdapat **8 fungsi** utama di C yang dideklarasikan pada [kendaraan.h](backend-c/kendaraan.h) dan diimplementasikan pada [kendaraan.c](backend-c/kendaraan.c):
   - `loadData`: Membaca file data.json secara manual.
   - `simpanData`: Menyimpan data ke file data.json.
   - `tambahData`: Menambahkan data kendaraan baru.
   - `tampilkanData`: Mengirim data ke stdout dalam format JSON.
   - `cariData`: Melakukan Linear Search.
   - `bubbleSort`: Melakukan Bubble Sort.
   - `updateData`: Memperbarui data kendaraan berdasarkan plat nomor.
   - `hapusData`: Menghapus data kendaraan dari memori.
2. **Minimal 1 Struct Utama**: Struct `Kendaraan` dideklarasikan di `kendaraan.h`:
   ```c
   typedef struct {
       char plat[20];
       char merk[50];
       int tahun;
       float pajak;
   } Kendaraan;
   ```
3. **Wajib Menggunakan Pointer**: Seluruh fungsi manipulasi memori menerima alamat array (`Kendaraan *data`) dan variabel penting lewat pointer untuk efisiensi eksekusi (seperti `int *jumlah` dan `Kendaraan *hasil`).
4. **Wajib Memiliki Fitur Searching (Linear Search)**: Fungsi `cariData` mengimplementasikan Linear Search secara case-insensitive untuk mencocokkan plat nomor kendaraan.
5. **Wajib Memiliki Fitur Sorting (Bubble Sort)**: Fungsi `bubbleSort` mengurutkan array of struct berdasarkan nilai `pajak` secara menaik (ascending) menggunakan Bubble Sort.
6. **Data Utama Disimpan dalam Array of Struct**: Seluruh data di memori diproses dalam array `Kendaraan data[MAX_KENDARAAN]`.
7. **Searching Menggunakan Linear Search**: Algoritma Linear Search diimplementasikan murni di C.
8. **Sorting Menggunakan Bubble Sort**: Algoritma Bubble Sort diimplementasikan murni di C.
9. **Logika Sorting/Searching Tetap di C**: Next.js tidak melakukan pengurutan atau pencarian di JavaScript. Next.js hanya memicu C binary lewat child_process dengan argumen CLI `sort` atau `search <plat>` lalu menerima output JSON-nya.
10. **Aman & Efisien**: Data I/O langsung ke file `data.json` lokal menggunakan custom JSON parser & serializer murni di C.

---

## 🚀 Cara Menjalankan Project secara Lokal

### Persyaratan Awal
* Pastikan Anda memiliki compiler C (`gcc`) terinstal (misalnya melalui MinGW di Windows).
* Node.js versi 18 ke atas dan npm.

### Langkah 1: Clone & Siapkan Workspace
Buka terminal (PowerShell / Command Prompt) di folder root workspace (`KELOMPOK7`).

### Langkah 2: Kompilasi Executable C
Jalankan script untuk meng-compile file source C menjadi program executable:
```bash
npm run compile-c
```
Perintah ini akan membuat file binary `backend-c/kendaraan.exe` di Windows.

### Langkah 3: Jalankan Next.js Frontend & API Server
Jalankan development server:
```bash
npm run dev
```
Buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

### Perintah Penting Lainnya
* **Build Project untuk Produksi**: `npm run build`
* **Menjalankan Production Server**: `npm run start`

---

## 📂 Struktur Direktori Proyek

```text
KELOMPOK7/
│
├── backend-c/
│   ├── kendaraan.h       # Header file (Struct, Deklarasi fungsi)
│   ├── kendaraan.c       # Implementasi Logika C (Bubble Sort, Linear Search, I/O JSON)
│   ├── data.json         # Database JSON lokal (berisi data dummy)
│   └── kendaraan.exe     # Executable hasil compile (Windows)
│
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── kendaraan/
│   │   │       ├── route.ts         # Handler CRUD utama (GET, POST, PUT, DELETE)
│   │   │       ├── search/
│   │   │       │   └── route.ts     # Handler Pencarian (GET)
│   │   │       └── sort/
│   │   │           └── route.ts     # Handler Pengurutan (GET)
│   │   │   ...
│   │   ├── globals.css              # Styling Tailwind CSS
│   │   ├── layout.tsx               # Root Layout
│   │   └── page.tsx                 # Dashboard UI (Premium Glassmorphism Dark Theme)
│   ├── lib/
│   │   └── backend.ts               # Wrapper child_process untuk menjalankan C exe
│   ├── package.json
│   └── tsconfig.json
│
├── package.json          # Root package.json untuk script shortcut
└── README.md             # Dokumentasi ini
```
