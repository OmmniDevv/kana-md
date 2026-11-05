// Lapor ke owner: teruskan pesan laporan pengguna ke nomor owner bot.
// Nomor owner dibaca dari env OWNER_NUMBER (konfigurasi, bukan rahasia).
export const config = {
  name: 'report',
  alias: ['request'],
  category: 'main',
  description: { id: 'Kirim laporan atau permintaan fitur ke owner bot', en: 'Send a report or feature request to the bot owner' },
  usage: '.report <isi laporan>',
  example: '.report Ada bug di perintah cuaca tadi',
  cooldown: 30,
}

export const i18n = {
  id: {
    report: {
      hint: '╭─❏ 📩 「 *LAPOR KE OWNER* 」\n┊ Tulis isi laporannya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.report Ada bug di perintah cuaca tadi*\n╰━━━━━━━',
      sent: '╭─❏ ✅ 「 *LAPORAN TERKIRIM* 」\n┊ Laporanmu sudah KANA teruskan ke owner.\n┊ Makasih sudah lapor~\n╰━━━━━━━ {mood}',
      forward: '╭─❏ 📩 「 *LAPORAN PENGGUNA* 」\n┊ ᴅᴀʀɪ: *{from}* ({chat})\n┊\n┊ {message}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *LAPORAN GAGAL* 」\n┊ Gagal meneruskan laporannya sekarang. Coba lagi nanti yaa~\n╰━━━━━━━',
    },
  },
  en: {
    report: {
      hint: '╭─❏ 📩 「 *REPORT TO OWNER* 」\n┊ Write your report please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.report The weather command had a bug*\n╰━━━━━━━',
      sent: '╭─❏ ✅ 「 *REPORT SENT* 」\n┊ Your report has been forwarded to the owner.\n┊ Thanks for reporting~\n╰━━━━━━━ {mood}',
      forward: '╭─❏ 📩 「 *USER REPORT* 」\n┊ ꜰʀᴏᴍ: *{from}* ({chat})\n┊\n┊ {message}\n╰━━━━━━━',
      fail: '╭─❏ ⚠️ 「 *REPORT FAILED* 」\n┊ Failed to forward the report right now. Try again later please~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.report', expect: /laporan|report/i }

export async function handler(ctx) {
  const message = (ctx.text || '').trim()
  if (!message) return ctx.reply(ctx.t('report.hint'))
  const owner = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  if (!owner) return ctx.reply(ctx.t('report.fail'))
  try {
    await ctx.sock.sendMessage(`${owner}@s.whatsapp.net`, {
      text: ctx.t('report.forward', { from: ctx.senderDigits, chat: ctx.chat, message: message.slice(0, 1500) }),
    })
    return ctx.reply(ctx.t('report.sent', { mood: ctx.say('senang') }))
  } catch {
    return ctx.reply(ctx.t('report.fail'))
  }
}
