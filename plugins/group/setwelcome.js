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
        'Teks welcome grup saat ini:\n{text}\n\nUbah dengan .setwelcome <teks baru>, atau reset ke default dengan tombol di bawah. Placeholder yang bisa dipakai: {user}, {group}, {count}.',
      saved: 'Siap~ teks welcome grup udah disimpan. {mood}',
      resetDone: 'Siap~ teks welcome dikembalikan ke default:\n{text}\n{mood}',
      tooLong: 'Ehh, teksnya kepanjangan nih. Maksimal {max} karakter yaa~',
      footer: 'Teks welcome KANA',
      resetBtn: 'Reset',
      checkBtn: 'Cek status welcome',
      viewBtn: 'Lihat teks welcome',
    },
  },
  en: {
    setwelcome: {
      current:
        'Current group welcome text:\n{text}\n\nChange it with .setwelcome <new text>, or reset it to the default with the button below. Placeholders you can use: {user}, {group}, {count}.',
      saved: 'Got it~ the group welcome text has been saved. {mood}',
      resetDone: 'Got it~ the welcome text is back to the default:\n{text}\n{mood}',
      tooLong: 'Eh, that text is too long. Maximum {max} characters, okayy~',
      footer: 'KANA welcome text',
      resetBtn: 'Reset',
      checkBtn: 'Check welcome status',
      viewBtn: 'View welcome text',
    },
  },
}

export const test = { input: '.setwelcome', expect: /welcome|grup|group/i }

const MAX_LENGTH = 500

export async function handler(ctx) {
  const text = (ctx.text ?? '').trim()
  if (!text) {
    const current = await getGroupText(ctx.storage, ctx.chat, 'welcome')
    const body = ctx.t('setwelcome.current', { text: current })
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
    const body = ctx.t('setwelcome.resetDone', { text: fallback, mood: ctx.say('senang') })
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
