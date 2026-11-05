// Lookup DNS publik via Cloudflare DNS-over-HTTPS (JSON API publik).
const TYPES = { a: 1, aaaa: 28, mx: 15, txt: 16, cname: 5, ns: 2, soa: 6 }

export const config = {
  name: 'dnslookup',
  alias: ['dns', 'cekdomain', 'lookup'],
  category: 'search',
  description: { id: 'Cek record DNS sebuah domain lewat Cloudflare DoH', en: 'Look up DNS records of a domain via Cloudflare DoH' },
  usage: '.dnslookup <domain> [tipe]',
  example: '.dnslookup google.com MX',
  cooldown: 10,
}

export const i18n = {
  id: {
    dnslookup: {
      hint: '╭─❏ 🌐 「 *DNS LOOKUP* 」\n┊ Tulis domainnya yaa~\n┊ Contoh: *.dnslookup google.com MX*\n╰━━━━━━━',
      head: '╭─❏ 🌐 「 *DNS {name} ({type})* 」',
      none: '╭─❏ 🔍 「 *RECORD TIDAK ADA* 」\n┊ Tidak ada record *{type}* untuk *{name}*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *LOOKUP GAGAL* 」\n┊ Gagal lookup DNS: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    dnslookup: {
      hint: '╭─❏ 🌐 「 *DNS LOOKUP* 」\n┊ Write the domain please~\n┊ Example: *.dnslookup google.com MX*\n╰━━━━━━━',
      head: '╭─❏ 🌐 「 *DNS {name} ({type})* 」',
      none: '╭─❏ 🔍 「 *NO RECORDS* 」\n┊ No *{type}* records for *{name}*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *LOOKUP FAILED* 」\n┊ DNS lookup failed: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.dnslookup google.com', expect: /.+/ }

export async function handler(ctx) {
  const args = (ctx.text || '').trim().split(/\s+/).filter(Boolean)
  if (!args.length) return ctx.reply(ctx.t('dnslookup.hint'))
  const name = args[0].replace(/^https?:\/\//, '').split('/')[0]
  const typeName = (args[1] || 'A').toUpperCase()
  const type = TYPES[typeName.toLowerCase()] ?? 1
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { accept: 'application/dns-json' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const d = await res.json()
    const answers = (d.Answer ?? []).map((a) => a.data)
    if (!answers.length) return ctx.reply(ctx.t('dnslookup.none', { type: typeName, name, mood: ctx.say('gagal') }))
    return ctx.reply(`${ctx.t('dnslookup.head', { name, type: typeName })}\n${answers.map((a) => `┊ ${a}`).join('\n')}\n╰━━━━━━━`)
  } catch (err) {
    return ctx.reply(ctx.t('dnslookup.fail', { error: err.message }))
  }
}
