import { bindReply, clearReply, registerReplyKind, saveReplyData } from '../../src/ui/reply-router.js'

// Suit PvP dua tahap reply-first: penantang menantang dengan .suitpvp
// @lawan, lawan MEMBALAS pesan tantangan dengan pilihannya (itu tanda
// menerima), lalu penantang membalas pesan lanjutan dengan pilihannya.
const PICKS = {
  gunting: '✌️', batu: '✊', kertas: '✋',
  scissors: '✌️', rock: '✊', paper: '✋',
}
const BEATS = { gunting: 'kertas', kertas: 'batu', batu: 'gunting', scissors: 'paper', paper: 'rock', rock: 'scissors' }
const NORM = { scissors: 'gunting', rock: 'batu', paper: 'kertas' }

export const config = {
  name: 'suitpvp',
  alias: ['suitlawan'],
  category: 'fun',
  description: { id: 'Suit lawan pemain lain: lawan membalas tantangan dengan pilihannya', en: 'Rock paper scissors against another player: they reply to the challenge with their pick' },
  usage: '.suitpvp @user',
  example: '.suitpvp @6281234567890',
  cooldown: 5,
}

export const i18n = {
  id: {
    suitpvp: {
      challenge: '╭─❏ ✊ 「 *SUIT PVP* 」\n┊ @{from} menantang @{to} main suit!\n┊ @{to}, balas (reply) pesan ini dengan pilihanmu: gunting, batu, atau kertas. Itu tanda kamu menerima tantangannya~\n╰━━━━━━━',
      needTarget: '╭─❏ ✊ 「 *SUIT PVP* 」\n┊ Tag lawanmu yaa~ Contoh: .suitpvp @6281234567890\n╰━━━━━━━',
      selfTarget: '╭─❏ ✊ 「 *SUIT PVP* 」\n┊ Tidak bisa suit lawan diri sendiri yaa~\n╰━━━━━━━ {mood}',
      firstPick: '╭─❏ ✊ 「 *SUIT PVP* 」\n┊ @{to} memilih duluan dan pilihannya sudah KANA kunci~\n┊ @{from}, sekarang balas (reply) pesan ini dengan pilihanmu: gunting, batu, atau kertas!\n╰━━━━━━━',
      invalid: '╭─❏ ✊ 「 *SUIT PVP* 」\n┊ Pilihannya gunting, batu, atau kertas saja yaa~ Balas lagi pesan yang terikat.\n╰━━━━━━━',
      result: '╭─❏ ✊ 「 *HASIL SUIT* 」\n┊ @{from}: {fromEmoji} ({fromPick})\n┊ @{to}: {toEmoji} ({toPick})\n┊ {verdict}\n╰━━━━━━━',
      winFrom: '🏆 @{from} MENANG!',
      winTo: '🏆 @{to} MENANG!',
      draw: '🤝 SERI! Sama kuatnya~',
    },
  },
  en: {
    suitpvp: {
      challenge: '╭─❏ ✊ 「 *RPS PVP* 」\n┊ @{from} challenges @{to} to rock paper scissors!\n┊ @{to}, reply to this message with your pick: gunting, batu, or kertas. That accepts the challenge~\n╰━━━━━━━',
      needTarget: '╭─❏ ✊ 「 *RPS PVP* 」\n┊ Tag your opponent please~ Example: .suitpvp @6281234567890\n╰━━━━━━━',
      selfTarget: '╭─❏ ✊ 「 *RPS PVP* 」\n┊ You cannot play against yourself~\n╰━━━━━━━ {mood}',
      firstPick: '╭─❏ ✊ 「 *RPS PVP* 」\n┊ @{to} picked first and their choice is locked in~\n┊ @{from}, now reply to this message with your pick: gunting, batu, or kertas!\n╰━━━━━━━',
      invalid: '╭─❏ ✊ 「 *RPS PVP* 」\n┊ Pick gunting, batu, or kertas only please~ Reply to the bound message again.\n╰━━━━━━━',
      result: '╭─❏ ✊ 「 *RPS RESULT* 」\n┊ @{from}: {fromEmoji} ({fromPick})\n┊ @{to}: {toEmoji} ({toPick})\n┊ {verdict}\n╰━━━━━━━',
      winFrom: '🏆 @{from} WINS!',
      winTo: '🏆 @{to} WINS!',
      draw: '🤝 DRAW! Equally matched~',
    },
  },
}

export const test = { input: '.suitpvp', expect: /tag|lawan|opponent/i }

function parsePick(text) {
  const word = (text || '').trim().toLowerCase()
  if (!PICKS[word]) return null
  return NORM[word] ?? word
}

registerReplyKind('suitpvp', async (ctx, binding) => {
  const pick = parsePick(ctx.text)
  if (!pick) {
    await ctx.reply(ctx.t('suitpvp.invalid'))
    return true
  }
  const data = binding.data
  if (!data.toPick) {
    data.toPick = pick
    const sent = await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t('suitpvp.firstPick', { from: data.fromDigits, to: data.toDigits }),
      mentions: [`${data.fromDigits}@s.whatsapp.net`, `${data.toDigits}@s.whatsapp.net`],
    }, { quoted: ctx.raw })
    await saveReplyData(ctx.storage, ctx.chat, {
      ...binding,
      messageId: sent?.key?.id ?? binding.messageId,
      ownerDigits: data.fromDigits,
      data,
      expiresAt: Date.now() + 5 * 60000,
    })
    return true
  }
  const fromPick = pick
  const toPick = data.toPick
  await clearReply(ctx.storage, ctx.chat)
  let verdict
  if (fromPick === toPick) verdict = ctx.t('suitpvp.draw')
  else if (BEATS[fromPick] === toPick) verdict = ctx.t('suitpvp.winFrom', { from: data.fromDigits })
  else verdict = ctx.t('suitpvp.winTo', { to: data.toDigits })
  await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('suitpvp.result', {
      from: data.fromDigits, fromEmoji: PICKS[fromPick], fromPick,
      to: data.toDigits, toEmoji: PICKS[toPick], toPick,
      verdict,
    }),
    mentions: [`${data.fromDigits}@s.whatsapp.net`, `${data.toDigits}@s.whatsapp.net`],
  })
  return true
})

export async function handler(ctx) {
  const target = ctx.mentionedJids?.[0]
  if (!target) return ctx.reply(ctx.t('suitpvp.needTarget'))
  const toDigits = target.split('@')[0]
  if (toDigits === ctx.senderDigits) return ctx.reply(ctx.t('suitpvp.selfTarget', { mood: ctx.say('malu') }))
  const sent = await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('suitpvp.challenge', { from: ctx.senderDigits, to: toDigits }),
    mentions: [`${ctx.senderDigits}@s.whatsapp.net`, target],
  }, { quoted: ctx.raw })
  await bindReply(ctx.storage, ctx.chat, {
    kind: 'suitpvp',
    messageId: sent?.key?.id,
    ownerDigits: toDigits,
    ttlMs: 5 * 60000,
    data: { fromDigits: ctx.senderDigits, toDigits },
  })
  return undefined
}
