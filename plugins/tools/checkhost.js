// Cek host dari beberapa lokasi dunia lewat API publik check-host.net
// (tanpa kunci). Terverifikasi dari VM 2026-11-05: pembuatan cek dan
// pengambilan hasil menjawab JSON.
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
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.checkhost google.com', expect: /CHECK HOST|google/ }

const API = 'https://check-host.net'

async function apiGet(path) {
  const res = await fetch(API + path, {
    signal: AbortSignal.timeout(20000),
    headers: { accept: 'application/json', 'user-agent': 'KANA-Bot' },
  })
  if (!res.ok) throw new Error(`check-host HTTP ${res.status}`)
  return res.json()
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

export async function handler(ctx, { api = apiGet, delay = wait } = {}) {
  const host = (ctx.text || '').trim().split(/\s+/)[0].replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (!host || !host.includes('.')) return ctx.reply(ctx.t('checkhost.needHost'))
  await ctx.reply(ctx.t('checkhost.working', { mood: ctx.say('mikir') }))
  try {
    const created = await api(`/check-ping?host=${encodeURIComponent(host)}&max_nodes=4`)
    const requestId = created?.request_id
    if (!requestId) throw new Error('request_id tidak diterima')
    await delay(5000)
    let rows = parseCheckResult(await api(`/check-result/${requestId}`))
    if (!rows.some((r) => r.ok)) {
      await delay(5000)
      rows = parseCheckResult(await api(`/check-result/${requestId}`))
    }
    if (!rows.length) throw new Error('hasil kosong')
    const lines = [ctx.t('checkhost.header', { host })]
    for (const row of rows) {
      lines.push(row.ok
        ? ctx.t('checkhost.okLine', { node: row.node, ms: row.ms ?? '-' })
        : ctx.t('checkhost.failLine', { node: row.node, reason: row.reason }))
    }
    lines.push(ctx.t('checkhost.summary', { ok: rows.filter((r) => r.ok).length, total: rows.length }))
    lines.push(ctx.t('checkhost.footer'))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('checkhost.failed', { message: err.message }))
  }
}
