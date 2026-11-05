// Cek plagiarisme teks via free tools Originality.ai (plagiarism-scan).
// Diadaptasi dari snippet "Orginality.ai" by FruatreMaou (kiriman user 2026-11-05),
// ditulis ulang gaya KANA. Satu fungsi satu plugin: lihat juga .aiscan dan .grammarcheck.
import axios from 'axios'

export const config = {
  name: "plagiarism",
  alias: [],
  category: "tools",
  description: { id: "Cek plagiarisme teks pakai Originality.ai, lengkap dengan sumber yang mirip", en: "Check text plagiarism with Originality.ai, complete with matching sources" },
  usage: ".plagiarism <teks>",
  example: ".plagiarism teks yang mau dicek",
  cooldown: 10,
}

export const i18n = {
  id: {
    "plagiarism": {
      hint: "╭─❏ 📝 「 *CEK PLAGIARISME* 」\n┊ Tulis atau tempel teks yang mau dicek dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.plagiarism pendidikan adalah kunci masa depan bangsa*\n╰━━━━━━━",
      working: "╭─❏ 📝 「 *LAGI MEMINDAI* 」\n┊ Sebentar, teksmu lagi dipindai dulu yaa... {mood}\n╰━━━━━━━",
      result: "╭─❏ 📝 「 *HASIL PLAGIARISME* 」\n┊ ꜱᴋᴏʀ ᴋᴇᴍɪʀɪᴘᴀɴ: *{score}%*\n┊ ꜱᴜᴍʙᴇʀ ᴅɪᴛᴇᴍᴜᴋᴀɴ: *{sources}*\n┊ {detail}\n╰━━━━━━━",
      clean: "Tidak ada kalimat yang cocok dengan sumber publik yang ditemukan~",
      fail: "╭─❏ 💦 「 *PEMINDAIAN GAGAL* 」\n┊ Mouu, pemindaiannya gagal: *{message}*\n┊ Layanan Originality.ai lagi bermasalah, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "plagiarism": {
      hint: "╭─❏ 📝 「 *PLAGIARISM CHECK* 」\n┊ Write or paste the text to check first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.plagiarism education is the key to the future*\n╰━━━━━━━",
      working: "╭─❏ 📝 「 *SCANNING* 」\n┊ One sec, scanning your text... {mood}\n╰━━━━━━━",
      result: "╭─❏ 📝 「 *PLAGIARISM RESULT* 」\n┊ ᴍᴀᴛᴄʜ ꜱᴄᴏʀᴇ: *{score}%*\n┊ ꜱᴏᴜʀᴄᴇꜱ ꜰᴏᴜɴᴅ: *{sources}*\n┊ {detail}\n╰━━━━━━━",
      clean: "No sentence matched any public source found~",
      fail: "╭─❏ 💦 「 *SCAN FAILED* 」\n┊ Mouu, the scan failed: *{message}*\n┊ The Originality.ai service is having trouble, try again later~\n╰━━━━━━━",
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

export async function scanPlagiarism(content) {
  const res = await axios.post('https://api.originality.ai/api/v2-tools/free-tools/plagiarism-scan', { content }, { headers: HEADERS, timeout: 90000 })
  return res.data
}

export const test = { input: '.plagiarism Indonesia adalah negara kepulauan terbesar di dunia dengan lebih dari tujuh belas ribu pulau.', expect: /.+/ }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('plagiarism.hint'))
  await ctx.reply(ctx.t('plagiarism.working', { mood: ctx.say('mikir') }))
  try {
    const data = await scanPlagiarism(text)
    const results = data?.results || {}
    const score = Math.round(Number(results.document_score ?? 0))
    const matches = []
    for (const item of results.results || []) {
      for (const hit of item.results || []) {
        const best = Math.max(...(hit.scores || []).map((s) => Number(s.score || 0)), 0)
        matches.push({ phrase: item.phrase, link: hit.link, title: hit.title, pct: Math.round(best * 100) })
      }
    }
    matches.sort((a, b) => b.pct - a.pct)
    const detail = matches.length
      ? matches.slice(0, 5).map((m, i) => (i + 1) + '. *' + m.pct + '%* - ' + (m.title || m.link) + '\n┊    ' + m.link).join('\n┊ ')
      : ctx.t('plagiarism.clean')
    return ctx.reply(ctx.t('plagiarism.result', { score, sources: matches.length, detail }))
  } catch (err) {
    return ctx.reply(ctx.t('plagiarism.fail', { message: err.response?.data?.message || err.message }))
  }
}
