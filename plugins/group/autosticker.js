import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { toStickerWebp } from '../../src/services/sticker.js'
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '../../src/ui/media.js'
import { sendSticker } from '../maker/sticker.js'

export const config = {
  name: 'autosticker',
  alias: [],
  category: 'group',
  description: { id: 'Toggle auto sticker: gambar/video yang dikirim member otomatis jadi stiker', en: 'Toggle auto sticker: images/videos members send automatically become stickers' },
  usage: '.autosticker <on|off>',
  example: '.autosticker on',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    autosticker: {
      changed: '╭─❏ 🏷️ 「 *AUTO STICKER* 」\n┊ Siap~ *autosticker* sekarang *{state}* di grup ini~\n┊ Gambar/video dari member bakal KANA jadikan stiker otomatis~\n╰━━━━━━━ {mood}',
      on: 'AKTIF', off: 'mati',
      usage: '╭─❏ 🏷️ 「 *AUTO STICKER* 」\n┊ Pakai: *.autosticker on* atau *.autosticker off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━',
    },
  },
  en: {
    autosticker: {
      changed: '╭─❏ 🏷️ 「 *AUTO STICKER* 」\n┊ Got it~ *autosticker* is now *{state}* in this group~\n┊ Images/videos from members will automatically become stickers~\n╰━━━━━━━ {mood}',
      on: 'ON', off: 'off',
      usage: '╭─❏ 🏷️ 「 *AUTO STICKER* 」\n┊ Use: *.autosticker on* or *.autosticker off*\n┊ Current status: *{state}*\n╰━━━━━━━',
    },
  },
}

const KEY = 'autosticker'
export const test = { input: '.autosticker on', expect: /AUTO STICKER[\s\S]*AKTIF/ }

export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('autosticker.usage', { state: ctx.t(settings[KEY] ? 'autosticker.on' : 'autosticker.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('autosticker.changed', { state: ctx.t(value ? 'autosticker.on' : 'autosticker.off'), mood: ctx.say('senang') }))
}

// Bila autosticker aktif di grup, gambar/video biasa dari member langsung
// dibalas versi stikernya. Gagal konversi diam saja supaya obrolan grup
// tidak terganggu.
export async function before(ctx) {
  if (!ctx.isGroup) return
  const msg = ctx.raw?.message ?? {}
  const kind = msg.imageMessage ? 'image' : msg.videoMessage ? 'video' : null
  if (!kind) return
  let settings
  try {
    settings = await getGroupSettings(ctx.storage, ctx.chat)
  } catch {
    return
  }
  if (!settings.autosticker) return
  try {
    const buffer = await ctx.downloadMedia()
    const max = kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (!buffer || buffer.length > max) return
    const webp = await toStickerWebp(buffer, { animated: kind === 'video' })
    await sendSticker(ctx, webp)
  } catch {}
}
