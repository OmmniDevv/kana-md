import { sendButtons } from '../../src/ui/buttons.js'
import { getSewaStatus, remainingText } from '../../src/services/premium.js'
import { formatWibDateTime } from '../../src/ui/format.js'

export const config = {
  name: 'ceksewa',
  alias: ['sewaku', 'statussewa'],
  category: 'user',
  description: { id: 'Cek status sewa bot grup ini atau sewa jadibot kamu', en: 'Check this group bot rental or your jadibot rental status' },
  usage: '.ceksewa',
  example: '.ceksewa',
  cooldown: 3,
}

export const i18n = {
  id: {
    ceksewa: {
      titleGroup: '╭─❏ 🏠 「 *STATUS SEWA GRUP* 」',
      titleJadibot: '╭─❏ 🤖 「 *STATUS SEWA JADIBOT KAMU* 」',
      activePermanent: '┊ ꜱᴛᴀᴛᴜꜱ: *Sewa aktif permanen* 💎\n┊ Fitur premium kebuka di sini selama sewa aktif~',
      activeUntil: '┊ ꜱᴛᴀᴛᴜꜱ: *Sewa aktif*\n┊ ʙᴇʀᴀᴋʜɪʀ: *{date}* (sisa {left})\n┊ Fitur premium kebuka di sini selama sewa aktif~',
      expired: '┊ ꜱᴛᴀᴛᴜꜱ: *Sewa sudah berakhir* ({date})\n┊ Perpanjang lewat owner yaa~',
      noneGroup: '┊ ꜱᴛᴀᴛᴜꜱ: *Grup ini belum menyewa*\n┊ Sewa grup membuka fitur premium buat semua anggota grup ini lho~',
      noneJadibot: '┊ ꜱᴛᴀᴛᴜꜱ: *Kamu belum punya sewa jadibot*\n┊ Sewa jadibot bikin kamu bisa jalanin *.jadibot* pakai nomor kamu sendiri~',
      closing: '╰━━━━━━━ {mood}',
      btnInfo: 'Info Premium',
      btnPrem: 'Cek Premium',
    },
  },
  en: {
    ceksewa: {
      titleGroup: '╭─❏ 🏠 「 *GROUP RENTAL STATUS* 」',
      titleJadibot: '╭─❏ 🤖 「 *YOUR JADIBOT RENTAL STATUS* 」',
      activePermanent: '┊ ꜱᴛᴀᴛᴜꜱ: *Rental permanently active* 💎\n┊ Premium features are unlocked here while the rental is active~',
      activeUntil: '┊ ꜱᴛᴀᴛᴜꜱ: *Rental active*\n┊ ᴇxᴘɪʀᴇꜱ: *{date}* ({left} left)\n┊ Premium features are unlocked here while the rental is active~',
      expired: '┊ ꜱᴛᴀᴛᴜꜱ: *Rental has expired* ({date})\n┊ Renew it via the owner~',
      noneGroup: '┊ ꜱᴛᴀᴛᴜꜱ: *This group has no rental yet*\n┊ A group rental unlocks premium features for every member of this group~',
      noneJadibot: '┊ ꜱᴛᴀᴛᴜꜱ: *You have no jadibot rental yet*\n┊ A jadibot rental lets you run *.jadibot* with your own number~',
      closing: '╰━━━━━━━ {mood}',
      btnInfo: 'Premium Info',
      btnPrem: 'Check Premium',
    },
  },
}

export const test = { input: '.ceksewa', expect: /sewa|rent/i }

export async function handler(ctx) {
  const inGroup = !!ctx.isGroup
  const key = inGroup ? ctx.chat : ctx.senderDigits
  const status = await getSewaStatus(ctx.storage, key)
  const validType = inGroup ? status.record?.type !== 'jadibot' : status.record?.type === 'jadibot'
  const lines = [ctx.t(inGroup ? 'ceksewa.titleGroup' : 'ceksewa.titleJadibot')]
  if (status.active && validType && status.permanent) {
    lines.push(ctx.t('ceksewa.activePermanent'))
  } else if (status.active && validType) {
    lines.push(
      ctx.t('ceksewa.activeUntil', {
        date: formatWibDateTime(new Date(status.expiresAt), ctx.lang),
        left: remainingText(status.expiresAt - Date.now(), ctx.lang),
      })
    )
  } else if (status.exists && validType && status.expired) {
    lines.push(
      ctx.t('ceksewa.expired', {
        date: status.expiresAt ? formatWibDateTime(new Date(status.expiresAt), ctx.lang) : '-',
      })
    )
  } else {
    lines.push(ctx.t(inGroup ? 'ceksewa.noneGroup' : 'ceksewa.noneJadibot'))
  }
  lines.push(ctx.t('ceksewa.closing', { mood: ctx.say('senang') }))
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('ceksewa.btnInfo'), id: '.infopremium' },
      { text: ctx.t('ceksewa.btnPrem'), id: '.cekprem' },
    ],
    textFallback: body,
  })
}
