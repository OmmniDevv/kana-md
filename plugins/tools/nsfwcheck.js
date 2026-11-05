// Cek NSFW gambar via fungsi klasifikasi Nyckel (alat moderasi, bukan konten dewasa).
// Diadaptasi dari snippet "Nsfw checker" by FruatreMaou (kiriman user 2026-11-05),
// ditulis ulang gaya KANA. Input URL gambar, atau gambar kutipan (dikirim sebagai
// data URI karena endpoint Nyckel menerima data gambar langsung).
import axios from 'axios'

export const config = {
  name: "nsfwcheck",
  alias: [],
  category: "tools",
  description: { id: "Cek apakah gambar mengandung unsur NSFW buat moderasi, pakai klasifikasi Nyckel", en: "Check whether an image contains NSFW elements for moderation, using Nyckel classification" },
  usage: ".nsfwcheck <url gambar> atau balas gambar",
  example: ".nsfwcheck https://picsum.photos/400/600.jpg",
  cooldown: 10,
}

export const i18n = {
  id: {
    "nsfwcheck": {
      hint: "╭─❏ 🛡️ 「 *CEK NSFW GAMBAR* 」\n┊ Kirim URL gambarnya, atau balas sebuah gambar yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.nsfwcheck https://picsum.photos/400/600.jpg*\n╰━━━━━━━",
      working: "╭─❏ 🛡️ 「 *LAGI MEMERIKSA* 」\n┊ Sebentar, gambarnya lagi diperiksa dulu yaa... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🛡️ 「 *HASIL CEK NSFW* 」\n┊ ʟᴀʙᴇʟ: *{label}*\n┊ ᴋᴇʏᴀᴋɪɴᴀɴ: *{confidence}%*\n┊ {verdict}\n╰━━━━━━━",
      safe: "Menurut klasifikasinya gambar ini tergolong aman~",
      risky: "Hati hati, klasifikasinya mengarah ke konten dewasa. Cocok ditahan buat moderasi~",
      fail: "╭─❏ 💦 「 *PEMERIKSAAN GAGAL* 」\n┊ Mouu, pemeriksaannya gagal: *{message}*\n┊ Layanan Nyckel lagi bermasalah atau gambarnya tidak bisa dijangkau, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "nsfwcheck": {
      hint: "╭─❏ 🛡️ 「 *IMAGE NSFW CHECK* 」\n┊ Send the image URL, or reply to an image~\n┊ ᴇxᴀᴍᴘʟᴇ: *.nsfwcheck https://picsum.photos/400/600.jpg*\n╰━━━━━━━",
      working: "╭─❏ 🛡️ 「 *CHECKING* 」\n┊ One sec, checking the image... {mood}\n╰━━━━━━━",
      result: "╭─❏ 🛡️ 「 *NSFW CHECK RESULT* 」\n┊ ʟᴀʙᴇʟ: *{label}*\n┊ ᴄᴏɴꜰɪᴅᴇɴᴄᴇ: *{confidence}%*\n┊ {verdict}\n╰━━━━━━━",
      safe: "The classifier considers this image safe~",
      risky: "Careful, the classification leans toward adult content. Worth holding for moderation~",
      fail: "╭─❏ 💦 「 *CHECK FAILED* 」\n┊ Mouu, the check failed: *{message}*\n┊ The Nyckel service is having trouble or the image is unreachable, try again later~\n╰━━━━━━━",
    },
  },
}

const INVOKE_URL = 'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke'

export async function checkNsfw(data) {
  const res = await axios.post(INVOKE_URL, { data }, {
    headers: { Accept: 'application/json, text/javascript, */*; q=0.01', 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' },
    timeout: 90000,
  })
  return { label: res.data?.labelName || '-', confidence: Number(res.data?.confidence ?? 0) }
}

export const test = { input: '.nsfwcheck https://picsum.photos/400/600.jpg', expect: /HASIL CEK NSFW|NSFW CHECK RESULT/ }
export async function handler(ctx) {
  const url = ((ctx.text || '').match(/https?:\/\/[^\s]+/) || [])[0]
  let data = url || null
  if (!data && ctx.quoted?.message?.imageMessage) {
    try {
      const buf = await ctx.downloadQuoted()
      if (buf) data = 'data:image/jpeg;base64,' + Buffer.from(buf).toString('base64')
    } catch {}
  }
  if (!data) return ctx.reply(ctx.t('nsfwcheck.hint'))
  await ctx.reply(ctx.t('nsfwcheck.working', { mood: ctx.say('mikir') }))
  try {
    const r = await checkNsfw(data)
    const risky = /nsfw|porn|adult|sex|nude|explicit/i.test(r.label)
    return ctx.reply(ctx.t('nsfwcheck.result', {
      label: r.label,
      confidence: Math.round(r.confidence * (r.confidence <= 1 ? 100 : 1)),
      verdict: ctx.t(risky ? 'nsfwcheck.risky' : 'nsfwcheck.safe'),
    }))
  } catch (err) {
    return ctx.reply(ctx.t('nsfwcheck.fail', { message: 'HTTP ' + (err.response?.status || err.message) }))
  }
}
