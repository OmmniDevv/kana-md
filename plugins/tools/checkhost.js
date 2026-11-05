// Cek host dari beberapa lokasi dunia lewat API publik check-host.net
// (tanpa kunci). Terverifikasi dari VM 2026-11-05: pembuatan cek dan
// pengambilan hasil menjawab JSON.
// Catatan 2026-11-06: check-host.net flap dari VM (HTTP 200 lalu 403
// bergantian; kasus live .checkhost gagal 403). Handler mencoba ulang
// sekali, lalu jatuh ke cek cadangan yang terbukti dari VM: resolusi
// DNS-over-HTTPS Google + Cloudflare dan probe HTTPS langsung dari VM.
// Alternatif lain yang dicoba dan gugur: Globalping (timeout dari VM),
// HackerTarget (sekarang wajib API key), isitup.org (timeout dari VM).
export const config = {
  name: 'checkhost',
  alias: ['cekhost', 'pinghost'],
  category: 'tools',
  description: { id: 'Cek apakah host/domain bisa dijangkau dari beberapa negara', en: 'Check whether a host/domain is reachable from several countries' },
  usage: '.checkhost <domain>',
  example: '.checkhost google.com',
  cooldown: 20,
  limit: 3,
}

export const i18n = {
  id: {
    checkhost: {
      needHost: '╭─❏ 🌐 「 *KETIK DOMAINNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.checkhost google.com*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA cek hostnya dari beberapa negara... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *CEK GAGAL* 」\n┊ Mouu, cek hostnya gagal: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 🌐 「 *CHECK HOST: {host}* 」',
      okLine: '┊ ✅ {node}: *OK* ({ms} ms)',
      failLine: '┊ ❌ {node}: *gagal* ({reason})',
      summary: '┊ ʀɪɴɢᴋᴀꜱᴀɴ: *{ok}/{total} node berhasil*',
      backupNote: '┊ Sumber utama lagi menolak, ini hasil cek cadangan (DNS publik + probe dari VM)',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    checkhost: {
      needHost: '╭─❏ 🌐 「 *TYPE THE DOMAIN* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.checkhost google.com*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is checking the host from several countries... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *CHECK FAILED* 」\n┊ Mouu, the host check failed: *{message}*\n╰━━━━━━━',
      header: '╭─❏ 🌐 「 *CHECK HOST: {host}* 」',
      okLine: '┊ ✅ {node}: *OK* ({ms} ms)',
      failLine: '┊ ❌ {node}: *failed* ({reason})',
      summary: '┊ ꜱᴜᴍᴍᴀʀʏ: *{ok}/{total} nodes ok*',
      backupNote: '┊ The main source is refusing, these are backup results (public DNS + VM probe)',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.checkhost google.com', expect: /CHECK HOST: google\.com[\s\S]*node berhasil/ }

const API = 'https://check-host.net'

async function apiGet(path) {
  const res = await fetch(API + path, {
    signal: AbortSignal.timeout(20000),
    headers: { accept: 'application/json', 'user-agent': 'KANA-Bot' },
  })
  if (!res.ok) throw new Error(`check-host HTTP ${res.status}`)
  return res.json()
}

// Node yang hasilnya belum siap bernilai null di check-result; itu
// keadaan PENDING, bukan gagal. Handler wajib terus polling selama
// masih ada node pending (hasil check-host bisa butuh 15-25 detik;
// polling pendek lama membuat semua node terbaca "timeout" 0/4).
export function countPendingNodes(json) {
  return Object.values(json || {}).filter((v) => v == null).length
}

// Urai hasil mentah check-result menjadi ringkasan per node.
export function parseCheckResult(json) {
  const rows = []
  for (const [node, attempts] of Object.entries(json || {})) {
    const tries = Array.isArray(attempts?.[0]) ? attempts[0] : attempts
    const ok = Array.isArray(tries) && tries.some((t) => Array.isArray(t) && t[0] === 'OK')
    let ms = null
    let reason = 'timeout'
    if (Array.isArray(tries)) {
      for (const t of tries) {
        if (Array.isArray(t) && t[0] === 'OK' && typeof t[1] === 'number') { ms = Math.round(t[1] * 1000); break }
        if (Array.isArray(t) && typeof t[0] === 'string' && t[0] !== 'OK') reason = t[0]
      }
    }
    rows.push({ node, ok, ms, reason })
  }
  return rows
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Urai jawaban DNS-over-HTTPS: true bila ada record A/AAAA untuk host.
export function dohHasAddress(json) {
  return Array.isArray(json?.Answer) && json.Answer.some((a) => a.type === 1 || a.type === 28)
}

async function dohRow(name, url, host) {
  const started = Date.now()
  try {
    const res = await fetch(`${url}?name=${encodeURIComponent(host)}&type=A`, {
      signal: AbortSignal.timeout(12000),
      headers: { accept: 'application/dns-json', 'user-agent': 'KANA-Bot' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ok = dohHasAddress(await res.json())
    return { node: name, ok, ms: Date.now() - started, reason: ok ? 'timeout' : 'tidak ada record A' }
  } catch (err) {
    return { node: name, ok: false, ms: null, reason: err.name === 'TimeoutError' || err.name === 'AbortError' ? 'timeout' : err.message }
  }
}

// Cek cadangan bila check-host.net menolak: resolusi nama dari dua DNS
// publik independen + probe HTTPS langsung dari VM. Terbukti dari VM
// 2026-11-06 (dns.google dan cloudflare-dns.com membalas 200).
export async function fallbackProbe(host) {
  const rows = await Promise.all([
    dohRow('DNS Google', 'https://dns.google/resolve', host),
    dohRow('DNS Cloudflare', 'https://cloudflare-dns.com/dns-query', host),
  ])
  const started = Date.now()
  try {
    const res = await fetch(`https://${host}`, { signal: AbortSignal.timeout(12000), headers: { 'user-agent': 'KANA-Bot' }, redirect: 'follow' })
    await res.arrayBuffer().catch(() => {})
    rows.push({ node: 'HTTPS (VM)', ok: res.status < 500, ms: Date.now() - started, reason: `HTTP ${res.status}` })
  } catch (err) {
    rows.push({ node: 'HTTPS (VM)', ok: false, ms: null, reason: err.name === 'TimeoutError' || err.name === 'AbortError' ? 'timeout' : err.message })
  }
  return rows
}

export async function handler(ctx, { api = apiGet, delay = wait, fallback = fallbackProbe } = {}) {
  const host = (ctx.text || '').trim().split(/\s+/)[0].replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (!host || !host.includes('.')) return ctx.reply(ctx.t('checkhost.needHost'))
  await ctx.reply(ctx.t('checkhost.working', { mood: ctx.say('mikir') }))
  const render = (rows, backup) => {
    const lines = [ctx.t('checkhost.header', { host })]
    for (const row of rows) {
      lines.push(row.ok
        ? ctx.t('checkhost.okLine', { node: row.node, ms: row.ms ?? '-' })
        : ctx.t('checkhost.failLine', { node: row.node, reason: row.reason }))
    }
    lines.push(ctx.t('checkhost.summary', { ok: rows.filter((r) => r.ok).length, total: rows.length }))
    if (backup) lines.push(ctx.t('checkhost.backupNote'))
    lines.push(ctx.t('checkhost.footer'))
    return lines.join('\n')
  }
  let primaryErr = null
  try {
    let created = null
    try {
      created = await api(`/check-ping?host=${encodeURIComponent(host)}&max_nodes=4`)
    } catch (err) {
      // check-host flap: 403 sesaat sering lolos pada percobaan kedua.
      if (!/HTTP 403/.test(err.message)) throw err
      await delay(3000)
      created = await api(`/check-ping?host=${encodeURIComponent(host)}&max_nodes=4`)
    }
    const requestId = created?.request_id
    if (!requestId) throw new Error('request_id tidak diterima')
    await delay(5000)
    let raw = await api(`/check-result/${requestId}`)
    let rows = parseCheckResult(raw)
    for (let poll = 0; poll < 4 && countPendingNodes(raw) > 0; poll += 1) {
      await delay(5000)
      raw = await api(`/check-result/${requestId}`)
      rows = parseCheckResult(raw)
    }
    if (!rows.length) throw new Error('hasil kosong')
    return ctx.reply(render(rows, false))
  } catch (err) {
    primaryErr = err
  }
  try {
    const rows = await fallback(host)
    if (rows.length) return ctx.reply(render(rows, true))
  } catch {}
  return ctx.reply(ctx.t('checkhost.failed', { message: primaryErr?.message || 'hasil kosong' }))
}
