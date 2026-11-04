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
      set: 'Siap~ kamu AFK sekarang: {reason}. KANA catat yaa, istirahat yang cukup~',
      setNoReason: 'Siap~ kamu AFK sekarang. KANA catat yaa, istirahat yang cukup~',
      back: 'Selamat datang kembali, @{digits}~ Kamu AFK selama {duration}. Udah nggak AFK lagi yaa~',
      info: '@{digits} lagi AFK sejak {duration} yang lalu. Alasan: {reason}',
      infoNoReason: '@{digits} lagi AFK sejak {duration} yang lalu.',
      minutes: '{count} menit', hours: '{count} jam', justNow: 'baru aja',
      defaultReason: 'lagi sibuk',
    },
  },
  en: {
    afk: {
      set: 'Got it~ you are AFK now: {reason}. I noted it, please rest well~',
      setNoReason: 'Got it~ you are AFK now. I noted it, please rest well~',
      back: 'Welcome back, @{digits}~ You were AFK for {duration}. You are no longer AFK~',
      info: '@{digits} is AFK since {duration} ago. Reason: {reason}',
      infoNoReason: '@{digits} is AFK since {duration} ago.',
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
