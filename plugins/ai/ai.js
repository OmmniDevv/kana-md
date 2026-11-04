// .ai: ngobrol dengan AI memakai memori percakapan per pengguna.
//
// Perubahan perilaku (2026-11-04, Fase 7): versi lama hanya jalan bila
// rudder.chat dikonfigurasi owner (opt-in cookie) dan langsung menolak
// bila belum. Versi ini memakai src/services/ai-provider.js: rudder
// tetap diprioritaskan bila terkonfigurasi, selain itu otomatis jatuh
// ke Pollinations teks publik tanpa key (gratis, sudah dipakai proyek
// untuk gambar). Memori 6 pasang terakhir per pengguna disimpan lewat
// src/services/ai-memory.js dan bisa direset dengan .aireset.
import { getAiProvider } from '../../src/services/ai-provider.js'
import { getMemory, appendTurn } from '../../src/services/ai-memory.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ai',
  alias: ['kana', 'chat'],
  category: 'ai',
  description: { id: 'Ngobrol dengan AI, ingat konteks percakapan', en: 'Chat with AI, remembers conversation context' },
  usage: '.ai <pesan>',
  example: '.ai jelaskan fotosintesis dengan singkat',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    ai: {
      needText: 'Ketik pesannya dulu yaa, contoh: .ai jelaskan fotosintesis dengan singkat~',
      notConfigured:
        'Mouu, fitur AI belum dikonfigurasi sama Master nih (╥﹏╥) Provider AI belum tersedia, jadi KANA belum bisa ngobrol AI dulu ya~',
      thinking: 'Hmm, KANA tanya ke AI dulu ya... {mood}',
      failed: 'Mouu, AI-nya gagal jawab: {message}. Coba lagi sebentar lagi ya~ (╥﹏╥)',
      failedNetwork: 'Mouu, KANA gagal menghubungi AI-nya nih: {message}. Jaringannya lagi bermasalah, coba lagi nanti ya~ (╥﹏╥) 💦',
      empty: 'Ehh? AI-nya jawab kosong. Coba tanya dengan kalimat lain ya~',
      truncated: '\n\n(Dipotong KANA biar nggak kepanjangan~)',
      btnReset: 'Lupa Percakapan',
      btnMenu: 'Menu AI',
    },
  },
  en: {
    ai: {
      needText: 'Type your message first, example: .ai explain photosynthesis briefly~',
      notConfigured:
        'Mouu, the AI feature is not configured by Master yet (╥﹏╥) No AI provider is available, so KANA cannot do AI chat yet~',
      thinking: 'Hmm, let KANA ask the AI first... {mood}',
      failed: 'Mouu, the AI failed to answer: {message}. Please try again in a bit~ (╥﹏╥)',
      failedNetwork: 'Mouu, KANA could not reach the AI: {message}. The network is having trouble, try again later~ (╥﹏╥) 💦',
      empty: 'Eh? The AI answered with nothing. Try rephrasing your question~',
      truncated: '\n\n(Trimmed by KANA so it does not get too long~)',
      btnReset: 'Forget Chat',
      btnMenu: 'AI Menu',
    },
  },
}

const MAX_REPLY_CHARS = 3500

function isNetworkError(err) {
  const msg = String(err?.message || '')
  return (
    err?.code === 'SOURCE_DOWN' ||
    /fetch|network|timeout|timed out|ECONN|ENOTFOUND|socket|HTTP 5\d\d/i.test(msg)
  )
}

export const test = { input: '.ai Apa ibu kota Jepang?', expect: /Tokyo/i }

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('ai.needText'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('ai.notConfigured'))
  await ctx.reply(ctx.t('ai.thinking', { mood: ctx.say('mikir') }))

  const botName = process.env.BOT_NAME || 'KANA'
  const system =
    ctx.lang === 'en'
      ? `You are ${botName}, a sweet and expressive WhatsApp assistant. Answer helpfully and concisely in the user's language. Keep the core information clear.`
      : `Kamu adalah ${botName}, asisten WhatsApp yang manis dan ekspresif. Jawab dengan membantu dan ringkas dalam bahasa pengguna. Informasi inti harus tetap jelas.`
  let memory = []
  try {
    memory = await getMemory(ctx.storage, ctx.senderDigits)
  } catch {
    memory = []
  }
  const messages = [
    { role: 'system', content: system },
    ...memory,
    { role: 'user', content: text },
  ]

  let replyText
  try {
    replyText = String((await provider.chat(messages)) || '').trim()
  } catch (err) {
    if (err?.code === 'NOT_CONFIGURED') return ctx.reply(ctx.t('ai.notConfigured'))
    if (isNetworkError(err)) return ctx.reply(ctx.t('ai.failedNetwork', { message: err.message }))
    return ctx.reply(ctx.t('ai.failed', { message: err.message }))
  }
  if (!replyText) return ctx.reply(ctx.t('ai.empty'))

  try {
    await appendTurn(ctx.storage, ctx.senderDigits, text, replyText)
  } catch {
    // Memori gagal disimpan tidak boleh menggagalkan jawaban.
  }
  const trimmed =
    replyText.length > MAX_REPLY_CHARS
      ? replyText.slice(0, MAX_REPLY_CHARS) + ctx.t('ai.truncated')
      : replyText
  return sendButtons(ctx.sock, ctx.chat, {
    title: botName,
    body: trimmed,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('ai.btnReset'), id: '.aireset' },
      { text: ctx.t('ai.btnMenu'), id: '.menu ai' },
    ],
    textFallback: trimmed,
  })
}
