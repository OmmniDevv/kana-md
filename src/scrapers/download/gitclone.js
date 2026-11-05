// Scraper GitClone: unduh arsip ZIP repo GitHub publik. Tanpa kunci untuk
// repo publik. Ditulis ulang gaya KANA dari perilaku fitur gitclone
// RYO-YAMADA-MD (audit RYO 2026-11-05).
//
// Urutan jalur (perbaikan 2026-11-06, kasus .gitclone octocat/Hello-World
// gagal HTTP 403): zipball api.github.com tunduk pada kuota API tanpa
// autentikasi (60/jam per IP) dan membalas 403 saat kuota habis, sedangkan
// codeload.github.com tidak memakai kuota itu. Karena itu codeload jadi
// jalur utama: ref HEAD diresolusi server codeload ke branch default.
// Cadangan berikutnya zipball API, lalu codeload branch default dari API
// repo. Semua jalur terverifikasi dari VM membalas ZIP asli (magic PK).
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

// Kandidat URL arsip secara berurutan. defaultBranch hanya diketahui
// sesudah API repo dipanggil, jadi kandidat ketiga disusun terpisah.
export function repoZipCandidates({ owner, repo }, defaultBranch = '') {
  const list = [
    `https://codeload.github.com/${owner}/${repo}/zip/HEAD`,
    `https://api.github.com/repos/${owner}/${repo}/zipball`,
  ]
  const branch = String(defaultBranch || '').trim()
  if (branch) list.push(`https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${encodeURIComponent(branch)}`)
  return list
}

async function fetchDefaultBranch({ owner, repo }) {
  const media = await downloadBuffer(`https://api.github.com/repos/${owner}/${repo}`, {
    maxBytes: 1024 * 1024,
    timeout: 30000,
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  })
  const info = JSON.parse(media.buffer.toString('utf8'))
  return typeof info?.default_branch === 'string' ? info.default_branch : ''
}

async function downloadZipFrom(url, maxBytes) {
  const media = await downloadBuffer(url, {
    maxBytes,
    timeout: 120000,
    headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  })
  if (!isZipBuffer(media.buffer)) throw new Error('Balasan GitHub bukan berkas ZIP yang valid')
  return media
}

export async function fetchRepoZip(raw, { maxBytes = 64 * 1024 * 1024 } = {}) {
  const parsed = parseGithubRepoUrl(raw)
  if (!parsed) throw new Error('Link harus URL repo GitHub, contoh: https://github.com/owner/repo')
  return withBreaker('gitclone', () =>
    retry(async () => {
      const urls = repoZipCandidates(parsed)
      let lastError = null
      for (let i = 0; i < urls.length; i++) {
        try {
          const media = await downloadZipFrom(urls[i], maxBytes)
          return {
            buffer: media.buffer,
            size: media.buffer.length,
            contentType: media.contentType || 'application/zip',
            owner: parsed.owner,
            repo: parsed.repo,
            fileName: `${parsed.owner}-${parsed.repo}.zip`,
          }
        } catch (err) {
          if (err.code === 'TOO_BIG') throw err
          lastError = err
          // Kedua jalur pertama gagal: cari nama branch default dari API
          // repo untuk kandidat codeload per branch sebelum menyerah.
          if (i === urls.length - 1) {
            try {
              const branch = await fetchDefaultBranch(parsed)
              if (branch) urls.push(...repoZipCandidates(parsed, branch).slice(2))
            } catch (branchErr) {
              lastError = branchErr
            }
          }
        }
      }
      throw lastError ?? new Error('Semua jalur unduh arsip GitHub gagal')
    })
  )
}
