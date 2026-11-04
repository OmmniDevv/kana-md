# KANA MD: image Docker untuk bot WhatsApp.
# Dashboard web TIDAK dijalankan dari image ini; deploy web ke Vercel
# (lihat TUTORIAL.md bagian dashboard web).
FROM node:20-bookworm-slim

# ffmpeg wajib untuk stiker, audio, dan video. fonts-dejavu-core dipakai
# generator teks bergambar (drawtext). ca-certificates untuk HTTPS.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pasang dependensi dulu supaya layer ini ter-cache selama kode berubah.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Data sesi WhatsApp dan penyimpanan lokal hidup di volume ini. Tanpa
# volume, sesi hilang setiap container dibuat ulang dan bot minta
# pairing lagi.
ENV NODE_ENV=production
ENV LOCAL_DATA_DIR=/app/data
RUN mkdir -p /app/data && chown -R node:node /app
VOLUME ["/app/data"]
USER node

CMD ["node", "src/index.js"]
