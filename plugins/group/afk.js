import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'afk',
  alias: [],
  category: 'group',
  description: { id: 'Tandai sedang AFK dengan alasan', en: 'Mark yourself AFK with a reason' },
  usage: '.afk [alasan]',
  example: '.afk lagi makan',
  cooldown: 3,
  priority: 30,
}

export const i18n = {
  id: {
    afk: {
      set: '╭─❏ 🌙 「 *AFK DULU YAA* 」\n┊ Kamu AFK sekarang: *{reason}*\n┊ KANA catat yaa, istirahat yang cukup~\n╰━━━━━━━',
      setNoReason: '╭─❏ 🌙 「 *AFK DULU YAA* 」\n┊ Kamu AFK sekarang~\n┊ KANA catat yaa, istirahat yang cukup~\n╰━━━━━━━',
      back: '╭─❏ 🌸 「 *SELAMAT DATANG KEMBALI* 」\n┊ Halo *@{digits}*~\n┊ Kamu AFK selama *{duration}*, sekarang udah nggak AFK lagi yaa~\n╰━━━━━━━',
      info: '╭─❏ 🌙 「 *LAGI AFK* 」\n┊ *@{digits}* lagi AFK sejak *{duration}* yang lalu~\n┊ ᴀʟᴀꜱᴀɴ: *{reason}*\n╰━━━━━━━',
      infoNoReason: '╭─❏ 🌙 「 *LAGI AFK* 」\n┊ *@{digits}* lagi AFK sejak *{duration}* yang lalu~\n╰━━━━━━━',
      minutes: '{count} menit', hours: '{count} jam', justNow: 'baru aja',
      defaultReason: 'lagi sibuk',
    },
  },
  en: {
    afk: {
      set: '╭─❏ 🌙 「 *AFK FOR NOW* 」\n┊ You are AFK now: *{reason}*\n┊ I noted it, please rest well~\n╰━━━━━━━',
      setNoReason: '╭─❏ 🌙 「 *AFK FOR NOW* 」\n┊ You are AFK now~\n┊ I noted it, please rest well~\n╰━━━━━━━',
      back: '╭─❏ 🌸 「 *WELCOME BACK* 」\n┊ Hello *@{digits}*~\n┊ You were AFK for *{duration}*, you are no longer AFK~\n╰━━━━━━━',
      info: '╭─❏ 🌙 「 *CURRENTLY AFK* 」\n┊ *@{digits}* is AFK since *{duration}* ago~\n┊ ʀᴇᴀꜱᴏɴ: *{reason}*\n╰━━━━━━━',
      infoNoReason: '╭─❏ 🌙 「 *CURRENTLY AFK* 」\n┊ *@{digits}* is AFK since *{duration}* ago~\n╰━━━━━━━',
      minutes: '{count} minutes', hours: '{count} hours', justNow: 'just now',
      defaultReason: 'busy',
    },
  },
}

function formatDuration(ctx, since) {
  const ms = Date.now() - Number(since || Date.now())
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return ctx.t('afk.justNow')
  if (minutes < 60) return ctx.t('afk.minutes', { count: minutes })
  return ctx.t('afk.hours', { count: Math.floor(minutes / 60) })
}

export const test = { input: '.afk', expect: /AFK/i }

export async function handler(ctx) {
  const reason = ctx.text.trim()
  const entry = { reason, since: Date.now() }
  if (ctx.isGroup) {
    const settings = await getGroupSettings(ctx.storage, ctx.chat)
    await updateGroupSettings(ctx.storage, ctx.chat, { afk: { ...(settings.afk ?? {}), [ctx.senderDigits]: entry } })
  } else {
    await updateProfile(ctx.storage, ctx.senderDigits, { afk: entry })
  }
  await ctx.reply(ctx.t(reason ? 'afk.set' : 'afk.setNoReason', { reason }))
}

export async function before(ctx) {
  if (!ctx.isGroup) return
  // Perintah .afk sendiri jangan memicu pesan kembali.
  if (/^[.!/#]afk\b/i.test(ctx.text || '')) return
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const afkMap = settings.afk ?? {}
  const myDigits = digitsOf(ctx.sender)
  if (afkMap[myDigits]) {
    const entry = afkMap[myDigits]
    const next = { ...afkMap }
    delete next[myDigits]
    await updateGroupSettings(ctx.storage, ctx.chat, { afk: next })
    await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t('afk.back', { digits: myDigits, duration: formatDuration(ctx, entry.since) }),
      mentions: [ctx.sender],
    })
  }
  // Info untuk member AFK yang di-mention, maks 1 balasan per pesan.
  for (const jid of ctx.mentionedJids ?? []) {
    const d = digitsOf(jid)
    if (d === myDigits) continue
    const entry = afkMap[d]
    if (!entry) continue
    const duration = formatDuration(ctx, entry.since)
    await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t(entry.reason ? 'afk.info' : 'afk.infoNoReason', { digits: d, duration, reason: entry.reason || '' }),
      mentions: [jid],
    })
    break
  }
}
