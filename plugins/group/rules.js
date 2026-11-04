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
      show: '╭─❏ 📜 「 *PERATURAN GRUP* 」\n┊ {rules}\n╰━━━━━━━\nPatuhi yaa semuanya~ {mood}',
      empty: '╭─❏ 📜 「 *PERATURAN GRUP* 」\n┊ Grup ini belum punya rules nih~\n┊ Admin bisa buat dengan *.setrules* yaa~\n╰━━━━━━━',
      footer: 'Rules grup KANA', setBtn: 'Buat rules',
    },
  },
  en: {
    rules: {
      show: '╭─❏ 📜 「 *GROUP RULES* 」\n┊ {rules}\n╰━━━━━━━\nPlease follow them everyone~ {mood}',
      empty: '╭─❏ 📜 「 *GROUP RULES* 」\n┊ This group has no rules yet~\n┊ Admins can create them with *.setrules*~\n╰━━━━━━━',
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
  const rulesText = String(s.rules).split('\n').join('\n┊ ')
  const body = ctx.t('rules.show', { rules: rulesText, mood: ctx.say('senang') })
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA', body, footer: ctx.t('rules.footer'),
    replies: [{ text: ctx.t('rules.setBtn'), id: '.setrules' }],
    textFallback: body,
  })
}
