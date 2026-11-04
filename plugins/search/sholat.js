import { getPrayerInfo } from '../../src/scrapers/search/sholat.js'
import { updateGroupSettings } from '../../src/services/group-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'sholat',
  alias: ['jadwalsholat', 'prayer', 'salat', 'shalattime'],
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
      needCity: '╭─❏ 🕌 「 *JADWAL SHOLAT* 」\n┊ Ketik nama kotanya dulu yaa~\n┊ Contoh: *.sholat Jakarta*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *JADWAL TIDAK KETEMU* 」\n┊ Mouu, jadwal buat kota itu nggak ketemu~\n┊ Coba nama kota lain yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *JADWAL GAGAL DIAMBIL* 」\n┊ Mouu, jadwal sholat lagi nggak bisa diambil: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      header: '╭─❏ 🕌 「 *JADWAL SHOLAT {city}* 」',
      dateLine: '┊ 📅 *{date}*',
      item: '┊ {name}: *{time}*',
      names: {
        imsak: 'ɪᴍꜱᴀᴋ',
        subuh: 'ꜱᴜʙᴜʜ',
        terbit: 'ᴛᴇʀʙɪᴛ',
        dzuhur: 'ᴅᴢᴜʜᴜʀ',
        ashar: 'ᴀꜱʜᴀʀ',
        maghrib: 'ᴍᴀɢʜʀɪʙ',
        isya: 'ɪꜱʏᴀ',
      },
      groupOnly: '╭─❏ 👥 「 *KHUSUS GRUP* 」\n┊ Pengingat sholat cuma bisa diatur di dalam grup yaa~\n╰━━━━━━━',
      adminOnly: '╭─❏ 👑 「 *KHUSUS ADMIN* 」\n┊ Ehh, cuma admin grup yang bisa mengatur pengingat sholat~\n╰━━━━━━━',
      needCityReminder: '╭─❏ 🕌 「 *TULIS KOTANYA* 」\n┊ Tulis kotanya sekalian yaa~\n┊ Contoh: *.sholat ingatkan Jakarta*\n╰━━━━━━━',
      reminderOn: '╭─❏ 🔔 「 *PENGINGAT NYALA* 」\n┊ Siap~ pengingat sholat buat *{city}* KANA nyalakan di grup ini~\n┊ KANA bakal ingetin pas masuk waktunya yaa!\n╰━━━━━━━',
      reminderOff: '╭─❏ 🔕 「 *PENGINGAT MATI* 」\n┊ Oke, pengingat sholat di grup ini KANA matikan yaa~\n╰━━━━━━━',
      btnRefresh: 'Segarkan',
    },
  },
  en: {
    sholat: {
      needCity: '╭─❏ 🕌 「 *PRAYER SCHEDULE* 」\n┊ Type the city name first~\n┊ Example: *.sholat Jakarta*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SCHEDULE NOT FOUND* 」\n┊ Mouu, the schedule for that city was not found~\n┊ Try another city name~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *SCHEDULE FAILED* 」\n┊ Mouu, the prayer schedule cannot be fetched: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🕌 「 *PRAYER SCHEDULE FOR {city}* 」',
      dateLine: '┊ 📅 *{date}*',
      item: '┊ {name}: *{time}*',
      names: {
        imsak: 'ɪᴍꜱᴀᴋ',
        subuh: 'ꜰᴀᴊʀ',
        terbit: 'ꜱᴜɴʀɪꜱᴇ',
        dzuhur: 'ᴅʜᴜʜʀ',
        ashar: 'ᴀꜱʀ',
        maghrib: 'ᴍᴀɢʜʀɪʙ',
        isya: 'ɪꜱʜᴀ',
      },
      groupOnly: '╭─❏ 👥 「 *GROUP ONLY* 」\n┊ Prayer reminders can only be set inside a group~\n╰━━━━━━━',
      adminOnly: '╭─❏ 👑 「 *ADMIN ONLY* 」\n┊ Ehh, only group admins can manage prayer reminders~\n╰━━━━━━━',
      needCityReminder: '╭─❏ 🕌 「 *INCLUDE THE CITY* 」\n┊ Include the city too~\n┊ Example: *.sholat ingatkan Jakarta*\n╰━━━━━━━',
      reminderOn: '╭─❏ 🔔 「 *REMINDER ON* 」\n┊ Got it~ prayer reminders for *{city}* are on in this group~\n┊ KANA will remind everyone when prayer time comes!\n╰━━━━━━━',
      reminderOff: '╭─❏ 🔕 「 *REMINDER OFF* 」\n┊ Okay, prayer reminders in this group are now off~\n╰━━━━━━━',
      btnRefresh: 'Refresh',
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

export const test = { input: '.sholat Jakarta', expect: /Jadwal sholat/i }

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
  lines.push('╰━━━━━━━')
  const body = lines.join('\n')
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('sholat.btnRefresh'), id: `.sholat ${city}` },
    ],
    textFallback: body,
  })
}
