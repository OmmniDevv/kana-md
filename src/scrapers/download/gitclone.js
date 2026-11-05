// Scraper GitClone: unduh arsip ZIP repo GitHub publik lewat endpoint
// zipball API GitHub resmi (api.github.com/repos/<owner>/<repo>/zipball,
// mengalihkan ke codeload.github.com). Tanpa kunci untuk repo publik.
// Ditulis ulang gaya KANA dari perilaku fitur gitclone RYO-YAMADA-MD
// (audit RYO 2026-11-05); terverifikasi dari VM: zipball repo contoh
// membalas HTTP 200 dan berkas ZIP asli (magic PK).
import { assertSafeUrl, downloadBuffer, retry, withBreaker } from '../runner.js'

export function parseGithubRepoUrl(raw) {
  const text = String(raw || '').trim()
  if (!text) return null
  let url
  try {
    url = assertSafeUrl(text)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  if (host !== 'github.com' && host !== 'www.github.com') return null
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null
  const owner = parts[0]
  const repo = parts[1].replace(/\.git$/i, '')
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) return null
  return { owner, repo }
}

export function isZipBuffer(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b
}

export async function fetchRepoZip(raw, { maxBytes = 64 * 1024 * 1024 } = {}) {
  const parsed = parseGithubRepoUrl(raw)
  if (!parsed) throw new Error('Link harus URL repo GitHub, contoh: https://github.com/owner/repo')
  const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/zipball`
  return withBreaker('gitclone', () =>
    retry(async () => {
      const media = await downloadBuffer(apiUrl, {
        maxBytes,
        timeout: 120000,
        headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      })
      if (!isZipBuffer(media.buffer)) throw new Error('Balasan GitHub bukan berkas ZIP yang valid')
      return {
        buffer: media.buffer,
        size: media.buffer.length,
        contentType: media.contentType || 'application/zip',
        owner: parsed.owner,
        repo: parsed.repo,
        fileName: `${parsed.owner}-${parsed.repo}.zip`,
      }
    })
  )
}
