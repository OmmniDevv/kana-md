import { toStickerWebp, injectStickerExif, stickerMeta } from '../../src/services/sticker.js'
import { sendButtons } from '../../src/ui/buttons.js'
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'sticker',
  alias: ['s', 'stiker'],
  category: 'maker',
  description: { id: 'Ubah gambar atau video yang dikutip jadi stiker', en: 'Turn a quoted image or video into a sticker' },
  usage: '.sticker (kutip gambar/video) atau .sticker <pack>|<author>',
  example: '.sticker KANA|KANA by OmniDevv',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    sticker: {
      needMedia: 'Kutip gambar atau videonya dulu yaa, terus ketik .sticker~',
      tooBig: 'Mouu, medianya kegedean. Batas gambar 16 MB dan video 64 MB ya~',
      failed: 'Mouu, gagal bikin stikernya: {message}. Coba media lain ya~',
      done: 'Stikernya jadii~ Mau lanjut ke mana?',
      menuButton: 'Menu Maker',
      toimgButton: 'Jadi Gambar',
      title: 'KANA',
    },
  },
  en: {
    sticker: {
      needMedia: 'Quote an image or video first, then type .sticker~',
      tooBig: 'Mouu, the media is too big. Limits are 16 MB for images and 64 MB for videos~',
      failed: 'Mouu, failed to make the sticker: {message}. Try other media~',
      done: 'Your sticker is ready~ Where to next?',
      menuButton: 'Maker Menu',
      toimgButton: 'To Image',
      title: 'KANA',
    },
  },
}

export function mediaKindOf(message) {
  if (!message) return null
  if (message.imageMessage) return { kind: 'image', node: message.imageMessage }
  if (message.videoMessage) return { kind: 'video', node: message.videoMessage }
  if (message.stickerMessage) return { kind: 'sticker', node: message.stickerMessage }
  if (message.documentMessage) return { kind: 'document', node: message.documentMessage }
  return null
}

export async function fetchSourceMedia(ctx) {
  if (ctx.quoted?.message) {
    const info = mediaKindOf(ctx.quoted.message)
    if (info) return { ...info, buffer: await ctx.downloadQuoted() }
  }
  const own = mediaKindOf(ctx.raw?.message)
  if (own) return { ...own, buffer: await ctx.downloadMedia() }
  return null
}

export function isAnimatedSource(src) {
  if (!src) return false
  if (src.kind === 'video') return true
  if (src.kind === 'sticker') return Boolean(src.node?.isAnimated)
  const mime = src.node?.mimetype || ''
  return /gif/i.test(mime)
}

// Kirim stiker WebP dengan EXIF pack; gagal injeksi tetap kirim tanpa EXIF.
export async function sendSticker(ctx, webp, meta = {}) {
  let out = webp
  try {
    out = injectStickerExif(webp, stickerMeta(meta))
  } catch {
    out = webp
  }
  return ctx.sock.sendMessage(ctx.chat, { sticker: out }, { quoted: ctx.raw })
}

export async function handler(ctx) {
  let src
  try {
    src = await fetchSourceMedia(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('sticker.failed', { message: err.message }))
  }
  if (!src) return ctx.reply(ctx.t('sticker.needMedia'))
  if (src.kind === 'document' && !/image|webp|gif/i.test(src.node?.mimetype || '')) {
    return ctx.reply(ctx.t('sticker.needMedia'))
  }
  const max = src.kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (src.buffer.length > max) return ctx.reply(ctx.t('sticker.tooBig'))

  // Argumen opsional: .sticker <pack>|<author> menimpa env sekali pakai.
  const meta = {}
  const raw = ctx.text.trim()
  if (raw.includes('|')) {
    const [pack, author] = raw.split('|').map((s) => s.trim())
    if (pack) meta.packName = pack
    if (author) meta.publisher = author
  } else if (raw) {
    meta.packName = raw
  }

  let webp
  try {
    webp = await toStickerWebp(src.buffer, { animated: isAnimatedSource(src) })
  } catch (err) {
    return ctx.reply(ctx.t('sticker.failed', { message: err.message }))
  }
  await sendSticker(ctx, webp, meta)
  await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('sticker.title'),
    body: ctx.t('sticker.done'),
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('sticker.menuButton'), id: '.menu maker' },
      { text: ctx.t('sticker.toimgButton'), id: '.toimg' },
    ],
    textFallback: ctx.t('sticker.done'),
  })
}
