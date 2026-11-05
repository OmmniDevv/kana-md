// Cek teks buatan AI via free tools Originality.ai (ai-scan).
// Diadaptasi dari snippet "Orginality.ai" by FruatreMaou (kiriman user 2026-11-05),
// ditulis ulang gaya KANA. Satu fungsi satu plugin: lihat juga .plagiarism dan .grammarcheck.
// Catatan jujur: saat probe 2026-11-05 endpoint ai-scan membalas 404 dari layanan
// aslinya (kemungkinan sudah dipensiunkan di sisi Originality.ai); plugin tetap
// menampilkan pesan gagal yang jujur bila layanan menolak.
import axios from 'axios'

export const config = {
  name: "aiscan",
  alias: [],
  category: "tools",
  description: { id: "Cek apakah teks ditulis AI atau manusia pakai Originality.ai", en: "Check whether a text was written by AI or a human with Originality.ai" },
  usage: ".aiscan <teks>",
  example: ".aiscan teks yang mau dicek",
  cooldown: 10,
}

export const i18n = {
  id: {
    "aiscan": {
      hint: "╭─❏ 🤖 「 *CEK TEKS AI* 」\n┊ Tulis atau tempel teks yang mau dicek dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.aiscan teknologi kecerdasan buatan berkembang sangat pesat*\n╰━━━━━━━",
      working: "╭─❏ 🤖 「 *LAGI MEMINDAI* 」\n┊ Sebentar, teksmu lagi dianalisis dulu yaa... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🤖 「 *HASIL CEK TEKS AI* 」\n┊ {detail}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PEMINDAIAN GAGAL* 」\n┊ Mouu, pemindaiannya gagal: *{message}*\n┊ Endpoint ai-scan Originality.ai sempat membalas 404 saat diuji, kemungkinan layanannya lagi berubah. Coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "aiscan": {
      hint: "╭─❏ 🤖 「 *AI TEXT CHECK* 」\n┊ Write or paste the text to check first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.aiscan artificial intelligence is developing rapidly*\n╰━━━━━━━",
      working: "╭─❏ 🤖 「 *SCANNING* 」\n┊ One sec, analyzing your text... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🤖 「 *AI TEXT CHECK RESULT* 」\n┊ {detail}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SCAN FAILED* 」\n┊ Mouu, the scan failed: *{message}*\n┊ The Originality.ai ai-scan endpoint returned 404 during testing, the service may be changing. Try again later~\n╰━━━━━━━",
    },
  },
}

const HEADERS = {
  accept: '*/*',
  'accept-language': 'id-ID',
  'content-type': 'application/json',
  origin: 'https://corefreetools.originality.ai',
  referer: 'https://corefreetools.originality.ai/',
  'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
}

export async function scanAiText(content) {
  const res = await axios.post('https://api.originality.ai/api/v2-tools/free-tools/ai-scan', { content }, { headers: HEADERS, timeout: 90000 })
  return res.data
}

function flat(obj, prefix = '', out = []) {
  if (obj === null || obj === undefined || out.length >= 12) return out
  if (typeof obj !== 'object') { out.push((prefix ? prefix + ': ' : '') + String(obj).slice(0, 200)); return out }
  if (Array.isArray(obj)) { obj.slice(0, 4).forEach((v, i) => flat(v, prefix + (i + 1), out)); return out }
  for (const [k, v] of Object.entries(obj).slice(0, 12)) {
    if (v && typeof v === 'object') flat(v, k, out)
    else if (v !== null && v !== undefined && v !== '') out.push('*' + k + '*: ' + String(v).slice(0, 200))
    if (out.length >= 12) break
  }
  return out
}

export const test = { input: '.aiscan https://example.com', expect: /.+/ }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('aiscan.hint'))
  await ctx.reply(ctx.t('aiscan.working', { mood: ctx.say('mikir') }))
  try {
    const data = await scanAiText(text)
    const detail = flat(data?.results ?? data).join('\n┊ ') || '-'
    return ctx.reply(ctx.t('aiscan.result', { detail }))
  } catch (err) {
    return ctx.reply(ctx.t('aiscan.fail', { message: 'HTTP ' + (err.response?.status || err.message) }))
  }
}
