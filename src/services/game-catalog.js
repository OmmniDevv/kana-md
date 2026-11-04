// Katalog game HTML: dibaca dari folder games/ saat runtime.
// Satu game = satu folder games/<id>/ berisi index.html + meta.js
// (default export { id, title, height }). Folder tanpa meta valid
// diabaikan supaya satu game rusak tidak menjatuhkan katalog.
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const gamesDir = join(dirname(fileURLToPath(import.meta.url)), '../../games')

export async function listGames() {
  let entries
  try {
    entries = await readdir(gamesDir, { withFileTypes: true })
  } catch {
    return []
  }
  const games = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const dir = join(gamesDir, entry.name)
    try {
      const mod = await import(pathToFileURL(join(dir, 'meta.js')).href)
      const meta = mod?.default
      if (!meta || typeof meta.id !== 'string' || !meta.id || typeof meta.title !== 'string' || !meta.title) continue
      games.push({
        id: meta.id,
        title: meta.title,
        height: Number.isFinite(meta.height) ? meta.height : 360,
        dir,
        htmlPath: join(dir, 'index.html'),
      })
    } catch {
      continue
    }
  }
  return games.sort((a, b) => a.id.localeCompare(b.id))
}

export async function getGame(id) {
  if (!id) return null
  const games = await listGames()
  return games.find((g) => g.id === String(id).toLowerCase()) ?? null
}
