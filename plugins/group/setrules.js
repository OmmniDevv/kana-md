import { updateGroupSettings } from '../../src/services/group-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'setrules',
  alias: [],
  category: 'group',
  description: { id: 'Atur peraturan grup', en: 'Set group rules' },
  usage: '.setrules <teks> atau .setrules clear',
  example: '.setrules 1. Sopan 2. No spam',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    setrules: {
      usage: 'Tulis rulesnya yaa, contoh .setrules 1. Sopan 2. No spam. Atau .setrules clear buat hapus~',
      set: 'Siap~ rules grup udah disimpan. {mood}',
      cleared: 'Siap~ rules grup udah dikosongkan. {mood}',
      footer: 'Rules grup KANA', viewBtn: 'Lihat rules',
    },
  },
  en: {
    setrules: {
      usage: 'Write the rules, for example .setrules 1. Be polite 2. No spam. Or .setrules clear to remove them~',
      set: 'Got it~ group rules have been saved. {mood}',
      cleared: 'Got it~ group rules have been cleared. {mood}',
      footer: 'KANA group rules', viewBtn: 'View rules',
    },
  },
}

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('setrules.usage'))
  const cleared = text.toLowerCase() === 'clear'
  await updateGroupSettings(ctx.storage, ctx.chat, { rules: cleared ? '' : text })
  const body = ctx.t(cleared ? 'setrules.cleared' : 'setrules.set', { mood: ctx.say('senang') })
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA', body, footer: ctx.t('setrules.footer'),
    replies: [{ text: ctx.t('setrules.viewBtn'), id: '.rules' }],
    textFallback: body,
  })
}
