import { cpus, totalmem, freemem, platform, arch, uptime as osUptime } from 'node:os'
import { statfs } from 'node:fs/promises'

export const config = {
  name: 'system',
  alias: [],
  category: 'main',
  description: { id: 'Menampilkan informasi sistem server bot (OS, CPU, RAM, disk, uptime)', en: 'Show the bot server system information (OS, CPU, RAM, disk, uptime)' },
  usage: '.system',
  example: '.system',
  cooldown: 5,
}

export const i18n = {
  id: {
    system: {
      body: '╭─❏ 🖥️ 「 *INFORMASI SISTEM* 」\n┊ 💻 OS: *{platform}* ({arch})\n┊ 🧠 CPU: *{cpu}* ({cores} core)\n┊ 🎛️ RAM server: *{ramUsed} / {ramTotal}* terpakai\n┊ 🤖 RAM proses bot: *{rss}*\n┊ 💾 Disk: *{disk}*\n┊ ⏱️ Uptime server: *{osUp}*\n┊ ⏱️ Uptime bot: *{botUp}*\n┊ 🟢 Node.js: *{node}*\n╰━━━━━━━',
      diskLine: '{free} bebas dari {total}',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    system: {
      body: '╭─❏ 🖥️ 「 *SYSTEM INFORMATION* 」\n┊ 💻 OS: *{platform}* ({arch})\n┊ 🧠 CPU: *{cpu}* ({cores} cores)\n┊ 🎛️ Server RAM: *{ramUsed} / {ramTotal}* used\n┊ 🤖 Bot process RAM: *{rss}*\n┊ 💾 Disk: *{disk}*\n┊ ⏱️ Server uptime: *{osUp}*\n┊ ⏱️ Bot uptime: *{botUp}*\n┊ 🟢 Node.js: *{node}*\n╰━━━━━━━',
      diskLine: '{free} free of {total}',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.system', expect: /sistem|system/i }

export function formatBytes(bytes) {
  const n = Number(bytes) || 0
  if (n >= 1024 ** 3) return (n / 1024 ** 3).toFixed(2) + ' GB'
  if (n >= 1024 ** 2) return (n / 1024 ** 2).toFixed(1) + ' MB'
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KB'
  return n + ' B'
}

export function formatUptime(seconds, lang) {
  const s = Math.floor(Number(seconds) || 0)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const units = lang === 'en'
    ? [[d, 'days'], [h, 'hours'], [m, 'minutes']]
    : [[d, 'hari'], [h, 'jam'], [m, 'menit']]
  return units.filter(([v]) => v > 0).map(([v, u]) => `${v} ${u}`).join(' ') || (lang === 'en' ? '0 minutes' : '0 menit')
}

export async function handler(ctx) {
  try {
    const cpuList = cpus()
    const total = totalmem()
    const free = freemem()
    let disk = '-'
    try {
      const fsStat = await statfs(process.cwd())
      const diskTotal = fsStat.blocks * fsStat.bsize
      const diskFree = fsStat.bavail * fsStat.bsize
      disk = ctx.t('system.diskLine', { free: formatBytes(diskFree), total: formatBytes(diskTotal) })
    } catch {}
    return ctx.reply(ctx.t('system.body', {
      platform: platform(),
      arch: arch(),
      cpu: cpuList[0]?.model?.trim() || '-',
      cores: cpuList.length,
      ramUsed: formatBytes(total - free),
      ramTotal: formatBytes(total),
      rss: formatBytes(process.memoryUsage().rss),
      disk,
      osUp: formatUptime(osUptime(), ctx.lang),
      botUp: formatUptime(process.uptime(), ctx.lang),
      node: process.version,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('system.fail', { error: err.message }))
  }
}
