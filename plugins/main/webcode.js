import { sendButtons } from '../../src/ui/buttons.js'
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
// (quick_reply tidak boleh dicampur jenis tombol lain). Jadi untuk
// sekarang kode dikirim sebagai teks biasa yang gampang disalin manual,
// disusul pesan tombol quick_reply [.menu] saja. Keterbatasan ini juga
// dicatat di docs/WEB.md; bila buttons.js nanti mengekspor pembangun
// cta_copy, plugin ini yang disesuaikan.
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
        'Kode login web kamu udah KANA bikin nih~ {mood}\n\nKode kamu:\n{code}\n\nBuka {url} lalu ketik kode itu yaa. Kodenya berlaku {minutes} menit dan cuma bisa dipakai sekali. Kode lama kamu langsung hangus tiap kode baru dibuat.\nJangan bagi kode ini ke siapa pun, rahasia kita berdua aja~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💕',
      follow: 'Kode di atas tinggal kamu salin terus tempel di halaman login yaa~ Mau balik jalan-jalan di bot? Pencet tombol di bawah ini aja (≧▽≦) ✨',
      btnMenu: 'Menu Utama',
      noNumber: 'Mouu, KANA nggak bisa baca nomor kamu nih... coba lagi dari chat pribadi yaa~ (╥﹏╥)',
    },
  },
  en: {
    webcode: {
      body:
        'Your web login code is ready~ {mood}\n\nYour code:\n{code}\n\nOpen {url} and type that code in. It stays valid for {minutes} minutes and can only be used once. Your previous code stops working the moment a new one is made.\nDo not share this code with anyone, keep it just between us~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💕',
      follow: 'Just copy the code above and paste it on the login page~ Want to wander around the bot again? Tap the button below (≧▽≦) ✨',
      btnMenu: 'Main Menu',
      noNumber: 'Mouu, KANA could not read your number... please try again from a private chat~ (╥﹏╥)',
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
  // Teks biasa dulu (isi kode), supaya kode tetap sampai walau tombol gagal.
  await ctx.reply(body)
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body: ctx.t('webcode.follow'),
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('webcode.btnMenu'), id: '.menu' }],
    textFallback: ctx.t('webcode.follow'),
  })
}
