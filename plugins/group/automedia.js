import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { sendImage, sendVideo } from '../../src/ui/media.js'
import { webpToPng } from '../maker/toimg.js'
import { toMp4 } from '../maker/tovideo.js'

export const config = {
  name: 'automedia',
  alias: [],
  category: 'group',
  description: { id: 'Toggle auto media: stiker yang dikirim member otomatis jadi gambar/video', en: 'Toggle auto media: stickers members send automatically become images/videos' },
  usage: '.automedia <on|off>',
  example: '.automedia on',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    automedia: {
      changed: '╭─❏ 🖼️ 「 *AUTO MEDIA* 」\n┊ Siap~ *automedia* sekarang *{state}* di grup ini~\n┊ Stiker dari member bakal KANA jadikan gambar/video otomatis~\n╰━━━━━━━ {mood}',
      on: 'AKTIF', off: 'mati',
      usage: '╭─❏ 🖼️ 「 *AUTO MEDIA* 」\n┊ Pakai: *.automedia on* atau *.automedia off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━',
    },
  },
  en: {
    automedia: {
      changed: '╭─❏ 🖼️ 「 *AUTO MEDIA* 」\n┊ Got it~ *automedia* is now *{state}* in this group~\n┊ Stickers from members will automatically become images/videos~\n╰━━━━━━━ {mood}',
      on: 'ON', off: 'off',
      usage: '╭─❏ 🖼️ 「 *AUTO MEDIA* 」\n┊ Use: *.automedia on* or *.automedia off*\n┊ Current status: *{state}*\n╰━━━━━━━',
    },
  },
}

const KEY = 'automedia'
export const test = { input: '.automedia on', expect: /AUTO MEDIA[\s\S]*AKTIF/ }

export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('automedia.usage', { state: ctx.t(settings[KEY] ? 'automedia.on' : 'automedia.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('automedia.changed', { state: ctx.t(value ? 'automedia.on' : 'automedia.off'), mood: ctx.say('senang') }))
}

// Bila automedia aktif di grup, stiker dari member langsung dibalas versi
// gambar (statis) atau video (animasi) nya. Gagal konversi diam saja.
export async function before(ctx) {
  if (!ctx.isGroup) return
  const sticker = ctx.raw?.message?.stickerMessage
  if (!sticker) return
  let settings
  try {
    settings = await getGroupSettings(ctx.storage, ctx.chat)
  } catch {
    return
  }
  if (!settings.automedia) return
  try {
    const buffer = await ctx.downloadMedia()
    if (!buffer) return
    if (sticker.isAnimated) {
      const mp4 = await toMp4(buffer)
      await sendVideo(ctx, mp4, {})
    } else {
      const png = await webpToPng(buffer)
      await sendImage(ctx, png, {})
    }
  } catch {}
}
