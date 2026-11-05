
import { renderRamadhanCard, daysUntil, RAMADHAN_2027_START } from '../../src/ui/ramadhan-card.js'
import { sendImage } from '../../src/ui/media.js'

// Ramadhan 2027: hitung mundur ke 1 Ramadhan 2027 (8 Februari 2027,
// tanggal yang sama dengan Elaina-MD) sebagai kartu canvas, dikirim
// sebagai gambar dengan caption. Dulu plugin ini cuma mengirim teks
// kurasi acak yang tidak berhubungan dengan hitung mundur.
export const config = {
  name: "ramadhan2027",
  alias: ["ramadan2027", "hitungramadhan2027"],
  category: "islamic",
  description: { id: "Kartu hitung mundur menuju bulan suci Ramadhan 2027", en: "Countdown card to the holy month of Ramadan 2027" },
  usage: ".ramadhan2027",
  example: ".ramadhan2027",
  cooldown: 5,
}

export const i18n = {
  id: {
    "ramadhan2027": {
      caption: "╭─❏ 🕌 「 *COUNTDOWN RAMADHAN 2027* 」\n┊ ᴘᴇʀᴋɪʀᴀᴀɴ 1 ʀᴀᴍᴀᴅʜᴀɴ 2027: *{date}*\n┊ ꜱɪꜱᴀ: *{days} ʜᴀʀɪ ʟᴀɢɪ*\n┊ Mari bersihkan hati dan niat menyambut bulan penuh berkah~\n╰━━━━━━━ {mood}",
      captionToday: "╭─❏ 🕌 「 *RAMADHAN 2027 TELAH TIBA* 」\n┊ Marhaban ya Ramadhan! 1 Ramadhan 2027 jatuh pada *{date}*~\n╰━━━━━━━ {mood}",
      captionPast: "╭─❏ 🕌 「 *RAMADHAN 2027* 」\n┊ Ramadhan 2027 (mulai *{date}*) sudah terlewat. Semoga kita dipertemukan lagi dengan Ramadhan berikutnya~\n╰━━━━━━━",
      cardTitle: "RAMADHAN 2027",
      cardSubtitle: "hari lagi menuju 1 Ramadhan 2027",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "ramadhan2027": {
      caption: "╭─❏ 🕌 「 *RAMADAN 2027 COUNTDOWN* 」\n┊ ᴇꜱᴛɪᴍᴀᴛᴇᴅ 1 ʀᴀᴍᴀᴅᴀɴ 2027: *{date}*\n┊ ʟᴇꜰᴛ: *{days} ᴅᴀʏꜱ*\n┊ Let us purify our hearts and intentions for the blessed month~\n╰━━━━━━━ {mood}",
      captionToday: "╭─❏ 🕌 「 *RAMADAN 2027 IS HERE* 」\n┊ Marhaban ya Ramadan! 1 Ramadan 2027 falls on *{date}*~\n╰━━━━━━━ {mood}",
      captionPast: "╭─❏ 🕌 「 *RAMADAN 2027* 」\n┊ Ramadan 2027 (started *{date}*) has passed. May we meet the next Ramadan~\n╰━━━━━━━",
      cardTitle: "RAMADAN 2027",
      cardSubtitle: "days left to 1 Ramadan 2027",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

export function ramadhan2027Countdown(now = new Date()) {
  return { start: RAMADHAN_2027_START, days: daysUntil(RAMADHAN_2027_START, now) }
}

export const test = { input: '.ramadhan2027', expect: /ramadhan 2027/i }
export async function handler(ctx) {
  try {
    const { start, days } = ramadhan2027Countdown()
    const date = start.toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })
    const image = await renderRamadhanCard({
      title: ctx.t('ramadhan2027.cardTitle'),
      days: Math.max(0, days),
      dateLabel: `1 Ramadhan 2027 • ${date}`,
      subtitle: ctx.t('ramadhan2027.cardSubtitle'),
    })
    const caption = days > 0
      ? ctx.t('ramadhan2027.caption', { date, days, mood: ctx.say('senang') })
      : days === 0
        ? ctx.t('ramadhan2027.captionToday', { date, mood: ctx.say('senang') })
        : ctx.t('ramadhan2027.captionPast', { date })
    return sendImage(ctx, image, { caption })
  } catch (err) {
    return ctx.reply(ctx.t('ramadhan2027.fail', { error: err.message }))
  }
}
