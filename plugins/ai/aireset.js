import { clearMemory } from '../../src/services/ai-memory.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'aireset',
  alias: ['resetai', 'lupaai'],
  category: 'ai',
  description: { id: 'Hapus memori percakapan AI kamu', en: 'Clear your AI conversation memory' },
  usage: '.aireset',
  example: '.aireset',
  cooldown: 3,
}

export const i18n = {
  id: {
    aireset: {
      done: 'Udah KANA lupain semua percakapan AI kita yaa~ Mulai dari awal lagi yuk, bersih bersih! ✨ (≧▽≦)',
      btnAi: 'Ngobrol AI',
      btnMenu: 'Menu AI',
    },
  },
  en: {
    aireset: {
      done: 'KANA has forgotten all our AI chats~ Let us start fresh, all clean! ✨ (≧▽≦)',
      btnAi: 'Chat AI',
      btnMenu: 'AI Menu',
    },
  },
}

export async function handler(ctx) {
  await clearMemory(ctx.storage, ctx.senderDigits)
  const body = ctx.t('aireset.done')
  return sendButtons(ctx.sock, ctx.chat, {
    title: process.env.BOT_NAME || 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('aireset.btnAi'), id: '.ai' },
      { text: ctx.t('aireset.btnMenu'), id: '.menu ai' },
    ],
    textFallback: body,
  })
}
