import os from 'node:os'

// Statistik server tempat bot berjalan: host, OS, CPU, memori total
// dan bebas, uptime sistem dan proses. Diukur langsung dari mesin.
export const config = {
  name: 'statserver',
  alias: ['serverstat', 'serverinfo'],
  category: 'info',
  description: { id: 'Statistik server bot: CPU, memori, uptime, OS', en: 'Bot server stats: CPU, memory, uptime, OS' },
  usage: '.statserver',
  example: '.statserver',
  cooldown: 5,
}

export const i18n = {
  id: {
    statserver: {
      body: '╭─❏ 🖥️ 「 *STAT SERVER* 」\n┊ ʜᴏꜱᴛ: *{host}*\n┊ ᴏꜱ: *{os}* ({arch})\n┊ ᴄᴘᴜ: *{cpu}* ({cores} core)\n┊ ʟᴏᴀᴅ: *{load}*\n┊ ʀᴀᴍ: *{used}* ᴅᴀʀɪ *{total}* (bebas {free})\n┊ ᴜᴘᴛɪᴍᴇ ꜱɪꜱᴛᴇᴍ: *{osup}*\n┊ ᴜᴘᴛɪᴍᴇ ʙᴏᴛ: *{botup}*\n┊ ɴᴏᴅᴇ: *{node}*\n╰━━━━━━━',
    },
  },
  en: {
    statserver: {
      body: '╭─❏ 🖥️ 「 *SERVER STATS* 」\n┊ ʜᴏꜱᴛ: *{host}*\n┊ ᴏꜱ: *{os}* ({arch})\n┊ ᴄᴘᴜ: *{cpu}* ({cores} cores)\n┊ ʟᴏᴀᴅ: *{load}*\n┊ ʀᴀᴍ: *{used}* ᴏꜰ *{total}* (free {free})\n┊ ꜱʏꜱᴛᴇᴍ ᴜᴘᴛɪᴍᴇ: *{osup}*\n┊ ʙᴏᴛ ᴜᴘᴛɪᴍᴇ: *{botup}*\n┊ ɴᴏᴅᴇ: *{node}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.statserver', expect: /STAT SERVER|SERVER STATS/ }

function fmtBytes(bytes) {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + ' GB'
  return (bytes / 1024 ** 2).toFixed(0) + ' MB'
}

function fmtUptime(seconds) {
  const s = Math.floor(seconds)
  const d = Math.floor(s / 86400)
  const h = Math.floor(s % 86400 / 3600)
  const m = Math.floor(s % 3600 / 60)
  const parts = []
  if (d) parts.push(`${d} hari`)
  if (h) parts.push(`${h} jam`)
  parts.push(`${m} mnt`)
  return parts.join(' ')
}

export async function handler(ctx) {
  const cpus = os.cpus()
  const total = os.totalmem()
  const free = os.freemem()
  return ctx.reply(ctx.t('statserver.body', {
    host: os.hostname(),
    os: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    cpu: (cpus[0]?.model || '-').slice(0, 40),
    cores: cpus.length,
    load: os.loadavg().map((n) => n.toFixed(2)).join(' / '),
    used: fmtBytes(total - free),
    total: fmtBytes(total),
    free: fmtBytes(free),
    osup: fmtUptime(os.uptime()),
    botup: fmtUptime(process.uptime()),
    node: process.version,
  }))
}
