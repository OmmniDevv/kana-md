import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MB } from '@rexxhayanasi/elaina-baileys'
import { logger } from '../../src/services/logger.js'
import {
  buildFakeContactQuoted,
  buildFakeTroliQuoted,
  loadMenuBanner,
  loadMenuThumbnail,
  sendQuotedText,
} from '../../src/ui/fake-thumb.js'
import { withButtonEmoji } from '../../src/config/templates.js'
import {
  CATEGORY_ICONS,
  formatMenu,
  formatMenuCategory,
  formatRuntime,
  formatWibClock,
  formatWibDate,
  formatWibDateTime,
  sortCategories,
} from '../../src/ui/format.js'

const here = dirname(fileURLToPath(import.meta.url))
const BANNER_PATH = join(here, '../../assets/menu-banner.jpg')
const REPO_URL = 'https://github.com/OmmniDevv/kana-md'

export const config = {
  name: 'menu',
  alias: ['m'],
  category: 'main',
  description: {
    id: 'Tampilkan menu Cantarella KANA dengan tombol kategori dan fake troli',
    en: 'Show the KANA Cantarella menu with category buttons and a fake troli quote',
  },
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

// Kategori owner hanya tampil untuk owner, mengikuti SC Elaina-MD owner.
export function visibleCategories(categories, isOwner) {
  return categories.filter((cat) => isOwner || cat.key !== 'owner')
}

function senderJid(ctx) {
  return ctx.sender || ctx.raw?.key?.participant || ctx.raw?.key?.remoteJid || ctx.chat
}

function senderNumber(ctx) {
  return String(ctx.senderDigits || senderJid(ctx) || '').replace(/\D/g, '')
}

function botNumber(ctx) {
  return String(process.env.BOT_NUMBER || ctx.botJid || ctx.sock?.user?.id || '').replace(/\D/g, '')
}

function countCommands(plugins) {
  return plugins.reduce((n, p) => n + 1 + (p.config.alias?.length ?? 0), 0)
}

async function reactLoading(ctx) {
  const key = ctx.raw?.key
  if (!key || typeof ctx.sock?.sendMessage !== 'function') return
  try {
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '⏳', key } })
  } catch {}
}

// Badan menu utama meniru blok info SC Elaina-MD owner, dengan persona KANA.
export function buildMainMenuBody(ctx, { botName, ownerName, commandCount }) {
  const now = new Date()
  const memoryMb = (process.memoryUsage().rss / 1048576).toFixed(1)
  return [
    ctx.t('menu.mainGreeting', { number: senderNumber(ctx) }),
    ctx.t('menu.meet'),
    '',
    `┌ ${ctx.t('menu.botInfo')}`,
    `│ ${ctx.t('menu.nameLabel')} : ${botName}`,
    `│ ${ctx.t('menu.ownerLabel')} : ${ownerName}`,
    `│ ${ctx.t('menu.uptime')} : ${formatRuntime(process.uptime() * 1000)}`,
    `│ ${ctx.t('menu.memory')} : ${memoryMb} MB`,
    `│ ${ctx.t('menu.totalCommandsLabel')} : ${commandCount} ${ctx.t('menu.commands')}`,
    '└',
    '┌',
    `│ ${ctx.t('menu.time')} : ${formatWibClock(now, ctx.lang)} WIB`,
    `│ ${ctx.t('menu.date')} : ${formatWibDate(now, ctx.lang)}`,
    '└',
    '',
    ctx.t('menu.repoPrompt'),
    REPO_URL,
    ctx.t('menu.wiseUse'),
  ].join('\n')
}

function buildFallbackBody(ctx, { body, categories }) {
  const lines = categories.map((cat) => `• *.menu ${cat.key}*`)
  return [
    body,
    '',
    `*${ctx.t('menu.categoryListTitle')}:*`,
    ...lines,
    '',
    ctx.t('menu.fallbackHint', { all: '.menu all' }),
  ].join('\n')
}

async function sendCategory(ctx, { categories, commandCount, botName }) {
  const arg = (ctx.args?.[0] || '').toLowerCase()
  const requested = categories.find((c) => c.key === arg)
  if (requested?.key === 'owner' && !ctx.isOwner) {
    return ctx.reply(ctx.t('menu.ownerCategoryOnly'))
  }
  if (!requested) {
    const visible = visibleCategories(categories, ctx.isOwner)
    return ctx.reply(
      ctx.t('menu.unknownCategory', { category: arg, list: visible.map((c) => c.key).join(', ') })
    )
  }

  const body = formatMenuCategory({
    category: requested,
    labels: { footer: ctx.t('menu.footer'), subHint: ctx.t('menu.subHint') },
  })
  const thumbnail = await loadMenuThumbnail(BANNER_PATH)
  const quoted = buildFakeTroliQuoted({
    botName,
    botNumber: botNumber(ctx),
    itemCount: commandCount,
    thumbnail,
  })
  return sendQuotedText(ctx.sock, ctx.chat, body, {
    quoted,
    contextInfo: {
      mentionedJid: [senderJid(ctx)],
      forwardingScore: 9,
      isForwarded: true,
    },
  })
}

