import { assertSafeUrl } from '../../src/scrapers/runner.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'aio',
  limitGroup: 'download',
  alias: ['allinone', 'dl', 'dla'],
  category: 'download',
  description: { id: 'Deteksi platform dari link lalu arahkan ke pengunduh yang tepat', en: 'Detect the platform of a link and route to the right downloader' },
  usage: '.aio <link>',
  example: '.aio https://www.tiktok.com/@user/video/123',
  cooldown: 5,
  limit: 5,
}

export const i18n = {
  id: {
    aio: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINKNYA DULU* 」\n┊ ᴄᴏɴᴛᴏʜ: *.aio https://www.tiktok.com/...*\n╰━━━━━━━',
      invalidUrl: '╭─❏ ⚠️ 「 *LINK TIDAK VALID* 」\n┊ Mouu, link itu nggak valid atau nggak aman. Pastikan formatnya lengkap yaa~\n╰━━━━━━━',
      detected: '╭─❏ 🔗 「 *LINK TERDETEKSI* 」\n┊ ᴘʟᴀᴛꜰᴏʀᴍ: *{platform}*\n┊ KANA nggak unduh langsung dari sini; pakai tombol di bawah atau ketik perintahnya yaa:\n┊ *{command} {url}*\n╰━━━━━━━',
      unsupported: '╭─❏ 🙈 「 *BELUM DIDUKUNG* 」\n┊ Mouu, platform dari link ini belum KANA dukung.\n┊ ʏᴀɴɢ ʙɪꜱᴀ: *YouTube, Instagram, Facebook, TikTok, Spotify, MediaFire, dan Google Drive*~\n╰━━━━━━━',
      btnDownload: 'Unduh sekarang',
      platforms: {
        youtube: 'YouTube',
        instagram: 'Instagram',
        facebook: 'Facebook',
        tiktok: 'TikTok',
        spotify: 'Spotify',
        mediafire: 'MediaFire',
        gdrive: 'Google Drive',
        unknown: 'tidak dikenal',
      },
    },
  },
  en: {
    aio: {
      needUrl: '╭─❏ 🔗 「 *SEND THE LINK FIRST* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.aio https://www.tiktok.com/...*\n╰━━━━━━━',
      invalidUrl: '╭─❏ ⚠️ 「 *INVALID LINK* 」\n┊ Mouu, that link is not valid or not safe. Make sure the format is complete~\n╰━━━━━━━',
      detected: '╭─❏ 🔗 「 *LINK DETECTED* 」\n┊ ᴘʟᴀᴛꜰᴏʀᴍ: *{platform}*\n┊ KANA does not download directly here; use the button below or type the command:\n┊ *{command} {url}*\n╰━━━━━━━',
      unsupported: '╭─❏ 🙈 「 *NOT SUPPORTED YET* 」\n┊ Mouu, the platform of this link is not supported by KANA yet.\n┊ ꜱᴜᴘᴘᴏʀᴛᴇᴅ: *YouTube, Instagram, Facebook, TikTok, Spotify, MediaFire, and Google Drive*~\n╰━━━━━━━',
      btnDownload: 'Download now',
      platforms: {
        youtube: 'YouTube',
        instagram: 'Instagram',
        facebook: 'Facebook',
        tiktok: 'TikTok',
        spotify: 'Spotify',
        mediafire: 'MediaFire',
        gdrive: 'Google Drive',
        unknown: 'unknown',
      },
    },
  },
}

const PLATFORM_COMMANDS = {
  youtube: 'ytmp4',
  instagram: 'ig',
  facebook: 'fb',
  tiktok: 'tiktok',
  spotify: 'spotify',
  mediafire: 'mediafire',
  gdrive: 'gdrive',
}

export function detectPlatform(rawUrl) {
  let host = ''
  try {
    host = new URL(String(rawUrl || '').trim()).hostname.toLowerCase()
  } catch {
    return null
  }
  if (host.includes('youtube.com') || host === 'youtu.be' || host.endsWith('.youtu.be')) return 'youtube'
  if (host.includes('instagram.com')) return 'instagram'
  if (host.includes('facebook.com') || host === 'fb.watch') return 'facebook'
  if (host.includes('tiktok.com')) return 'tiktok'
  if (host.includes('spotify.com')) return 'spotify'
  if (host.includes('mediafire.com')) return 'mediafire'
  if (host === 'drive.google.com') return 'gdrive'
  return null
}

export const test = { input: '.aio https://www.tiktok.com/@pojoksatu.id/video/7647074044960984340', expect: /TikTok/i }

export async function handler(ctx) {
  const raw = ctx.args[0]
  if (!raw) return ctx.reply(ctx.t('aio.needUrl'))
  let url
  try {
    url = assertSafeUrl(raw)
  } catch {
    return ctx.reply(ctx.t('aio.invalidUrl'))
  }
  const platform = detectPlatform(url.href)
  if (!platform) return ctx.reply(ctx.t('aio.unsupported'))
  const command = `.${PLATFORM_COMMANDS[platform]}`
  const body = ctx.t('aio.detected', {
    platform: ctx.t(`aio.platforms.${platform}`),
    command,
    url: url.href,
  })
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('aio.btnDownload'), id: `${command} ${url.href}` }],
    textFallback: body,
  })
}
