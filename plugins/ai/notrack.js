// Notrack AI: chat AI via notrack.ai/api/dispatch (streaming SSE).
// Diadaptasi dari snippet "Notrack Ai" by FruatreMaou (kiriman user 2026-11-05),
// ditulis ulang gaya KANA (ESM + fetch, sesi acak per panggilan seperti snippet).
import crypto from 'node:crypto'

export const config = {
  name: "notrack",
  alias: [],
  category: "ai",
  description: { id: "Chat AI Notrack tanpa lacak, jawab cepat buat tanya apa saja", en: "Notrack AI chat with no tracking, quick answers for anything" },
  usage: ".notrack <pertanyaan>",
  example: ".notrack buatkan pantun tentang kopi",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "notrack": {
      hint: "╭─❏ 🕶️ 「 *NOTRACK* 」\n┊ Tulis pertanyaanmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.notrack apa itu inflasi*\n╰━━━━━━━",
      thinking: "╭─❏ 🕶️ 「 *LAGI MIKIR* 」\n┊ Sebentar, Notrack lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *NOTRACK GAGAL MENJAWAB* 」\n┊ Mouu, Notrack gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
    },
  },
  en: {
    "notrack": {
      hint: "╭─❏ 🕶️ 「 *NOTRACK* 」\n┊ Write your question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.notrack what is inflation*\n╰━━━━━━━",
      thinking: "╭─❏ 🕶️ 「 *THINKING* 」\n┊ One sec, Notrack is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *NOTRACK FAILED TO ANSWER* 」\n┊ Mouu, Notrack failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
    },
  },
}

export async function askNotrack(query) {
  const sessionId = crypto.randomBytes(8).toString('hex')
  const payload = {
    user_input: query,
    mode: 'usual',
    model: 'C',
    persona: 'normal',
    max_turns: 6,
    chat_id: null,
    attachments: [],
    regenerate: false,
    edit: false,
    edit_mid: null,
  }
  const res = await fetch('https://notrack.ai/api/dispatch', {
    method: 'POST',
    signal: AbortSignal.timeout(120000),
    headers: {
      accept: '*/*',
      'accept-language': 'id-ID',
      'content-type': 'application/json',
      cookie: `si_usr_id=${sessionId}; si_ses_id=${sessionId}; uid=${crypto.randomUUID()}`,
      origin: 'https://notrack.ai',
      referer: 'https://notrack.ai/chat',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const raw = await res.text()
  let full = ''
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const s = line.slice(6).trim()
    if (!s || s === '[DONE]') continue
    try {
      const parsed = JSON.parse(s)
      if (parsed.content) full += parsed.content
    } catch {}
  }
  return full.trim()
}

export const test = { input: '.notrack halo', expect: /notrack|mikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('notrack.hint'))
  await ctx.reply(ctx.t('notrack.thinking', { mood: ctx.say('mikir') }))
  try {
    const out = await askNotrack(text)
    if (!out) return ctx.reply(ctx.t('notrack.fail', { message: 'empty' }))
    return ctx.reply(out.slice(0, 3500))
  } catch (err) {
    return ctx.reply(ctx.t('notrack.fail', { message: err.message }))
  }
}