async function sendAll(ctx, { categories, plugins, commandCount, botName }) {
  const userName = ctx.raw?.pushName?.trim() || ctx.t('menu.friend')
  const mode =
    (process.env.BOT_MODE || 'public').toLowerCase() === 'self' ? ctx.t('menu.modeSelf') : ctx.t('menu.modePublic')
  const visible = visibleCategories(categories, ctx.isOwner)
  const body = formatMenu({
    botName,
    runtimeMs: process.uptime() * 1000,
    mode,
    pluginCount: plugins.length,
    commandCount,
    dateTime: formatWibDateTime(new Date(), ctx.lang),
    categories: visible,
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
  const thumbnail = await loadMenuThumbnail(BANNER_PATH)
  const quoted = buildFakeTroliQuoted({
    botName,
    botNumber: botNumber(ctx),
    itemCount: commandCount,
    thumbnail,
  })
  return sendQuotedText(ctx.sock, ctx.chat, body, {
    quoted,
    contextInfo: {
      mentionedJid: [senderJid(ctx)],
      forwardingScore: 9,
      isForwarded: true,
    },
  })
}

async function sendMain(ctx, { categories, commandCount, botName, ownerName }) {
  await reactLoading(ctx)
  const visible = visibleCategories(categories, ctx.isOwner)
  const body = buildMainMenuBody(ctx, { botName, ownerName, commandCount })
  const banner = await loadMenuBanner(BANNER_PATH)
  const contextInfo = {
    mentionedJid: [senderJid(ctx)],
    forwardingScore: 999,
    isForwarded: true,
  }
  const quoted = buildFakeContactQuoted({ botName })

  try {
    const builder = new MB.Button(ctx.sock)
    builder.setTitle(botName)
    builder.setBody(body)
    builder.setFooter(ctx.t('menu.footer'))
    if (banner) builder.setImage(banner)
    builder.setContextInfo({ ...contextInfo, mentionedJid: [...contextInfo.mentionedJid] })
    builder.setParams({
      limited_time_offer: {
        text: ctx.t('menu.offerText', { bot: botName }),
        url: REPO_URL,
        copy_code: botName,
        expiration_time: Date.now() * 999,
      },
      bottom_sheet: {
        in_thread_buttons_limit: 2,
        divider_indices: [2, 3, 4, 5, 6, 999],
        list_title: ctx.t('menu.listTitle'),
        button_title: ctx.t('menu.listButton'),
      },
    })

    builder.addButton('single_select', { has_multiple_buttons: true })
    builder.addSelection(ctx.t('menu.selectionTitle'), { has_multiple_buttons: true })
    builder.makeSection(ctx.t('menu.sectionTitle'), botName)
    for (const cat of visible) {
      builder.makeRow(
        `${cat.icon} ${cat.title}`,
        ctx.t('menu.rowTitle', { category: cat.title }),
        ctx.t('menu.rowDescription', {
          count: cat.commands.length,
          examples: cat.commands.slice(0, 3).join(', '),
        }),
        `.menu ${cat.key}`
      )
    }
    builder.addUrl(withButtonEmoji(ctx.t('menu.repoButton'), 'link'), REPO_URL)
    builder.addCopy(withButtonEmoji(ctx.t('menu.copyButton'), 'copy'), botName)
    builder.addReply(withButtonEmoji(ctx.t('menu.allCommandsButton'), '.menu all'), '.menu all')
    builder.addReply(withButtonEmoji(ctx.t('menu.botStatusButton'), '.ping'), '.ping')
    if (ctx.isOwner) builder.addReply(withButtonEmoji(ctx.t('menu.ownerPanelButton'), '.menu owner'), '.menu owner')

    return await builder.send(ctx.chat, { quoted })
  } catch (err) {
    logger.warn({ err: err.message }, 'MB.Button menu gagal, fallback ke teks menu')
    const fallbackBody = buildFallbackBody(ctx, { body, categories: visible })
    const content = banner
      ? { image: banner, caption: fallbackBody, contextInfo }
      : { text: fallbackBody, contextInfo }
    return ctx.sock.sendMessage(ctx.chat, content, { quoted })
  }
}

export const test = { input: '.menu', expect: /KANA/i }

export async function handler(ctx) {
  const botName = process.env.BOT_NAME || 'KANA'
  const ownerName = process.env.OWNER_NAME || 'OmniDevv'
  const plugins = ctx.registry.list()
  const categories = collectCategories(ctx)
  const commandCount = countCommands(plugins)
  const arg = (ctx.args?.[0] || '').toLowerCase()

  if (arg === 'all') return sendAll(ctx, { categories, plugins, commandCount, botName })
  if (arg) return sendCategory(ctx, { categories, commandCount, botName })
  return sendMain(ctx, { categories, commandCount, botName, ownerName })
}
