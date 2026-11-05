import { sendButtons } from '../../src/ui/buttons.js'
import { getPremiumStatus, getSewaStatus, remainingText } from '../../src/services/premium.js'
import { peekLimit } from '../../src/services/limit.js'
import { formatWibDateTime } from '../../src/ui/format.js'

export const config = {
  name: 'cekprem',
  alias: ['premiumku', 'statusku'],
  category: 'user',
  description: { id: 'Cek status premium dan sisa limit harian kamu', en: 'Check your premium status and remaining daily limits' },
  usage: '.cekprem',
  example: '.cekprem',
  cooldown: 3,
}

export const i18n = {
  id: {
    cekprem: {
      title: '╭─❏ 💎 「 *STATUS PREMIUM KAMU* 」',
      ownerLine: '┊ ꜱᴛᴀᴛᴜꜱ: *Owner* (selalu premium, tanpa batas) 💎',
      activePermanent: '┊ ꜱᴛᴀᴛᴜꜱ: *Premium permanen* 💎',
      activeUntil: '┊ ꜱᴛᴀᴛᴜꜱ: *Premium aktif*\n┊ ʙᴇʀᴀᴋʜɪʀ: *{date}* (sisa {left})',
      expired: '┊ ꜱᴛᴀᴛᴜꜱ: *Premium sudah berakhir* ({date})\n┊ Perpanjang lewat owner yaa~',
      free: '┊ ꜱᴛᴀᴛᴜꜱ: *Belum premium*\n┊ Fitur gratis tetap bisa kamu pakai kok, santai~',
      jadibotActive: '┊ ꜱᴇᴡᴀ ᴊᴀᴅɪʙᴏᴛ: *aktif* s/d *{date}* (sisa {left})',
      jadibotPermanent: '┊ ꜱᴇᴡᴀ ᴊᴀᴅɪʙᴏᴛ: *aktif permanen*',
      jadibotNone: '┊ ꜱᴇᴡᴀ ᴊᴀᴅɪʙᴏᴛ: *tidak ada*',
      limitTitle: '┊ ⏳ *Limit hari ini:*',
      limitLine: '┊ {group}: sisa *{left} dari {quota}* kali',
      limitOwner: '┊ ⏳ Limit hari ini: *tanpa batas* (owner)',
      closing: '╰━━━━━━━ {mood}',
      btnInfo: 'Info Premium',
      btnSewa: 'Cek Sewa',
    },
  },
  en: {
    cekprem: {
      title: '╭─❏ 💎 「 *YOUR PREMIUM STATUS* 」',
      ownerLine: '┊ ꜱᴛᴀᴛᴜꜱ: *Owner* (always premium, no limits) 💎',
      activePermanent: '┊ ꜱᴛᴀᴛᴜꜱ: *Permanent premium* 💎',
      activeUntil: '┊ ꜱᴛᴀᴛᴜꜱ: *Premium active*\n┊ ᴇxᴘɪʀᴇꜱ: *{date}* ({left} left)',
      expired: '┊ ꜱᴛᴀᴛᴜꜱ: *Premium has expired* ({date})\n┊ Renew it via the owner~',
      free: '┊ ꜱᴛᴀᴛᴜꜱ: *Not premium yet*\n┊ Free features are still yours to use, no worries~',
      jadibotActive: '┊ ᴊᴀᴅɪʙᴏᴛ ʀᴇɴᴛᴀʟ: *active* until *{date}* ({left} left)',
      jadibotPermanent: '┊ ᴊᴀᴅɪʙᴏᴛ ʀᴇɴᴛᴀʟ: *permanently active*',
      jadibotNone: '┊ ᴊᴀᴅɪʙᴏᴛ ʀᴇɴᴛᴀʟ: *none*',
      limitTitle: '┊ ⏳ *Today limits:*',
      limitLine: '┊ {group}: *{left} of {quota}* left',
      limitOwner: '┊ ⏳ Today limits: *unlimited* (owner)',
      closing: '╰━━━━━━━ {mood}',
      btnInfo: 'Premium Info',
      btnSewa: 'Check Rental',
    },
  },
}

export const test = { input: '.cekprem', expect: /premium/i }

export async function handler(ctx) {
  const lines = [ctx.t('cekprem.title')]
  const prem = await getPremiumStatus(ctx.storage, ctx.senderDigits)
  if (ctx.isOwner) {
    lines.push(ctx.t('cekprem.ownerLine'))
  } else if (prem.active && prem.permanent) {
    lines.push(ctx.t('cekprem.activePermanent'))
  } else if (prem.active) {
    lines.push(
      ctx.t('cekprem.activeUntil', {
        date: formatWibDateTime(new Date(prem.expiresAt), ctx.lang),
        left: remainingText(prem.expiresAt - Date.now(), ctx.lang),
      })
    )
  } else if (prem.exists && prem.expired) {
    lines.push(
      ctx.t('cekprem.expired', {
        date: prem.expiresAt ? formatWibDateTime(new Date(prem.expiresAt), ctx.lang) : '-',
      })
    )
  } else {
    lines.push(ctx.t('cekprem.free'))
  }

  const rent = await getSewaStatus(ctx.storage, ctx.senderDigits)
  if (rent.active && rent.record?.type === 'jadibot' && rent.permanent) {
    lines.push(ctx.t('cekprem.jadibotPermanent'))
  } else if (rent.active && rent.record?.type === 'jadibot') {
    lines.push(
      ctx.t('cekprem.jadibotActive', {
        date: formatWibDateTime(new Date(rent.expiresAt), ctx.lang),
        left: remainingText(rent.expiresAt - Date.now(), ctx.lang),
      })
    )
  } else {
    lines.push(ctx.t('cekprem.jadibotNone'))
  }

  if (ctx.isOwner) {
    lines.push(ctx.t('cekprem.limitOwner'))
  } else {
    const paidTier = prem.active
    lines.push(ctx.t('cekprem.limitTitle'))
    for (const group of ['download', 'upscale']) {
      const peek = await peekLimit(ctx.storage, ctx.senderDigits, group, { paidTier })
      lines.push(ctx.t('cekprem.limitLine', { group, left: peek.left, quota: peek.quota }))
    }
  }
  lines.push(ctx.t('cekprem.closing', { mood: ctx.say('senang') }))
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekprem.btnInfo'), id: '.infopremium' },
      { text: ctx.t('cekprem.btnSewa'), id: '.ceksewa' },
    ],
    textFallback: body,
  })
}
