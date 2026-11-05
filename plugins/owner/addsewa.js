import { sendButtons } from '../../src/ui/buttons.js'
import { addSewa, isDurationToken, recordStatus, remainingText } from '../../src/services/premium.js'
import { formatWibDateTime } from '../../src/ui/format.js'

export const config = {
  name: 'addsewa',
  alias: ['addrent', 'sewakan'],
  category: 'owner',
  description: { id: 'Tambah atau perpanjang sewa bot untuk grup atau jadibot', en: 'Add or extend a bot rental for a group or jadibot' },
  usage: '.addsewa [jid grup|nomor jadibot] [durasi]',
  example: '.addsewa 30d',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    addsewa: {
      hint: '╭─❏ 🏠 「 *TAMBAH SEWA BOT* 」\n┊ Tentukan target sewanya dulu yaa, Master.\n┊ Di grup: *.addsewa 30d* = sewa grup ini\n┊ Grup lain: *.addsewa <jid @g.us> 30d*\n┊ Jadibot personal: *.addsewa <nomor> jadibot 30d*\n┊ Durasi: *7d*, *30d*, *2w*, *1y*, atau *permanen*. Tanpa durasi = *30 hari*~\n╰━━━━━━━',
      done: '╭─❏ 🏠 「 *SEWA AKTIF* 」\n┊ ᴛᴀʀɢᴇᴛ: *{target}*\n┊ ᴊᴇɴɪꜱ: *{type}*\n┊ ᴅᴜʀᴀꜱɪ: *{duration}*\n┊ ʙᴇʀᴀᴋʜɪʀ: *{expires}*\n┊ Siap, Master~ sewanya udah KANA nyalain. {mood}\n╰━━━━━━━',
      typeGroup: 'sewa grup',
      typeJadibot: 'sewa jadibot',
      permanent: 'permanen',
      btnList: 'Daftar Sewa',
      btnDel: 'Cabut Sewa',
    },
  },
  en: {
    addsewa: {
      hint: '╭─❏ 🏠 「 *ADD BOT RENTAL* 」\n┊ Set the rental target first, Master.\n┊ In a group: *.addsewa 30d* = rent for this group\n┊ Another group: *.addsewa <jid @g.us> 30d*\n┊ Personal jadibot: *.addsewa <number> jadibot 30d*\n┊ Duration: *7d*, *30d*, *2w*, *1y*, or *permanen*. No duration = *30 days*~\n╰━━━━━━━',
      done: '╭─❏ 🏠 「 *RENTAL ACTIVE* 」\n┊ ᴛᴀʀɢᴇᴛ: *{target}*\n┊ ᴛʏᴘᴇ: *{type}*\n┊ ᴅᴜʀᴀᴛɪᴏɴ: *{duration}*\n┊ ᴇxᴘɪʀᴇꜱ: *{expires}*\n┊ Got it, Master~ the rental is on now. {mood}\n╰━━━━━━━',
      typeGroup: 'group rental',
      typeJadibot: 'jadibot rental',
      permanent: 'permanent',
      btnList: 'Rental List',
      btnDel: 'Remove Rental',
    },
  },
}

// Urai target sewa dari argumen:
// - token tautan chat.whatsapp.com/<kode> = grup itu (kode undangan
//   disimpan, handler menukarnya jadi JID grup via groupGetInviteInfo)
// - token berisi @g.us = grup itu, type group
// - token angka 16 digit atau lebih = ID grup polos, type group
// - token nomor 9-15 digit = sewa jadibot personal nomor itu
// - tanpa target dan dipakai di grup = grup tempat perintah diketik
// Token 'jadibot' diterima sebagai penegas jenis, token durasi terpisah.
export function parseAddsewaArgs(ctx) {
  let key = ''
  let type = 'group'
  let duration = ''
  let inviteCode = ''
  for (const token of ctx.args ?? []) {
    const raw = String(token)
    const lower = raw.toLowerCase()
    if (lower === 'jadibot') {
      type = 'jadibot'
      continue
    }
    const invite = raw.match(/chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i)
    if (invite) {
      inviteCode = invite[1]
      type = 'group'
      continue
    }
    if (raw.includes('@g.us')) {
      key = raw
      type = 'group'
      continue
    }
    const d = raw.replace(/\D/g, '')
    if (!key && /^\d+$/.test(raw) && d.length >= 16) {
      key = `${d}@g.us`
      type = 'group'
      continue
    }
    if (!key && /^\d+$/.test(raw) && d.length >= 9 && d.length <= 15) {
      key = d
      type = 'jadibot'
      continue
    }
    if (!duration && isDurationToken(raw)) duration = lower
  }
  if (!key && !inviteCode && ctx.isGroup && ctx.chat) {
    key = ctx.chat
    type = 'group'
  }
  return { key, type, duration, inviteCode }
}

export const test = { input: '.addsewa', expect: /sewa|rent/i }

export async function handler(ctx) {
  const parsed = parseAddsewaArgs(ctx)
  let { key, type } = parsed
  const { duration } = parsed
  if (!key && parsed.inviteCode) {
    // Tautan grup: tukarkan kode undangan jadi JID grup beneran.
    if (typeof ctx.sock?.groupGetInviteInfo !== 'function') return ctx.reply(ctx.t('addsewa.hint'))
    try {
      const info = await ctx.sock.groupGetInviteInfo(parsed.inviteCode)
      if (!info?.id) return ctx.reply(ctx.t('addsewa.hint'))
      key = info.id
      type = 'group'
    } catch {
      return ctx.reply(ctx.t('addsewa.hint'))
    }
  }
  if (!key) return ctx.reply(ctx.t('addsewa.hint'))
  const record = await addSewa(ctx.storage, key, {
    type,
    duration: duration || '30d',
    addedBy: ctx.senderDigits,
  })
  const status = recordStatus(record)
  const expires = status.permanent
    ? ctx.t('addsewa.permanent')
    : `${formatWibDateTime(new Date(status.expiresAt), ctx.lang)} (${remainingText(status.expiresAt - Date.now(), ctx.lang)})`
  const body = ctx.t('addsewa.done', {
    target: key,
    type: ctx.t(type === 'jadibot' ? 'addsewa.typeJadibot' : 'addsewa.typeGroup'),
    duration: duration || '30d',
    expires,
    mood: ctx.say('sukses'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('addsewa.btnList'), id: '.listsewa' },
      { text: ctx.t('addsewa.btnDel'), id: `.delsewa ${key}` },
    ],
    textFallback: body,
  })
}
