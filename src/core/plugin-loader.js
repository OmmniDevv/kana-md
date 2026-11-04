import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { addMessages } from '../i18n/index.js'
import { logger } from '../services/logger.js'

// Loader plugin: impor semua .js di folder plugins secara rekursif.
// Plugin wajib ekspor `config` (punya name string dan category) dan `handler` fungsi.
// Plugin yang rusak atau tidak valid dikarantina (dicatat, tidak dimuat),
// bentrok nama/alias ditolak, boot tidak pernah mati karena satu plugin.
export async function loadPlugins(dir) {
  const plugins = new Map()
  const aliases = new Map()
  const quarantined = []

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true })
    const files = []
    for (const entry of entries) {
      const full = join(current, entry.name)
      if (entry.isDirectory()) files.push(...(await walk(full)))
      else if (entry.name.endsWith('.js')) files.push(full)
    }
    return files
  }

  for (const file of await walk(dir)) {
    let mod
    try {
      mod = await import(pathToFileURL(file).href)
    } catch (err) {
      quarantined.push({ file, reason: `gagal impor: ${err.message}` })
      logger.error({ file, err: err.message }, 'plugin dikarantina')
      continue
    }
    const { config, handler } = mod
    if (!config || typeof config.name !== 'string' || typeof handler !== 'function') {
      quarantined.push({ file, reason: 'config.name atau handler tidak valid' })
      logger.error({ file }, 'plugin dikarantina: skema tidak valid')
      continue
    }
    const name = config.name.toLowerCase()
    if (plugins.has(name) || aliases.has(name)) {
      quarantined.push({ file, reason: `nama bentrok: ${name}` })
      continue
    }
    const plugin = { config: { cooldown: 3, ...config, name }, handler, file }
    plugins.set(name, plugin)
    for (const alias of config.alias ?? []) {
      const a = alias.toLowerCase()
      if (plugins.has(a) || aliases.has(a)) {
        quarantined.push({ file, reason: `alias bentrok: ${a}` })
        continue
      }
      aliases.set(a, name)
    }
    if (mod.i18n) {
      for (const [lang, messages] of Object.entries(mod.i18n)) addMessages(lang, messages)
    }
  }

  return {
    plugins,
    aliases,
    quarantined,
    resolve(command) {
      const c = command.toLowerCase()
      return plugins.get(c) ?? plugins.get(aliases.get(c))
    },
    list() {
      return [...plugins.values()]
    },
  }
}
