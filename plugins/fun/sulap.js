import { bindReply, clearReply, registerReplyKind } from '../../src/ui/reply-router.js'
import { participantJid } from './randomtag.js'

// Sulap: pertunjukan kick member secara dramatis, seperti sulap
// Elaina-MD. Admin menjalankan .sulap, bot mengirim pesan panggung,
// lalu admin yang sama MEMBALAS pesan itu sambil mention target.
// Sesi memakai reply-router bersama (satu binding aktif per chat),
// kedaluwarsa 2 menit. Target admin kebal, bot dan diri sendiri tidak
// bisa dihilangkan.
export const config = {
  name: 'sulap',
  alias: ['magictrick'],
  category: 'fun',
  description: { id: 'Pertunjukan sulap: hilangkan satu member grup secara dramatis', en: 'Magic show: dramatically vanish one group member' },
  usage: '.sulap',
  example: '.sulap',
  cooldown: 60,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    sulap: {
      prompt: '╭─❏ 🎩 「 *PERTUNJUKAN SULAP* 」\n┊ Siapa yang ingin dihilangkan?\n┊\n┊ Balas pesan ini sambil mention orangnya yaa~\n┊ ᴡᴀᴋᴛᴜ: *2 menit*\n╰━━━━━━━',
      needMention: '╭─❏ 🎩 「 *SULAP* 」\n┊ Mention orangnya dong~\n╰━━━━━━━',
      botTarget: '╭─❏ 🎭 「 *SULAP* 」\n┊ KANA tidak bisa menghilangkan diri sendiri~\n╰━━━━━━━',
      selfTarget: '╭─❏ 🎭 「 *SULAP* 」\n┊ Pesulap tidak bisa menghilangkan diri sendiri~\n╰━━━━━━━',
      notMember: '╭─❏ 👻 「 *SULAP* 」\n┊ Orang itu tidak ada di grup ini~\n╰━━━━━━━',
      adminImmune: '╭─❏ 🛡️ 「 *SULAP* 」\n┊ Admin kebal terhadap sihir~\n╰━━━━━━━',
      prepare: '╭─❏ 🪄 「 *SULAP* 」\n┊ Bersiaplah, *@{target}*... ✨\n╰━━━━━━━',
      success: '╭─❏ 🎪 「 *SULAP SELESAI* 」\n┊ {line}\n┊ 🎯 *@{target}* telah menghilang!\n┊ 🎩 Pesulap: *@{magician}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *SULAP GAGAL* 」\n┊ Sulapnya gagal nih: *{message}*\n╰━━━━━━━',
      startFail: '╭─❏ 💦 「 *SULAP GAGAL* 」\n┊ Pesan panggungnya gagal dikirim, coba lagi yaa~\n╰━━━━━━━',
      lines: [
        '💨 *POOF!* Dan... dia menghilang!',
        '🌟 Sulap berhasil! Sampai jumpa lagi~',
        '✨ Absen dulu ya, ditunggu pertunjukan berikutnya!',
        '🎪 Pertunjukan selesai, tepuk tangan semuanya!',
      ],
    },
  },
  en: {
    sulap: {
      prompt: '╭─❏ 🎩 「 *MAGIC SHOW* 」\n┊ Who should be vanished?\n┊\n┊ Reply to this message while mentioning the person~\n┊ ᴛɪᴍᴇ: *2 minutes*\n╰━━━━━━━',
      needMention: '╭─❏ 🎩 「 *MAGIC* 」\n┊ Mention the person please~\n╰━━━━━━━',
      botTarget: '╭─❏ 🎭 「 *MAGIC* 」\n┊ KANA cannot vanish herself~\n╰━━━━━━━',
      selfTarget: '╭─❏ 🎭 「 *MAGIC* 」\n┊ The magician cannot vanish themselves~\n╰━━━━━━━',
      notMember: '╭─❏ 👻 「 *MAGIC* 」\n┊ That person is not in this group~\n╰━━━━━━━',
      adminImmune: '╭─❏ 🛡️ 「 *MAGIC* 」\n┊ Admins are immune to magic~\n╰━━━━━━━',
      prepare: '╭─❏ 🪄 「 *MAGIC* 」\n┊ Get ready, *@{target}*... ✨\n╰━━━━━━━',
      success: '╭─❏ 🎪 「 *MAGIC DONE* 」\n┊ {line}\n┊ 🎯 *@{target}* has vanished!\n┊ 🎩 Magician: *@{magician}*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *MAGIC FAILED* 」\n┊ The trick failed: *{message}*\n╰━━━━━━━',
      startFail: '╭─❏ 💦 「 *MAGIC FAILED* 」\n┊ The stage message failed to send, please try again~\n╰━━━━━━━',
      lines: [
        '💨 *POOF!* And... they vanished!',
        '🌟 The trick worked! See you again~',
        '✨ Gone for now, wait for the next show!',
        '🎪 The show is over, applause everyone!',
      ],
    },
  },
}

