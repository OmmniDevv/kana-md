import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendButtons } from '../../src/ui/buttons.js'
import { loadMenuThumbnail, sendFakeThumbText } from '../../src/ui/fake-thumb.js'
import { CATEGORY_ICONS, formatMenu, formatMenuCategory, formatWibDateTime, sortCategories } from '../../src/ui/format.js'

const here = dirname(fileURLToPath(import.meta.url))
const BANNER_PATH = join(here, '../../assets/menu-banner.jpg')
// Aturan library: quick_reply maksimal 10 per pesan dan tidak dicampur jenis lain.
const MAX_QUICK_REPLY = 10
// Teks tombol native flow tampil sempit di HP; jaga tetap pendek.
const MAX_BUTTON_TEXT = 25

export const config = {
  name: 'menu',
  alias: ['m'],
  category: 'main',
  description: {
    id: 'Tampilkan menu penuh gaya Elaina: semua perintah dalam satu pesan teks',
    en: 'Show the full Elaina style menu: every command in a single text message',
  },
  usage: '.menu [kategori]',
  example: '.menu download',
  cooldown: 2,
}

// Kelompokkan perintah dari registry per kategori. Dinamis, tanpa hardcode.
// Mengembalikan [{ key, icon, title, commands }] terurut ala menu.
export function collectCategories(ctx) {
  const byCategory = new Map()
  for (const plugin of ctx.registry.list()) {
    const cat = plugin.config.category ?? 'main'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat).push(plugin.config.name)
  }
  return sortCategories([...byCategory.keys()]).map((key) => {
    const rawTitle = ctx.t(`menu.cat.${key}`)
    return {
      key,
      icon: CATEGORY_ICONS[key] ?? '✦',
      title: rawTitle === `menu.cat.${key}` ? key.toUpperCase() : rawTitle,
      commands: byCategory.get(key),
    }
  })
}

function buttonText(cat) {
  const text = `${cat.icon} ${cat.title}`
  return text.length > MAX_BUTTON_TEXT ? text.slice(0, MAX_BUTTON_TEXT) : text
}

// Tombol sub-menu: kembali ke ".menu" (menu penuh) + kategori lain (total maks 10).
export function buildSubMenuButtons(categories, currentKey, { backLabel }) {
  const others = categories
    .filter((cat) => cat.key !== currentKey)
    .slice(0, MAX_QUICK_REPLY - 1)
    .map((cat) => ({ text: buttonText(cat), id: `.menu ${cat.key}` }))
  return [{ text: backLabel, id: '.menu' }, ...others]
}

export async function handler(ctx) {
  const botName = process.env.BOT_NAME || 'KANA'
  const plugins = ctx.registry.list()
  const categories = collectCategories(ctx)
  const commandCount = plugins.reduce((n, p) => n + 1 + (p.config.alias?.length ?? 0), 0)
  const userName = ctx.raw?.pushName?.trim() || ctx.t('menu.friend')
  const mode =
    (process.env.BOT_MODE || 'public').toLowerCase() === 'self' ? ctx.t('menu.modeSelf') : ctx.t('menu.modePublic')
  const title = ctx.t('menu.title')
  const footer = ctx.t('menu.footer')
  const arg = (ctx.args?.[0] || '').toLowerCase()

  // .menu <kategori>: sub-menu ringkas satu kategori, tetap SATU pesan
  // (tombol navigasi, tanpa gambar terpisah). Kategori tak dikenal: teks jelas.
  if (arg && arg !== 'all') {
    const cat = categories.find((c) => c.key === arg)
    if (!cat) {
      return ctx.reply(
        ctx.t('menu.unknownCategory', { category: arg, list: categories.map((c) => c.key).join(', ') })
      )
    }
    const body = formatMenuCategory({ category: cat, labels: { footer, subHint: ctx.t('menu.subHint') } })
    return sendButtons(ctx.sock, ctx.chat, {
      title,
      body,
      footer,
      replies: buildSubMenuButtons(categories, cat.key, { backLabel: ctx.t('menu.backButton') }),
      textFallback: body,
    })
  }

  // .menu dan .menu all: menu PENUH gaya Elaina klasik dalam SATU pesan teks
  // berisi semua perintah dari semua kategori (keputusan user 2026-11-04:
  // tidak disembunyikan di balik tombol, tidak ada pesan gambar terpisah).
  // Banner tampil sebagai thumbnail palsu (externalAdReply) yang menempel
  // pada pesan teks itu sendiri, jadi galeri HP user tidak kotor.
  const fullBody = formatMenu({
    botName,
    runtimeMs: process.uptime() * 1000,
    mode,
    pluginCount: plugins.length,
    commandCount,
    dateTime: formatWibDateTime(new Date(), ctx.lang),
    categories,
    labels: {
      greeting: ctx.t('menu.greeting', { name: userName }),
      runtime: ctx.t('menu.runtime'),
      mode: ctx.t('menu.mode'),
      plugins: ctx.t('menu.plugins'),
      commands: ctx.t('menu.commands'),
      date: ctx.t('menu.date'),
      hint: ctx.t('menu.hint'),
      closing: ctx.t('menu.closing'),
      footer,
    },
  })
  const thumbnail = await loadMenuThumbnail(BANNER_PATH)
  return sendFakeThumbText(ctx.sock, ctx.chat, fullBody, {
    quoted: ctx.raw,
    body: ctx.t('menu.cardBody', { bot: botName }),
    thumbnail,
  })
}
