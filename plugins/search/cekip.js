// Cek info alamat IP publik via ip-api.com (layanan info IP publik
// gratis tanpa kunci, pengecualian ringan seperti kurs di DECISIONS.md).
export const config = {
  name: 'cekip',
  alias: ['ipinfo', 'checkip', 'iplookup', 'ipwho', 'ip', 'myip'],
  category: 'search',
  description: { id: 'Info lokasi dan penyedia dari alamat IP publik', en: 'Location and provider info of a public IP address' },
  usage: '.cekip <alamat ip>',
  example: '.cekip 8.8.8.8',
  cooldown: 10,
}

export const i18n = {
  id: {
    cekip: {
      hint: '╭─❏ 🌐 「 *CEK IP* 」\n┊ Tulis alamat IP-nya yaa~\n┊ Contoh: *.cekip 8.8.8.8*\n╰━━━━━━━',
      body: '╭─❏ 🌐 「 *INFO IP {query}* 」\n┊ ɴᴇɢᴀʀᴀ: *{country} ({code})*\n┊ ᴡɪʟᴀʏᴀʜ: *{region}*\n┊ ᴋᴏᴛᴀ: *{city}*\n┊ ɪꜱᴘ: *{isp}*\n┊ ᴏʀɢᴀɴɪꜱᴀꜱɪ: *{org}*\n┊ ᴢᴏɴᴀ ᴡᴀᴋᴛᴜ: *{tz}*\n╰━━━━━━━',
      fail: '╭─❏ 🔍 「 *IP TIDAK KETEMU* 」\n┊ Alamat IP itu tidak valid atau tidak ditemukan. {mood}\n╰━━━━━━━',
      error: '╭─❏ 😖 「 *GAGAL CEK IP* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    cekip: {
      hint: '╭─❏ 🌐 「 *IP CHECK* 」\n┊ Write the IP address please~\n┊ Example: *.cekip 8.8.8.8*\n╰━━━━━━━',
      body: '╭─❏ 🌐 「 *IP INFO {query}* 」\n┊ ᴄᴏᴜɴᴛʀʏ: *{country} ({code})*\n┊ ʀᴇɢɪᴏɴ: *{region}*\n┊ ᴄɪᴛʏ: *{city}*\n┊ ɪꜱᴘ: *{isp}*\n┊ ᴏʀɢᴀɴɪᴢᴀᴛɪᴏɴ: *{org}*\n┊ ᴛɪᴍᴇᴢᴏɴᴇ: *{tz}*\n╰━━━━━━━',
      fail: '╭─❏ 🔍 「 *IP NOT FOUND* 」\n┊ That IP address is not valid or not found. {mood}\n╰━━━━━━━',
      error: '╭─❏ 😖 「 *FAILED TO CHECK IP* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.cekip 8.8.8.8', expect: /INFO IP|IP INFO/ }

// Sumber data: ipwho.is (HTTPS, tanpa key). Penyedia lama ip-api.com
// tidak bisa dipakai dari VM bot: permintaannya lewat Node fetch
// menggantung sampai timeout (curl sehat, pola yang sama dengan
// cdn.jsdelivr.net), terbukti pada sapuan live P11 dan CLEANUP
// 2026-11-05. ipwho.is menjawab 200 dalam ~1 detik lewat Node fetch.
async function fetchIpInfo(ip) {
  const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`ipwho.is balas HTTP ${res.status}`)
  return res.json()
}

export async function handler(ctx, { fetchInfo = fetchIpInfo } = {}) {
  const ip = (ctx.text || '').trim().split(/\s+/)[0]
  if (!ip) return ctx.reply(ctx.t('cekip.hint'))
  try {
    const d = await fetchInfo(ip)
    if (!d || d.success === false) return ctx.reply(ctx.t('cekip.fail', { mood: ctx.say('gagal') }))
    return ctx.reply(ctx.t('cekip.body', {
      query: d.ip, country: d.country, code: d.country_code, region: d.region,
      city: d.city, isp: d.connection?.isp || '-', org: d.connection?.org || '-', tz: d.timezone?.id || '-',
    }))
  } catch (err) {
    return ctx.reply(ctx.t('cekip.error', { error: err.message }))
  }
}
