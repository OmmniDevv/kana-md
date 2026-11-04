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
      usage: '╭─❏ 📜 「 *RULES GRUPNYA MANA?* 」\n┊ Tulis rules grupnya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.setrules 1. Sopan 2. No spam*\n┊ Atau *.setrules clear* buat hapus~\n╰━━━━━━━',
      set: '╭─❏ ✅ 「 *RULES DISIMPAN* 」\n┊ Siap~ rules grup udah disimpan~\n╰━━━━━━━ {mood}',
      cleared: '╭─❏ 🗑️ 「 *RULES DIKOSONGKAN* 」\n┊ Siap~ rules grup udah dikosongkan~\n╰━━━━━━━ {mood}',
      footer: 'Rules grup KANA', viewBtn: 'Lihat rules',
    },
  },
  en: {
    setrules: {
      usage: '╭─❏ 📜 「 *WHERE ARE THE GROUP RULES?* 」\n┊ Write the group rules~\n┊ ᴇxᴀᴍᴘʟᴇ: *.setrules 1. Be polite 2. No spam*\n┊ Or *.setrules clear* to remove them~\n╰━━━━━━━',
      set: '╭─❏ ✅ 「 *RULES SAVED* 」\n┊ Got it~ group rules have been saved~\n╰━━━━━━━ {mood}',
      cleared: '╭─❏ 🗑️ 「 *RULES CLEARED* 」\n┊ Got it~ group rules have been cleared~\n╰━━━━━━━ {mood}',
      footer: 'KANA group rules', viewBtn: 'View rules',
    },
  },
}

export const test = { input: '.setrules', expect: /grup|group/i }

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
