import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const PLUGINS_DIR = join(here, '..')

export const config = {
  name: 'grepplugin',
  alias: [],
  category: 'owner',
  description: { id: 'Cari teks di dalam isi kode semua plugin (grep beneran, bukan cuma nama)', en: 'Search text inside the source code of all plugins (a real grep, not just names)' },
  usage: '.grepplugin <teks>',
  example: '.grepplugin relayMessage',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    grepplugin: {
      header: '╭─❏ 🔍 「 *GREP PLUGIN: {query}* 」\n┊ Dipindai *{scanned} berkas*, ketemu *{total} kecocokan* di *{files} berkas*:',
      row: '┊ *{file}* ({count}x) · {snippet}',
      more: '┊ …dan {rest} berkas lainnya',
      footer: '╰━━━━━━━',
      none: '╭─❏ 🔍 「 *GREP PLUGIN: {query}* 」\n┊ Tidak ada kecocokan di *{scanned} berkas* plugin~\n╰━━━━━━━',
      usage: '╭─❏ 🔍 「 *GREPPLUGIN* 」\n┊ Format: *.grepplugin <teks>*\n┊ Contoh: *.grepplugin relayMessage*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    grepplugin: {
      header: '╭─❏ 🔍 「 *PLUGIN GREP: {query}* 」\n┊ Scanned *{scanned} files*, found *{total} matches* in *{files} files*:',
      row: '┊ *{file}* ({count}x) · {snippet}',
      more: '┊ …and {rest} more files',
      footer: '╰━━━━━━━',
      none: '╭─❏ 🔍 「 *PLUGIN GREP: {query}* 」\n┊ No matches in *{scanned} plugin files*~\n╰━━━━━━━',
      usage: '╭─❏ 🔍 「 *GREPPLUGIN* 」\n┊ Format: *.grepplugin <text>*\n┊ Example: *.grepplugin relayMessage*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.grepplugin relayMessage', expect: /relayMessage/i }

const MAX_ROWS = 15

async function collectJsFiles(dir) {
  const out = []
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry)
    const info = await stat(full).catch(() => null)
    if (!info) continue
    if (info.isDirectory()) out.push(...(await collectJsFiles(full)))
    else if (entry.endsWith('.js')) out.push(full)
  }
  return out
}

// Grep substring case-insensitive ke semua berkas plugin.
// Mengembalikan { scanned, total, hits: [{ file, count, snippet }] }.
export async function grepPlugins(query, dir = PLUGINS_DIR) {
  const needle = String(query || '').toLowerCase()
  const files = await collectJsFiles(dir)
  const hits = []
  let total = 0
  for (const file of files) {
    let content = ''
    try {
      content = await readFile(file, 'utf8')
    } catch {
      continue
    }
    const lower = content.toLowerCase()
    let count = 0
    let idx = lower.indexOf(needle)
    let firstLine = ''
    while (idx !== -1) {
      count += 1
      if (!firstLine) {
        const start = content.lastIndexOf('\n', idx) + 1
        const end = content.indexOf('\n', idx)
        firstLine = content.slice(start, end === -1 ? undefined : end).trim().slice(0, 80)
      }
      idx = lower.indexOf(needle, idx + needle.length)
    }
    if (count) {
      total += count
      hits.push({ file: relative(PLUGINS_DIR, file), count, snippet: firstLine })
    }
  }
  hits.sort((a, b) => b.count - a.count)
  return { scanned: files.length, total, hits }
}

export async function handler(ctx) {
  const query = (ctx.text || '').trim()
  if (!query) return ctx.reply(ctx.t('grepplugin.usage'))
  try {
    const { scanned, total, hits } = await grepPlugins(query)
    if (!hits.length) return ctx.reply(ctx.t('grepplugin.none', { query, scanned }))
    const lines = [ctx.t('grepplugin.header', { query, scanned, total, files: hits.length })]
    for (const hit of hits.slice(0, MAX_ROWS)) {
      lines.push(ctx.t('grepplugin.row', { file: hit.file, count: hit.count, snippet: hit.snippet }))
    }
    if (hits.length > MAX_ROWS) lines.push(ctx.t('grepplugin.more', { rest: hits.length - MAX_ROWS }))
    lines.push(ctx.t('grepplugin.footer'))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('grepplugin.fail', { error: err.message }))
  }
}
