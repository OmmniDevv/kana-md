
import { renderRamadhanCard, nextRamadhanStart, daysUntil } from '../../src/ui/ramadhan-card.js'
import { sendImage } from '../../src/ui/media.js'

// Ramadhan: kartu canvas hitung mundur ke 1 Ramadhan berikutnya
// (tanggal dari kalender Islam via src/ui/ramadhan-card.js), dikirim
// sebagai gambar dengan caption. Menggantikan ringkasan profil generik
// lama yang tidak ada hubungannya dengan Ramadhan.
export const config = {
  name: "ramadhan",
  alias: [],
  category: "rpg",
  description: { id: "Kartu hitung mundur menuju bulan suci Ramadhan berikutnya", en: "Countdown card to the next holy month of Ramadan" },
  usage: ".ramadhan",
  example: ".ramadhan",
  cooldown: 5,
}

export const i18n = {
  id: {
    "ramadhan": {
      caption: "╭─❏ 🌙 「 *HITUNG MUNDUR RAMADHAN* 」\n┊ ᴍᴇɴᴜᴊᴜ 1 ʀᴀᴍᴀᴅʜᴀɴ: *{date}*\n┊ ꜱɪꜱᴀ: *{days} ʜᴀʀɪ ʟᴀɢɪ*\n┊ Siapkan hati dan niat dari sekarang yaa~\n╰━━━━━━━ {mood}",
      captionToday: "╭─❏ 🌙 「 *RAMADHAN TELAH TIBA* 」\n┊ Marhaban ya Ramadhan! Bulan suci dimulai *{date}*~\n╰━━━━━━━ {mood}",
      cardTitle: "MENUJU RAMADHAN",
      cardSubtitle: "hari lagi menuju 1 Ramadhan",
      fail: "╭─❏ 💦 「 *RAMADHAN* 」\n┊ Mouu, kartu hitung mundurnya gagal dibuat: *{message}*\n╰━━━━━━━",
    },
  },
  en: {
    "ramadhan": {
      caption: "╭─❏ 🌙 「 *RAMADAN COUNTDOWN* 」\n┊ ᴛᴏᴡᴀʀᴅꜱ 1 ʀᴀᴍᴀᴅᴀɴ: *{date}*\n┊ ʟᴇꜰᴛ: *{days} ᴅᴀʏꜱ*\n┊ Prepare your heart and intention from now~\n╰━━━━━━━ {mood}",
      captionToday: "╭─❏ 🌙 「 *RAMADAN IS HERE* 」\n┊ Marhaban ya Ramadan! The holy month started *{date}*~\n╰━━━━━━━ {mood}",
      cardTitle: "TOWARDS RAMADAN",
      cardSubtitle: "days left to 1 Ramadan",
      fail: "╭─❏ 💦 「 *RAMADAN* 」\n┊ Mouu, the countdown card failed to render: *{message}*\n╰━━━━━━━",
    },
  },
}

export function ramadhanCountdown(now = new Date()) {
  const start = nextRamadhanStart(now)
  return { start, days: daysUntil(start, now) }
}

export const test = { input: '.ramadhan', expect: /ramadhan/i }
export async function handler(ctx) {
  try {
    const { start, days } = ramadhanCountdown()
    const date = start.toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })
    const image = await renderRamadhanCard({
      title: ctx.t('ramadhan.cardTitle'),
      days,
      dateLabel: `1 Ramadhan • ${date}`,
      subtitle: ctx.t('ramadhan.cardSubtitle'),
    })
    const caption = days <= 0
      ? ctx.t('ramadhan.captionToday', { date, mood: ctx.say('senang') })
      : ctx.t('ramadhan.caption', { date, days, mood: ctx.say('senang') })
    return sendImage(ctx, image, { caption })
  } catch (err) {
    return ctx.reply(ctx.t('ramadhan.fail', { message: err.message }))
  }
}
