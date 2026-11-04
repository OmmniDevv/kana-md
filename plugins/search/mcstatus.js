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
      hint: 'Tulis alamat servernya yaa~ Contoh: .mcstatus mc.hypixel.net',
      online: '🟢 SERVER ONLINE: {host}\n\nPemain: {now}/{max}\nVersi: {version}\nMOTD: {motd}',
      offline: '🔴 Server {host} lagi offline atau tidak terjangkau. {mood}',
      fail: 'Gagal cek statusnya: {error}',
    },
  },
  en: {
    mcstatus: {
      hint: 'Write the server address please~ Example: .mcstatus mc.hypixel.net',
      online: '🟢 SERVER ONLINE: {host}\n\nPlayers: {now}/{max}\nVersion: {version}\nMOTD: {motd}',
      offline: '🔴 Server {host} is offline or unreachable. {mood}',
      fail: 'Failed to check the status: {error}',
    },
  },
}

export const test = { input: '.mcstatus', expect: /server/i }

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
