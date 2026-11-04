import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendButtons } from '../../src/ui/buttons.js'
import { CATEGORY_ICONS, formatMenu, formatWibDateTime, sortCategories } from '../../src/ui/format.js'

const here = dirname(fileURLToPath(import.meta.url))
// Batas caption gambar WhatsApp; menu yang lebih panjang dikirim terpisah.
const CAPTION_LIMIT = 1024

export const config = {
  name: 'menu',
  alias: ['m'],
  category: 'main',
  description: { id: 'Tampilkan daftar perintah', en: 'Show the command list' },
  usage: '.menu',
  example: '.menu',
  cooldown: 5,
}

export async function handler(ctx) {
  const botName = process.env.BOT_NAME || 'KANA'
  const plugins = ctx.registry.list()

  // Menu dinamis dari registry: kelompokkan nama perintah per kategori.
  const byCategory = new Map()
  for (const plugin of plugins) {
    const cat = plugin.config.category ?? 'main'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat).push(plugin.config.name)
  }
  const categories = sortCategories([...byCategory.keys()]).map((key) => {
    const rawTitle = ctx.t(`menu.cat.${key}`)
    return {
      key,
      icon: CATEGORY_ICONS[key] ?? '✦',
      title: rawTitle === `menu.cat.${key}` ? key.toUpperCase() : rawTitle,
      commands: byCategory.get(key),
    }
  })
  const commandCount = plugins.reduce((n, p) => n + 1 + (p.config.alias?.length ?? 0), 0)
  const userName = ctx.raw?.pushName?.trim() || ctx.t('menu.friend')
  const mode =
    (process.env.BOT_MODE || 'public').toLowerCase() === 'self'
      ? ctx.t('menu.modeSelf')
      : ctx.t('menu.modePublic')

  const body = formatMenu({
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
      footer: ctx.t('menu.footer'),
    },
  })

  const title = ctx.t('menu.title')
  const footer = ctx.t('menu.footer')
  const replies = ['ping', 'help', 'owner']
    .filter((name) => ctx.registry.resolve(name))
    .map((name) => ({ text: `.${name}`, id: name }))

  let image = null
  try {
    image = await readFile(join(here, '../../assets/welcome.png'))
  } catch {
    image = null
  }

  if (image && body.length <= CAPTION_LIMIT) {
    // Muat jadi caption: gambar + menu satu pesan, tombol pintas menyusul.
    await ctx.sock.sendMessage(ctx.chat, { image, caption: body }, { quoted: ctx.raw })
    await sendButtons(ctx.sock, ctx.chat, {
      title,
      body: ctx.t('menu.buttonsHint'),
      footer,
      replies,
      textFallback: ctx.t('menu.buttonsHint'),
    })
    return
  }
  if (image) {
    await ctx.sock.sendMessage(
      ctx.chat,
      { image, caption: ctx.t('menu.imageCaption', { bot: botName }) },
      { quoted: ctx.raw }
    )
  }
  await sendButtons(ctx.sock, ctx.chat, { title, body, footer, replies, textFallback: body })
}
