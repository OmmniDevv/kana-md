// Menfess: kirim pesan anonim ke seseorang lewat bot. Pengirim tidak
// ditampilkan ke penerima. Ada cooldown per pengirim dan batas panjang.
export const config = {
  name: 'menfess',
  alias: ['menfes', 'confess'],
  category: 'fun',
  description: { id: 'Kirim pesan anonim (menfess) ke nomor seseorang lewat bot', en: 'Send an anonymous message (menfess) to someone via the bot' },
  usage: '.menfess <nomor> | <pesan>',
  example: '.menfess 6281234567890 | Semangat ya ujian besok!',
  cooldown: 30,
}

export const i18n = {
  id: {
    menfess: {
      hint: 'Formatnya: .menfess <nomor tujuan> | <pesan>. Contoh: .menfess 6281234567890 | Semangat ya ujian besok!',
      sent: 'Menfess kamu sudah KANA kirim secara anonim. Tenang, namamu tidak ditampilkan~ {mood}',
      received: '💌 ADA MENFESS BUAT KAMU\n\n"{message}"\n\nDari: seseorang yang merahasiakan namanya.\nMau balas? Kirim menfess balik pakai .menfess yaa~',
      badNumber: 'Nomor tujuannya tidak valid. Pakai format 628xxxxxxxxxx yaa~',
      tooLong: 'Pesanmu kepanjangan (maks 500 karakter).',
      toSelf: 'Tidak bisa menfess ke nomor sendiri lewat bot yaa~',
      fail: 'Gagal kirim menfessnya: {error}',
    },
  },
  en: {
    menfess: {
      hint: 'Format: .menfess <target number> | <message>. Example: .menfess 6281234567890 | Good luck with the exam!',
      sent: 'Your menfess has been sent anonymously. Relax, your name is not shown~ {mood}',
      received: '💌 A MENFESS FOR YOU\n\n"{message}"\n\nFrom: someone keeping their name secret.\nWant to reply? Send a menfess back with .menfess~',
      badNumber: 'The target number is not valid. Use the 628xxxxxxxxxx format please~',
      tooLong: 'Your message is too long (max 500 characters).',
      toSelf: 'You cannot menfess your own number through the bot~',
      fail: 'Failed to send the menfess: {error}',
    },
  },
}

export const test = { input: '.menfess', expect: /menfess/i }

export function parseMenfess(raw) {
  const sep = raw.indexOf('|')
  if (sep < 1) return null
  const number = raw.slice(0, sep).replace(/\D/g, '')
  const message = raw.slice(sep + 1).trim()
  if (number.length < 9 || number.length > 15 || !message) return null
  return { number, message }
}

export async function handler(ctx) {
  const parsed = parseMenfess(ctx.text || '')
  if (!parsed) return ctx.reply(ctx.t('menfess.hint'))
  if (parsed.message.length > 500) return ctx.reply(ctx.t('menfess.tooLong'))
  if (parsed.number === ctx.senderDigits) return ctx.reply(ctx.t('menfess.toSelf'))
  const jid = `${parsed.number}@s.whatsapp.net`
  try {
    const [check] = await ctx.sock.onWhatsApp(jid)
    if (check && check.exists === false) return ctx.reply(ctx.t('menfess.badNumber'))
    await ctx.sock.sendMessage(jid, { text: ctx.t('menfess.received', { message: parsed.message }) })
    return ctx.reply(ctx.t('menfess.sent', { mood: ctx.say('senang') }))
  } catch (err) {
    return ctx.reply(ctx.t('menfess.fail', { error: err.message }))
  }
}
