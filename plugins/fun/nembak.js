import { bindReply, clearReply, registerReplyKind } from '../../src/ui/reply-router.js'

// Nembak: pengirim menembak target (mention), target MEMBALAS pesan
// tembakan dengan "terima" atau "tolak" (standar reply-first). Pasangan
// disimpan di namespace 'couples', key = digit pengirim.
export const config = {
  name: 'nembak',
  alias: [],
  category: 'fun',
  description: { id: 'Tembak seseorang: dia membalas pesan tembakanmu dengan terima atau tolak', en: 'Confess to someone: they reply to your confession message with accept or reject' },
  usage: '.nembak @user',
  example: '.nembak @6281234567890',
  cooldown: 10,
}

export const i18n = {
  id: {
    nembak: {
      hint: '╭─❏ 💘 「 *NEMBAK* 」\n┊ Tag orangnya yaa~\n┊ Contoh: *.nembak @6281234567890*\n╰━━━━━━━',
      ask: '╭─❏ 💘 「 *ADA YANG NEMBAK* 」\n┊ *@{from}* baru saja menembak *@{to}*!\n┊\n┊ @{to}, balas (reply) pesan ini dengan *terima* buat menerima, atau *tolak* buat menolak yaa~\n┊ ᴡᴀᴋᴛᴜ: *5 menit*\n╰━━━━━━━',
      needTarget: '╭─❏ 💘 「 *NEMBAK* 」\n┊ Tag satu orang yang mau kamu tembak yaa~\n╰━━━━━━━',
      selfTarget: '╭─❏ 💘 「 *NEMBAK* 」\n┊ Tidak bisa nembak diri sendiri yaa~\n╰━━━━━━━ {mood}',
      alreadyCouple: '╭─❏ 💘 「 *SUDAH JADIAN* 」\n┊ Kamu sudah jadian sama *@{partner}*.\n┊ Putus dulu pakai *.putus* kalau mau nembak yang lain~\n╰━━━━━━━',
      targetTaken: '╭─❏ 💘 「 *SUDAH PUNYA PASANGAN* 」\n┊ *@{to}* sudah punya pasangan.\n┊ Cari yang lain yaa~\n╰━━━━━━━',
      accepted: '╭─❏ 🎉 「 *RESMI JADIAN* 」\n┊ Selamat! *@{from}* dan *@{to}* resmi jadian!\n┊ Semoga langgeng yaa~\n╰━━━━━━━ {mood}',
      rejected: '╭─❏ 💔 「 *DITOLAK* 」\n┊ Yahh, *@{from}* ditolak sama *@{to}*.\n┊ Yang sabar yaa, bukan jodohnya~\n╰━━━━━━━ {mood}',
      weird: '╭─❏ 💘 「 *NEMBAK* 」\n┊ Balas dengan *terima* atau *tolak* saja yaa~\n╰━━━━━━━',
    },
  },
  en: {
    nembak: {
      hint: '╭─❏ 💘 「 *CONFESS* 」\n┊ Tag the person please~\n┊ Example: *.nembak @6281234567890*\n╰━━━━━━━',
      ask: '╭─❏ 💘 「 *SOMEONE CONFESSED* 」\n┊ *@{from}* just confessed to *@{to}*!\n┊\n┊ @{to}, reply to this message with *terima* to accept, or *tolak* to reject~\n┊ ᴛɪᴍᴇ: *5 minutes*\n╰━━━━━━━',
      needTarget: '╭─❏ 💘 「 *CONFESS* 」\n┊ Tag one person you want to confess to please~\n╰━━━━━━━',
      selfTarget: '╭─❏ 💘 「 *CONFESS* 」\n┊ You cannot confess to yourself~\n╰━━━━━━━ {mood}',
      alreadyCouple: '╭─❏ 💘 「 *ALREADY DATING* 」\n┊ You are already dating *@{partner}*.\n┊ Break up first with *.putus* if you want someone else~\n╰━━━━━━━',
      targetTaken: '╭─❏ 💘 「 *ALREADY TAKEN* 」\n┊ *@{to}* already has a partner.\n┊ Find someone else~\n╰━━━━━━━',
      accepted: '╭─❏ 🎉 「 *OFFICIALLY DATING* 」\n┊ Congrats! *@{from}* and *@{to}* are officially dating!\n┊ Wishing you both the best~\n╰━━━━━━━ {mood}',
      rejected: '╭─❏ 💔 「 *REJECTED* 」\n┊ Oh no, *@{from}* was rejected by *@{to}*.\n┊ Stay strong, they were not the one~\n╰━━━━━━━ {mood}',
      weird: '╭─❏ 💘 「 *CONFESS* 」\n┊ Reply with just *terima* or *tolak* please~\n╰━━━━━━━',
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
