
import { sendButtons } from '../../src/ui/buttons.js'
import { downloadBuffer, withBreaker } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'
export const config = {
  name: "xvideos",
  alias: ["xvsearch", "xvideosdl", "xvid"],
  category: "nsfw",
  description: { id: "Fitur xvideos versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD xvideos feature, rewritten in KANA style" },
  usage: ".xvideos",
  example: ".xvideos",
  cooldown: 5,
  isPrivate: true,
}

export const i18n = {
  id: {
    "xvideos": {
      gate: "╭─❏ 🔞 「 *KONTEN DEWASA* 」\n┊ Fitur ini khusus *18 tahun ke atas*, cuma bisa di chat pribadi.\n┊ Kalau kamu memang sudah 18+, pencet tombol di bawah buat konfirmasi sekali saja yaa~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *KONFIRMASI TERSIMPAN* 」\n┊ Siap, konfirmasi 18+ kamu sudah KANA simpan~\n┊ Ketik lagi *.xvideos* buat memakai fiturnya yaa~\n╰━━━━━━━",
      btnConfirm: "Saya sudah 18+",
      body: "╭─❏ 🔞 「 *XVIDEOS* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🔞 「 *XVIDEOS* 」\n┊ Tulis kata kuncinya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.xvideos kata kunci*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal: *{message}*\n╰━━━━━━━",
    },
  },
  en: {
    "xvideos": {
      gate: "╭─❏ 🔞 「 *ADULT CONTENT* 」\n┊ This feature is for *18 years and older* only, private chat only.\n┊ If you are really 18+, tap the button below to confirm once~\n╰━━━━━━━",
      confirmed: "╭─❏ 🔞 「 *CONFIRMATION SAVED* 」\n┊ Got it, your 18+ confirmation is saved~\n┊ Type *.xvideos* again to use the feature~\n╰━━━━━━━",
      btnConfirm: "I am 18 or older",
      body: "╭─❏ 🔞 「 *XVIDEOS* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🔞 「 *XVIDEOS* 」\n┊ Write a keyword please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.xvideos keyword*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed: *{message}*\n╰━━━━━━━",
    },
  },
}

const MODE = "link"
export const test = { input: '.xvideos', expect: /18/ }
export async function handler(ctx) {
  const key = 'adult18:' + ctx.senderDigits
  const saved = await ctx.storage.get('kv', key)
  if ((ctx.args[0] || '').toLowerCase() === 'dewasa') {
    await ctx.storage.set('kv', key, { confirmedAt: Date.now() })
    return ctx.reply(ctx.t('xvideos.confirmed'))
  }
  if (!saved) {
    const body = ctx.t('xvideos.gate')
    return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('xvideos.btnConfirm'), id: '.xvideos dewasa' }], textFallback: body })
  }
  const q = (ctx.text || '').trim()
  try {
    if (MODE === 'image') {
      const res = await fetch('https://api.waifu.im/search?included_tags=' + encodeURIComponent('xvideos' === 'hentai' ? 'hentai' : 'waifu') + '&is_nsfw=true', { signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      const img = data.images && data.images[0] && data.images[0].url
      if (!img) throw new Error('empty')
      const media = await withBreaker('waifu-im', () => downloadBuffer(img, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 }))
      await sendImage(ctx, media.buffer, { caption: ctx.t('xvideos.body', { text: q || 'xvideos' }) })
      return ctx.reply(ctx.t('xvideos.body', { text: q || 'xvideos' }))
    }
    const links = {
      xnxxsearch: 'https://www.xnxx.com/search/', xvideos: 'https://www.xvideos.com/?k=', nh: 'https://nhentai.net/search/?q=',
      filebokep: 'https://www.xnxx.com/search/', nsfw: 'https://www.xvideos.com/?k=', asupan: 'https://www.tiktok.com/search?q=',
      asupantiktok: 'https://www.tiktok.com/search?q=', santuy: 'https://www.tiktok.com/search?q=', ukhty: 'https://www.tiktok.com/search?q=',
    }
    const base = links['xvideos'] || 'https://duckduckgo.com/?q='
    const text = 'Hasil publik untuk kata kunci kamu ada di tautan pencarian ini yaa: ' + base + encodeURIComponent(q || 'xvideos')
    return ctx.reply(ctx.t('xvideos.body', { text }))
  } catch (err) {
    return ctx.reply(ctx.t('xvideos.fail', { message: err.message }))
  }
}
