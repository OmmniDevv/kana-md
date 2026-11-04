import { getGroupSettings } from '../../src/services/group-service.js'
import { sleep } from '../../src/scrapers/runner.js'

export const config = {
  name: 'broadcast',
  alias: ['bc', 'bcgc', 'broadcastgroup', 'bcgcb', 'bcchats', 'broadcastchats', 'bchere'],
  category: 'owner',
  description: { id: 'Kirim siaran ke grup dan chat yang opt-in', en: 'Send a broadcast to opted-in groups and chats' },
  usage: '.broadcast <teks>',
  example: '.broadcast Halo semua, KANA punya info baru nih~',
  cooldown: 10,
  isOwner: true,
}

export const i18n = {
  id: {
    broadcast: {
      hint: '╭─❏ 📢 「 *SIARAN* 」\n┊ Tulis teks siarannya dulu yaa, Master.\n┊ ᴄᴏɴᴛᴏʜ: *.broadcast Halo semua~*\n╰━━━━━━━',
      noTargets: '╭─❏ 📢 「 *BELUM ADA TARGET SIARAN* 」\n┊ Mouu, belum ada chat yang opt-in siaran nih, Master.\n┊ Grup bisa opt-in pakai *.subscribe* dulu yaa~ {mood}\n╰━━━━━━━',
      tag: '📢 *Siaran dari KANA:*',
      sending: '╭─❏ 📢 「 *SIARAN DIKIRIM* 」\n┊ ᴛᴀʀɢᴇᴛ: *{total} chat*\n┊ Siap, Master~ KANA kirim siarannya pelan pelan biar aman...\n╰━━━━━━━',
      done: '╭─❏ 📢 「 *SIARAN BERES* 」\n┊ ᴛᴇʀᴋɪʀɪᴍ: *{ok}*\n┊ ɢᴀɢᴀʟ: *{fail}*\n┊ ᴛᴏᴛᴀʟ ᴛᴀʀɢᴇᴛ: *{total}*\n┊ Siaran beres yaa, Master~ {mood}\n╰━━━━━━━',
    },
  },
  en: {
    broadcast: {
      hint: '╭─❏ 📢 「 *BROADCAST* 」\n┊ Write the broadcast text first, Master.\n┊ ᴇxᴀᴍᴘʟᴇ: *.broadcast Hello everyone~*\n╰━━━━━━━',
      noTargets: '╭─❏ 📢 「 *NO BROADCAST TARGETS YET* 」\n┊ Mouu, no chat has opted in to broadcasts yet, Master.\n┊ Groups can opt in with *.subscribe* first~ {mood}\n╰━━━━━━━',
      tag: '📢 *Broadcast from KANA:*',
      sending: '╭─❏ 📢 「 *BROADCAST SENDING* 」\n┊ ᴛᴀʀɢᴇᴛ: *{total} chats*\n┊ Got it, Master~ KANA is sending it slowly to stay safe...\n╰━━━━━━━',
      done: '╭─❏ 📢 「 *BROADCAST DONE* 」\n┊ ꜱᴇɴᴛ: *{ok}*\n┊ ꜰᴀɪʟᴇᴅ: *{fail}*\n┊ ᴛᴏᴛᴀʟ ᴛᴀʀɢᴇᴛꜱ: *{total}*\n┊ Broadcast done, Master~ {mood}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.broadcast', expect: /siaran/i }

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('broadcast.hint'))

  const targets = new Set()
  let groupJids = []
  try {
    groupJids = await ctx.storage.keys('groups')
  } catch {
    groupJids = []
  }
  for (const jid of groupJids) {
    const settings = await getGroupSettings(ctx.storage, jid)
    if (settings.broadcastOptIn === true) targets.add(jid)
  }
  try {
    const extra = await ctx.storage.get('kv', 'broadcast_chats')
    if (Array.isArray(extra)) {
      for (const jid of extra) if (typeof jid === 'string' && jid) targets.add(jid)
    }
  } catch {
    // Daftar tambahan opsional; abaikan bila namespace kv belum ada.
  }

  const list = [...targets]
  if (!list.length) {
    return ctx.reply(ctx.t('broadcast.noTargets', { mood: ctx.say('malu') }))
  }

  await ctx.reply(ctx.t('broadcast.sending', { total: list.length }))
  const message = `${ctx.t('broadcast.tag')}\n\n${text}`
  let ok = 0
  let fail = 0
  for (let i = 0; i < list.length; i++) {
    try {
      await ctx.sock.sendMessage(list[i], { text: message })
      ok++
    } catch {
      fail++
    }
    if (i < list.length - 1) await sleep(1500)
  }
  return ctx.reply(ctx.t('broadcast.done', { ok, fail, total: list.length, mood: ctx.say('sukses') }))
}
