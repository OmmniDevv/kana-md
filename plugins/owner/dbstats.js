import { sendButtons } from '../../src/ui/buttons.js'
import { smallCaps } from '../../src/config/templates.js'

export const config = {
  name: 'dbstats',
  alias: ['statserver'],
  category: 'owner',
  description: { id: 'Statistik storage per namespace', en: 'Storage statistics per namespace' },
  usage: '.dbstats',
  example: '.dbstats',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    dbstats: {
      header: '╭─❏ 🗄️ 「 *STATISTIK STORAGE* 」\n┊ ᴅʀɪᴠᴇʀ: *{driver}*\n{rows}\n╰━━━━━━━ {mood}',
      error: 'error',
      btnOwner: 'Status Bot',
      btnHealth: 'Scraper Health',
    },
  },
  en: {
    dbstats: {
      header: '╭─❏ 🗄️ 「 *STORAGE STATISTICS* 」\n┊ ᴅʀɪᴠᴇʀ: *{driver}*\n{rows}\n╰━━━━━━━ {mood}',
      error: 'error',
      btnOwner: 'Bot Status',
      btnHealth: 'Scraper Health',
    },
  },
}

const NAMESPACES = ['users', 'groups', 'settings', 'kv', 'scores', 'quiz']

export const test = { input: '.dbstats', expect: /storage/i }

export async function handler(ctx) {
  const rows = []
  for (const ns of NAMESPACES) {
    try {
      const keys = await ctx.storage.keys(ns)
      rows.push(`┊ ${smallCaps(ns)}: *${keys.length}*`)
    } catch {
      rows.push(`┊ ${smallCaps(ns)}: *${ctx.t('dbstats.error')}*`)
    }
  }
  const body = ctx.t('dbstats.header', {
    driver: ctx.storage.driver ?? 'unknown',
    rows: rows.join('\n'),
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('dbstats.btnOwner'), id: '.owner' },
      { text: ctx.t('dbstats.btnHealth'), id: '.scraperhealth' },
    ],
    textFallback: body,
  })
}
