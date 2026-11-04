import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
import { updateGroupSettings } from '../../src/services/group-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'sholat',
  alias: ['jadwalsholat', 'prayer'],
  category: 'search',
  description: { id: 'Jadwal sholat per kota, plus pengingat grup', en: 'Prayer schedule per city, plus group reminders' },
  usage: '.sholat <kota> | .sholat ingatkan <kota> | .sholat matikan',
  example: '.sholat Jakarta',
  cooldown: 8,
  limit: 5,
  needsAdminInfo: true,
}

export const i18n = {
  id: {
    sholat: {
      needCity: 'Ketik nama kotanya dulu yaa, contoh: .sholat Jakarta~',
      notFound: 'Mouu, jadwal buat kota itu nggak ketemu. Coba nama kota lain ya~',
      failed: 'Mouu, jadwal sholat lagi nggak bisa diambil: {message}. Coba lagi nanti ya~',
      header: 'Jadwal sholat {city}',
      dateLine: '{date}',
      item: '{name}: {time}',
      names: {
        imsak: 'Imsak',
        subuh: 'Subuh',
        terbit: 'Terbit',
        dzuhur: 'Dzuhur',
        ashar: 'Ashar',
        maghrib: 'Maghrib',
        isya: 'Isya',
      },
      groupOnly: 'Pengingat sholat cuma bisa diatur di dalam grup yaa~',
      adminOnly: 'Ehh, cuma admin grup yang bisa mengatur pengingat sholat~',
      needCityReminder: 'Tulis kotanya sekalian yaa, contoh: .sholat ingatkan Jakarta~',
      reminderOn: 'Siap~ pengingat sholat buat {city} KANA nyalakan di grup ini. KANA bakal ingetin pas masuk waktunya yaa!',
      reminderOff: 'Oke, pengingat sholat di grup ini KANA matikan yaa~',
      btnRefresh: 'Segarkan',
      btnMenu: 'Menu pencarian',
    },
  },
  en: {
    sholat: {
      needCity: 'Type the city name first, example: .sholat Jakarta~',
      notFound: 'Mouu, the schedule for that city was not found. Try another city name~',
      failed: 'Mouu, the prayer schedule cannot be fetched: {message}. Try again later~',
      header: 'Prayer schedule for {city}',
      dateLine: '{date}',
      item: '{name}: {time}',
      names: {
        imsak: 'Imsak',
        subuh: 'Fajr',
        terbit: 'Sunrise',
        dzuhur: 'Dhuhr',
        ashar: 'Asr',
        maghrib: 'Maghrib',
        isya: 'Isha',
      },
      groupOnly: 'Prayer reminders can only be set inside a group~',
      adminOnly: 'Ehh, only group admins can manage prayer reminders~',
      needCityReminder: 'Include the city too, example: .sholat ingatkan Jakarta~',
      reminderOn: 'Got it~ prayer reminders for {city} are on in this group. KANA will remind everyone when prayer time comes!',
      reminderOff: 'Okay, prayer reminders in this group are now off~',
      btnRefresh: 'Refresh',
      btnMenu: 'Search menu',
    },
  },
}

function todayJakarta() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export const test = { input: '.sholat', expect: /kota/i }

export async function handler(ctx) {
  const first = (ctx.args[0] || '').toLowerCase()
  if (first === 'ingatkan' || first === 'matikan' || first === 'off' || first === 'on') {
    if (!ctx.isGroup) return ctx.reply(ctx.t('sholat.groupOnly'))
    if (!ctx.isAdmin && !ctx.isOwner) return ctx.reply(ctx.t('sholat.adminOnly'))
    if (first === 'matikan' || first === 'off') {
      await updateGroupSettings(ctx.storage, ctx.chat, { prayerReminder: false })
      return ctx.reply(ctx.t('sholat.reminderOff'))
    }
    const city = ctx.args.slice(1).join(' ').trim()
    if (!city) return ctx.reply(ctx.t('sholat.needCityReminder'))
    await updateGroupSettings(ctx.storage, ctx.chat, { prayerReminder: true, prayerCity: city })
    return ctx.reply(ctx.t('sholat.reminderOn', { city }))
  }
  const city = ctx.text.trim()
  if (!city) return ctx.reply(ctx.t('sholat.needCity'))
  let info
  try {
    info = await getPrayerInfo(city, todayJakarta())
  } catch (err) {
    return ctx.reply(ctx.t('sholat.failed', { message: err.message }))
  }
  if (!info) return ctx.reply(ctx.t('sholat.notFound'))
  const rows = [
    ['imsak', info.times.imsak],
    ['subuh', info.times.subuh],
    ['terbit', info.extra.terbit],
    ['dzuhur', info.times.dzuhur],
    ['ashar', info.times.ashar],
    ['maghrib', info.times.maghrib],
    ['isya', info.times.isya],
  ].filter(([, time]) => time)
  const lines = [ctx.t('sholat.header', { city: info.city.name || city })]
  if (info.extra.dateLabel) lines.push(ctx.t('sholat.dateLine', { date: info.extra.dateLabel }))
  for (const [key, time] of rows) {
    lines.push(ctx.t('sholat.item', { name: ctx.t(`sholat.names.${key}`), time }))
  }
  const body = lines.join('\n')
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('sholat.btnRefresh'), id: `.sholat ${city}` },
      { text: ctx.t('sholat.btnMenu'), id: '.menu search' },
    ],
    textFallback: body,
  })
}
