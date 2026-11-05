import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'botmode',
  alias: ['setmode'],
  category: 'group',
  description: { id: 'Atur mode bot untuk grup ini: publik (semua member), admin (hanya admin grup), diam (hanya owner)', en: 'Set the bot mode for this group: public (all members), admin (group admins only), silent (owner only)' },
  usage: '.botmode <publik|admin|diam>',
  example: '.botmode admin',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  needsAdminInfo: true,
  priority: 25,
}

export const MODES = ['publik', 'admin', 'diam']

export const i18n = {
  id: {
    botmode: {
      status: '╭─❏ 🎛️ 「 *MODE BOT GRUP* 」\n┊ Mode sekarang: *{mode}*\n┊ ᴘᴜʙʟɪᴋ: semua member bisa pakai KANA\n┊ ᴀᴅᴍɪɴ: cuma admin grup (mode onlyadmin)\n┊ ᴅɪᴀᴍ: KANA diam, cuma owner yang dilayani\n┊ Ubah: *.botmode publik|admin|diam*\n╰━━━━━━━',
      changed: '╭─❏ 🎛️ 「 *MODE BOT DIUBAH* 」\n┊ Siap~ mode bot grup ini sekarang *{mode}*~\n┊ {note}\n╰━━━━━━━ {mood}',
      notePublik: 'Semua member bisa pakai KANA lagi~',
      noteAdmin: 'Member biasa bakal KANA abaikan, cuma admin grup yang dilayani~',
      noteDiam: 'KANA diam total di grup ini, cuma owner yang bisa mengubah mode lagi~',
      invalid: '╭─❏ ⚠️ 「 *MODE TIDAK VALID* 」\n┊ Mode *{mode}* nggak dikenal~\n┊ ᴘɪʟɪʜᴀɴ: *publik, admin, diam*\n╰━━━━━━━',
    },
  },
  en: {
    botmode: {
      status: '╭─❏ 🎛️ 「 *GROUP BOT MODE* 」\n┊ Current mode: *{mode}*\n┊ ᴘᴜʙʟɪᴄ: every member can use KANA\n┊ ᴀᴅᴍɪɴ: group admins only (onlyadmin mode)\n┊ ꜱɪʟᴇɴᴛ: KANA stays silent, owner only\n┊ Change: *.botmode public|admin|silent*\n╰━━━━━━━',
      changed: '╭─❏ 🎛️ 「 *BOT MODE CHANGED* 」\n┊ Got it~ this group bot mode is now *{mode}*~\n┊ {note}\n╰━━━━━━━ {mood}',
      notePublik: 'All members can use KANA again~',
      noteAdmin: 'Regular members will be ignored, only group admins are served~',
      noteDiam: 'KANA stays fully silent in this group, only the owner can change the mode back~',
      invalid: '╭─❏ ⚠️ 「 *INVALID MODE* 」\n┊ Mode *{mode}* is unknown~\n┊ ᴏᴘᴛɪᴏɴꜱ: *public, admin, silent*\n╰━━━━━━━',
    },
  },
}

// Terima juga nama Inggris supaya mode tetap konsisten lintas bahasa.
const ALIASES = { public: 'publik', publik: 'publik', admin: 'admin', onlyadmin: 'admin', silent: 'diam', diam: 'diam', off: 'diam' }
const NOTE_KEY = { publik: 'botmode.notePublik', admin: 'botmode.noteAdmin', diam: 'botmode.noteDiam' }

export const test = { input: '.botmode admin', expect: /MODE BOT DIUBAH|BOT MODE CHANGED/ }

export async function handler(ctx) {
  const raw = (ctx.args[0] || '').toLowerCase()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const current = settings.botMode || 'publik'
  if (!raw) return ctx.reply(ctx.t('botmode.status', { mode: current }))
  const mode = ALIASES[raw]
  if (!mode) return ctx.reply(ctx.t('botmode.invalid', { mode: raw }))
  await updateGroupSettings(ctx.storage, ctx.chat, { botMode: mode })
  return ctx.reply(ctx.t('botmode.changed', { mode, note: ctx.t(NOTE_KEY[mode]), mood: ctx.say('senang') }))
}

async function senderIsAdmin(ctx) {
  try {
    const meta = await ctx.getGroupMetadata()
    if (!meta?.participants) return false
    const myDigits = digitsOf(ctx.sender)
    return meta.participants.some((p) => {
      if (!p.admin) return false
      return [p.id, p.phoneNumber, p.lid, p.jid].some((c) => c && digitsOf(c) === myDigits)
    })
  } catch {
    return false
  }
}

// Penegakan mode: jalan sebelum handler apa pun. Mode publik tidak
// menyentuh pesan. Mode admin mengabaikan non-admin. Mode diam
// mengabaikan semua selain owner, kecuali perintah .botmode dari admin
// grup supaya mode masih bisa diubah tanpa menunggu owner.
export async function before(ctx) {
  if (!ctx.isGroup || ctx.isOwner) return
  let settings
  try {
    settings = await getGroupSettings(ctx.storage, ctx.chat)
  } catch {
    return
  }
  const mode = settings.botMode || 'publik'
  if (mode === 'publik') return
  const admin = await senderIsAdmin(ctx)
  if (mode === 'admin') {
    if (!admin) return false
    return
  }
  // mode diam
  if (admin && /^\s*[.!/#]\s*botmode\b/i.test(ctx.text || '')) return
  return false
}
