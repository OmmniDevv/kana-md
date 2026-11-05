// Videy: unduh video dari tautan videy.co (v?id=<id>) lewat CDN
// publiknya. Ditulis ulang total 2026-11-05: versi lama adalah klon
// generik salah label yang meneruskan URL apa pun ke downloader
// YouTube (PLATFORM "youtube") sehingga menggantung 120 detik pada
// tes live; versi ini mengunduh berkas videy yang sebenarnya.
import { downloadVidey } from '../../src/scrapers/download/videy.js'

export const config = {
  name: 'videy',
  alias: [],
  category: 'download',
  description: { id: 'Download video dari videy.co', en: 'Download a video from videy.co' },
  usage: '.videy <link videy.co>',
  example: '.videy https://videy.co/v/?id=JrNCwEbD1',
  cooldown: 5,
  limitGroup: 'download',
}

export const i18n = {
  id: {
    videy: {
      hint: '╭─❏ 📥 「 *VIDEY* 」\n┊ Kirim link videy.co-nya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.videy https://videy.co/v/?id=JrNCwEbD1*\n╰━━━━━━━',
      working: '╭─❏ 📥 「 *LAGI DIAMBIL* 」\n┊ Sebentar, KANA ambil videonya dari videy dulu... {mood}\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *UNDUHAN GAGAL* 」\n┊ Mouu, unduhannya gagal: *{message}*\n┊ Pastikan link videy-nya benar dan videonya masih ada ya~\n╰━━━━━━━',
      caption: '╭─❏ 📥 「 *VIDEY* 」\n┊ Nih videonya~\n╰━━━━━━━',
    },
  },
  en: {
    videy: {
      hint: '╭─❏ 📥 「 *VIDEY* 」\n┊ Send the videy.co link first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.videy https://videy.co/v/?id=JrNCwEbD1*\n╰━━━━━━━',
      working: '╭─❏ 📥 「 *FETCHING IT* 」\n┊ One sec, KANA is fetching the video from videy... {mood}\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *DOWNLOAD FAILED* 」\n┊ Mouu, the download failed: *{message}*\n┊ Make sure the videy link is right and the video still exists please~\n╰━━━━━━━',
      caption: '╭─❏ 📥 「 *VIDEY* 」\n┊ Here is your video~\n╰━━━━━━━',
    },
  },
}

// Input uji adalah tautan videy asli berisi klip uji yang diunggah
// KANA sendiri (terverifikasi: berkas CDN identik dengan unggahan).
export const test = { input: '.videy https://videy.co/v/?id=JrNCwEbD1', expect: /VIDEY/ }

export async function handler(ctx, { fetchVideo = downloadVidey } = {}) {
  const url = ((ctx.text || '').match(/https?:\/\/[^\s]+/) || [])[0]
  if (!url) return ctx.reply(ctx.t('videy.hint'))
  await ctx.reply(ctx.t('videy.working', { mood: ctx.say('mikir') }))
  try {
    const video = await fetchVideo(url)
    await ctx.sock.sendMessage(ctx.chat, { video: video.buffer, caption: ctx.t('videy.caption') }, { quoted: ctx.raw })
    return undefined
  } catch (err) {
    return ctx.reply(ctx.t('videy.fail', { message: err.message }))
  }
}
