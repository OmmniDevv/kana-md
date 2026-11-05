import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
// QRIS donasi resmi KANA, aset yang sama dengan halaman premium web
// (web/public/qris.png di repo ini).
const QRIS_PATH = join(here, '../../web/public/qris.png')

export const config = {
  name: 'donasi',
  alias: [],
  category: 'main',
  description: { id: 'Info donasi untuk mendukung KANA, lengkap dengan QRIS', en: 'Donation info to support KANA, complete with the QRIS code' },
  usage: '.donasi',
  example: '.donasi',
  cooldown: 5,
}

export const i18n = {
  id: {
    donasi: {
      caption: '╭─❏ 💖 「 *DONASI BUAT KANA* 」\n┊ Makasih banyak udah mau dukung KANA~\n┊ Donasi dipakai buat biaya server dan pengembangan bot biar KANA tetap online dan makin pintar.\n┊ 📷 Scan *QRIS* pada gambar ini (GoPay Merchant owner), nominalnya bebas seikhlasnya.\n┊ Cara lain: chat owner di *{owner}* ( {link} )\n┊ Berapa pun donasinya sangat berarti~\n╰━━━━━━━',
      fallback: '╭─❏ 💖 「 *DONASI BUAT KANA* 」\n┊ Makasih banyak udah mau dukung KANA~\n┊ Donasi dipakai buat biaya server dan pengembangan bot.\n┊ Gambar QRIS lagi tidak bisa dimuat, jadi silakan chat owner di *{owner}* ( {link} ) buat minta QRIS atau cara donasi lainnya yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    donasi: {
      caption: '╭─❏ 💖 「 *DONATE FOR KANA* 」\n┊ Thank you so much for supporting KANA~\n┊ Donations go to server costs and bot development so KANA stays online and keeps getting smarter.\n┊ 📷 Scan the *QRIS* in this image (owner GoPay Merchant), any amount you like.\n┊ Another way: chat the owner at *{owner}* ( {link} )\n┊ Any amount means a lot~\n╰━━━━━━━',
      fallback: '╭─❏ 💖 「 *DONATE FOR KANA* 」\n┊ Thank you so much for supporting KANA~\n┊ Donations go to server costs and bot development.\n┊ The QRIS image could not be loaded right now, so please chat the owner at *{owner}* ( {link} ) to ask for the QRIS or other donation options~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.donasi', expect: /donasi|donate|qris/i }

export async function handler(ctx) {
  const owner = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  const vars = { owner: owner || '-', link: owner ? `https://wa.me/${owner}` : '-' }
  let image = null
  try {
    image = await readFile(QRIS_PATH)
  } catch {
    image = null
  }
  if (!image) return ctx.reply(ctx.t('donasi.fallback', vars))
  try {
    await ctx.sock.sendMessage(ctx.chat, {
      image,
      caption: ctx.t('donasi.caption', vars),
    }, { quoted: ctx.raw })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('donasi.fail', { error: err.message }))
  }
}
