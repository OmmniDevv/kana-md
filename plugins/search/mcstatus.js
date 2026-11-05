// Status server Minecraft dari mcsrvstat.us (API publik tanpa kunci,
// pengecualian setara API game di DECISIONS.md).
export const config = {
  name: 'mcstatus',
  alias: ['mcserver', 'statusmc'],
  category: 'search',
  description: { id: 'Cek status server Minecraft: online, pemain, versi, MOTD', en: 'Check a Minecraft server status: online, players, version, MOTD' },
  usage: '.mcstatus <alamat server>',
  example: '.mcstatus mc.hypixel.net',
  cooldown: 10,
}

export const i18n = {
  id: {
    mcstatus: {
      hint: '╭─❏ 🎮 「 *STATUS MINECRAFT* 」\n┊ Tulis alamat servernya yaa~\n┊ Contoh: *.mcstatus mc.hypixel.net*\n╰━━━━━━━',
      online: '╭─❏ 🟢 「 *SERVER ONLINE: {host}* 」\n┊ ᴘᴇᴍᴀɪɴ: *{now}/{max}*\n┊ ᴠᴇʀꜱɪ: *{version}*\n┊ ᴍᴏᴛᴅ: {motd}\n╰━━━━━━━',
      offline: '╭─❏ 🔴 「 *SERVER OFFLINE* 」\n┊ Server *{host}* lagi offline atau tidak terjangkau. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *GAGAL CEK STATUS* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    mcstatus: {
      hint: '╭─❏ 🎮 「 *MINECRAFT STATUS* 」\n┊ Write the server address please~\n┊ Example: *.mcstatus mc.hypixel.net*\n╰━━━━━━━',
      online: '╭─❏ 🟢 「 *SERVER ONLINE: {host}* 」\n┊ ᴘʟᴀʏᴇʀꜱ: *{now}/{max}*\n┊ ᴠᴇʀꜱɪᴏɴ: *{version}*\n┊ ᴍᴏᴛᴅ: {motd}\n╰━━━━━━━',
      offline: '╭─❏ 🔴 「 *SERVER OFFLINE* 」\n┊ Server *{host}* is offline or unreachable. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *FAILED TO CHECK STATUS* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.mcstatus mc.hypixel.net', expect: /SERVER ONLINE|SERVER OFFLINE/ }

export async function handler(ctx) {
  const host = (ctx.text || '').trim().split(/\s+/)[0]
  if (!host) return ctx.reply(ctx.t('mcstatus.hint'))
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(host)}`, { signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const d = await res.json()
    if (!d.online) return ctx.reply(ctx.t('mcstatus.offline', { host, mood: ctx.say('gagal') }))
    const motd = Array.isArray(d.motd?.clean) ? d.motd.clean.join(' ').slice(0, 140) : '-'
    return ctx.reply(ctx.t('mcstatus.online', {
      host: d.hostname ?? host,
      now: d.players?.online ?? 0,
      max: d.players?.max ?? 0,
      version: d.version ?? '-',
      motd,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('mcstatus.fail', { error: err.message }))
  }
}
