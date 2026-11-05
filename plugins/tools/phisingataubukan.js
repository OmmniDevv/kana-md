// Cek apakah sebuah URL termasuk daftar phishing publik OpenPhish
// (openphish.com feed komunitas) plus heuristik lokal. Hasil AMAN
// berarti tidak ditemukan di daftar dan tidak mencurigakan, bukan
// jaminan mutlak.
export const config = {
  name: 'phisingataubukan',
  alias: ['cekphishing', 'cekphising', 'phishingcheck'],
  category: 'tools',
  description: { id: 'Cek apakah URL termasuk phishing (daftar OpenPhish + heuristik)', en: 'Check whether a URL is phishing (OpenPhish list + heuristics)' },
  usage: '.phisingataubukan <url>',
  example: '.phisingataubukan https://google.com',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    phisingataubukan: {
      needUrl: '╭─❏ 🛡️ 「 *KIRIM URL-NYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.phisingataubukan https://google.com*\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *CEK GAGAL* 」\n┊ Mouu, ceknya gagal: *{message}*\n╰━━━━━━━',
      bad: '╭─❏ 🚨 「 *TERDETEKSI PHISHING* 」\n┊ ᴜʀʟ: {url}\n┊ ᴀʟᴀꜱᴀɴ: *{reasons}*\n┊ ᴊᴀɴɢᴀɴ ᴅɪʙᴜᴋᴀ, ᴊᴀɴɢᴀɴ ɪꜱɪ ᴅᴀᴛᴀ ᴀᴘᴀ ᴘᴜɴ ᴅɪ ꜱᴀɴᴀ.\n╰━━━━━━━',
      warn: '╭─❏ ⚠️ 「 *MENCURIGAKAN* 」\n┊ ᴜʀʟ: {url}\n┊ ᴛᴀɴᴅᴀ: *{reasons}*\n┊ ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴅɪ ᴅᴀꜰᴛᴀʀ ᴏᴘᴇɴᴘʜɪꜱʜ, ᴛᴀᴘɪ ᴛᴇᴛᴀᴘ ʜᴀᴛɪ ʜᴀᴛɪ ʏᴀ~\n╰━━━━━━━',
      safe: '╭─❏ ✅ 「 *TIDAK TERDETEKSI PHISHING* 」\n┊ ᴜʀʟ: {url}\n┊ ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴅɪ ᴅᴀꜰᴛᴀʀ ᴏᴘᴇɴᴘʜɪꜱʜ ᴅᴀɴ ʟᴏʟᴏꜱ ʜᴇᴜʀɪꜱᴛɪᴋ ᴋᴀɴᴀ.\n┊ ɪɴɪ ʙᴜᴋᴀɴ ᴊᴀᴍɪɴᴀɴ ᴍᴜᴛʟᴀᴋ; ᴛᴇᴛᴀᴘ ᴄᴇᴋ ᴅᴏᴍᴀɪɴ ʀᴇꜱᴍɪɴʏᴀ ʏᴀ~\n╰━━━━━━━',
    },
  },
  en: {
    phisingataubukan: {
      needUrl: '╭─❏ 🛡️ 「 *SEND THE URL* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.phisingataubukan https://google.com*\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *CHECK FAILED* 」\n┊ Mouu, the check failed: *{message}*\n╰━━━━━━━',
      bad: '╭─❏ 🚨 「 *PHISHING DETECTED* 」\n┊ ᴜʀʟ: {url}\n┊ ʀᴇᴀꜱᴏɴ: *{reasons}*\n┊ ᴅᴏ ɴᴏᴛ ᴏᴘᴇɴ ɪᴛ ᴀɴᴅ ɴᴇᴠᴇʀ ᴇɴᴛᴇʀ ᴀɴʏ ᴅᴀᴛᴀ ᴛʜᴇʀᴇ.\n╰━━━━━━━',
      warn: '╭─❏ ⚠️ 「 *SUSPICIOUS* 」\n┊ ᴜʀʟ: {url}\n┊ ꜱɪɢɴꜱ: *{reasons}*\n┊ ɴᴏᴛ ᴏɴ ᴛʜᴇ ᴏᴘᴇɴᴘʜɪꜱʜ ʟɪꜱᴛ, ʙᴜᴛ ꜱᴛɪʟʟ ʙᴇ ᴄᴀʀᴇꜰᴜʟ~\n╰━━━━━━━',
      safe: '╭─❏ ✅ 「 *NO PHISHING DETECTED* 」\n┊ ᴜʀʟ: {url}\n┊ ɴᴏᴛ ᴏɴ ᴛʜᴇ ᴏᴘᴇɴᴘʜɪꜱʜ ʟɪꜱᴛ ᴀɴᴅ ᴘᴀꜱꜱᴇᴅ ᴋᴀɴᴀ ʜᴇᴜʀɪꜱᴛɪᴄꜱ.\n┊ ɴᴏᴛ ᴀɴ ᴀʙꜱᴏʟᴜᴛᴇ ɢᴜᴀʀᴀɴᴛᴇᴇ; ꜱᴛɪʟʟ ᴠᴇʀɪꜰʏ ᴛʜᴇ ᴏꜰꜰɪᴄɪᴀʟ ᴅᴏᴍᴀɪɴ~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.phisingataubukan https://google.com', expect: /PHISHING|AMAN|TERDETEKSI/ }

// Heuristik lokal atas URL.
export function heuristicFlags(input) {
  let url
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : 'https://' + input)
  } catch { return null }
  const flags = []
  const host = url.hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) flags.push('host berupa alamat IP')
  if (host.startsWith('xn--') || host.split('.').some((p) => p.startsWith('xn--'))) flags.push('domain punycode')
  if ((host.match(/-/g) || []).length >= 4) flags.push('banyak tanda hubung di domain')
  if (host.split('.').length >= 5) flags.push('subdomain sangat dalam')
  if (/\.(zip|mov|top|click|xyz|rest|gq|tk|ml|cf)$/i.test(host)) flags.push('TLD sering dipakai phishing')
  if (/@/.test(input)) flags.push('ada karakter @ yang bisa menyamarkan host asli')
  if (/(login|verify|secure|account|update|wallet|bonus|klaim|hadiah)/i.test(url.pathname) && flags.length) {
    flags.push('jalur berbau kredensial/hadiah')
  }
  return { url, host, flags }
}

