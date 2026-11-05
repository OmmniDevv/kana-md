// Scraper primbon Siputzx: arti nama, ramalan jodoh, nomor hoki, potensi
// penyakit, zodiak, kecocokan nama pasangan, dan sifat usaha bisnis
// memakai data asli dari API, sama seperti fitur primbon Elaina-MD. Bila
// API ramalan sedang mati, ramalan jodoh dihitung lokal dengan metode
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

export function parseNomorHoki(json) {
  const d = json?.data
  if (!json?.status || !d?.nomor || !d?.angka_bagua_shuzi || !d?.energi_positif?.details || !d?.energi_negatif?.details) return null
  const ep = d.energi_positif.details
  const en = d.energi_negatif.details
  return {
    nomor: String(d.nomor).trim(),
    bagua: Number(d.angka_bagua_shuzi.value),
    positif: {
      total: Number(d.energi_positif.total),
      kekayaan: Number(ep.kekayaan),
      kesehatan: Number(ep.kesehatan),
      cinta: Number(ep.cinta),
      kestabilan: Number(ep.kestabilan),
    },
    negatif: {
      total: Number(d.energi_negatif.total),
      perselisihan: Number(en.perselisihan),
      kehilangan: Number(en.kehilangan),
      malapetaka: Number(en.malapetaka),
      kehancuran: Number(en.kehancuran),
    },
    hoki: d.analisis?.status === true,
  }
}

export async function getNomorHoki(nomor) {
  const digits = String(nomor || '').replace(/\D/g, '')
  if (!digits) throw new Error('Nomor wajib diisi')
  return withBreaker('siputzx-primbon', () =>
    retry(async () => {
      const json = await fetchJson(`${BASE}/nomorhoki?phoneNumber=${encodeURIComponent(digits)}`)
      const parsed = parseNomorHoki(json)
      if (!parsed) throw new Error('Siputzx tidak mengembalikan nomor hoki')
      return parsed
    })
  )
}

export function parsePotensiPenyakit(json) {
  const d = json?.data
  if (!json?.status || !d?.sektor || !d?.elemen) return null
  return {
    analisa: String(d.analisa || '').trim(),
    sektor: String(d.sektor || '').trim(),
    elemen: String(d.elemen || '').trim(),
    catatan: String(d.catatan || '').trim(),
  }
}

export async function getPotensiPenyakit(input) {
  const params = new URLSearchParams({ tgl: String(input.tgl), bln: String(input.bln), thn: String(input.thn) })
  return withBreaker('siputzx-primbon', () =>
    retry(async () => {
      const json = await fetchJson(`${BASE}/cek_potensi_penyakit?${params}`)
      const parsed = parsePotensiPenyakit(json)
      if (!parsed) throw new Error('Siputzx tidak mengembalikan potensi penyakit')
      return parsed
    })
  )
}

// Label atribut di dalam string gabungan zodiak Siputzx. Pasangan muncul
// dengan dua ejaan label ("Pasangan Zodiak:" di sebagian tanda,
// "Pasangan Serasi:" di sebagian lain), nomor kadang cuma awalan angka
// sebelum label pertama tanpa labelnya sendiri.
const ZODIAK_LABELS = [
  ['nomor', 'Nomor Keberuntungan:'],
  ['aroma', 'Aroma Keberuntungan:'],
  ['planet', 'Planet Yang Mengitari:'],
  ['bunga', 'Bunga Keberuntungan:'],
  ['warna', 'Warna Keberuntungan:'],
  ['batu', 'Batu Keberuntungan:'],
  ['elemen', 'Elemen Keberuntungan:'],
  ['pasangan', 'Pasangan Zodiak:'],
  ['pasangan', 'Pasangan Serasi:'],
]

// Uraikan string gabungan zodiak menjadi atribut terpisah. Nilai pasangan
// di string aslinya menyambung langsung dengan paragraf deskripsi tanda
// (kata pertama adalah nama pasangannya, sisanya deskripsi), jadi
// pasangan dipotong di kata pertama dan sisanya jadi deskripsi.
export function parseZodiakString(teks) {
  const raw = String(teks || '').trim()
  const out = { nomor: '', aroma: '', planet: '', bunga: '', warna: '', batu: '', elemen: '', pasangan: '', deskripsi: '' }
  if (!raw) return out
  const hits = []
  for (const [key, label] of ZODIAK_LABELS) {
    const idx = raw.indexOf(label)
    if (idx >= 0) hits.push({ key, idx, end: idx + label.length })
  }
  hits.sort((a, b) => a.idx - b.idx)
  if (!hits.length) return out
  const prefix = raw.slice(0, hits[0].idx).trim()
  if (/^[\d,\s.]+$/.test(prefix)) out.nomor = prefix.replace(/[\s.]+$/, '')
  for (let i = 0; i < hits.length; i++) {
    const seg = raw.slice(hits[i].end, i + 1 < hits.length ? hits[i + 1].idx : raw.length).trim()
    if (hits[i].key === 'pasangan') {
      const m = seg.match(/^(\S+)\s+([\s\S]+)$/)
      if (m) {
        out.pasangan = m[1].replace(/[.,]$/, '')
        out.deskripsi = m[2].trim()
      } else {
        out.pasangan = seg.replace(/[.,]$/, '')
      }
    } else if (!out[hits[i].key]) {
      out[hits[i].key] = seg
    }
  }
  return out
}

