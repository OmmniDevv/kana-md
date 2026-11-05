import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { digitsOf } from '../../src/services/guard-rules.js'
import { getAiProvider } from '../../src/services/ai-provider.js'

export const config = {
  name: 'autoai',
  alias: ['aai'],
  category: 'group',
  description: { id: 'Toggle auto AI: KANA otomatis menjawab chat grup yang memanggil atau menyebutnya', en: 'Toggle auto AI: KANA automatically answers group chats that call or mention her' },
  usage: '.autoai <on|off>',
  example: '.autoai on',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  priority: 45,
}

export const i18n = {
  id: {
    autoai: {
      changed: '╭─❏ 🤖 「 *AUTO AI GRUP* 」\n┊ Siap~ *autoai* sekarang *{state}* di grup ini~\n┊ KANA bakal otomatis jawab chat yang manggil atau mention KANA yaa~\n╰━━━━━━━ {mood}',
      on: 'AKTIF', off: 'mati',
      usage: '╭─❏ 🤖 「 *AUTO AI GRUP* 」\n┊ Pakai: *.autoai on* atau *.autoai off*\n┊ Status sekarang: *{state}*\n╰━━━━━━━',
    },
  },
  en: {
    autoai: {
      changed: '╭─❏ 🤖 「 *GROUP AUTO AI* 」\n┊ Got it~ *autoai* is now *{state}* in this group~\n┊ KANA will automatically answer chats that call or mention her~\n╰━━━━━━━ {mood}',
      on: 'ON', off: 'off',
      usage: '╭─❏ 🤖 「 *GROUP AUTO AI* 」\n┊ Use: *.autoai on* or *.autoai off*\n┊ Current status: *{state}*\n╰━━━━━━━',
    },
  },
}

const KEY = 'autoai'
export const test = { input: '.autoai on', expect: /AUTO AI[\s\S]*AKTIF/ }

export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const state = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(state)) {
    return ctx.reply(ctx.t('autoai.usage', { state: ctx.t(settings[KEY] ? 'autoai.on' : 'autoai.off') }))
  }
  const value = state === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [KEY]: value })
  return ctx.reply(ctx.t('autoai.changed', { state: ctx.t(value ? 'autoai.on' : 'autoai.off'), mood: ctx.say('senang') }))
}

// Jeda minimal antar jawaban otomatis per grup, supaya autoai tidak
// membanjiri grup dan tidak menghabiskan kuota AI.
const COOLDOWN_MS = 20000
const lastReplyAt = new Map()

// Bila autoai aktif, KANA menjawab chat biasa (bukan perintah) yang
// menyebut namanya, mention bot, atau membalas pesan bot. Pesan lain
// dibiarkan, supaya grup tidak terasa diawasi mesin penjawab.
export async function before(ctx) {
  if (!ctx.isGroup || !ctx.text) return
  const text = ctx.text.trim()
  if (/^[.!/#]/.test(text)) return
  let settings
  try {
    settings = await getGroupSettings(ctx.storage, ctx.chat)
  } catch {
    return
  }
  if (!settings.autoai) return
  const botDigits = digitsOf(ctx.botJid)
  if (!botDigits) return
  const mentioned = (ctx.mentionedJids ?? []).some((j) => digitsOf(j) === botDigits)
  const quotedFromBot = ctx.quoted?.sender ? digitsOf(ctx.quoted.sender) === botDigits : false
  const calledByName = /\bkana\b/i.test(text)
  if (!mentioned && !quotedFromBot && !calledByName) return
  const now = Date.now()
  if (now - (lastReplyAt.get(ctx.chat) ?? 0) < COOLDOWN_MS) return
  lastReplyAt.set(ctx.chat, now)
  const provider = getAiProvider()
  if (!provider) return
  const botName = process.env.BOT_NAME || 'KANA'
  const system =
    ctx.lang === 'en'
      ? `You are ${botName}, a sweet and expressive WhatsApp assistant chatting inside a group. Answer briefly and naturally in the user's language, like a normal chat message, not a formal report.`
      : `Kamu adalah ${botName}, asisten WhatsApp yang manis dan ekspresif, lagi ngobrol di dalam grup. Jawab singkat dan natural dalam bahasa pengguna, seperti pesan chat biasa, bukan laporan formal.`
  try {
    const answer = String((await provider.chat([
      { role: 'system', content: system },
      { role: 'user', content: text.slice(0, 1000) },
    ])) || '').trim()
    if (answer) {
      await ctx.sock.sendMessage(ctx.chat, { text: answer.slice(0, 2000) }, { quoted: ctx.raw })
    }
  } catch {}
}
