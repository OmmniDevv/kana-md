import { pinterestSearch } from '../../src/scrapers/pinterest/pinterest.js'
import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage, MAX_IMAGE_BYTES } from '../../src/ui/media.js'

// Kirim pap (foto) dari Pinterest sesuai kategori: cewe, cowo, atau
// femboy. Satu hasil acak dari pencarian potret yang aman dan publik.
export const config = {
  name: 'pap',
  alias: [],
  category: 'search',
  description: { id: 'Minta pap foto dari Pinterest: pap cewe, pap cowo, pap femboy', en: 'Ask for a photo from Pinterest: pap cewe, pap cowo, pap femboy' },
  usage: '.pap <cewe/cowo/femboy>',
  example: '.pap cewe',
  cooldown: 10,
  limit: 5,
}

export const i18n = {
  id: {
    pap: {
      needKind: '╭─❏ 🖼️ 「 *PILIH KATEGORINYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.pap cewe* | *.pap cowo* | *.pap femboy*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *PAP TIDAK KETEMU* 」\n┊ Mouu, lagi nggak ada pap buat kategori itu~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL PAP* 」\n┊ Mouu, gagal ambil pap-nya: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🖼️ 「 *PAP {kind}* 」\n┊ ɴɪʜ ᴘᴀᴘɴʏᴀ, ᴅᴀʀɪ ᴘɪɴᴛᴇʀᴇꜱᴛ~\n╰━━━━━━━',
    },
  },
  en: {
    pap: {
      needKind: '╭─❏ 🖼️ 「 *PICK A CATEGORY* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.pap cewe* | *.pap cowo* | *.pap femboy*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NO PHOTO FOUND* 」\n┊ Mouu, no photo for that category right now~\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH* 」\n┊ Mouu, failed to fetch the photo: *{message}*\n╰━━━━━━━',
      caption: '╭─❏ 🖼️ 「 *PAP {kind}* 」\n┊ ʜᴇʀᴇ ɪᴛ ɪꜱ, ꜰʀᴏᴍ ᴘɪɴᴛᴇʀᴇꜱᴛ~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.pap cewe', expect: /PAP/i }

const QUERIES = {
  cewe: 'beautiful woman portrait photography aesthetic',
  cowo: 'handsome man portrait photography aesthetic',
  femboy: 'soft aesthetic portrait fashion',
}

export async function handler(ctx, { search = pinterestSearch } = {}) {
  const kind = (ctx.text || '').trim().toLowerCase()
  const query = QUERIES[kind]
  if (!query) return ctx.reply(ctx.t('pap.needKind'))
  let pins
  try {
    pins = await search(query, { limit: 15 })
  } catch (err) {
    return ctx.reply(ctx.t('pap.failed', { message: err.message }))
  }
  const images = (pins || []).map((p) => p.image).filter(Boolean)
  if (!images.length) return ctx.reply(ctx.t('pap.notFound'))
  for (let tries = 0; tries < 3; tries += 1) {
    const url = images[Math.floor(Math.random() * images.length)]
    try {
      const { buffer } = await downloadBuffer(url, { maxBytes: MAX_IMAGE_BYTES, timeout: 30000 })
      await sendImage(ctx, buffer, { caption: ctx.t('pap.caption', { kind: kind.toUpperCase() }) })
      return undefined
    } catch {}
  }
  return ctx.reply(ctx.t('pap.failed', { message: 'gambar gagal diunduh' }))
}
