#!/bin/sh

# Pastikan folder database ada
mkdir -p /app/database

# Salin binary C terbaru ke persistent volume agar bisa dijalankan
cp /app/backend-c-dist/kendaraan /app/database/kendaraan
chmod +x /app/database/kendaraan

# Copy data.json awal jika belum ada (agar data tidak hilang saat deploy ulang)
if [ ! -f /app/database/data.json ]; then
  echo "Seeding data.json awal ke persistent volume..."
  cp /app/backend-c-dist/data.json /app/database/data.json
fi

# Jalankan Next.js server
npm run start --prefix frontend
