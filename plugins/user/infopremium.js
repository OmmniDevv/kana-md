import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LIMIT_GROUPS } from '../../src/services/limit.js'

const here = dirname(fileURLToPath(import.meta.url))
// QRIS resmi KANA, aset yang sama dengan .donasi dan halaman premium web
// (web/public/qris.png di repo ini).
const QRIS_PATH = join(here, '../../web/public/qris.png')

export const config = {
  name: 'infopremium',
  alias: ['premium', 'sewa', 'sewabot'],
  category: 'user',
  description: { id: 'Info premium dan sewa bot: daftar harga, QRIS aktivasi, dan fitur premium', en: 'Premium and bot rental info: prices, activation QRIS, and premium features' },
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
      priceTitle: '┊ 💰 *Daftar harga:*',
      pricePremium: '┊ 💎 *Premium personal*: 7 hari Rp3.000, 30 hari Rp8.000, 90 hari Rp20.000, permanen Rp50.000',
      priceGroup: '┊ 🏠 *Sewa grup*: 7 hari Rp2.000, 30 hari Rp5.000, 90 hari Rp12.000, permanen Rp30.000',
      priceJadibot: '┊ 🤖 *Sewa jadibot*: 7 hari Rp4.000, 30 hari Rp10.000, 90 hari Rp25.000, permanen Rp65.000',
      priceNote: '┊ Sewa grup tidak termasuk jadibot; jadibot cuma kebuka lewat premium personal atau sewa jadibot.',
      summaryLine: '┊ 💎 Ada *{count} fitur premium* (bertanda 💎 di menu) dari semua kategori, termasuk AI, generate gambar, game HTML, dan render berat.',
      limitSummary: '┊ ⏳ Fitur berat pakai limit harian: download gratis *{df}x* per hari (premium/sewa *{dp}x*), upscale gratis *{uf}x* per hari (premium/sewa *{up}x*).',
      payHowto: '┊ 📷 *Cara aktivasi:* bayar lewat *QRIS* pada gambar ini (GoPay Merchant owner), lalu chat owner di *{owner}* ( {link} ) dan sebutkan paket yang dipilih. Aktivasinya manual sama owner, tidak ada pembayaran otomatis di bot~',
      fallbackHowto: '┊ *Cara aktivasi:* chat owner di *{owner}* ( {link} ) buat bayar lewat QRIS dan sebutkan paket yang dipilih. Aktivasinya manual sama owner, tidak ada pembayaran otomatis di bot~',
      fallbackNote: '┊ Gambar QRIS lagi tidak bisa dimuat, jadi QRIS-nya minta langsung ke owner yaa~',
      closing: '╰━━━━━━━ {mood}',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
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
      priceTitle: '┊ 💰 *Price list:*',
      pricePremium: '┊ 💎 *Personal premium*: 7 days Rp3.000, 30 days Rp8.000, 90 days Rp20.000, permanent Rp50.000',
      priceGroup: '┊ 🏠 *Group rental*: 7 days Rp2.000, 30 days Rp5.000, 90 days Rp12.000, permanent Rp30.000',
      priceJadibot: '┊ 🤖 *Jadibot rental*: 7 days Rp4.000, 30 days Rp10.000, 90 days Rp25.000, permanent Rp65.000',
      priceNote: '┊ A group rental does not include jadibot; jadibot only unlocks through personal premium or a jadibot rental.',
      summaryLine: '┊ 💎 There are *{count} premium features* (marked 💎 in the menu) across all categories, including AI, image generation, HTML games, and heavy rendering.',
      limitSummary: '┊ ⏳ Heavy features use a daily limit: downloads free *{df}x* per day (premium/rental *{dp}x*), upscale free *{uf}x* per day (premium/rental *{up}x*).',
      payHowto: '┊ 📷 *How to activate:* pay through the *QRIS* in this image (owner GoPay Merchant), then chat the owner at *{owner}* ( {link} ) and say which package you picked. Activation is manual by the owner, there is no automatic payment in the bot~',
      fallbackHowto: '┊ *How to activate:* chat the owner at *{owner}* ( {link} ) to pay through QRIS and say which package you picked. Activation is manual by the owner, there is no automatic payment in the bot~',
      fallbackNote: '┊ The QRIS image could not be loaded right now, so please ask the owner for the QRIS directly~',
      closing: '╰━━━━━━━ {mood}',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.infopremium', expect: /Rp3\.000/ }

function collectRegistry(ctx) {
  const plugins = ctx.registry?.list?.() ?? []
  const byCategory = new Map()
  const limitByGroup = new Map()
  let premiumCount = 0
  for (const plugin of plugins) {
    const cfg = plugin.config ?? {}
    if (cfg.premium) {
      premiumCount += 1
      const cat = cfg.category ?? 'main'
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat).push(cfg.name)
    }
    if (cfg.limitGroup) {
      if (!limitByGroup.has(cfg.limitGroup)) limitByGroup.set(cfg.limitGroup, [])
      limitByGroup.get(cfg.limitGroup).push(cfg.name)
    }
  }
  return { byCategory, limitByGroup, premiumCount }
}

