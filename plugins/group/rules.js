import { getGroupSettings } from '../../src/services/group-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'rules',
  alias: ['aturan'],
  category: 'group',
  description: { id: 'Lihat peraturan grup', en: 'Show group rules' },
  usage: '.rules',
  example: '.rules',
  cooldown: 3,
  isGroup: true,
}

export const i18n = {
  id: {
    rules: {
      show: 'Peraturan grup ini:\n{rules}\n\nPatuhi yaa semuanya~ {mood}',
      empty: 'Grup ini belum punya rules nih. Admin bisa buat dengan .setrules yaa~',
      footer: 'Rules grup KANA', setBtn: 'Buat rules',
    },
  },
  en: {
    rules: {
      show: 'Rules of this group:\n{rules}\n\nPlease follow them everyone~ {mood}',
      empty: 'This group has no rules yet. Admins can create them with .setrules~',
      footer: 'KANA group rules', setBtn: 'Create rules',
    },
  },
}

export const test = { input: '.rules', expect: /grup|group/i }

export async function handler(ctx) {
  const s = await getGroupSettings(ctx.storage, ctx.chat)
  if (!s.rules) {
    const body = ctx.t('rules.empty')
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA', body, footer: ctx.t('rules.footer'),
      replies: [{ text: ctx.t('rules.setBtn'), id: '.setrules' }],
      textFallback: body,
    })
    return
  }
  const body = ctx.t('rules.show', { rules: s.rules, mood: ctx.say('senang') })
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA', body, footer: ctx.t('rules.footer'),
    replies: [{ text: ctx.t('rules.setBtn'), id: '.setrules' }],
    textFallback: body,
  })
}
