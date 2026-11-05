// Cek grammar teks Inggris via free tools Originality.ai (grammar-scan).
// Diadaptasi dari snippet "Orginality.ai" by FruatreMaou (kiriman user 2026-11-05),
// ditulis ulang gaya KANA. Satu fungsi satu plugin: lihat juga .plagiarism dan .aiscan.
import axios from 'axios'

export const config = {
  name: "grammarcheck",
  alias: [],
  category: "tools",
  description: { id: "Cek grammar teks bahasa Inggris pakai Originality.ai, ada nilai dan saran perbaikannya", en: "Check English grammar with Originality.ai, with a grade and fix suggestions" },
  usage: ".grammarcheck <teks inggris>",
  example: ".grammarcheck she go to school yesterday",
  cooldown: 10,
}

export const i18n = {
  id: {
    "grammarcheck": {
      hint: "╭─❏ ✍️ 「 *CEK GRAMMAR* 」\n┊ Tulis teks bahasa Inggris yang mau dicek dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.grammarcheck she go to school yesterday*\n╰━━━━━━━",
      working: "╭─❏ ✍️ 「 *LAGI MEMERIKSA* 」\n┊ Sebentar, teksmu lagi diperiksa dulu yaa... {mood}\n╰━━━━━━━",
      result: "╭─❏ ✍️ 「 *HASIL CEK GRAMMAR* 」\n┊ ɴɪʟᴀɪ: *{grade}* (skor {score})\n┊ ᴍᴀꜱᴀʟᴀʜ ᴅɪᴛᴇᴍᴜᴋᴀɴ: *{count}*\n┊ {detail}\n╰━━━━━━━",
      clean: "Tidak ada masalah grammar yang ditemukan. Kerja bagus~",
      fail: "╭─❏ 💦 「 *PEMERIKSAAN GAGAL* 」\n┊ Mouu, pemeriksaannya gagal: *{message}*\n┊ Layanan Originality.ai lagi bermasalah, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "grammarcheck": {
      hint: "╭─❏ ✍️ 「 *GRAMMAR CHECK* 」\n┊ Write the English text to check first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.grammarcheck she go to school yesterday*\n╰━━━━━━━",
      working: "╭─❏ ✍️ 「 *CHECKING* 」\n┊ One sec, checking your text... {mood}\n╰━━━━━━━",
      result: "╭─❏ ✍️ 「 *GRAMMAR CHECK RESULT* 」\n┊ ɢʀᴀᴅᴇ: *{grade}* (score {score})\n┊ ɪꜱꜱᴜᴇꜱ ꜰᴏᴜɴᴅ: *{count}*\n┊ {detail}\n╰━━━━━━━",
      clean: "No grammar issues found. Nice work~",
      fail: "╭─❏ 💦 「 *CHECK FAILED* 」\n┊ Mouu, the check failed: *{message}*\n┊ The Originality.ai service is having trouble, try again later~\n╰━━━━━━━",
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

export async function scanGrammar(content) {
  const res = await axios.post('https://api.originality.ai/api/v2-tools/free-tools/grammar-scan', { content, lang: 'en-US' }, { headers: HEADERS, timeout: 90000 })
  return res.data
}

export const test = { input: '.grammarcheck', expect: /tulis|write/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('grammarcheck.hint'))
  await ctx.reply(ctx.t('grammarcheck.working', { mood: ctx.say('mikir') }))
  try {
    const data = await scanGrammar(text)
    const inner = data?.results?.results || data?.results || {}
    const matches = inner.matches || []
    const detail = matches.length
      ? matches.slice(0, 6).map((m, i) => {
          const fix = (m.replacements || []).map((r) => r.value).filter(Boolean).slice(0, 3).join(' / ')
          const bad = m.context?.text ? m.context.text.slice(m.context.offset || 0, (m.context.offset || 0) + (m.context.length || 0)) : ''
          return (i + 1) + '. ' + (m.message || 'Masalah grammar') + (bad ? '\n┊    ᴛᴇᴋꜱ: "' + bad + '"' : '') + (fix ? '\n┊    ꜱᴀʀᴀɴ: *' + fix + '*' : '')
        }).join('\n┊ ')
      : ctx.t('grammarcheck.clean')
    return ctx.reply(ctx.t('grammarcheck.result', { grade: inner.grade || '-', score: inner.score ?? '-', count: matches.length, detail }))
  } catch (err) {
    return ctx.reply(ctx.t('grammarcheck.fail', { message: err.response?.data?.message || err.message }))
  }
}
