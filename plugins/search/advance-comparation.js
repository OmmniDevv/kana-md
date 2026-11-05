// Bandingkan dua paket npm secara langsung: versi terbaru, unduhan
// mingguan, lisensi, dan deskripsi dari registry resmi npm.
export const config = {
  name: 'advance-comparation',
  alias: ['compare', 'bandingkan', 'npmcompare'],
  category: 'search',
  description: { id: 'Bandingkan dua paket npm: versi, unduhan, lisensi', en: 'Compare two npm packages: version, downloads, license' },
  usage: '.advance-comparation <paket a> vs <paket b>',
  example: '.advance-comparation express vs fastify',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    'advance-comparation': {
      needInput: '╭─❏ ⚖️ 「 *FORMAT PERBANDINGAN* 」\n┊ ᴄᴏɴᴛᴏʜ: *.advance-comparation express vs fastify*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PAKET TIDAK KETEMU* 」\n┊ Mouu, paket *{pkg}* tidak ketemu di registry npm~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *PERBANDINGAN GAGAL* 」\n┊ Mouu, gagal bandingkan paketnya: *{message}*\n╰━━━━━━━',
      body: '╭─❏ ⚖️ 「 *{a} vs {b}* 」\n┊ 📦 *{a}*\n┊ ᴠᴇʀꜱɪ: *{av}* | ⬇️ ᴜɴᴅᴜʜ/ᴍɪɴɢɢᴜ: *{ad}*\n┊ ʟɪꜱᴇɴꜱɪ: *{al}* | {adesc}\n┊ ─────\n┊ 📦 *{b}*\n┊ ᴠᴇʀꜱɪ: *{bv}* | ⬇️ ᴜɴᴅᴜʜ/ᴍɪɴɢɢᴜ: *{bd}*\n┊ ʟɪꜱᴇɴꜱɪ: *{bl}* | {bdesc}\n┊ ─────\n┊ 🏆 ʟᴇʙɪʜ ᴘᴏᴘᴜʟᴇʀ ᴍɪɴɢɢᴜ ɪɴɪ: *{winner}*\n╰━━━━━━━',
    },
  },
  en: {
    'advance-comparation': {
      needInput: '╭─❏ ⚖️ 「 *COMPARISON FORMAT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.advance-comparation express vs fastify*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PACKAGE NOT FOUND* 」\n┊ Mouu, the package *{pkg}* was not found in the npm registry~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *COMPARISON FAILED* 」\n┊ Mouu, failed to compare the packages: *{message}*\n╰━━━━━━━',
      body: '╭─❏ ⚖️ 「 *{a} vs {b}* 」\n┊ 📦 *{a}*\n┊ ᴠᴇʀꜱɪᴏɴ: *{av}* | ⬇️ ᴅᴏᴡɴʟᴏᴀᴅꜱ/ᴡᴇᴇᴋ: *{ad}*\n┊ ʟɪᴄᴇɴꜱᴇ: *{al}* | {adesc}\n┊ ─────\n┊ 📦 *{b}*\n┊ ᴠᴇʀꜱɪᴏɴ: *{bv}* | ⬇️ ᴅᴏᴡɴʟᴏᴀᴅꜱ/ᴡᴇᴇᴋ: *{bd}*\n┊ ʟɪᴄᴇɴꜱᴇ: *{bl}* | {bdesc}\n┊ ─────\n┊ 🏆 ᴍᴏʀᴇ ᴘᴏᴘᴜʟᴀʀ ᴛʜɪꜱ ᴡᴇᴇᴋ: *{winner}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.advance-comparation express vs fastify', expect: /express|fastify/i }

// Urai dua nama paket dari teks perintah.
export function parsePair(text) {
  const src = String(text || '').trim().toLowerCase()
  const vs = src.match(/^(@?[\w./-]+)\s+(?:vs|versus)\s+(@?[\w./-]+)$/)
  if (vs) return [vs[1], vs[2]]
  const two = src.match(/^(@?[\w./-]+)\s+(@?[\w./-]+)$/)
  if (two) return [two[1], two[2]]
  return null
}

async function fetchPackage(pkg) {
  const encoded = pkg.startsWith('@') ? pkg.replace('/', '%2f') : encodeURIComponent(pkg)
  const metaRes = await fetch(`https://registry.npmjs.org/${encoded}`, {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot', accept: 'application/json' },
  })
  if (metaRes.status === 404) return null
  if (!metaRes.ok) throw new Error(`npm HTTP ${metaRes.status}`)
  const meta = await metaRes.json()
  const latest = meta['dist-tags']?.latest
  const versionInfo = latest ? meta.versions?.[latest] : null
  let downloads = 0
  try {
    const dlRes = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encoded}`, {
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'KANA-Bot', accept: 'application/json' },
    })
    if (dlRes.ok) downloads = (await dlRes.json())?.downloads ?? 0
  } catch {}
  return {
    name: meta.name || pkg,
    version: latest || '-',
    license: versionInfo?.license || meta.license || '-',
    desc: String(versionInfo?.description || meta.description || '-').slice(0, 90),
    downloads,
  }
}

export async function handler(ctx, { fetchPkg = fetchPackage } = {}) {
  const pair = parsePair(ctx.text || '')
  if (!pair) return ctx.reply(ctx.t('advance-comparation.needInput'))
  let a
  let b
  try {
    a = await fetchPkg(pair[0])
    if (!a) return ctx.reply(ctx.t('advance-comparation.notFound', { pkg: pair[0] }))
    b = await fetchPkg(pair[1])
    if (!b) return ctx.reply(ctx.t('advance-comparation.notFound', { pkg: pair[1] }))
  } catch (err) {
    return ctx.reply(ctx.t('advance-comparation.failed', { message: err.message }))
  }
  const fmt = (n) => Number(n).toLocaleString('id-ID')
  return ctx.reply(ctx.t('advance-comparation.body', {
    a: a.name, b: b.name,
    av: a.version, ad: fmt(a.downloads), al: a.license, adesc: a.desc,
    bv: b.version, bd: fmt(b.downloads), bl: b.license, bdesc: b.desc,
    winner: a.downloads === b.downloads ? 'seri' : (a.downloads > b.downloads ? a.name : b.name),
  }))
}
