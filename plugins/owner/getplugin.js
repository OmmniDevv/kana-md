import { readFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendDocument } from '../../src/ui/media.js'

const pluginsRoot = resolve(join(dirname(fileURLToPath(import.meta.url)), '..'))

export const config = {
  name: 'getplugin',
  alias: ['getfile'],
  category: 'owner',
  description: { id: 'Kirim file source satu plugin sebagai dokumen (owner)', en: 'Send one plugin source file as a document (owner)' },
  usage: '.getplugin <path relatif plugin, misal fun/cekmood>',
  example: '.getplugin fun/cekmood',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    getplugin: {
      hint: '╭─❏ 📂 「 *AMBIL PLUGIN* 」\n┊ Sebut path pluginnya yaa, Master.\n┊ ᴄᴏɴᴛᴏʜ: *.getplugin fun/cekmood*\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GAGAL AMBIL PLUGIN* 」\n┊ Mouu, gagal ambil file plugin, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    getplugin: {
      hint: '╭─❏ 📂 「 *GET PLUGIN* 」\n┊ Mention the plugin path, Master.\n┊ ᴇxᴀᴍᴘʟᴇ: *.getplugin fun/cekmood*\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *GET PLUGIN FAILED* 」\n┊ Mouu, failed to get the plugin file, Master.\n┊ ᴇʀʀᴏʀ: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.getplugin fun/cekmood', expect: /cekmood/ }

export function resolvePluginPath(input) {
  const clean = String(input || '').trim().replace(/\.js$/, '')
  if (!clean || clean.includes('..')) return null
  const full = resolve(join(pluginsRoot, `${clean}.js`))
  if (!full.startsWith(pluginsRoot + sep)) return null
  return full
}

export async function handler(ctx) {
  const full = resolvePluginPath(ctx.text)
  if (!full) return ctx.reply(ctx.t('getplugin.hint'))
  try {
    const buffer = await readFile(full)
    const fileName = full.split(sep).slice(-2).join('-')
    return sendDocument(ctx, buffer, { fileName, mimetype: 'text/javascript' })
  } catch (err) {
    return ctx.reply(ctx.t('getplugin.fail', { error: err.message }))
  }
}
