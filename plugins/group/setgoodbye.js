import { getGroupText, resetGroupText, setGroupText } from '../../src/services/group-settings.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'setgoodbye',
  alias: [],
  category: 'group',
  description: { id: 'Atur teks perpisahan grup', en: 'Set the group goodbye text' },
  usage: '.setgoodbye <teks> atau .setgoodbye reset',
  example: '.setgoodbye Dadah {user}, makasih udah gabung di {group}!',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    setgoodbye: {
      current:
        '╭─❏ 👋 「 *TEKS GOODBYE GRUP* 」\n┊ {text}\n╰━━━━━━━\nUbah dengan *.setgoodbye <teks baru>*, atau reset ke default dengan tombol di bawah~\nᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ: *{user}*, *{group}*, *{count}*',
      saved: '╭─❏ ✅ 「 *TEKS GOODBYE DISIMPAN* 」\n┊ Siap~ teks goodbye grup udah disimpan~\n╰━━━━━━━ {mood}',
      resetDone: '╭─❏ ✅ 「 *TEKS GOODBYE DIRESET* 」\n┊ Siap~ teks goodbye dikembalikan ke default:\n┊ {text}\n╰━━━━━━━ {mood}',
      tooLong: '╭─❏ ⚠️ 「 *TEKS KEPANJANGAN* 」\n┊ Ehh, teksnya kepanjangan nih~\n┊ Maksimal *{max} karakter* yaa~\n╰━━━━━━━',
      footer: 'Teks goodbye KANA',
      resetBtn: 'Reset',
      checkBtn: 'Cek status welcome',
      viewBtn: 'Lihat teks goodbye',
    },
  },
  en: {
    setgoodbye: {
      current:
        '╭─❏ 👋 「 *GROUP GOODBYE TEXT* 」\n┊ {text}\n╰━━━━━━━\nChange it with *.setgoodbye <new text>*, or reset it to the default with the button below~\nᴘʟᴀᴄᴇʜᴏʟᴅᴇʀꜱ: *{user}*, *{group}*, *{count}*',
      saved: '╭─❏ ✅ 「 *GOODBYE TEXT SAVED* 」\n┊ Got it~ the group goodbye text has been saved~\n╰━━━━━━━ {mood}',
      resetDone: '╭─❏ ✅ 「 *GOODBYE TEXT RESET* 」\n┊ Got it~ the goodbye text is back to the default:\n┊ {text}\n╰━━━━━━━ {mood}',
      tooLong: '╭─❏ ⚠️ 「 *TEXT TOO LONG* 」\n┊ Eh, that text is too long~\n┊ Maximum *{max} characters*, okayy~\n╰━━━━━━━',
      footer: 'KANA goodbye text',
      resetBtn: 'Reset',
      checkBtn: 'Check welcome status',
      viewBtn: 'View welcome text',
    },
  },
}

export const test = { input: '.setgoodbye', expect: /goodbye|grup|group/i }

const MAX_LENGTH = 500

export async function handler(ctx) {
  const text = (ctx.text ?? '').trim()
  if (!text) {
    const current = await getGroupText(ctx.storage, ctx.chat, 'goodbye')
    const currentLines = String(current).split('\n').join('\n┊ ')
    const body = ctx.t('setgoodbye.current', { text: currentLines })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('setgoodbye.footer'),
      replies: [{ text: ctx.t('setgoodbye.resetBtn'), id: '.setgoodbye reset' }],
      textFallback: body,
    })
  }
  if (text.toLowerCase() === 'reset') {
    const fallback = await resetGroupText(ctx.storage, ctx.chat, 'goodbye')
    const fallbackLines = String(fallback).split('\n').join('\n┊ ')
    const body = ctx.t('setgoodbye.resetDone', { text: fallbackLines, mood: ctx.say('senang') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('setgoodbye.footer'),
      replies: [{ text: ctx.t('setgoodbye.viewBtn'), id: '.setgoodbye' }],
      textFallback: body,
    })
  }
  if (text.length > MAX_LENGTH) return ctx.reply(ctx.t('setgoodbye.tooLong', { max: MAX_LENGTH }))
  await setGroupText(ctx.storage, ctx.chat, 'goodbye', text)
  const body = ctx.t('setgoodbye.saved', { mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('setgoodbye.footer'),
    replies: [{ text: ctx.t('setgoodbye.checkBtn'), id: '.welcome' }],
    textFallback: body,
  })
}