let feedCache = { at: 0, set: new Set() }
async function fetchFeed() {
  if (Date.now() - feedCache.at < 10 * 60 * 1000 && feedCache.set.size) return feedCache.set
  const res = await fetch('https://openphish.com/feed.txt', {
    signal: AbortSignal.timeout(20000),
    headers: { 'user-agent': 'KANA-Bot' },
  })
  if (!res.ok) throw new Error(`OpenPhish HTTP ${res.status}`)
  const text = await res.text()
  const set = new Set(text.split('\n').map((s) => s.trim().toLowerCase()).filter(Boolean))
  feedCache = { at: Date.now(), set }
  return set
}

export async function handler(ctx, { feed = fetchFeed } = {}) {
  const input = (ctx.text || '').trim().split(/\s+/)[0]
  if (!input || !input.includes('.')) return ctx.reply(ctx.t('phisingataubukan.needUrl'))
  const check = heuristicFlags(input)
  if (!check) return ctx.reply(ctx.t('phisingataubukan.needUrl'))
  let listed = false
  try {
    const set = await feed()
    const normalized = check.url.href.toLowerCase()
    const variants = [normalized, normalized.replace(/\/$/, ''), normalized + '/', normalized.replace('https://', 'http://')]
    listed = variants.some((v) => set.has(v))
  } catch (err) {
    return ctx.reply(ctx.t('phisingataubukan.failed', { message: err.message }))
  }
  if (listed) {
    return ctx.reply(ctx.t('phisingataubukan.bad', { url: check.url.href, reasons: 'terdaftar di daftar phishing OpenPhish' }))
  }
  if (check.flags.length >= 2) {
    return ctx.reply(ctx.t('phisingataubukan.warn', { url: check.url.href, reasons: check.flags.join(', ') }))
  }
  return ctx.reply(ctx.t('phisingataubukan.safe', { url: check.url.href }))
}
