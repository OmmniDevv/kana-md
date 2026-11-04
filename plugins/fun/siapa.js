export const config = {
  name: 'siapa',
  alias: [],
  category: 'fun',
  description: { id: 'Mesin jawab pertanyaan siapa: menunjuk satu member grup secara acak', en: 'Who-question machine: points at one random group member' },
  usage: '.siapa <pertanyaan>',
  example: '.siapa yang paling rajin di grup ini',
  cooldown: 3,
}

export const i18n = {
  id: {
    siapa: {
      hint: '╭─❏ 🎯 「 *SIAPA DIA* 」\n┊ Tanya yang lengkap yaa~ Contoh: .siapa yang paling rajin di grup ini\n╰━━━━━━━',
      group: '╭─❏ 🎯 「 *SIAPA DIA* 」\n┊ 👉 Menurut KANA, jawabannya adalah @{digits}!\n╰━━━━━━━ {mood}',
      dm: '╭─❏ 🎯 「 *SIAPA DIA* 」\n┊ 👉 Jawabannya... kamu sendiri, siapa lagi~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ 🎯 「 *SIAPA DIA* 」\n┊ Gagal ambil daftar member grup: {error}\n╰━━━━━━━',
    },
  },
  en: {
    siapa: {
      hint: '╭─❏ 🎯 「 *WHO IS IT* 」\n┊ Ask a full question please~ Example: .siapa is the most diligent here\n╰━━━━━━━',
      group: '╭─❏ 🎯 「 *WHO IS IT* 」\n┊ 👉 According to KANA, the answer is @{digits}!\n╰━━━━━━━ {mood}',
      dm: '╭─❏ 🎯 「 *WHO IS IT* 」\n┊ 👉 The answer is... yourself, who else~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ 🎯 「 *WHO IS IT* 」\n┊ Failed to get group members: {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.siapa', expect: /tanya|ask/i }

export async function handler(ctx) {
  if (!(ctx.text || '').trim()) return ctx.reply(ctx.t('siapa.hint'))
  if (!ctx.isGroup) return ctx.reply(ctx.t('siapa.dm', { mood: ctx.say('senang') }))
  let meta = ctx.groupMetadata
  if (!meta) {
    try { meta = await ctx.getGroupMetadata() } catch (err) { return ctx.reply(ctx.t('siapa.fail', { error: err.message })) }
  }
  const participants = (meta?.participants ?? []).filter((p) => p.id)
  if (!participants.length) return ctx.reply(ctx.t('siapa.dm', { mood: ctx.say('senang') }))
  const pick = participants[Math.floor(Math.random() * participants.length)]
  const digits = pick.id.split('@')[0]
  await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('siapa.group', { digits, mood: ctx.say('senang') }),
    mentions: [pick.id],
  }, { quoted: ctx.raw })
}
