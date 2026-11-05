import { sendButtons } from '../../src/ui/buttons.js'
import { removeSewa } from '../../src/services/premium.js'

export const config = {
  name: 'delsewa',
  alias: ['delrent', 'hapussewa'],
  category: 'owner',
  description: { id: 'Cabut sewa bot satu grup atau nomor jadibot', en: 'Remove a bot rental for one group or jadibot number' },
  usage: '.delsewa [jid grup|nomor]',
  example: '.delsewa 120363000000000000@g.us',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    delsewa: {
      hint: '╭─❏ 🏠 「 *CABUT SEWA BOT* 」\n┊ Sebutin targetnya dulu yaa, Master: *.delsewa <jid grup>* atau *.delsewa <nomor jadibot>*.\n┊ Kalau dipakai di grup tanpa target, sewa grup ini yang dicabut~\n╰━━━━━━━',
      done: '╭─❏ 🏠 「 *SEWA DICABUT* 」\n┊ ᴛᴀʀɢᴇᴛ: *{target}*\n┊ Beres, Master~ sewanya udah KANA matiin. {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NGAK ADA SEWA* 」\n┊ Target *{target}* memang nggak punya sewa aktif kok, Master~\n╰━━━━━━━',
      btnList: 'Daftar Sewa',
    },
  },
  en: {
    delsewa: {
      hint: '╭─❏ 🏠 「 *REMOVE BOT RENTAL* 」\n┊ Give the target first, Master: *.delsewa <group jid>* or *.delsewa <jadibot number>*.\n┊ Used in a group without a target, it removes this group rental~\n╰━━━━━━━',
      done: '╭─❏ 🏠 「 *RENTAL REMOVED* 」\n┊ ᴛᴀʀɢᴇᴛ: *{target}*\n┊ Done, Master~ the rental is off now. {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO RENTAL FOUND* 」\n┊ Target *{target}* does not have an active rental anyway, Master~\n╰━━━━━━━',
      btnList: 'Rental List',
    },
  },
}

export function parseDelsewaTarget(ctx) {
  for (const token of ctx.args ?? []) {
    const raw = String(token)
    if (raw.includes('@g.us')) return raw
    const d = raw.replace(/\D/g, '')
    if (/^\d+$/.test(raw) && d.length >= 9 && d.length <= 15) return d
  }
  if (ctx.isGroup && ctx.chat) return ctx.chat
  return ''
}

export const test = { input: '.delsewa', expect: /sewa|rent/i }

export async function handler(ctx) {
  const target = parseDelsewaTarget(ctx)
  if (!target) return ctx.reply(ctx.t('delsewa.hint'))
  const removed = await removeSewa(ctx.storage, target)
  const body = ctx.t(removed ? 'delsewa.done' : 'delsewa.notFound', {
    target,
    mood: ctx.say('sukses'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('delsewa.btnList'), id: '.listsewa' }],
    textFallback: body,
  })
}
