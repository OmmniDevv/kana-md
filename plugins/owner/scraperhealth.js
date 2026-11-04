import { sendButtons } from '../../src/ui/buttons.js'
import { breakerState } from '../../src/scrapers/runner.js'

export const config = {
  name: 'scraperhealth',
  alias: [],
  category: 'owner',
  description: { id: 'Status circuit breaker semua sumber scraper', en: 'Circuit breaker status of all scraper sources' },
  usage: '.scraperhealth',
  example: '.scraperhealth',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    scraperhealth: {
      header: 'Kesehatan Scraper\n{rows}\n{mood}',
      ok: '{source}: OK (gagal: {failures})',
      down: '{source}: DOWN (gagal: {failures})',
      btnDb: 'Statistik Storage',
      btnOwner: 'Status Bot',
    },
  },
  en: {
    scraperhealth: {
      header: 'Scraper Health\n{rows}\n{mood}',
      ok: '{source}: OK (failures: {failures})',
      down: '{source}: DOWN (failures: {failures})',
      btnDb: 'Storage Stats',
      btnOwner: 'Bot Status',
    },
  },
}

const SOURCES = [
  'spotify',
  'spotidown',
  'youtube',
  'pinterest',
  'facebook',
  'instagram',
  'tiktok',
  'tikwm',
  'komikcast',
  'dafont',
  'rudder',
]

export async function handler(ctx) {
  const now = Date.now()
  const rows = SOURCES.map((source) => {
    const state = breakerState(source)
    const key = state.openUntil > now ? 'scraperhealth.down' : 'scraperhealth.ok'
    return ctx.t(key, { source, failures: state.failures || 0 })
  })
  const body = ctx.t('scraperhealth.header', { rows: rows.join('\n'), mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('scraperhealth.btnDb'), id: '.dbstats' },
      { text: ctx.t('scraperhealth.btnOwner'), id: '.owner' },
    ],
    textFallback: body,
  })
}
