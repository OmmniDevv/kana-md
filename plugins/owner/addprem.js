import { sendButtons } from '../../src/ui/buttons.js'
import { addPremium, isDurationToken, recordStatus, remainingText } from '../../src/services/premium.js'
import { formatWibDateTime } from '../../src/ui/format.js'

export const config = {
  name: 'addprem',
  alias: ['addpremium'],
  category: 'owner',
  description: { id: 'Tambah atau perpanjang premium satu nomor', en: 'Add or extend premium for one number' },
  usage: '.addprem <nomor> [durasi]',
  example: '.addprem 6281234567890 30d',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    addprem: {
      hint: '╭─❏ 💎 「 *TAMBAH PREMIUM* 」\n┊ Sebutin nomornya dulu yaa, Master.\n┊ ᴄᴏɴᴛᴏʜ: *.addprem 6281234567890 30d*\n┊ Durasi: *7d*, *30d*, *2w*, *1y*, atau *permanen*. Tanpa durasi = *30 hari*. Bisa juga reply pesan orangnya atau mention dia~\n╰━━━━━━━',
      done: '╭─❏ 💎 「 *PREMIUM AKTIF* 」\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ ᴅᴜʀᴀꜱɪ: *{duration}*\n┊ ʙᴇʀᴀᴋʜɪʀ: *{expires}*\n┊ Siap, Master~ premiumnya udah KANA nyalain. {mood}\n╰━━━━━━━',
      permanent: 'permanen',
      btnList: 'Daftar Premium',
      btnDel: 'Cabut Premium',
    },
  },
  en: {
    addprem: {
      hint: '╭─❏ 💎 「 *ADD PREMIUM* 」\n┊ Give the number first, Master.\n┊ ᴇxᴀᴍᴘʟᴇ: *.addprem 6281234567890 30d*\n┊ Duration: *7d*, *30d*, *2w*, *1y*, or *permanen*. No duration = *30 days*. You can also reply to their message or mention them~\n╰━━━━━━━',
      done: '╭─❏ 💎 「 *PREMIUM ACTIVE* 」\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ ᴅᴜʀᴀᴛɪᴏɴ: *{duration}*\n┊ ᴇxᴘɪʀᴇꜱ: *{expires}*\n┊ Got it, Master~ premium is on now. {mood}\n╰━━━━━━━',
      permanent: 'permanent',
      btnList: 'Premium List',
      btnDel: 'Remove Premium',
    },
  },
}

// Target: mention pertama, pengirim pesan yang dikutip, atau token
// nomor (9-15 digit) di argumen. Token durasi dikenali terpisah.
export function parseAddpremArgs(ctx) {
  let target = ''
  if (ctx.mentionedJids?.length) {
    const d = String(ctx.mentionedJids[0]).replace(/\D/g, '')
    if (d.length >= 9 && d.length <= 15) target = d
  }
  if (!target && ctx.quoted?.sender) {
    const d = String(ctx.quoted.sender).replace(/\D/g, '')
    if (d.length >= 9 && d.length <= 15) target = d
  }
  let duration = ''
  for (const token of ctx.args ?? []) {
    const raw = String(token)
    const d = raw.replace(/\D/g, '')
    if (!target && /^\d+$/.test(raw) && d.length >= 9 && d.length <= 15) {
      target = d
      continue
    }
    if (!duration && isDurationToken(raw)) duration = raw.toLowerCase()
  }
  return { target, duration }
}

export const test = { input: '.addprem', expect: /premium/i }

export async function handler(ctx) {
  const { target, duration } = parseAddpremArgs(ctx)
  if (!target) return ctx.reply(ctx.t('addprem.hint'))
  const record = await addPremium(ctx.storage, target, {
    duration: duration || '30d',
    addedBy: ctx.senderDigits,
  })
  const status = recordStatus(record)
  const expires = status.permanent
    ? ctx.t('addprem.permanent')
    : `${formatWibDateTime(new Date(status.expiresAt), ctx.lang)} (${remainingText(status.expiresAt - Date.now(), ctx.lang)})`
  const body = ctx.t('addprem.done', {
    number: target,
    duration: duration || '30d',
    expires,
    mood: ctx.say('sukses'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('addprem.btnList'), id: '.listprem' },
      { text: ctx.t('addprem.btnDel'), id: `.delprem ${target}` },
    ],
    textFallback: body,
  })
}
