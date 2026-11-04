import { sendButtons } from '../../src/ui/buttons.js'
import { sendAudio } from '../../src/ui/media.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'

export const config = {
  name: 'murottal',
  alias: ['murrotal', 'tilawah'],
  category: 'fun',
  description: { id: 'Murottal Al-Quran per ayat dari equran.id: pilih surah dan ayat, audio dikirim langsung', en: 'Quran recitation per verse from equran.id: pick a surah and verse, audio sent directly' },
  usage: '.murottal <nomor surah | nama surah> [nomor ayat]',
  example: '.murottal 1 1',
  cooldown: 5,
}

// Sumber: API publik equran.id v2 (tanpa kunci). Metadata surah dan URL
// audio per ayat diambil dari respons API itu sendiri; qari bawaan
// Misyari Rasyid Al-Afasi (kunci audio "05" di respons equran.id).
const API = 'https://equran.id/api/v2'
const RECITER_KEY = '05'

export const i18n = {
  id: {
    murottal: {
      title: 'Murottal Al-Quran',
      info: '🎧 MUROTTAL {namaLatin} ({nama})\n\nSurah ke-{nomor} • {jumlahAyat} ayat • Turun di {tempatTurun}\nArtinya: {arti}\n\nSedang memutar ayat {ayat} dari {jumlahAyat}. Qari: Misyari Rasyid Al-Afasi 🎶',
      usage: 'Pakai: .murottal <nomor surah> [ayat], contoh .murottal 1 1 atau .murottal yasin 1. Ada 114 surah yaa~',
      notFound: 'Surahnya tidak ketemu nih. Coba pakai nomor 1 sampai 114, contoh .murottal 36 untuk Yasin~',
      ayatInvalid: 'Surah {nama} cuma punya {jumlahAyat} ayat. Pilih ayat 1 sampai {jumlahAyat} yaa~',
      failed: 'Mouu, sumber murottal lagi tidak bisa dijangkau ({message}). Coba lagi nanti yaa~',
      prevBtn: '⏮️ Ayat Sebelumnya',
      nextBtn: '⏭️ Ayat Berikutnya',
      listBtn: '📖 Ayat Pilihan',
    },
  },
  en: {
    murottal: {
      title: 'Quran Recitation',
      info: '🎧 RECITATION {namaLatin} ({nama})\n\nSurah number {nomor} • {jumlahAyat} verses • Revealed in {tempatTurun}\nMeaning: {arti}\n\nNow playing verse {ayat} of {jumlahAyat}. Reciter: Misyari Rasyid Al-Afasi 🎶',
      usage: 'Use: .murottal <surah number> [verse], for example .murottal 1 1 or .murottal yasin 1. There are 114 surahs~',
      notFound: 'The surah was not found. Try a number from 1 to 114, for example .murottal 36 for Yasin~',
      ayatInvalid: 'Surah {nama} only has {jumlahAyat} verses. Pick a verse from 1 to {jumlahAyat}~',
      failed: 'Mouu, the recitation source is unreachable right now ({message}). Try again later~',
      prevBtn: '⏮️ Previous Verse',
      nextBtn: '⏭️ Next Verse',
      listBtn: '📖 Selected Verse',
    },
  },
}

export const test = { input: '.murottal 1 1', expect: /murottal/i }

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function normalizeName(s) {
  return String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

export async function resolveSurah(query) {
  if (/^\d+$/.test(query)) {
    const n = Number(query)
    if (n < 1 || n > 114) return null
    const json = await fetchJson(`${API}/surat/${n}`)
    return json?.data ?? null
  }
  const list = await fetchJson(`${API}/surat`)
  const q = normalizeName(query)
  const found = (list?.data ?? []).find((s) => normalizeName(s.namaLatin).includes(q) || normalizeName(s.nama) === q)
  if (!found) return null
  const json = await fetchJson(`${API}/surat/${found.nomor}`)
  return json?.data ?? null
}

export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  const fail = async (key, vars = {}) => {
    const body = ctx.t(`murottal.${key}`, vars)
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('murottal.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('murottal.listBtn'), id: '.ayat' }],
      textFallback: body,
    })
  }
  if (!raw) return fail('usage')
  const tokens = raw.split(/\s+/)
  let ayatNo = 1
  if (tokens.length > 1 && /^\d+$/.test(tokens[tokens.length - 1])) {
    ayatNo = Number(tokens.pop())
  }
  const query = tokens.join(' ')
  let surah
  try {
    surah = await resolveSurah(query)
  } catch (err) {
    return fail('failed', { message: err.message })
  }
  if (!surah) return fail('notFound')
  if (ayatNo < 1 || ayatNo > surah.jumlahAyat) {
    return fail('ayatInvalid', { nama: surah.namaLatin, jumlahAyat: surah.jumlahAyat })
  }
  const ayat = (surah.ayat ?? []).find((a) => a.nomorAyat === ayatNo)
  const audioUrl = ayat?.audio?.[RECITER_KEY] ?? (ayat?.audio ? Object.values(ayat.audio)[0] : null)
  if (!audioUrl) return fail('failed', { message: 'audio tidak tersedia' })
  const replies = []
  if (ayatNo > 1) replies.push({ text: ctx.t('murottal.prevBtn'), id: `.murottal ${surah.nomor} ${ayatNo - 1}` })
  if (ayatNo < surah.jumlahAyat) replies.push({ text: ctx.t('murottal.nextBtn'), id: `.murottal ${surah.nomor} ${ayatNo + 1}` })
  replies.push({ text: ctx.t('murottal.listBtn'), id: '.ayat' })
  const body = ctx.t('murottal.info', {
    namaLatin: surah.namaLatin,
    nama: surah.nama,
    nomor: surah.nomor,
    jumlahAyat: surah.jumlahAyat,
    tempatTurun: surah.tempatTurun,
    arti: surah.arti,
    ayat: ayatNo,
  })
  await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('murottal.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
  try {
    const buffer = await downloadBuffer(audioUrl, { maxBytes: 16 * 1024 * 1024, timeout: 60000 })
    await sendAudio(ctx, buffer, { title: `${surah.namaLatin} - Ayat ${ayatNo}`, mimetype: 'audio/mpeg' })
  } catch (err) {
    return fail('failed', { message: err.message })
  }
  return undefined
}
