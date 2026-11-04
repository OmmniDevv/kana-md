import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { getLocale } from '../src/i18n/index.js'

// Gagal (exit 1) bila kunci id dan en tidak sama, di locale inti maupun di i18n plugin.
function flatten(obj, prefix = '', out = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') flatten(v, key, out)
    else out.add(key)
  }
  return out
}

function diff(a, b) {
  return [...a].filter((k) => !b.has(k))
}

let failed = false
function check(label, idObj, enObj) {
  const idKeys = flatten(structuredClone(idObj))
  const enKeys = flatten(structuredClone(enObj))
  const missingEn = diff(idKeys, enKeys)
  const missingId = diff(enKeys, idKeys)
  if (missingEn.length || missingId.length) {
    failed = true
    console.error(`[i18n] ${label}: hilang di en: ${missingEn.join(', ') || '-'}; hilang di id: ${missingId.join(', ') || '-'}`)
  } else {
    console.log(`[i18n] ${label}: OK (${idKeys.size} kunci)`)
  }
}

check('core', getLocale('id'), getLocale('en'))

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else if (entry.name.endsWith('.js')) out.push(full)
  }
  return out
}

for (const file of await walk('plugins')) {
  try {
    const mod = await import(pathToFileURL(file).href)
    if (mod.i18n) check(file, mod.i18n.id ?? {}, mod.i18n.en ?? {})
  } catch (err) {
    console.error(`[i18n] ${file}: gagal impor, dilewati di check ini (${err.message})`)
  }
}

process.exit(failed ? 1 : 0)