export function parseZodiak(json) {
  const d = json?.data
  if (!json?.status || !d) return null
  const mentah = String(d.zodiak || '').trim()
  const parsed = parseZodiakString(mentah)
  // Cadangan: versi API sekarang kadang menyertakan field terpisah juga.
  // Field pasangannya tercemar paragraf deskripsi yang sama, jadi tetap
  // dipotong di kata pertama seperti hasil uraian string.
  const structured = {
    nomor: String(d.nomor_keberuntungan || '').trim(),
    aroma: String(d.aroma_keberuntungan || '').trim(),
    planet: String(d.planet_yang_mengitari || '').trim(),
    bunga: String(d.bunga_keberuntungan || '').trim(),
    warna: String(d.warna_keberuntungan || '').trim(),
    batu: String(d.batu_keberuntungan || '').trim(),
    elemen: String(d.elemen_keberuntungan || '').trim(),
  }
  for (const [key, value] of Object.entries(structured)) {
    if (value && !parsed[key]) parsed[key] = value
  }
  if (!parsed.pasangan && d.pasangan_zodiak) {
    const seg = String(d.pasangan_zodiak).trim()
    const m = seg.match(/^(\S+)\s+([\s\S]+)$/)
    if (m) {
      parsed.pasangan = m[1].replace(/[.,]$/, '')
      if (!parsed.deskripsi) parsed.deskripsi = m[2].trim()
    } else {
      parsed.pasangan = seg
    }
  }
  const lengkap = ['nomor', 'aroma', 'planet', 'bunga', 'warna', 'batu', 'elemen', 'pasangan'].every((k) => parsed[k])
  if (!mentah && !lengkap) return null
  return { ...parsed, lengkap, mentah }
}

export async function getZodiak(nama) {
  const sign = String(nama || '').trim().toLowerCase()
  if (!sign) throw new Error('Nama zodiak wajib diisi')
  return withBreaker('siputzx-primbon', () =>
    retry(async () => {
      const json = await fetchJson(`${BASE}/zodiak?zodiak=${encodeURIComponent(sign)}`)
      const parsed = parseZodiak(json)
      if (!parsed) throw new Error('Siputzx tidak mengembalikan zodiak')
      return parsed
    })
  )
}

export function parseKecocokanNama(json) {
  const d = json?.data
  if (!json?.status || !d?.nama_anda || !d?.nama_pasangan || !d?.sisi_positif || !d?.sisi_negatif) return null
  return {
    namaAnda: String(d.nama_anda).trim(),
    namaPasangan: String(d.nama_pasangan).trim(),
    positif: String(d.sisi_positif).trim(),
    negatif: String(d.sisi_negatif).trim(),
    catatan: String(d.catatan || '').trim(),
  }
}

export async function getKecocokanNama(nama1, nama2) {
  const first = String(nama1 || '').trim()
  const second = String(nama2 || '').trim()
  if (!first || !second) throw new Error('Dua nama wajib diisi')
  const params = new URLSearchParams({ nama1: first, nama2: second })
  return withBreaker('siputzx-primbon', () =>
    retry(async () => {
      const json = await fetchJson(`${BASE}/kecocokan_nama_pasangan?${params}`)
      const parsed = parseKecocokanNama(json)
      if (!parsed) throw new Error('Siputzx tidak mengembalikan kecocokan nama')
      return parsed
    })
  )
}

export function parseSifatUsaha(json) {
  const d = json?.data
  if (!json?.status || !d?.hari_lahir || !d?.usaha) return null
  return {
    hariLahir: String(d.hari_lahir).trim(),
    usaha: String(d.usaha).trim(),
    catatan: String(d.catatan || '').trim(),
  }
}

export async function getSifatUsaha(input) {
  const params = new URLSearchParams({ tgl: String(input.tgl), bln: String(input.bln), thn: String(input.thn) })
  return withBreaker('siputzx-primbon', () =>
    retry(async () => {
      const json = await fetchJson(`${BASE}/sifat_usaha_bisnis?${params}`)
      const parsed = parseSifatUsaha(json)
      if (!parsed) throw new Error('Siputzx tidak mengembalikan sifat usaha bisnis')
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
