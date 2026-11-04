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
        'Teks goodbye grup saat ini:\n{text}\n\nUbah dengan .setgoodbye <teks baru>, atau reset ke default dengan tombol di bawah. Placeholder yang bisa dipakai: {user}, {group}, {count}.',
      saved: 'Siap~ teks goodbye grup udah disimpan. {mood}',
      resetDone: 'Siap~ teks goodbye dikembalikan ke default:\n{text}\n{mood}',
      tooLong: 'Ehh, teksnya kepanjangan nih. Maksimal {max} karakter yaa~',
      footer: 'Teks goodbye KANA',
      resetBtn: 'Reset',
      checkBtn: 'Cek status welcome',
      viewBtn: 'Lihat teks goodbye',
    },
  },
  en: {
    setgoodbye: {
      current:
        'Current group goodbye text:\n{text}\n\nChange it with .setgoodbye <new text>, or reset it to the default with the button below. Placeholders you can use: {user}, {group}, {count}.',
      saved: 'Got it~ the group goodbye text has been saved. {mood}',
      resetDone: 'Got it~ the goodbye text is back to the default:\n{text}\n{mood}',
      tooLong: 'Eh, that text is too long. Maximum {max} characters, okayy~',
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
    const body = ctx.t('setgoodbye.current', { text: current })
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
    const body = ctx.t('setgoodbye.resetDone', { text: fallback, mood: ctx.say('senang') })
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
