import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'slowmode',
  alias: ['modepelan'],
  category: 'group',
  description: { id: 'Slowmode grup: batasi jeda antar pesan member (detik), admin bebas', en: 'Group slowmode: limit the gap between member messages (seconds), admins exempt' },
  usage: '.slowmode <detik> atau .slowmode off',
  example: '.slowmode 10',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    slowmode: {
      current: '╭─❏ 🐢 「 *SLOWMODE GRUP* 」\n┊ Slowmode grup ini sekarang: *{state}*\n┊ Ubah dengan *.slowmode <detik>* atau *.slowmode off* yaa~\n╰━━━━━━━',
      off: 'mati',
      onState: '{seconds} detik antar pesan',
      set: '╭─❏ 🐢 「 *SLOWMODE DIATUR* 」\n┊ Slowmode diatur ke *{seconds} detik*~\n┊ Member yang kirim pesan lebih cepat dari itu akan dihapus pesannya (admin bebas)~\n╰━━━━━━━ {mood}',
      setOff: '╭─❏ 🐢 「 *SLOWMODE DIMATIKAN* 」\n┊ Slowmode dimatikan, silakan ngobrol normal lagi yaa~\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ ⚠️ 「 *ANGKANYA SALAH* 」\n┊ Tulis detiknya *5* sampai *3600*, atau *off*~\n┊ ᴄᴏɴᴛᴏʜ: *.slowmode 10*\n╰━━━━━━━ {mood}',
      warn: '╭─❏ 🐢 「 *SLOWMODE AKTIF* 」\n┊ Pelan pelan yaa *@{digits}*, jeda minimal *{seconds} detik* antar pesan~\n╰━━━━━━━',
      footer: 'Slowmode KANA',
    },
  },
  en: {
    slowmode: {
      current: '╭─❏ 🐢 「 *GROUP SLOWMODE* 」\n┊ This group slowmode is now: *{state}*\n┊ Change it with *.slowmode <seconds>* or *.slowmode off*~\n╰━━━━━━━',
      off: 'off',
      onState: '{seconds} seconds between messages',
      set: '╭─❏ 🐢 「 *SLOWMODE SET* 」\n┊ Slowmode set to *{seconds} seconds*~\n┊ Members sending faster than that get their message deleted (admins exempt)~\n╰━━━━━━━ {mood}',
      setOff: '╭─❏ 🐢 「 *SLOWMODE TURNED OFF* 」\n┊ Slowmode turned off, chat normally again~\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ ⚠️ 「 *WRONG NUMBER* 」\n┊ Write seconds between *5* and *3600*, or *off*~\n┊ ᴇxᴀᴍᴘʟᴇ: *.slowmode 10*\n╰━━━━━━━ {mood}',
      warn: '╭─❏ 🐢 「 *SLOWMODE IS ACTIVE* 」\n┊ Slow down *@{digits}*, minimum gap is *{seconds} seconds* between messages~\n╰━━━━━━━',
      footer: 'KANA Slowmode',
    },
  },
}

export const test = { input: '.slowmode 10', expect: /slowmode/i }

const lastSent = new Map()
const lastWarn = new Map()

export async function before(ctx) {
  if (!ctx.isGroup || ctx.raw?.key?.fromMe) return
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const seconds = Number(settings.slowmodeSec ?? 0)
  if (!seconds) return
  if (ctx.isOwner) return
  try {
    const meta = await ctx.getGroupMetadata()
    const myDigits = digitsOf(ctx.sender)
    const isAdmin = (meta?.participants ?? []).some((p) => p.admin && [p.id, p.phoneNumber, p.lid, p.jid].some((c) => c && digitsOf(c) === myDigits))
    if (isAdmin) return
  } catch {}
  const key = `${ctx.chat}:${digitsOf(ctx.sender)}`
  const now = Date.now()
  const last = lastSent.get(key) ?? 0
  lastSent.set(key, now)
  if (now - last < seconds * 1000) {
    try { await ctx.sock.sendMessage(ctx.chat, { delete: ctx.raw.key }) } catch {}
    if (now - (lastWarn.get(key) ?? 0) > 60000) {
      lastWarn.set(key, now)
      await ctx.sock.sendMessage(ctx.chat, {
        text: ctx.t('slowmode.warn', { digits: digitsOf(ctx.sender), seconds }),
        mentions: [ctx.sender],
      }).catch(() => {})
    }
    return false
  }
}

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  if (!arg) {
    const state = settings.slowmodeSec ? ctx.t('slowmode.onState', { seconds: settings.slowmodeSec }) : ctx.t('slowmode.off')
    return ctx.reply(ctx.t('slowmode.current', { state }))
  }
  if (arg === 'off' || arg === '0') {
    await updateGroupSettings(ctx.storage, ctx.chat, { slowmodeSec: 0 })
    return ctx.reply(ctx.t('slowmode.setOff', { mood: ctx.say('sukses') }))
  }
  const seconds = parseInt(arg, 10)
  if (!Number.isFinite(seconds) || seconds < 5 || seconds > 3600) {
    return ctx.reply(ctx.t('slowmode.invalid', { mood: ctx.say('gagal') }))
  }
  await updateGroupSettings(ctx.storage, ctx.chat, { slowmodeSec: seconds })
  return ctx.reply(ctx.t('slowmode.set', { seconds, mood: ctx.say('sukses') }))
}
