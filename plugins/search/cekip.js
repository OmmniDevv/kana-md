// Cek info alamat IP publik via ip-api.com (layanan info IP publik
// gratis tanpa kunci, pengecualian ringan seperti kurs di DECISIONS.md).
export const config = {
  name: 'cekip',
  alias: ['ipinfo', 'iplookup', 'checkip'],
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

export const test = { input: '.cekip', expect: /alamat ip|ip address/i }

export async function handler(ctx) {
  const ip = (ctx.text || '').trim().split(/\s+/)[0]
  if (!ip) return ctx.reply(ctx.t('cekip.hint'))
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,regionName,city,isp,org,timezone,query`, { signal: AbortSignal.timeout(20000) })
    const d = await res.json()
    if (d.status !== 'success') return ctx.reply(ctx.t('cekip.fail', { mood: ctx.say('gagal') }))
    return ctx.reply(ctx.t('cekip.body', {
      query: d.query, country: d.country, code: d.countryCode, region: d.regionName,
      city: d.city, isp: d.isp, org: d.org || '-', tz: d.timezone,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('cekip.error', { error: err.message }))
  }
}
