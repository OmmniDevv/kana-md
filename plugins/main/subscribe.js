import { updateGroupSettings } from '../../src/services/group-service.js'

export const config = {
  name: 'subscribe',
  alias: ['sub'],
  category: 'group',
  description: {
    id: 'Aktifkan atau matikan langganan siaran owner di grup ini',
    en: 'Enable or disable owner broadcasts in this group',
  },
  usage: '.subscribe [off]',
  example: '.subscribe',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    subscribe: {
      enabled: '╭─❏ ✅ 「 *LANGGANAN AKTIF* 」\n┊ Siap~ grup ini sekarang langganan siaran dari owner.\n╰━━━━━━━ {mood}',
      disabled: '╭─❏ 🔕 「 *LANGGANAN MATI* 」\n┊ Oke, langganan siaran di grup ini dimatikan.\n┊ Sampai ketemu di siaran lain yaa~\n╰━━━━━━━ {mood}',
    },
  },
  en: {
    subscribe: {
      enabled: '╭─❏ ✅ 「 *SUBSCRIPTION ON* 」\n┊ Got it~ this group now subscribes to owner broadcasts.\n╰━━━━━━━ {mood}',
      disabled: '╭─❏ 🔕 「 *SUBSCRIPTION OFF* 」\n┊ Okay, broadcast subscription in this group is off.\n┊ See you in another broadcast~\n╰━━━━━━━ {mood}',
    },
  },
}

export const test = { input: '.subscribe', expect: /grup|group/i }

export async function handler(ctx) {
  const off = (ctx.args[0] || '').toLowerCase() === 'off'
  await updateGroupSettings(ctx.storage, ctx.chat, { broadcastOptIn: !off })
  const body = off
    ? ctx.t('subscribe.disabled', { mood: ctx.say('pamit') })
    : ctx.t('subscribe.enabled', { mood: ctx.say('senang') })
  return ctx.reply(body)
}
