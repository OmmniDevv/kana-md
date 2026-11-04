import { rudderChat, isRudderConfigured } from '../../src/scrapers/ai/rudder.js'

export const config = {
  name: 'ai',
  alias: ['kana', 'chat'],
  category: 'ai',
  description: { id: 'Ngobrol dengan AI (opt-in, butuh konfigurasi owner)', en: 'Chat with AI (opt-in, needs owner configuration)' },
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
        'Mouu, fitur AI belum dikonfigurasi sama Master. Rudder chat butuh cookie sesi yang diisi manual di .env (RUDDER_USER_ID, RUDDER_COOKIE_C0, RUDDER_COOKIE_C1, RUDDER_TH_WHO), jadi KANA belum bisa ngobrol AI dulu ya~',
      thinking: 'Hmm, KANA tanya ke AI dulu ya... {mood}',
      failed: 'Mouu, AI-nya gagal jawab: {message}. Cookie sesinya mungkin sudah kedaluwarsa, bilang ke Master ya~',
      empty: 'Ehh? AI-nya jawab kosong. Coba tanya dengan kalimat lain ya~',
      truncated: '\n\n(Dipotong KANA biar nggak kepanjangan~)',
    },
  },
  en: {
    ai: {
      needText: 'Type your message first, example: .ai explain photosynthesis briefly~',
      notConfigured:
        'Mouu, the AI feature is not configured by Master yet. Rudder chat needs a session cookie filled manually in .env (RUDDER_USER_ID, RUDDER_COOKIE_C0, RUDDER_COOKIE_C1, RUDDER_TH_WHO), so KANA cannot do AI chat yet~',
      thinking: 'Hmm, let KANA ask the AI first... {mood}',
      failed: 'Mouu, the AI failed to answer: {message}. The session cookie may have expired, tell Master please~',
      empty: 'Eh? The AI answered with nothing. Try rephrasing your question~',
      truncated: '\n\n(Trimmed by KANA so it does not get too long~)',
    },
  },
}

const MAX_REPLY_CHARS = 3500

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('ai.needText'))
  if (!isRudderConfigured()) return ctx.reply(ctx.t('ai.notConfigured'))
  await ctx.reply(ctx.t('ai.thinking', { mood: ctx.say('mikir') }))
  const result = await rudderChat(text)
  if (!result.status) return ctx.reply(ctx.t('ai.failed', { message: result.error || 'unknown' }))
  const reply = (result.reply || '').trim()
  if (!reply) return ctx.reply(ctx.t('ai.empty'))
  const trimmed = reply.length > MAX_REPLY_CHARS ? reply.slice(0, MAX_REPLY_CHARS) + ctx.t('ai.truncated') : reply
  await ctx.reply(trimmed)
}