export const test = { input: '.sulap', expect: /sulap|magic/i }

export const SULAP_TTL_MS = 2 * 60000
export const SULAP_DELAY_MS = 2000

function digitsOf(value) {
  return String(value ?? '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Cari peserta grup berdasarkan digit dari JID target, cocok di semua
// field identitas peserta (id, phoneNumber, jid, lid).
export function findParticipant(participants, targetJid) {
  const targetDigits = digitsOf(targetJid)
  if (!targetDigits) return null
  for (const participant of participants ?? []) {
    if (!participant) continue
    if (typeof participant === 'string') {
      if (digitsOf(participant) === targetDigits) return { id: participant, admin: null }
      continue
    }
    const candidates = [participant.phoneNumber, participant.id, participant.jid, participant.lid]
    if (candidates.some((c) => c && digitsOf(c) === targetDigits)) return participant
  }
  return null
}

export async function handler(ctx) {
  const sent = await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('sulap.prompt') }, { quoted: ctx.raw })
  const messageId = sent?.key?.id
  if (!messageId) return ctx.reply(ctx.t('sulap.startFail'))
  await bindReply(ctx.storage, ctx.chat, {
    kind: 'sulap',
    messageId,
    ownerDigits: ctx.senderDigits,
    ttlMs: SULAP_TTL_MS,
    data: { magicianDigits: ctx.senderDigits },
  })
  return undefined
}

registerReplyKind('sulap', async (ctx, binding) => {
  const targetJid = ctx.mentionedJids?.[0]
  if (!targetJid) {
    await ctx.reply(ctx.t('sulap.needMention'))
    return true
  }
  await clearReply(ctx.storage, ctx.chat)
  const targetDigits = digitsOf(targetJid)
  const magicianDigits = binding.data?.magicianDigits || ctx.senderDigits
  const send = (text, mentions) =>
    ctx.sock.sendMessage(ctx.chat, { text, ...(mentions?.length ? { mentions } : {}) }, { quoted: ctx.raw })

  if (ctx.botJid && targetDigits === digitsOf(ctx.botJid)) {
    await send(ctx.t('sulap.botTarget'))
    return true
  }
  if (targetDigits === digitsOf(ctx.sender)) {
    await send(ctx.t('sulap.selfTarget'))
    return true
  }

  try {
    const meta = ctx.groupMetadata ?? (await ctx.getGroupMetadata().catch(() => null))
    const participant = findParticipant(meta?.participants ?? [], targetJid)
    if (!participant) {
      await send(ctx.t('sulap.notMember'))
      return true
    }
    if (participant.admin) {
      await send(ctx.t('sulap.adminImmune'))
      return true
    }
    const canonicalTarget = participantJid(participant) || targetJid
    await send(ctx.t('sulap.prepare', { target: targetDigits }), [canonicalTarget])
    await sleep(SULAP_DELAY_MS)
    await ctx.sock.groupParticipantsUpdate(ctx.chat, [canonicalTarget], 'remove')
    const pack = i18n[ctx.lang]?.sulap ?? i18n.id.sulap
    const line = pack.lines[Math.floor(Math.random() * pack.lines.length)]
    await send(ctx.t('sulap.success', { line, target: targetDigits, magician: magicianDigits }), [
      canonicalTarget,
      `${magicianDigits}@s.whatsapp.net`,
    ])
  } catch (err) {
    await send(ctx.t('sulap.fail', { message: err.message }))
  }
  return true
})
