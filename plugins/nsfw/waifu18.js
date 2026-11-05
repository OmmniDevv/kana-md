// Gambar waifu dewasa 18+ acak. Port perilaku RYO-YAMADA-MD
// plugins/nsfw/waifu.js (perintah waifunsfw) atas perintah owner
// 2026-11-05 sebagai fitur premium, ditulis ulang gaya KANA. Sumber
// RYO api.waifu.im mati dari VM, diganti NekosAPI + Konachan yang
// terverifikasi hidup (lihat src/scrapers/nsfw/adult-image.js).
import { sendButtons } from '../../src/ui/buttons.js'
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
import { fetchAdultImage } from '../../src/scrapers/nsfw/adult-image.js'

export const config = {
  name: "waifu18",
  alias: ["neko18", "boobs", "corean", "tik18", "waifunsfw"],
  category: "nsfw",
  description: { id: "Gambar waifu dewasa 18+ acak (premium, khusus 18+, chat pribadi)", en: "Random 18+ adult waifu image (premium, 18+ only, private chat)" },
  usage: ".waifu18",
  example: ".waifu18",
  cooldown: 5,
  isPrivate: true,
  premium: true,
}

export const i18n = {
  id: {
    "waifu18": {
      gate: "╭─❏ 🔞 「 *KONTEN DEWASA* 」\n┊ Fitur ini khusus *18 tahun ke atas*, cuma bisa di chat pribadi.\n┊ Kalau kamu memang sudah 18+, pencet tombol di bawah buat konfirmasi sekali saja yaa~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *KONFIRMASI TERSIMPAN* 」\n┊ Siap, konfirmasi 18+ kamu sudah KANA simpan~\n┊ Ketik lagi *.waifu18* buat memakai fiturnya yaa~\n╰━━━━━━━",
      btnConfirm: "Saya sudah 18+",
      body: "╭─❏ 🔞 「 *WAIFU 18+* 」\n┊ Gambar waifu dewasa acak buat kamu~\n┊ Sumber: {source}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal: *{message}*\n╰━━━━━━━",
    },
  },
  en: {
    "waifu18": {
      gate: "╭─❏ 🔞 「 *ADULT CONTENT* 」\n┊ This feature is for *18 years and older* only, private chat only.\n┊ If you are really 18+, tap the button below to confirm once~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *CONFIRMATION SAVED* 」\n┊ Got it, your 18+ confirmation is saved~\n┊ Type *.waifu18* again to use the feature~\n╰━━━━━━━",
      btnConfirm: "I am 18 or older",
      body: "╭─❏ 🔞 「 *WAIFU 18+* 」\n┊ A random adult waifu image for you~\n┊ Source: {source}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed: *{message}*\n╰━━━━━━━",
    },
  },
}

export const test = { input: '.waifu18', expect: /18/ }
export async function handler(ctx) {
  const key = 'adult18:' + ctx.senderDigits
  const saved = await ctx.storage.get('kv', key)
  if ((ctx.args[0] || '').toLowerCase() === 'dewasa') {
    await ctx.storage.set('kv', key, { confirmedAt: Date.now() })
    return ctx.reply(ctx.t('waifu18.confirmed'))
  }
  if (!saved) {
    const body = ctx.t('waifu18.gate')
    return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('waifu18.btnConfirm'), id: '.waifu18 dewasa' }], textFallback: body })
  }
  try {
    const img = await withBreaker('adult-image', () => fetchAdultImage('waifunsfw'))
    const media = await withBreaker('adult-image', () => downloadBuffer(img.url, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 }))
    return sendImage(ctx, media.buffer, { caption: ctx.t('waifu18.body', { source: img.source }) })
  } catch (err) {
    return ctx.reply(ctx.t('waifu18.fail', { message: err.message }))
  }
}
