// Menfess: kirim pesan anonim ke seseorang lewat bot. Pengirim tidak
// ditampilkan ke penerima. Ada cooldown per pengirim dan batas panjang.
export const config = {
  name: 'menfess',
  alias: ['menfes', 'confess', 'confession'],
  category: 'fun',
  description: { id: 'Kirim pesan anonim (menfess) ke nomor seseorang lewat bot', en: 'Send an anonymous message (menfess) to someone via the bot' },
  usage: '.menfess <nomor> | <pesan>',
  example: '.menfess 6281234567890 | Semangat ya ujian besok!',
  cooldown: 30,
}

export const i18n = {
  id: {
    menfess: {
      hint: '╭─❏ 💌 「 *MENFESS* 」\n┊ Formatnya: *.menfess <nomor tujuan> | <pesan>*\n┊ Contoh: *.menfess 6281234567890 | Semangat ya ujian besok!*\n╰━━━━━━━',
      sent: '╭─❏ 💌 「 *MENFESS TERKIRIM* 」\n┊ Menfess kamu sudah KANA kirim secara anonim.\n┊ Tenang, namamu tidak ditampilkan~\n╰━━━━━━━ {mood}',
      received: '╭─❏ 💌 「 *ADA MENFESS BUAT KAMU* 」\n┊ "{message}"\n┊\n┊ ᴅᴀʀɪ: seseorang yang merahasiakan namanya.\n┊ Mau balas? Kirim menfess balik pakai *.menfess* yaa~\n╰━━━━━━━',
      badNumber: '╭─❏ 💌 「 *NOMOR TIDAK VALID* 」\n┊ Nomor tujuannya tidak valid.\n┊ Pakai format *628xxxxxxxxxx* yaa~\n╰━━━━━━━',
      tooLong: '╭─❏ 💌 「 *PESAN KEPANJANGAN* 」\n┊ Pesanmu kepanjangan (maks *500 karakter*).\n╰━━━━━━━',
      toSelf: '╭─❏ 💌 「 *MENFESS* 」\n┊ Tidak bisa menfess ke nomor sendiri lewat bot yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💌 「 *GAGAL KIRIM MENFESS* 」\n┊ Gagal kirim menfessnya: {error}\n╰━━━━━━━',
    },
  },
  en: {
    menfess: {
      hint: '╭─❏ 💌 「 *MENFESS* 」\n┊ Format: *.menfess <target number> | <message>*\n┊ Example: *.menfess 6281234567890 | Good luck with the exam!*\n╰━━━━━━━',
      sent: '╭─❏ 💌 「 *MENFESS SENT* 」\n┊ Your menfess has been sent anonymously.\n┊ Relax, your name is not shown~\n╰━━━━━━━ {mood}',
      received: '╭─❏ 💌 「 *A MENFESS FOR YOU* 」\n┊ "{message}"\n┊\n┊ ꜰʀᴏᴍ: someone keeping their name secret.\n┊ Want to reply? Send a menfess back with *.menfess*~\n╰━━━━━━━',
      badNumber: '╭─❏ 💌 「 *INVALID NUMBER* 」\n┊ The target number is not valid.\n┊ Use the *628xxxxxxxxxx* format please~\n╰━━━━━━━',
      tooLong: '╭─❏ 💌 「 *MESSAGE TOO LONG* 」\n┊ Your message is too long (max *500 characters*).\n╰━━━━━━━',
      toSelf: '╭─❏ 💌 「 *MENFESS* 」\n┊ You cannot menfess your own number through the bot~\n╰━━━━━━━',
      fail: '╭─❏ 💌 「 *FAILED TO SEND MENFESS* 」\n┊ Failed to send the menfess: {error}\n╰━━━━━━━',
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
