
import { sendButtons } from '../../src/ui/buttons.js'
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
export const config = {
  name: "hentai",
  alias: ["hent", "hentaisearch"],
  category: "nsfw",
  description: { id: "Fitur hentai versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD hentai feature, rewritten in KANA style" },
  usage: ".hentai",
  example: ".hentai",
  cooldown: 5,
  isPrivate: true,
}

export const i18n = {
  id: {
    "hentai": {
      gate: "╭─❏ 🔞 「 *KONTEN DEWASA* 」\n┊ Fitur ini khusus *18 tahun ke atas*, cuma bisa di chat pribadi.\n┊ Kalau kamu memang sudah 18+, pencet tombol di bawah buat konfirmasi sekali saja yaa~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *KONFIRMASI TERSIMPAN* 」\n┊ Siap, konfirmasi 18+ kamu sudah KANA simpan~\n┊ Ketik lagi *.hentai* buat memakai fiturnya yaa~\n╰━━━━━━━",
      btnConfirm: "Saya sudah 18+",
      body: "╭─❏ 🔞 「 *HENTAI* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🔞 「 *HENTAI* 」\n┊ Tulis kata kuncinya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.hentai kata kunci*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal: *{message}*\n╰━━━━━━━",
    },
  },
  en: {
    "hentai": {
      gate: "╭─❏ 🔞 「 *ADULT CONTENT* 」\n┊ This feature is for *18 years and older* only, private chat only.\n┊ If you are really 18+, tap the button below to confirm once~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *CONFIRMATION SAVED* 」\n┊ Got it, your 18+ confirmation is saved~\n┊ Type *.hentai* again to use the feature~\n╰━━━━━━━",
      btnConfirm: "I am 18 or older",
      body: "╭─❏ 🔞 「 *HENTAI* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🔞 「 *HENTAI* 」\n┊ Write a keyword please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.hentai keyword*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed: *{message}*\n╰━━━━━━━",
    },
  },
}

const MODE = "image"
export const test = { input: '.hentai', expect: /18/ }
export async function handler(ctx) {
  const key = 'adult18:' + ctx.senderDigits
  const saved = await ctx.storage.get('kv', key)
  if ((ctx.args[0] || '').toLowerCase() === 'dewasa') {
    await ctx.storage.set('kv', key, { confirmedAt: Date.now() })
    return ctx.reply(ctx.t('hentai.confirmed'))
  }
  if (!saved) {
    const body = ctx.t('hentai.gate')
    return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('hentai.btnConfirm'), id: '.hentai dewasa' }], textFallback: body })
  }
  const q = (ctx.text || '').trim()
  try {
    if (MODE === 'image') {
      const res = await fetch('https://api.waifu.im/search?included_tags=' + encodeURIComponent('hentai' === 'hentai' ? 'hentai' : 'waifu') + '&is_nsfw=true', { signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      const img = data.images && data.images[0] && data.images[0].url
      if (!img) throw new Error('empty')
      const media = await withBreaker('waifu-im', () => downloadBuffer(img, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 }))
      await sendImage(ctx, media.buffer, { caption: ctx.t('hentai.body', { text: q || 'hentai' }) })
      return ctx.reply(ctx.t('hentai.body', { text: q || 'hentai' }))
    }
    const links = {
      xnxxsearch: 'https://www.xnxx.com/search/', xvideos: 'https://www.xvideos.com/?k=', nh: 'https://nhentai.net/search/?q=',
      filebokep: 'https://www.xnxx.com/search/', nsfw: 'https://www.xvideos.com/?k=', asupan: 'https://www.tiktok.com/search?q=',
      asupantiktok: 'https://www.tiktok.com/search?q=', santuy: 'https://www.tiktok.com/search?q=', ukhty: 'https://www.tiktok.com/search?q=',
    }
    const base = links['hentai'] || 'https://duckduckgo.com/?q='
    const text = 'Hasil publik untuk kata kunci kamu ada di tautan pencarian ini yaa: ' + base + encodeURIComponent(q || 'hentai')
    return ctx.reply(ctx.t('hentai.body', { text }))
  } catch (err) {
    return ctx.reply(ctx.t('hentai.fail', { message: err.message }))
  }
}