function ownerVars() {
  const owner = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  return { owner: owner || '-', link: owner ? `https://wa.me/${owner}` : '-' }
}

function priceLines(ctx) {
  return [
    ctx.t('infopremium.priceTitle'),
    ctx.t('infopremium.pricePremium'),
    ctx.t('infopremium.priceGroup'),
    ctx.t('infopremium.priceJadibot'),
    ctx.t('infopremium.priceNote'),
  ]
}

// Caption gambar QRIS: pricelist lengkap + ringkasan dinamis. Daftar nama
// fitur lengkap tidak muat di caption WhatsApp (114 plugin premium),
// jadi caption membawa jumlahnya; daftar lengkap tetap ada di jalur teks.
function buildCaption(ctx, { premiumCount }) {
  const dl = LIMIT_GROUPS.download ?? { free: 0, paid: 0 }
  const up = LIMIT_GROUPS.upscale ?? { free: 0, paid: 0 }
  const lines = [
    ctx.t('infopremium.title'),
    ...priceLines(ctx),
    ctx.t('infopremium.summaryLine', { count: premiumCount }),
    ctx.t('infopremium.limitSummary', { df: dl.free, dp: dl.paid, uf: up.free, up: up.paid }),
    ctx.t('infopremium.payHowto', ownerVars()),
    ctx.t('infopremium.closing', { mood: ctx.say('senang') }),
  ]
  return lines.join('\n')
}

// Teks lengkap untuk jalur tanpa gambar (QRIS gagal dibaca): isi lama
// plugin ini (fitur per kategori + limit per perintah + tiga cara
// berbayar) ditambah pricelist resmi.
function buildFullText(ctx, { byCategory, limitByGroup }) {
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
  lines.push(ctx.t('infopremium.kindsTitle'))
  lines.push(ctx.t('infopremium.kindPremium'))
  lines.push(ctx.t('infopremium.kindGroup'))
  lines.push(ctx.t('infopremium.kindJadibot'))
  lines.push(...priceLines(ctx))
  lines.push(ctx.t('infopremium.fallbackNote'))
  lines.push(ctx.t('infopremium.fallbackHowto', ownerVars()))
  lines.push(ctx.t('infopremium.closing', { mood: ctx.say('senang') }))
  return lines.join('\n')
}

export async function handler(ctx) {
  const collected = collectRegistry(ctx)
  let image = null
  try {
    image = await readFile(QRIS_PATH)
  } catch {
    image = null
  }
  if (!image) return ctx.reply(buildFullText(ctx, collected))
  try {
    await ctx.sock.sendMessage(ctx.chat, {
      image,
      caption: buildCaption(ctx, collected),
    }, { quoted: ctx.raw })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('infopremium.fail', { error: err.message }))
  }
}
