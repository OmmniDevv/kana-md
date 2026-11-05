import os from 'node:os'

// Statistik performa server bot saat ini: uptime proses, memori,
// beban CPU, dan latensi baca storage lokal. Semua diukur langsung
// dari proses bot yang sedang berjalan.
export const config = {
  name: 'speedbot',
  alias: ['botspeed'],
  category: 'tools',
  description: { id: 'Lihat statistik performa server bot saat ini', en: 'See the current bot server performance stats' },
  usage: '.speedbot',
  example: '.speedbot',
  cooldown: 5,
}

export const i18n = {
  id: {
    speedbot: {
      body: '╭─❏ ⚡ 「 *SPEED BOT* 」\n┊ ᴜᴘᴛɪᴍᴇ ᴘʀᴏꜱᴇꜱ: *{uptime}*\n┊ ᴍᴇᴍᴏʀɪ: *{mem}* (heap {heap})\n┊ ᴄᴘᴜ: *{cpus} core* | ʟᴏᴀᴅ: {load}\n┊ ʟᴀᴛᴇɴꜱɪ ꜱᴛᴏʀᴀɢᴇ: *{latency} ms*\n┊ ᴘʟᴀᴛꜰᴏʀᴍ: *{platform}* | ɴᴏᴅᴇ *{node}*\n╰━━━━━━━',
    },
  },
  en: {
    speedbot: {
      body: '╭─❏ ⚡ 「 *BOT SPEED* 」\n┊ ᴘʀᴏᴄᴇꜱꜱ ᴜᴘᴛɪᴍᴇ: *{uptime}*\n┊ ᴍᴇᴍᴏʀʏ: *{mem}* (heap {heap})\n┊ ᴄᴘᴜ: *{cpus} cores* | ʟᴏᴀᴅ: {load}\n┊ ꜱᴛᴏʀᴀɢᴇ ʟᴀᴛᴇɴᴄʏ: *{latency} ms*\n┊ ᴘʟᴀᴛꜰᴏʀᴍ: *{platform}* | ɴᴏᴅᴇ *{node}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.speedbot', expect: /SPEED BOT|BOT SPEED|UPTIME/ }

function fmtUptime(seconds) {
  const s = Math.floor(seconds)
  const d = Math.floor(s / 86400)
  const h = Math.floor(s % 86400 / 3600)
  const m = Math.floor(s % 3600 / 60)
  const parts = []
  if (d) parts.push(`${d} hari`)
  if (h) parts.push(`${h} jam`)
  parts.push(`${m} menit`)
  return parts.join(' ')
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

export async function handler(ctx) {
  const started = Date.now()
  try { await ctx.storage.get('speedbot', 'ping') } catch {}
  const latency = Date.now() - started
  const memory = process.memoryUsage()
  return ctx.reply(ctx.t('speedbot.body', {
    uptime: fmtUptime(process.uptime()),
    mem: mb(memory.rss),
    heap: mb(memory.heapUsed),
    cpus: os.cpus().length,
    load: os.loadavg().map((n) => n.toFixed(2)).join(' / '),
    latency,
    platform: `${os.platform()} ${os.arch()}`,
    node: process.version,
  }))
}
