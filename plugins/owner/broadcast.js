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
      hint: 'Tulis teks siarannya dulu yaa, Master. Contoh: .broadcast Halo semua~',
      noTargets: 'Mouu, belum ada chat yang opt-in siaran nih, Master. Grup bisa opt-in pakai .subscribe dulu yaa~ {mood}',
      tag: 'Siaran dari KANA:',
      sending: 'Siap, Master~ KANA kirim siarannya ke {total} chat, pelan pelan biar aman...',
      done: 'Siaran beres, Master~ Terkirim: {ok}, gagal: {fail}, total target: {total}. {mood}',
    },
  },
  en: {
    broadcast: {
      hint: 'Write the broadcast text first, Master. Example: .broadcast Hello everyone~',
      noTargets: 'Mouu, no chat has opted in to broadcasts yet, Master. Groups can opt in with .subscribe first~ {mood}',
      tag: 'Broadcast from KANA:',
      sending: 'Got it, Master~ KANA is sending the broadcast to {total} chats, slowly to stay safe...',
      done: 'Broadcast done, Master~ Sent: {ok}, failed: {fail}, total targets: {total}. {mood}',
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
