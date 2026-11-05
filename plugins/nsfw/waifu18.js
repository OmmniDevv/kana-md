
import { sendButtons } from '../../src/ui/buttons.js'
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
export const config = {
  name: "waifu18",
  alias: ["neko18", "boobs", "corean", "tik18"],
  category: "nsfw",
  description: { id: "Fitur waifu18 versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD waifu18 feature, rewritten in KANA style" },
  usage: ".waifu18",
  example: ".waifu18",
  cooldown: 5,
  isPrivate: true,
}

export const i18n = {
  id: {
    "waifu18": {
      gate: "╭─❏ 🔞 「 *KONTEN DEWASA* 」\n┊ Fitur ini khusus *18 tahun ke atas*, cuma bisa di chat pribadi.\n┊ Kalau kamu memang sudah 18+, pencet tombol di bawah buat konfirmasi sekali saja yaa~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *KONFIRMASI TERSIMPAN* 」\n┊ Siap, konfirmasi 18+ kamu sudah KANA simpan~\n┊ Ketik lagi *.waifu18* buat memakai fiturnya yaa~\n╰━━━━━━━",
      btnConfirm: "Saya sudah 18+",
      body: "╭─❏ 🔞 「 *WAIFU18* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🔞 「 *WAIFU18* 」\n┊ Tulis kata kuncinya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.waifu18 kata kunci*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal: *{message}*\n╰━━━━━━━",
    },
  },
  en: {
    "waifu18": {
      gate: "╭─❏ 🔞 「 *ADULT CONTENT* 」\n┊ This feature is for *18 years and older* only, private chat only.\n┊ If you are really 18+, tap the button below to confirm once~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *CONFIRMATION SAVED* 」\n┊ Got it, your 18+ confirmation is saved~\n┊ Type *.waifu18* again to use the feature~\n╰━━━━━━━",
      btnConfirm: "I am 18 or older",
      body: "╭─❏ 🔞 「 *WAIFU18* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🔞 「 *WAIFU18* 」\n┊ Write a keyword please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.waifu18 keyword*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed: *{message}*\n╰━━━━━━━",
    },
  },
}

const MODE = "image"
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
  const q = (ctx.text || '').trim()
  try {
    if (MODE === 'image') {
      const res = await fetch('https://api.waifu.im/search?included_tags=' + encodeURIComponent('waifu18' === 'hentai' ? 'hentai' : 'waifu') + '&is_nsfw=true', { signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      const img = data.images && data.images[0] && data.images[0].url
      if (!img) throw new Error('empty')
      const media = await withBreaker('waifu-im', () => downloadBuffer(img, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 }))
      await sendImage(ctx, media.buffer, { caption: ctx.t('waifu18.body', { text: q || 'waifu18' }) })
      return ctx.reply(ctx.t('waifu18.body', { text: q || 'waifu18' }))
    }
    const links = {
      xnxxsearch: 'https://www.xnxx.com/search/', xvideos: 'https://www.xvideos.com/?k=', nh: 'https://nhentai.net/search/?q=',
      filebokep: 'https://www.xnxx.com/search/', nsfw: 'https://www.xvideos.com/?k=', asupan: 'https://www.tiktok.com/search?q=',
      asupantiktok: 'https://www.tiktok.com/search?q=', santuy: 'https://www.tiktok.com/search?q=', ukhty: 'https://www.tiktok.com/search?q=',
    }
    const base = links['waifu18'] || 'https://duckduckgo.com/?q='
    const text = 'Hasil publik untuk kata kunci kamu ada di tautan pencarian ini yaa: ' + base + encodeURIComponent(q || 'waifu18')
    return ctx.reply(ctx.t('waifu18.body', { text }))
  } catch (err) {
    return ctx.reply(ctx.t('waifu18.fail', { message: err.message }))
  }
}
