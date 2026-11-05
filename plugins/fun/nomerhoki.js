import { sendButtons } from '../../src/ui/buttons.js'
import { getNomorHoki } from '../../src/scrapers/search/primbon.js'

// Nomor hoki primbon: angka bagua dan energi nomor HP dari API primbon
// Siputzx, sama seperti padanan Elaina-MD. Tidak ada lagi angka karangan
// dari hash nama.
export const config = {
  name: 'nomerhoki',
  alias: ['nomorhoki', 'ceknomor', 'angkaberkah'],
  category: 'fun',
  description: { id: 'Cek keberuntungan nomor HP menurut data primbon', en: 'Check a phone number luck from primbon data' },
  usage: '.nomerhoki <nomor hp>',
  example: '.nomerhoki 6281234567890',
  cooldown: 5,
}

export const i18n = {
  id: {
    nomerhoki: {
      usage: '╭─❏ 🍀 「 *NOMOR HOKI* 」\n┊ Tulis nomor HP-nya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.nomerhoki 6281234567890*\n╰━━━━━━━',
      title: 'Nomor Hoki Primbon',
      result: '╭─❏ 🍀 「 *NOMOR HOKI PRIMBON* 」\n┊ ɴᴏᴍᴏʀ: *{nomor}*\n┊\n┊ 📊 ᴀɴɢᴋᴀ ʙᴀɢᴜᴀ: *{bagua}%*\n┊\n┊ ✅ ᴇɴᴇʀɢɪ ᴘᴏꜱɪᴛɪꜰ: *{posTotal}%*\n┊ Kekayaan: {kekayaan}\n┊ Kesehatan: {kesehatan}\n┊ Cinta: {cinta}\n┊ Kestabilan: {kestabilan}\n┊\n┊ ❌ ᴇɴᴇʀɢɪ ɴᴇɢᴀᴛɪꜰ: *{negTotal}%*\n┊ Perselisihan: {perselisihan}\n┊ Kehilangan: {kehilangan}\n┊ Malapetaka: {malapetaka}\n┊ Kehancuran: {kehancuran}\n┊\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n╰━━━━━━━',
      statusHoki: '✅ HOKI',
      statusTidak: '❌ TIDAK HOKI',
      fail: '╭─❏ 💦 「 *NOMOR HOKI GAGAL* 」\n┊ Mouu, sumber data primbonnya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Nomor Lain',
    },
  },
  en: {
    nomerhoki: {
      usage: '╭─❏ 🍀 「 *LUCKY NUMBER* 」\n┊ Write the phone number first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.nomerhoki 6281234567890*\n╰━━━━━━━',
      title: 'Primbon Lucky Number',
      result: '╭─❏ 🍀 「 *PRIMBON LUCKY NUMBER* 」\n┊ ɴᴜᴍʙᴇʀ: *{nomor}*\n┊\n┊ 📊 ʙᴀɢᴜᴀ ɴᴜᴍʙᴇʀ: *{bagua}%*\n┊\n┊ ✅ ᴘᴏꜱɪᴛɪᴠᴇ ᴇɴᴇʀɢʏ: *{posTotal}%*\n┊ Wealth: {kekayaan}\n┊ Health: {kesehatan}\n┊ Love: {cinta}\n┊ Stability: {kestabilan}\n┊\n┊ ❌ ɴᴇɢᴀᴛɪᴠᴇ ᴇɴᴇʀɢʏ: *{negTotal}%*\n┊ Conflict: {perselisihan}\n┊ Loss: {kehilangan}\n┊ Calamity: {malapetaka}\n┊ Destruction: {kehancuran}\n┊\n┊ ꜱᴛᴀᴛᴜꜱ: *{status}*\n╰━━━━━━━',
      statusHoki: '✅ LUCKY',
      statusTidak: '❌ NOT LUCKY',
      fail: '╭─❏ 💦 「 *LUCKY NUMBER FAILED* 」\n┊ Mouu, the primbon data source cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Number',
    },
  },
}

export const test = { input: '.nomerhoki 6281234567890', expect: /nomor hoki primbon|primbon lucky number/i }

// Ambil digit nomor saja dari teks bebas; spasi dan tanda hubung dibuang.
export function cleanPhone(text) {
  return String(text || '').replace(/\D/g, '')
}

export function formatNomorHoki(t, data) {
  return t('nomerhoki.result', {
    nomor: data.nomor,
    bagua: data.bagua,
    posTotal: data.positif.total,
    kekayaan: data.positif.kekayaan,
    kesehatan: data.positif.kesehatan,
    cinta: data.positif.cinta,
    kestabilan: data.positif.kestabilan,
    negTotal: data.negatif.total,
    perselisihan: data.negatif.perselisihan,
    kehilangan: data.negatif.kehilangan,
    malapetaka: data.negatif.malapetaka,
    kehancuran: data.negatif.kehancuran,
    status: t(data.hoki ? 'nomerhoki.statusHoki' : 'nomerhoki.statusTidak'),
  })
}

export async function handler(ctx) {
  const digits = cleanPhone(ctx.text || (ctx.args || []).join(' '))
  if (digits.length < 9) return ctx.reply(ctx.t('nomerhoki.usage'))
  let data
  try {
    data = await getNomorHoki(digits)
  } catch (err) {
    return ctx.reply(ctx.t('nomerhoki.fail', { message: err.message }))
  }
  const body = formatNomorHoki(ctx.t, data)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('nomerhoki.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('nomerhoki.btnAgain'), id: '.nomerhoki' }],
    textFallback: body,
  })
}
