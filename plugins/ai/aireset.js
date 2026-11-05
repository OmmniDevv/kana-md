import { clearMemory } from '../../src/services/ai-memory.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'aireset',
  premium: true,
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
      done: '╭─❏ ✨ 「 *PERCAKAPAN DIRESET* 」\n┊ Udah KANA lupain semua percakapan AI kita yaa~\n┊ Mulai dari awal lagi yuk, bersih bersih! ✨ (≧▽≦)\n╰━━━━━━━',
      btnAi: 'Ngobrol AI',
    },
  },
  en: {
    aireset: {
      done: '╭─❏ ✨ 「 *CHAT RESET* 」\n┊ KANA has forgotten all our AI chats~\n┊ Let us start fresh, all clean! ✨ (≧▽≦)\n╰━━━━━━━',
      btnAi: 'Chat AI',
    },
  },
}

export const test = { input: '.aireset', expect: /percakapan AI/i }

export async function handler(ctx) {
  await clearMemory(ctx.storage, ctx.senderDigits)
  const body = ctx.t('aireset.done')
  return sendButtons(ctx.sock, ctx.chat, {
    title: process.env.BOT_NAME || 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('aireset.btnAi'), id: '.ai' }],
    textFallback: body,
  })
}
