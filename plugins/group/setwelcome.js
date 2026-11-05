import { getGroupText, resetGroupText, setGroupText } from '../../src/services/group-settings.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'setwelcome',
  alias: [],
  category: 'group',
  description: { id: 'Atur teks sambutan datang grup', en: 'Set the group welcome text' },
  usage: '.setwelcome <teks> atau .setwelcome reset',
  example: '.setwelcome Halo {user}, selamat datang di {group}!',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    setwelcome: {
      current:
        '╭─❏ 👋 「 *TEKS WELCOME GRUP* 」\n┊ {text}\n╰━━━━━━━\nUbah dengan *.setwelcome <teks baru>*, atau reset ke default dengan tombol di bawah~\nᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ: *{user}*, *{group}*, *{count}*',
      saved: '╭─❏ ✅ 「 *TEKS WELCOME DISIMPAN* 」\n┊ Siap~ teks welcome grup udah disimpan~\n╰━━━━━━━ {mood}',
      resetDone: '╭─❏ ✅ 「 *TEKS WELCOME DIRESET* 」\n┊ Siap~ teks welcome dikembalikan ke default:\n┊ {text}\n╰━━━━━━━ {mood}',
      tooLong: '╭─❏ ⚠️ 「 *TEKS KEPANJANGAN* 」\n┊ Ehh, teksnya kepanjangan nih~\n┊ Maksimal *{max} karakter* yaa~\n╰━━━━━━━',
      footer: 'Teks welcome KANA',
      resetBtn: 'Reset',
      checkBtn: 'Cek status welcome',
      viewBtn: 'Lihat teks welcome',
    },
  },
  en: {
    setwelcome: {
      current:
        '╭─❏ 👋 「 *GROUP WELCOME TEXT* 」\n┊ {text}\n╰━━━━━━━\nChange it with *.setwelcome <new text>*, or reset it to the default with the button below~\nᴘʟᴀᴄᴇʜᴏʟᴅᴇʀꜱ: *{user}*, *{group}*, *{count}*',
      saved: '╭─❏ ✅ 「 *WELCOME TEXT SAVED* 」\n┊ Got it~ the group welcome text has been saved~\n╰━━━━━━━ {mood}',
      resetDone: '╭─❏ ✅ 「 *WELCOME TEXT RESET* 」\n┊ Got it~ the welcome text is back to the default:\n┊ {text}\n╰━━━━━━━ {mood}',
      tooLong: '╭─❏ ⚠️ 「 *TEXT TOO LONG* 」\n┊ Eh, that text is too long~\n┊ Maximum *{max} characters*, okayy~\n╰━━━━━━━',
      footer: 'KANA welcome text',
      resetBtn: 'Reset',
      checkBtn: 'Check welcome status',
      viewBtn: 'View welcome text',
    },
  },
}

export const test = { input: '.setwelcome', expect: /selamat datang|welcome/i }

const MAX_LENGTH = 500

export async function handler(ctx) {
  const text = (ctx.text ?? '').trim()
  if (!text) {
    const current = await getGroupText(ctx.storage, ctx.chat, 'welcome')
    const currentLines = String(current).split('\n').join('\n┊ ')
    const body = ctx.t('setwelcome.current', { text: currentLines })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('setwelcome.footer'),
      replies: [{ text: ctx.t('setwelcome.resetBtn'), id: '.setwelcome reset' }],
      textFallback: body,
    })
  }
  if (text.toLowerCase() === 'reset') {
    const fallback = await resetGroupText(ctx.storage, ctx.chat, 'welcome')
    const fallbackLines = String(fallback).split('\n').join('\n┊ ')
    const body = ctx.t('setwelcome.resetDone', { text: fallbackLines, mood: ctx.say('senang') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('setwelcome.footer'),
      replies: [{ text: ctx.t('setwelcome.viewBtn'), id: '.setwelcome' }],
      textFallback: body,
    })
  }
  if (text.length > MAX_LENGTH) return ctx.reply(ctx.t('setwelcome.tooLong', { max: MAX_LENGTH }))
  await setGroupText(ctx.storage, ctx.chat, 'welcome', text)
  const body = ctx.t('setwelcome.saved', { mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('setwelcome.footer'),
    replies: [{ text: ctx.t('setwelcome.checkBtn'), id: '.welcome' }],
    textFallback: body,
  })
}
