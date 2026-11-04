import { readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const config = {
  name: 'cleartmp',
  alias: ['bersihtemp'],
  category: 'owner',
  description: { id: 'Bersihkan folder temp kana- bekas unduhan dan konversi (owner)', en: 'Clean leftover kana- temp folders from downloads and conversions (owner)' },
  usage: '.cleartmp',
  example: '.cleartmp',
  cooldown: 10,
  isOwner: true,
}

export const i18n = {
  id: {
    cleartmp: {
      done: 'Siap, Master~ {count} folder temp dibersihkan, sekitar {kb} KB dibebaskan. {mood}',
      empty: 'Folder temp sudah bersih kok, Master. {mood}',
      fail: 'Gagal membersihkan temp, Master: {error}',
    },
  },
  en: {
    cleartmp: {
      done: 'Done, Master~ {count} temp folders cleaned, about {kb} KB freed. {mood}',
      empty: 'The temp folder is already clean, Master. {mood}',
      fail: 'Failed to clean temp, Master: {error}',
    },
  },
}

export const test = { input: '.cleartmp', expect: /temp/i }

async function dirSize(path) {
  let total = 0
  try {
    const entries = await readdir(path, { withFileTypes: true })
    for (const e of entries) {
      const full = join(path, e.name)
      if (e.isDirectory()) total += await dirSize(full)
      else {
        try { total += (await stat(full)).size } catch {}
      }
    }
  } catch {}
  return total
}

export async function handler(ctx) {
  try {
    const base = tmpdir()
    const entries = await readdir(base, { withFileTypes: true })
    const targets = entries.filter((e) => e.isDirectory() && e.name.startsWith('kana-'))
    if (!targets.length) return ctx.reply(ctx.t('cleartmp.empty', { mood: ctx.say('senang') }))
    let bytes = 0
    let count = 0
    for (const e of targets) {
      const full = join(base, e.name)
      bytes += await dirSize(full)
      await rm(full, { recursive: true, force: true })
      count += 1
    }
    return ctx.reply(ctx.t('cleartmp.done', { count, kb: Math.round(bytes / 1024), mood: ctx.say('sukses') }))
  } catch (err) {
    return ctx.reply(ctx.t('cleartmp.fail', { error: err.message }))
  }
}
