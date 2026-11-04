import { t as translate } from '../i18n/index.js'
import { logger } from '../services/logger.js'
import { getGroupSettings, saveGroupSettings } from '../services/group-service.js'

// Scheduler ringan: tick tiap menit (timer unref, tidak menahan proses).
// Pekerjaan:
// 1. Buka/tutup grup terjadwal (settings.openClose) lewat groupSettingUpdate.
// 2. Pengingat sholat per grup (settings.prayerReminder + prayerCity); jadwal
//    diambil dari modul search/sholat (dimuat dinamis; absen = lewati diam).
// 3. Ayat/hadits harian ke grup yang mengaktifkan settings.religiTime.
// Semua pekerjaan dibungkus try/catch: scheduler tidak boleh menjatuhkan bot.
export function wibParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type)?.value ?? ''
  const hour = String(Number(get('hour')) % 24).padStart(2, '0')
  return {
    hhmm: `${hour}:${get('minute')}`,
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(hour) * 60 + Number(get('minute')),
  }
}

export function isOpenAt(nowMinutes, open, close) {
  const toMin = (s) => {
    const [h, m] = String(s || '').split(':').map(Number)
    return Number.isFinite(h) ? h * 60 + (m || 0) : null
  }
  const o = toMin(open)
  const c = toMin(close)
  if (o === null || c === null || o === c) return null
  if (o < c) return nowMinutes >= o && nowMinutes < c
  return nowMinutes >= o || nowMinutes < c
}

const PRAYERS = ['imsak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']

export function startScheduler({ session, storage, defaultLang = 'id', statsSource = null }) {
  const prayerCache = new Map()
  let stopped = false

  // Flush statistik bot untuk dashboard web ke kv 'bot_stats' (kontrak
  // docs/WEB.md): { startedAt, totalUsers, totalCommands, pluginCount }.
  async function flushBotStats() {
    if (!statsSource) return
    try {
      const prev = await storage.get('kv', 'bot_stats')
      const stats = statsSource()
      let totalUsers = prev?.totalUsers ?? 0
      try {
        totalUsers = (await storage.keys('users')).filter((k) => /^\d+$/.test(k)).length
      } catch {}
      await storage.set('kv', 'bot_stats', {
        startedAt: prev?.startedAt ?? stats.startedAt,
        totalUsers,
        totalCommands: stats.totalCommands,
        pluginCount: stats.pluginCount,
        updatedAt: Date.now(),
      })
    } catch (err) {
      logger.warn({ err: err.message }, 'flush bot_stats gagal')
    }
  }

  async function alreadySent(jid, date, kind) {
    const marker = await storage.get('kv', `sched:${jid}:${date}:${kind}`)
    return Boolean(marker)
  }

  async function markSent(jid, date, kind) {
    await storage.set('kv', `sched:${jid}:${date}:${kind}`, true, 2 * 24 * 3600)
  }

  async function prayerTimes(city, date) {
    const cacheKey = `${city}:${date}`
    if (prayerCache.has(cacheKey)) return prayerCache.get(cacheKey)
    let times = null
    try {
      const mod = await import('../scrapers/search/sholat.js')
      if (typeof mod.getPrayerSchedule === 'function') {
        times = await mod.getPrayerSchedule(city, date)
      }
    } catch {
      times = null
    }
    prayerCache.set(cacheKey, times)
    return times
  }

  async function tick() {
    if (stopped) return
    await flushBotStats()
    const sock = session?.sock
    if (!sock?.user) return
    const now = wibParts()
    let jids = []
    try {
      jids = await storage.keys('groups')
    } catch {
      return
    }
    for (const jid of jids) {
      if (!jid.endsWith('@g.us')) continue
      try {
        const settings = await getGroupSettings(storage, jid)
        const lang = settings.lang || defaultLang

        if (settings.openClose?.open && settings.openClose?.close) {
          const open = isOpenAt(now.minutes, settings.openClose.open, settings.openClose.close)
          const desired = open === null ? null : open ? 'open' : 'closed'
          if (desired && settings.openClose.state !== desired) {
            await sock.groupSettingUpdate(jid, desired === 'open' ? 'not_announcement' : 'announcement')
            settings.openClose = { ...settings.openClose, state: desired }
            await saveGroupSettings(storage, jid, settings)
          }
        }

        if (settings.prayerReminder && settings.prayerCity) {
          const times = await prayerTimes(settings.prayerCity, now.date)
          if (times) {
            for (const name of PRAYERS) {
              if (times[name] === now.hhmm && !(await alreadySent(jid, now.date, `prayer:${name}`))) {
                await sock.sendMessage(jid, {
                  text: translate(lang, 'sched.prayer', { prayer: name, time: now.hhmm }),
                })
                await markSent(jid, now.date, `prayer:${name}`)
              }
            }
          }
        }

        if (settings.religiTime && settings.religiTime === now.hhmm && !(await alreadySent(jid, now.date, 'religi'))) {
          const mod = await import('../data/religi.js').catch(() => null)
          const items = [...(mod?.ayat ?? []), ...(mod?.hadits ?? [])]
          if (items.length) {
            const dayIndex = Math.floor(Date.parse(now.date) / 86400000)
            const item = items[Math.abs(dayIndex) % items.length]
            await sock.sendMessage(jid, {
              text: translate(lang, 'sched.religiDaily', { text: item.text, source: item.source }),
            })
            await markSent(jid, now.date, 'religi')
          }
        }
      } catch (err) {
        logger.warn({ err: err.message, jid }, 'scheduler: pekerjaan grup gagal')
      }
    }
  }

  const timer = setInterval(() => {
    tick().catch((err) => logger.warn({ err: err.message }, 'scheduler tick gagal'))
  }, 60000)
  timer.unref?.()
  const first = setTimeout(() => {
    tick().catch(() => {})
  }, 5000)
  first.unref?.()

  return {
    stop() {
      stopped = true
      clearInterval(timer)
      clearTimeout(first)
    },
    tick,
  }
}
