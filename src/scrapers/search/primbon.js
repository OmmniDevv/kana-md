// Scraper primbon Siputzx: arti nama dan ramalan jodoh memakai data
// weton asli dari API, sama seperti fitur primbon Elaina-MD. Bila API
// ramalan sedang mati, ramalan jodoh dihitung lokal dengan metode
// primbon beneran (neptu hari + neptu pasaran, kategori delapan) supaya
// hasilnya tetap berbasis data tanggal, bukan persen generik.
import { randomUserAgent, retry, withBreaker } from '../runner.js'

const BASE = 'https://api.siputzx.my.id/api/primbon'

async function fetchJson(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: { 'User-Agent': randomUserAgent(), Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Siputzx balas HTTP ${res.status}`)
  return res.json()
}

export function parseArtiNama(json) {
  if (!json?.status || !json?.data?.arti) return null
  return {
    nama: String(json.data.nama || '').trim(),
    arti: String(json.data.arti || '').trim(),
    catatan: String(json.data.catatan || '').trim(),
  }
}

export async function getArtiNama(nama) {
  const name = String(nama || '').trim()
  if (!name) throw new Error('Nama wajib diisi')
  return withBreaker('siputzx-primbon', () =>
    retry(async () => {
      const json = await fetchJson(`${BASE}/artinama?nama=${encodeURIComponent(name)}`)
      const parsed = parseArtiNama(json)
      if (!parsed) throw new Error('Siputzx tidak mengembalikan arti nama')
      return { ...parsed, nama: parsed.nama || name }
    })
  )
}

export function parseRamalanJodoh(json) {
  const result = json?.data?.result
  if (!json?.status || !result?.orang_pertama || !result?.orang_kedua) return null
  return {
    first: {
      nama: String(result.orang_pertama.nama || '').trim(),
      tanggalLahir: String(result.orang_pertama.tanggal_lahir || '').trim(),
    },
    second: {
      nama: String(result.orang_kedua.nama || '').trim(),
      tanggalLahir: String(result.orang_kedua.tanggal_lahir || '').trim(),
    },
    hasil: Array.isArray(result.hasil_ramalan) ? result.hasil_ramalan.map((h) => String(h).trim()).filter(Boolean) : [],
    peringatan: String(json.data.peringatan || '').trim(),
  }
}

export async function getRamalanJodoh(input) {
  const params = new URLSearchParams({
    nama1: String(input.nama1),
    tgl1: String(input.tgl1),
    bln1: String(input.bln1),
    thn1: String(input.thn1),
    nama2: String(input.nama2),
    tgl2: String(input.tgl2),
    bln2: String(input.bln2),
    thn2: String(input.thn2),
  })
  return withBreaker('siputzx-primbon', () =>
    retry(async () => {
      const json = await fetchJson(`${BASE}/ramalanjodoh?${params}`)
      const parsed = parseRamalanJodoh(json)
      if (!parsed) throw new Error('Siputzx tidak mengembalikan ramalan jodoh')
      return parsed
    })
  )
}

/* ---------------- Hitungan weton lokal (cadangan primbon) ---------------- */

export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
export const NEPTU_HARI = { Minggu: 5, Senin: 4, Selasa: 3, Rabu: 7, Kamis: 8, Jumat: 6, Sabtu: 9 }
export const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon']
export const NEPTU_PASARAN = { Legi: 5, Pahing: 9, Pon: 7, Wage: 4, Kliwon: 8 }

const ANCHOR_UTC = Date.UTC(1945, 7, 17) // 17 Agustus 1945: Jumat Legi.
const DAY_MS = 86400000

// Weton satu tanggal: { hari, pasaran, neptu } atau null bila tanggalnya
// tidak nyata (mis. 31 Februari).
export function hitungWeton(tahun, bulan, tanggal) {
  const y = Number(tahun)
  const m = Number(bulan)
  const d = Number(tanggal)
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null
  if (y < 1 || m < 1 || m > 12 || d < 1 || d > 31) return null
  const utc = Date.UTC(y, m - 1, d)
  const check = new Date(utc)
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null
  const hari = HARI[check.getUTCDay()]
  const diffDays = Math.round((utc - ANCHOR_UTC) / DAY_MS)
  const pasaran = PASARAN[((diffDays % 5) + 5) % 5]
  return { hari, pasaran, neptu: NEPTU_HARI[hari] + NEPTU_PASARAN[pasaran] }
}

// Kategori primbon jodoh dari jumlah neptu dua orang: sisa bagi 9
// memetakan Pegat (0 dan 1), Ratu (2), Jodoh (3), Topo (4), Tinari (5),
// Padu (6), Sujanan (7), Pesthi (8). Tabel ini tabel weton jodoh yang
// beredar luas di literatur primbon Jawa.
export function kategoriNeptu(total) {
  const r = ((Number(total) % 9) + 9) % 9
  if (r === 0 || r === 1) return 'Pegat'
  return { 2: 'Ratu', 3: 'Jodoh', 4: 'Topo', 5: 'Tinari', 6: 'Padu', 7: 'Sujanan', 8: 'Pesthi' }[r]
}

export function ramalanWetonLokal(input) {
  const w1 = hitungWeton(input.thn1, input.bln1, input.tgl1)
  const w2 = hitungWeton(input.thn2, input.bln2, input.tgl2)
  if (!w1 || !w2) return null
  const total = w1.neptu + w2.neptu
  return {
    first: { nama: String(input.nama1), weton: `${w1.hari} ${w1.pasaran}`, neptu: w1.neptu },
    second: { nama: String(input.nama2), weton: `${w2.hari} ${w2.pasaran}`, neptu: w2.neptu },
    total,
    kategori: kategoriNeptu(total),
  }
}
