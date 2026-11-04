// Lapor ke owner: teruskan pesan laporan pengguna ke nomor owner bot.
// Nomor owner dibaca dari env OWNER_NUMBER (konfigurasi, bukan rahasia).
export const config = {
  name: 'report',
  alias: ['lapor', 'request'],
  category: 'main',
  description: { id: 'Kirim laporan atau permintaan fitur ke owner bot', en: 'Send a report or feature request to the bot owner' },
  usage: '.report <isi laporan>',
  example: '.report Ada bug di perintah cuaca tadi',
  cooldown: 30,
}

export const i18n = {
  id: {
    report: {
      hint: 'Tulis isi laporannya yaa~ Contoh: .report Ada bug di perintah cuaca tadi',
      sent: 'Laporanmu sudah KANA teruskan ke owner. Makasih sudah lapor~ {mood}',
      forward: '📩 LAPORAN PENGGUNA\nDari: {from} ({chat})\n\n{message}',
      fail: 'Gagal meneruskan laporannya sekarang. Coba lagi nanti yaa~',
    },
  },
  en: {
    report: {
      hint: 'Write your report please~ Example: .report The weather command had a bug',
      sent: 'Your report has been forwarded to the owner. Thanks for reporting~ {mood}',
      forward: '📩 USER REPORT\nFrom: {from} ({chat})\n\n{message}',
      fail: 'Failed to forward the report right now. Try again later please~',
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
