import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Driver lokal untuk dev: satu file JSON per namespace di .dev-data/ (gitignored).
export function createLocalStorage(baseDir = '.dev-data') {
  const cache = new Map()

  async function load(ns) {
    if (cache.has(ns)) return cache.get(ns)
    let data = {}
    try {
      data = JSON.parse(await readFile(join(baseDir, `${ns}.json`), 'utf8'))
    } catch {
      data = {}
    }
    cache.set(ns, data)
    return data
  }

  async function persist(ns) {
    await mkdir(baseDir, { recursive: true })
    await writeFile(join(baseDir, `${ns}.json`), JSON.stringify(cache.get(ns), null, 2))
  }

  return {
    driver: 'local',
    async get(ns, key) {
      const data = await load(ns)
      const entry = data[key]
      if (!entry) return undefined
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        delete data[key]
        await persist(ns)
        return undefined
      }
      return entry.value
    },
    async set(ns, key, value, ttlSeconds) {
      const data = await load(ns)
      data[key] = { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null }
      await persist(ns)
    },
    async delete(ns, key) {
      const data = await load(ns)
      delete data[key]
      await persist(ns)
    },
    async keys(ns) {
      const data = await load(ns)
      return Object.keys(data)
    },
    async close() {},
  }
}
