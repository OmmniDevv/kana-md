import { bindReply, clearReply, registerReplyKind } from '../../src/ui/reply-router.js'

// Nembak: pengirim menembak target (mention), target MEMBALAS pesan
// tembakan dengan "terima" atau "tolak" (standar reply-first). Pasangan
// disimpan di namespace 'couples', key = digit pengirim.
export const config = {
  name: 'nembak',
  alias: ['tembak'],
  category: 'fun',
  description: { id: 'Tembak seseorang: dia membalas pesan tembakanmu dengan terima atau tolak', en: 'Confess to someone: they reply to your confession message with accept or reject' },
  usage: '.nembak @user',
  example: '.nembak @6281234567890',
  cooldown: 10,
}

export const i18n = {
  id: {
    nembak: {
      hint: 'Tag orangnya yaa~ Contoh: .nembak @6281234567890',
      ask: '💘 @{from} baru saja MENEMBAK @{to}!\n\n@{to}, balas (reply) pesan ini dengan "terima" buat menerima, atau "tolak" buat menolak yaa~\nWaktunya 5 menit.',
      needTarget: 'Tag satu orang yang mau kamu tembak yaa~',
      selfTarget: 'Tidak bisa nembak diri sendiri yaa~ {mood}',
      alreadyCouple: 'Kamu sudah jadian sama @{partner}. Putus dulu pakai .putus kalau mau nembak yang lain~',
      targetTaken: '@{to} sudah punya pasangan. Cari yang lain yaa~',
      accepted: '🎉 SELAMAT! @{from} dan @{to} resmi JADIAN! Semoga langgeng yaa~ {mood}',
      rejected: '💔 Yahh, @{from} ditolak sama @{to}. Yang sabar yaa, bukan jodohnya~ {mood}',
      weird: 'Balas dengan "terima" atau "tolak" saja yaa~',
    },
  },
  en: {
    nembak: {
      hint: 'Tag the person please~ Example: .nembak @6281234567890',
      ask: '💘 @{from} just CONFESSED to @{to}!\n\n@{to}, reply to this message with "terima" to accept, or "tolak" to reject~\nYou have 5 minutes.',
      needTarget: 'Tag one person you want to confess to please~',
      selfTarget: 'You cannot confess to yourself~ {mood}',
      alreadyCouple: 'You are already dating @{partner}. Break up first with .putus if you want someone else~',
      targetTaken: '@{to} already has a partner. Find someone else~',
      accepted: '🎉 CONGRATS! @{from} and @{to} are officially DATING! Wishing you both the best~ {mood}',
      rejected: '💔 Oh no, @{from} was rejected by @{to}. Stay strong, they were not the one~ {mood}',
      weird: 'Reply with just "terima" or "tolak" please~',
    },
  },
}

export const test = { input: '.nembak', expect: /tag|tembak/i }

const COUPLES_NS = 'couples'

registerReplyKind('nembak', async (ctx, binding) => {
  const answer = (ctx.text || '').trim().toLowerCase()
  const { fromDigits, toDigits } = binding.data
  if (answer !== 'terima' && answer !== 'tolak') {
    await ctx.reply(ctx.t('nembak.weird'))
    return true
  }
  await clearReply(ctx.storage, ctx.chat)
  if (answer === 'terima') {
    await ctx.storage.set(COUPLES_NS, fromDigits, { partner: toDigits, since: Date.now() })
    await ctx.storage.set(COUPLES_NS, toDigits, { partner: fromDigits, since: Date.now() })
    await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t('nembak.accepted', { from: fromDigits, to: toDigits, mood: ctx.say('senang') }),
      mentions: [`${fromDigits}@s.whatsapp.net`, `${toDigits}@s.whatsapp.net`],
    })
    return true
  }
  await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('nembak.rejected', { from: fromDigits, to: toDigits, mood: ctx.say('gagal') }),
    mentions: [`${fromDigits}@s.whatsapp.net`, `${toDigits}@s.whatsapp.net`],
  })
  return true
})

export async function handler(ctx) {
  const target = ctx.mentionedJids?.[0]
  if (!target) return ctx.reply(ctx.t('nembak.needTarget'))
  const toDigits = target.split('@')[0]
  if (toDigits === ctx.senderDigits) return ctx.reply(ctx.t('nembak.selfTarget', { mood: ctx.say('malu') }))
  const mine = await ctx.storage.get(COUPLES_NS, ctx.senderDigits)
  if (mine?.partner) return ctx.reply(ctx.t('nembak.alreadyCouple', { partner: mine.partner }))
  const theirs = await ctx.storage.get(COUPLES_NS, toDigits)
  if (theirs?.partner) return ctx.reply(ctx.t('nembak.targetTaken', { to: toDigits }))
  const sent = await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('nembak.ask', { from: ctx.senderDigits, to: toDigits }),
    mentions: [`${ctx.senderDigits}@s.whatsapp.net`, target],
  }, { quoted: ctx.raw })
  await bindReply(ctx.storage, ctx.chat, {
    kind: 'nembak',
    messageId: sent?.key?.id,
    ownerDigits: toDigits,
    ttlMs: 5 * 60000,
    data: { fromDigits: ctx.senderDigits, toDigits },
  })
  return undefined
}
