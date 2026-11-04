import { sendButtons } from '../../src/ui/buttons.js'
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
      enabled: 'Siap~ grup ini sekarang langganan siaran dari owner. {mood}',
      disabled: 'Oke, langganan siaran di grup ini dimatikan. Sampai ketemu di siaran lain yaa~ {mood}',
      btnMenuGroup: 'Menu Grup',
    },
  },
  en: {
    subscribe: {
      enabled: 'Got it~ this group now subscribes to owner broadcasts. {mood}',
      disabled: 'Okay, broadcast subscription in this group is off. See you in another broadcast~ {mood}',
      btnMenuGroup: 'Group Menu',
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
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('subscribe.btnMenuGroup'), id: '.menu group' }],
    textFallback: body,
  })
}
