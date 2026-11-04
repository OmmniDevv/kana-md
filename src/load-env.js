// Muat .env sejak paling awal memakai process.loadEnvFile() bawaan Node
// (Node 20.12+). Diimpor pertama oleh src/index.js agar semua modul lain
// membaca process.env yang sudah terisi. File tidak ada: diam saja,
// bot tetap jalan dengan env dari shell.
try {
  process.loadEnvFile()
} catch {}
