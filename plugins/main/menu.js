import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendButtons } from '../../src/ui/buttons.js'
import {
  CATEGORY_ICONS,
  formatMenu,
  formatMenuCategory,
  formatMenuHome,
  formatWibDateTime,
  sortCategories,
} from '../../src/ui/format.js'

const here = dirname(fileURLToPath(import.meta.url))
// Batas caption gambar WhatsApp; menu yang lebih panjang dikirim terpisah.
const CAPTION_LIMIT = 1024
// Aturan library: quick_reply maksimal 10 per pesan dan tidak dicampur jenis lain.
const MAX_QUICK_REPLY = 10
// Teks tombol native flow tampil sempit di HP; jaga tetap pendek.
const MAX_BUTTON_TEXT = 25

export const config = {
  name: 'menu',
  alias: ['m'],
  category: 'main',
  description: { id: 'Tampilkan menu navigasi tombol per kategori', en: 'Show the button-navigated menu per category' },
  usage: '.menu [kategori|all]',
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

// Tombol navigasi menu utama: satu quick_reply per kategori, id tombol =
// perintah ".menu <kategori>" supaya tertangkap pipeline sebagai perintah.
// Lebih dari 10 kategori: 9 kategori pertama + tombol ".menu all".
export function buildCategoryButtons(categories, { allLabel }) {
  const mk = (cat) => ({ text: buttonText(cat), id: `.menu ${cat.key}` })
  if (categories.length <= MAX_QUICK_REPLY) return categories.map(mk)
  return [...categories.slice(0, MAX_QUICK_REPLY - 1).map(mk), { text: allLabel, id: '.menu all' }]
}

// Tombol sub-menu: kembali ke ".menu" + kategori lain (total maks 10).
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
    (process.env.BOT_MODE || 'public').toLowerCase() === 'self'
      ? ctx.t('menu.modeSelf')
      : ctx.t('menu.modePublic')
  const title = ctx.t('menu.title')
  const footer = ctx.t('menu.footer')
  const baseLabels = {
    greeting: ctx.t('menu.greeting', { name: userName }),
    runtime: ctx.t('menu.runtime'),
    mode: ctx.t('menu.mode'),
    plugins: ctx.t('menu.plugins'),
    commands: ctx.t('menu.commands'),
    date: ctx.t('menu.date'),
    hint: ctx.t('menu.hint'),
    closing: ctx.t('menu.closing'),
    footer,
  }
  const shared = {
    botName,
    runtimeMs: process.uptime() * 1000,
    mode,
    pluginCount: plugins.length,
    commandCount,
    dateTime: formatWibDateTime(new Date(), ctx.lang),
    categories,
  }
  const fullBody = formatMenu({ ...shared, labels: baseLabels })
  const arg = (ctx.args?.[0] || '').toLowerCase()

  // Gambar header menu: banner resmi dari user (assets/menu-banner.jpg).
  let image = null
  try {
    image = await readFile(join(here, '../../assets/menu-banner.jpg'))
  } catch {
    image = null
  }

  // .menu <kategori>: banner + sub-menu satu kategori + tombol kembali/kategori lain.
  // Gagal kirim tombol: sendButtons mengirim teks sub-menu sebagai fallback.
  if (arg && arg !== 'all') {
    const cat = categories.find((c) => c.key === arg)
    if (!cat) {
      return ctx.reply(
        ctx.t('menu.unknownCategory', { category: arg, list: categories.map((c) => c.key).join(', ') })
      )
    }
    const body = formatMenuCategory({ category: cat, labels: { footer, subHint: ctx.t('menu.subHint') } })
    if (image) {
      await ctx.sock.sendMessage(ctx.chat, { image, caption: `${cat.icon} ${cat.title}` }, { quoted: ctx.raw })
    }
    return sendButtons(ctx.sock, ctx.chat, {
      title,
      body,
      footer,
      replies: buildSubMenuButtons(categories, cat.key, { backLabel: ctx.t('menu.backButton') }),
      textFallback: body,
    })
  }

  // .menu all: teks penuh seperti perilaku lama (fallback dan WhatsApp Web).
  if (arg === 'all') {
    const replies = ['ping', 'help', 'owner']
      .filter((name) => ctx.registry.resolve(name))
      .map((name) => ({ text: `.${name}`, id: `.${name}` }))
    if (image && fullBody.length <= CAPTION_LIMIT) {
      await ctx.sock.sendMessage(ctx.chat, { image, caption: fullBody }, { quoted: ctx.raw })
      return sendButtons(ctx.sock, ctx.chat, {
        title,
        body: ctx.t('menu.buttonsHint'),
        footer,
        replies,
        textFallback: ctx.t('menu.buttonsHint'),
      })
    }
    if (image) {
      await ctx.sock.sendMessage(
        ctx.chat,
        { image, caption: ctx.t('menu.imageCaption', { bot: botName }) },
        { quoted: ctx.raw }
      )
    }
    return sendButtons(ctx.sock, ctx.chat, { title, body: fullBody, footer, replies, textFallback: fullBody })
  }

  // .menu: gambar header + badan ringkas + tombol navigasi kategori.
  // Gagal kirim tombol: fallback teks penuh (perilaku lama).
  const homeBody = formatMenuHome({
    ...shared,
    categories: categories.map((c) => ({ ...c, count: c.commands.length })),
    labels: { ...baseLabels, categoriesTitle: ctx.t('menu.categoriesTitle'), navHint: ctx.t('menu.navHint') },
  })
  const replies = buildCategoryButtons(categories, { allLabel: ctx.t('menu.allButton') })
  if (image && homeBody.length <= CAPTION_LIMIT) {
    await ctx.sock.sendMessage(ctx.chat, { image, caption: homeBody }, { quoted: ctx.raw })
    return sendButtons(ctx.sock, ctx.chat, {
      title,
      body: ctx.t('menu.navHint'),
      footer,
      replies,
      textFallback: fullBody,
    })
  }
  if (image) {
    await ctx.sock.sendMessage(
      ctx.chat,
      { image, caption: ctx.t('menu.imageCaption', { bot: botName }) },
      { quoted: ctx.raw }
    )
  }
  return sendButtons(ctx.sock, ctx.chat, { title, body: homeBody, footer, replies, textFallback: fullBody })
}
