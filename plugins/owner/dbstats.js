import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'dbstats',
  alias: [],
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
      header: 'Statistik Storage KANA\nDriver: {driver}\n{rows}\n{mood}',
      error: 'error',
      btnOwner: 'Status Bot',
      btnHealth: 'Scraper Health',
    },
  },
  en: {
    dbstats: {
      header: 'KANA Storage Statistics\nDriver: {driver}\n{rows}\n{mood}',
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
      rows.push(`${ns}: ${keys.length}`)
    } catch {
      rows.push(`${ns}: ${ctx.t('dbstats.error')}`)
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
