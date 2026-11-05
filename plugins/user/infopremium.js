import { sendButtons } from '../../src/ui/buttons.js'
import { LIMIT_GROUPS } from '../../src/services/limit.js'

export const config = {
  name: 'infopremium',
  alias: ['premium', 'sewa', 'sewabot'],
  category: 'user',
  description: { id: 'Info premium, sewa bot, dan daftar fitur premium', en: 'Premium and bot rental info with the premium feature list' },
  usage: '.infopremium',
  example: '.infopremium',
  cooldown: 3,
}

export const i18n = {
  id: {
    infopremium: {
      title: '╭─❏ 💎 「 *PREMIUM DAN SEWA BOT* 」',
      listTitle: '┊ *Fitur premium* (bertanda 💎 di menu):',
      catLine: '┊ 💎 *{category}*: {commands}',
      emptyList: '┊ Belum ada fitur premium yang terdaftar~',
      limitTitle: '┊ ⏳ *Fitur berat pakai limit harian* (bukan premium):',
      limitLine: '┊ ⏳ {commands} : gratis *{free}x per hari*, premium/sewa *{paid}x per hari*',
      kindsTitle: '┊ *Tiga cara berbayar:*',
      kindPremium: '┊ 💎 *Premium personal*: semua fitur 💎 kebuka buat nomor kamu di mana pun.',
      kindGroup: '┊ 🏠 *Sewa grup*: fitur 💎 kebuka buat semua anggota di grup itu saja, plus limit download/upscale di grup itu naik.',
      kindJadibot: '┊ 🤖 *Sewa jadibot*: khusus membuka *.jadibot* buat nomor kamu (sewa grup tidak membuka jadibot).',
      howto: '┊ *Cara aktivasi:* chat owner KANA di *{owner}* ( {link} ), bilang mau premium atau sewa yang mana. Aktivasinya manual sama owner, tidak ada pembayaran otomatis di bot~',
      closing: '╰━━━━━━━ {mood}',
      btnCheck: 'Cek Premium',
      btnSewa: 'Cek Sewa',
    },
  },
  en: {
    infopremium: {
      title: '╭─❏ 💎 「 *PREMIUM AND BOT RENTAL* 」',
      listTitle: '┊ *Premium features* (marked 💎 in the menu):',
      catLine: '┊ 💎 *{category}*: {commands}',
      emptyList: '┊ No premium features registered yet~',
      limitTitle: '┊ ⏳ *Heavy features use a daily limit* (not premium):',
      limitLine: '┊ ⏳ {commands} : free *{free}x per day*, premium/rental *{paid}x per day*',
      kindsTitle: '┊ *Three paid options:*',
      kindPremium: '┊ 💎 *Personal premium*: every 💎 feature unlocks for your number everywhere.',
      kindGroup: '┊ 🏠 *Group rental*: 💎 features unlock for every member in that group only, and download/upscale limits in that group go up.',
      kindJadibot: '┊ 🤖 *Jadibot rental*: only unlocks *.jadibot* for your number (a group rental does not unlock jadibot).',
      howto: '┊ *How to activate:* chat KANA owner at *{owner}* ( {link} ) and say which premium or rental you want. Activation is manual by the owner, there is no automatic payment in the bot~',
      closing: '╰━━━━━━━ {mood}',
      btnCheck: 'Check Premium',
      btnSewa: 'Check Rental',
    },
  },
}

export const test = { input: '.infopremium', expect: /premium/i }

export async function handler(ctx) {
  const plugins = ctx.registry?.list?.() ?? []
  const byCategory = new Map()
  const limitByGroup = new Map()
  for (const plugin of plugins) {
    const cfg = plugin.config ?? {}
    if (cfg.premium) {
      const cat = cfg.category ?? 'main'
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat).push(cfg.name)
    }
    if (cfg.limitGroup) {
      if (!limitByGroup.has(cfg.limitGroup)) limitByGroup.set(cfg.limitGroup, [])
      limitByGroup.get(cfg.limitGroup).push(cfg.name)
    }
  }
  const lines = [ctx.t('infopremium.title'), ctx.t('infopremium.listTitle')]
  if (!byCategory.size) {
    lines.push(ctx.t('infopremium.emptyList'))
  } else {
    for (const [cat, names] of [...byCategory.entries()].sort()) {
      const rawTitle = ctx.t(`menu.cat.${cat}`)
      const title = rawTitle === `menu.cat.${cat}` ? cat.toUpperCase() : rawTitle
      lines.push(
        ctx.t('infopremium.catLine', {
          category: title,
          commands: names.sort().map((n) => `.${n}`).join(', '),
        })
      )
    }
  }
  if (limitByGroup.size) {
    lines.push(ctx.t('infopremium.limitTitle'))
    for (const [group, names] of [...limitByGroup.entries()].sort()) {
      const quota = LIMIT_GROUPS[group] ?? { free: 0, paid: 0 }
      lines.push(
        ctx.t('infopremium.limitLine', {
          commands: names.sort().map((n) => `.${n}`).join(', '),
          free: quota.free,
          paid: quota.paid,
        })
      )
    }
  }
  const ownerNumber = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  lines.push(ctx.t('infopremium.kindsTitle'))
  lines.push(ctx.t('infopremium.kindPremium'))
  lines.push(ctx.t('infopremium.kindGroup'))
  lines.push(ctx.t('infopremium.kindJadibot'))
  lines.push(
    ctx.t('infopremium.howto', {
      owner: ownerNumber || '-',
      link: ownerNumber ? `https://wa.me/${ownerNumber}` : '-',
    })
  )
  lines.push(ctx.t('infopremium.closing', { mood: ctx.say('senang') }))
  const body = lines.join('\n')
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('infopremium.btnCheck'), id: '.cekprem' },
      { text: ctx.t('infopremium.btnSewa'), id: '.ceksewa' },
    ],
    textFallback: body,
  })
}
