// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama klon
// persen hashPercent, tidak mengirim pesan ke siapa pun. Sekarang
// confess anonim NYATA mengikuti pola sehat .menfess: pesan dikirim
// lewat bot ke nomor target tanpa menyebut pengirim, pengirim hanya
// menerima konfirmasi terkirim. Nomor divalidasi lewat onWhatsApp,
// pesan dibatasi 500 karakter, dan ada cooldown per pengirim
// (config.cooldown 60 detik ditegakkan pipeline) anti spam beruntun.
export const config = {
  name: 'confess',
  alias: [],
  category: 'fun',
  description: { id: 'Kirim confess anonim ke nomor seseorang lewat bot, namamu tidak ditampilkan', en: 'Send an anonymous confession to someone via the bot, your name is not shown' },
  usage: '.confess <nomor> | <pesan>',
  example: '.confess 6281234567890 | Aku suka kamu sejak lama',
  cooldown: 60,
}

export const i18n = {
  id: {
    confess: {
      hint: '╭─❏ 💌 「 *CONFESS* 」\n┊ Formatnya: *.confess <nomor tujuan> | <pesan>*\n┊ Contoh: *.confess 6281234567890 | Aku suka kamu sejak lama*\n╰━━━━━━━',
      sent: '╭─❏ 💌 「 *CONFESS TERKIRIM* 」\n┊ Confess kamu sudah KANA kirim secara anonim.\n┊ Namamu tidak ditampilkan ke penerima~\n╰━━━━━━━ {mood}',
      received: '╭─❏ 💌 「 *ADA CONFESS BUAT KAMU* 」\n┊ "{message}"\n┊ \n┊ ᴅᴀʀɪ: seseorang yang merahasiakan namanya.\n╰━━━━━━━',
      badNumber: '╭─❏ 💌 「 *NOMOR TIDAK VALID* 」\n┊ Nomor tujuannya tidak valid atau tidak terdaftar di WhatsApp.\n┊ Pakai format *628xxxxxxxxxx* yaa~\n╰━━━━━━━',
      tooLong: '╭─❏ 💌 「 *PESAN KEPANJANGAN* 」\n┊ Pesanmu kepanjangan (maks *500 karakter*).\n╰━━━━━━━',
      toSelf: '╭─❏ 💌 「 *CONFESS* 」\n┊ Tidak bisa confess ke nomor sendiri lewat bot yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💌 「 *GAGAL KIRIM CONFESS* 」\n┊ Gagal kirim confessnya: {error}\n╰━━━━━━━',
    },
  },
  en: {
    confess: {
      hint: '╭─❏ 💌 「 *CONFESS* 」\n┊ Format: *.confess <target number> | <message>*\n┊ Example: *.confess 6281234567890 | I have liked you for a long time*\n╰━━━━━━━',
      sent: '╭─❏ 💌 「 *CONFESS SENT* 」\n┊ Your confession has been sent anonymously.\n┊ Your name is not shown to the recipient~\n╰━━━━━━━ {mood}',
      received: '╭─❏ 💌 「 *A CONFESSION FOR YOU* 」\n┊ "{message}"\n┊ \n┊ ꜰʀᴏᴍ: someone keeping their name secret.\n╰━━━━━━━',
      badNumber: '╭─❏ 💌 「 *INVALID NUMBER* 」\n┊ The target number is invalid or not registered on WhatsApp.\n┊ Use the *628xxxxxxxxxx* format please~\n╰━━━━━━━',
      tooLong: '╭─❏ 💌 「 *MESSAGE TOO LONG* 」\n┊ Your message is too long (max *500 characters*).\n╰━━━━━━━',
      toSelf: '╭─❏ 💌 「 *CONFESS* 」\n┊ You cannot confess to your own number through the bot~\n╰━━━━━━━',
      fail: '╭─❏ 💌 「 *FAILED TO SEND CONFESS* 」\n┊ Failed to send the confession: {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.confess 6285869074622 | Halo, ini confess uji dari KANA', expect: /CONFESS TERKIRIM|CONFESS SENT/ }

export function parseConfess(raw) {
  const sep = raw.indexOf('|')
  if (sep < 1) return null
  const number = raw.slice(0, sep).replace(/\D/g, '')
  const message = raw.slice(sep + 1).trim()
  if (number.length < 9 || number.length > 15 || !message) return null
  return { number, message }
}

export async function handler(ctx) {
  const parsed = parseConfess(ctx.text || '')
  if (!parsed) return ctx.reply(ctx.t('confess.hint'))
  if (parsed.message.length > 500) return ctx.reply(ctx.t('confess.tooLong'))
  if (parsed.number === ctx.senderDigits) return ctx.reply(ctx.t('confess.toSelf'))
  const jid = `${parsed.number}@s.whatsapp.net`
  try {
    const [check] = await ctx.sock.onWhatsApp(jid)
    if (check && check.exists === false) return ctx.reply(ctx.t('confess.badNumber'))
    await ctx.sock.sendMessage(jid, { text: ctx.t('confess.received', { message: parsed.message }) })
    return ctx.reply(ctx.t('confess.sent', { mood: ctx.say('senang') }))
  } catch (err) {
    return ctx.reply(ctx.t('confess.fail', { error: err.message }))
  }
}
