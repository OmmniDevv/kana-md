import { createWebCode } from '../../src/services/web-login.js'

// Jalur cadangan login web: user meminta kode langsung dari WhatsApp
// lewat .webcode, lalu mengetik kode itu di halaman login dashboard.
// Kode disimpan sebagai hash di namespace 'web_login' (lihat
// src/services/web-login.js dan docs/WEB.md) dan kode mentahnya hanya
// muncul di balasan chat ini. Kode TIDAK PERNAH ditulis ke log.
//
// Soal tombol salin: MB.Button dari library memang mendukung addCopy
// (cta_copy), tetapi helper proyek src/ui/buttons.js saat ini hanya
// mengekspor sendButtons yang membangun quick_reply lewat addReply.
// Menyelipkan cta_copy di pesan yang sama juga melanggar aturan library
// (quick_reply tidak boleh dicampur jenis tombol lain). Jadi kode dikirim
// sebagai teks biasa berbingkai yang gampang disalin manual, tanpa tombol
// menu generik (dilarang di pesan hasil per perintah owner 2026-11-04).
// Keterbatasan ini juga dicatat di docs/WEB.md; bila buttons.js nanti
// mengekspor pembangun cta_copy, plugin ini yang disesuaikan.
export const config = {
  name: 'webcode',
  alias: ['loginweb'],
  category: 'main',
  description: {
    id: 'Minta kode login dashboard web (berlaku 10 menit, sekali pakai)',
    en: 'Request a web dashboard login code (valid 10 minutes, single use)',
  },
  usage: '.webcode',
  example: '.webcode',
  cooldown: 30,
}

export const i18n = {
  id: {
    webcode: {
      body:
        '╭─❏ 🔐 「 *KODE LOGIN WEB* 」\n┊ Kode login web kamu udah KANA bikin nih~\n┊\n┊ ᴋᴏᴅᴇ ᴋᴀᴍᴜ: *{code}*\n┊\n┊ Buka *{url}* lalu ketik kode itu yaa.\n┊ Kodenya berlaku *{minutes} menit* dan cuma bisa dipakai *sekali*.\n┊ Kode lama kamu langsung hangus tiap kode baru dibuat.\n┊ Jangan bagi kode ini ke siapa pun, rahasia kita berdua aja~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💕\n╰━━━━━━━ {mood}',
      noNumber: '╭─❏ 😿 「 *NOMOR TIDAK TERBACA* 」\n┊ Mouu, KANA nggak bisa baca nomor kamu nih...\n┊ Coba lagi dari chat pribadi yaa~ (╥﹏╥)\n╰━━━━━━━',
    },
  },
  en: {
    webcode: {
      body:
        '╭─❏ 🔐 「 *WEB LOGIN CODE* 」\n┊ Your web login code is ready~\n┊\n┊ ʏᴏᴜʀ ᴄᴏᴅᴇ: *{code}*\n┊\n┊ Open *{url}* and type that code in.\n┊ It stays valid for *{minutes} minutes* and can only be used *once*.\n┊ Your previous code stops working the moment a new one is made.\n┊ Do not share this code with anyone, keep it just between us~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💕\n╰━━━━━━━ {mood}',
      noNumber: '╭─❏ 😿 「 *NUMBER NOT READABLE* 」\n┊ Mouu, KANA could not read your number...\n┊ Please try again from a private chat~ (╥﹏╥)\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.webcode', expect: /kode/i }

export async function handler(ctx) {
  const digits = ctx.senderDigits || String(ctx.sender ?? '').replace(/\D/g, '')
  if (!digits) return ctx.reply(ctx.t('webcode.noNumber'))
  const { code } = await createWebCode(ctx.storage, digits)
  const url = process.env.WEB_LOGIN_URL?.trim() || 'https://kana.omnicorp.web.id/login'
  const body = ctx.t('webcode.body', { code, url, minutes: 10, mood: ctx.say('senang') })
  return ctx.reply(body)
}
