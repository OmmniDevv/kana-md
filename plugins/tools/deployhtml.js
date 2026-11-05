// Deploy file HTML jadi situs live via deploysxc.vercel.app.
// Diadaptasi dari snippet "Html Deploy" kiriman user 2026-11-05 (penulis tidak
// tercantum di file), ditulis ulang gaya KANA. Fungsi spoof IP dari snippet
// (header X-Forwarded-For dan X-Real-IP acak) SENGAJA DIBUANG TOTAL: adaptasi
// ini memakai request polos. Bila layanan menolak request polos, itu dicatat
// sebagai gangguan sumber, bukan diakali.
export const config = {
  name: "deployhtml",
  alias: [],
  category: "tools",
  description: { id: "Deploy file HTML dari media kutipan jadi situs live di deploysxc", en: "Deploy an HTML file from quoted media into a live site on deploysxc" },
  usage: ".deployhtml [nama situs] sambil membalas file HTML",
  example: ".deployhtml situsku",
  cooldown: 15,
}

export const i18n = {
  id: {
    "deployhtml": {
      hint: "╭─❏ 🚀 「 *DEPLOY HTML* 」\n┊ Balas file HTML (dokumen .html) yang mau dideploy yaa~\n┊ Nama situs bisa ditulis: *.deployhtml namasitus*\n╰━━━━━━━",
      working: "╭─❏ 🚀 「 *LAGI DEPLOY* 」\n┊ Sebentar, situs *{site}* lagi dideploy dulu yaa... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🚀 「 *DEPLOY SELESAI* 」\n┊ {detail}\n╰━━━━━━━",
      toolarge: "╭─❏ 💦 「 *FILE KEBESARAN* 」\n┊ File HTML-nya maksimal 1 MB yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *DEPLOY GAGAL* 」\n┊ Mouu, deploynya gagal: *{message}*\n┊ Layanan deploysxc lagi bermasalah, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "deployhtml": {
      hint: "╭─❏ 🚀 「 *DEPLOY HTML* 」\n┊ Reply to an HTML file (an .html document) to deploy~\n┊ You can set the site name: *.deployhtml sitename*\n╰━━━━━━━",
      working: "╭─❏ 🚀 「 *DEPLOYING* 」\n┊ One sec, deploying site *{site}*... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🚀 「 *DEPLOY DONE* 」\n┊ {detail}\n╰━━━━━━━",
      toolarge: "╭─❏ 💦 「 *FILE TOO BIG* 」\n┊ The HTML file can be at most 1 MB~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *DEPLOY FAILED* 」\n┊ Mouu, the deploy failed: *{message}*\n┊ The deploysxc service is having trouble, try again later~\n╰━━━━━━━",
    },
  },
}

const MAX_HTML_BYTES = 1024 * 1024

export async function deployHtml(siteName, buffer) {
  const form = new FormData()
  form.append('siteName', siteName)
  form.append('file', new Blob([buffer], { type: 'text/html' }), 'index.html')
  const res = await fetch('https://deploysxc.vercel.app/api/deploy', {
    method: 'POST',
    signal: AbortSignal.timeout(120000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      origin: 'https://deploysxc.vercel.app',
      referer: 'https://deploysxc.vercel.app/',
    },
    body: form,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || data?.error || 'HTTP ' + res.status)
  if (!data) throw new Error('respons bukan JSON')
  return data
}

function findUrls(obj, out = [], depth = 0) {
  if (!obj || depth > 3) return out
  if (typeof obj === 'string') { if (/^https:\/\//.test(obj)) out.push(obj); return out }
  if (typeof obj === 'object') for (const v of Object.values(obj)) findUrls(v, out, depth + 1)
  return out
}

function flat(obj, prefix = '', out = []) {
  if (obj === null || obj === undefined || out.length >= 10) return out
  if (typeof obj !== 'object') { out.push((prefix ? prefix + ': ' : '') + String(obj).slice(0, 250)); return out }
  for (const [k, v] of Object.entries(obj).slice(0, 10)) {
    if (v && typeof v === 'object') flat(v, k, out)
    else if (v !== null && v !== undefined && v !== '') out.push('*' + k + '*: ' + String(v).slice(0, 250))
    if (out.length >= 10) break
  }
  return out
}

export const test = { input: '.deployhtml', expect: /balas|reply/i }
export async function handler(ctx) {
  const doc = ctx.quoted?.message?.documentMessage
  const looksHtml = doc && ((doc.mimetype || '').includes('html') || /\.html?$/i.test(doc.fileName || ''))
  if (!looksHtml) return ctx.reply(ctx.t('deployhtml.hint'))
  let buffer
  try {
    buffer = await ctx.downloadQuoted()
  } catch (err) {
    return ctx.reply(ctx.t('deployhtml.fail', { message: err.message }))
  }
  if (!buffer) return ctx.reply(ctx.t('deployhtml.hint'))
  if (buffer.length > MAX_HTML_BYTES) return ctx.reply(ctx.t('deployhtml.toolarge'))
  const wanted = (ctx.args[0] || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40)
  const site = wanted || 'kana-' + ctx.senderDigits.slice(-6) + '-' + Math.random().toString(36).slice(2, 6)
  await ctx.reply(ctx.t('deployhtml.working', { site, mood: ctx.say('mikir') }))
  try {
    const data = await deployHtml(site, buffer)
    const urls = findUrls(data)
    const detail = [...flat(data), ...(urls.length ? ['🔗 ' + urls[0]] : [])].join('\n┊ ')
    return ctx.reply(ctx.t('deployhtml.result', { detail: detail || '-' }))
  } catch (err) {
    return ctx.reply(ctx.t('deployhtml.fail', { message: err.message }))
  }
}
