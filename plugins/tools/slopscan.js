// Scan AI slop: cek apakah sebuah website terindikasi buatan AI, via sniffslop.com.
// Diadaptasi dari snippet "Scan AI Slop" by yuor (kiriman user 2026-11-05),
// ditulis ulang gaya KANA.
import axios from 'axios'

export const config = {
  name: "slopscan",
  alias: [],
  category: "tools",
  description: { id: "Cek apakah website terindikasi buatan AI atau ditulis manusia, pakai SniffSlop", en: "Check whether a website looks AI-made or human-written, using SniffSlop" },
  usage: ".slopscan <url website>",
  example: ".slopscan https://kyzorohan.web.id",
  cooldown: 10,
}

export const i18n = {
  id: {
    "slopscan": {
      hint: "╭─❏ 🔎 「 *SCAN AI SLOP* 」\n┊ Kirim URL website yang mau dicek dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.slopscan https://kyzorohan.web.id*\n╰━━━━━━━",
      working: "╭─❏ 🔎 「 *LAGI MEMINDAI* 」\n┊ Sebentar, websitenya lagi dipindai dulu yaa, ini bisa agak lama... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🔎 「 *HASIL SCAN AI SLOP* 」\n┊ ᴜʀʟ: *{url}*\n┊ ꜱᴋᴏʀ ꜱʟᴏᴘ: *{score}/100* (keyakinan {confidence})\n┊ ᴠᴏɴɪꜱ: *{verdict}*\n┊ {summary}\n┊ ʟᴀᴘᴏʀᴀɴ: {report}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PEMINDAIAN GAGAL* 」\n┊ Mouu, pemindaiannya gagal: *{message}*\n┊ Layanan SniffSlop lagi bermasalah atau situsnya tidak bisa dijangkau, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "slopscan": {
      hint: "╭─❏ 🔎 「 *AI SLOP SCAN* 」\n┊ Send the website URL to check first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.slopscan https://kyzorohan.web.id*\n╰━━━━━━━",
      working: "╭─❏ 🔎 「 *SCANNING* 」\n┊ One sec, scanning the website, this can take a while... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🔎 「 *AI SLOP SCAN RESULT* 」\n┊ ᴜʀʟ: *{url}*\n┊ ꜱʟᴏᴘ ꜱᴄᴏʀᴇ: *{score}/100* (confidence {confidence})\n┊ ᴠᴇʀᴅɪᴄᴛ: *{verdict}*\n┊ {summary}\n┊ ʀᴇᴘᴏʀᴛ: {report}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SCAN FAILED* 」\n┊ Mouu, the scan failed: *{message}*\n┊ The SniffSlop service is having trouble or the site is unreachable, try again later~\n╰━━━━━━━",
    },
  },
}

export async function scanSlop(url) {
  const res = await axios.post('https://www.sniffslop.com/api/scan', { url }, {
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      origin: 'https://www.sniffslop.com',
      referer: 'https://www.sniffslop.com/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    },
    timeout: 120000,
  })
  return res.data
}

export const test = { input: '.slopscan https://example.com', expect: /.+/ }
export async function handler(ctx) {
  const url = ((ctx.text || '').match(/https?:\/\/[^\s]+/) || [])[0]
  if (!url) return ctx.reply(ctx.t('slopscan.hint'))
  await ctx.reply(ctx.t('slopscan.working', { mood: ctx.say('mikir') }))
  try {
    const data = await scanSlop(url)
    if (!data || data.status === false) throw new Error(data?.message || 'respons kosong')
    return ctx.reply(ctx.t('slopscan.result', {
      url: data.url || url,
      score: data.score ?? '-',
      confidence: data.confidence || '-',
      verdict: data.verdict || '-',
      summary: String(data.summary || '-').slice(0, 600),
      report: data.reportUrl || '-',
    }))
  } catch (err) {
    return ctx.reply(ctx.t('slopscan.fail', { message: err.response?.data?.message || err.message }))
  }
}
