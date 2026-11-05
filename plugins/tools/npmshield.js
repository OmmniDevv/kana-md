export const config = {
  name: 'npmshield',
  alias: [],
  category: 'tools',
  description: { id: 'Info badge dan statistik paket npm dari registry npm + shields.io: versi terbaru, lisensi, unduhan mingguan', en: 'npm package badge and stats from the npm registry + shields.io: latest version, license, weekly downloads' },
  usage: '.npmshield <nama paket>',
  example: '.npmshield express',
  cooldown: 8,
}

export const i18n = {
  id: {
    npmshield: {
      hint: '╭─❏ 🛡️ 「 *NPM SHIELD* 」\n┊ Tulis nama paket npmnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.npmshield express*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *PAKET TIDAK KETEMU* 」\n┊ Mouu, paket *{q}* tidak ada di registry npm~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil info paket: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      card: '╭─❏ 🛡️ 「 *{name}* 」\n┊ ᴠᴇʀꜱɪ (ꜱʜɪᴇʟᴅꜱ.ɪᴏ): *{version}*\n┊ ʟɪꜱᴇɴꜱɪ: *{license}*\n┊ ᴜɴᴅᴜʜᴀɴ ᴍɪɴɢɢᴜ ʟᴀʟᴜ: *{downloads}*\n┊ ʙᴀᴅɢᴇ: https://img.shields.io/npm/v/{name}.svg\n┊ ɴᴘᴍ: https://www.npmjs.com/package/{name}\n┊ {desc}\n╰━━━━━━━',
    },
  },
  en: {
    npmshield: {
      hint: '╭─❏ 🛡️ 「 *NPM SHIELD* 」\n┊ Write the npm package name first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.npmshield express*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *PACKAGE NOT FOUND* 」\n┊ Mouu, package *{q}* does not exist on the npm registry~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch package info: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      card: '╭─❏ 🛡️ 「 *{name}* 」\n┊ ᴠᴇʀꜱɪᴏɴ (ꜱʜɪᴇʟᴅꜱ.ɪᴏ): *{version}*\n┊ ʟɪᴄᴇɴꜱᴇ: *{license}*\n┊ ᴅᴏᴡɴʟᴏᴀᴅꜱ ʟᴀꜱᴛ ᴡᴇᴇᴋ: *{downloads}*\n┊ ʙᴀᴅɢᴇ: https://img.shields.io/npm/v/{name}.svg\n┊ ɴᴘᴍ: https://www.npmjs.com/package/{name}\n┊ {desc}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.npmshield express', expect: /express|npm|\d+\.\d+\.\d+/i }

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'KANA-Bot', Accept: 'application/json' } })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

export async function handler(ctx) {
  const q = (ctx.text || '').trim().split(/\s+/)[0]
  if (!q) return ctx.reply(ctx.t('npmshield.hint'))
  try {
    const meta = await fetchJson('https://registry.npmjs.org/' + encodeURIComponent(q)).catch((e) => {
      if (String(e.message).includes('404')) return null
      throw e
    })
    if (!meta || !meta.name) return ctx.reply(ctx.t('npmshield.notfound', { q }))
    const latest = meta['dist-tags']?.latest || '-'
    const ver = meta.versions?.[latest] || {}
    const shield = await fetchJson('https://img.shields.io/npm/v/' + encodeURIComponent(q) + '.json').catch(() => null)
    const dl = await fetchJson('https://api.npmjs.org/downloads/point/last-week/' + encodeURIComponent(q)).catch(() => null)
    return ctx.reply(ctx.t('npmshield.card', {
      name: meta.name,
      version: shield?.value || ('v' + latest),
      license: ver.license || meta.license || '-',
      downloads: dl && typeof dl.downloads === 'number' ? dl.downloads.toLocaleString('id-ID') : '-',
      desc: ver.description || meta.description || '-',
    }))
  } catch (err) {
    return ctx.reply(ctx.t('npmshield.fail', { message: err.message }))
  }
}
