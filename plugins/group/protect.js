import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const FEATURES = ['welcome', 'goodbye', 'antilink', 'antispam', 'antitoxic', 'antijudol', 'antiphising', 'antidocument', 'antisticker', 'antiflood', 'antitagsw', 'antivirtex', 'antihidetag']

export const config = {
  name: 'protect',
  alias: [],
  category: 'group',
  description: { id: 'Aktifkan atau matikan fitur proteksi grup', en: 'Turn group protection features on or off' },
  usage: '.protect <fitur> <on|off>',
  example: '.protect antilink on',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    protect: {
      status: 'Status proteksi:\n{lines}\n{mood}',
      line: '{feature}: {state}',
      on: 'AKTIF', off: 'mati',
      changed: 'Siap~ {feature} sekarang {state}. {mood}',
      unknown: 'Fitur "{feature}" nggak dikenal. Pilihan: {features}',
      usage: 'Pakai: .protect <fitur> <on|off>. Fitur: {features}',
      footer: 'Proteksi grup KANA',
      menuGroup: 'Menu grup',
      enable: 'Aktifkan {feature}',
    },
  },
  en: {
    protect: {
      status: 'Protection status:\n{lines}\n{mood}',
      line: '{feature}: {state}',
      on: 'ON', off: 'off',
      changed: 'Got it~ {feature} is now {state}. {mood}',
      unknown: 'Unknown feature "{feature}". Options: {features}',
      usage: 'Use: .protect <feature> <on|off>. Features: {features}',
      footer: 'KANA group protection',
      menuGroup: 'Group menu',
      enable: 'Enable {feature}',
    },
  },
}

export const test = { input: '.protect', expect: /grup|group/i }

export async function handler(ctx) {
  const [featureRaw, stateRaw] = ctx.args
  const feature = (featureRaw || '').toLowerCase()
  const showStatus = async () => {
    const s = await getGroupSettings(ctx.storage, ctx.chat)
    const lines = FEATURES.map((f) => ctx.t('protect.line', { feature: f, state: ctx.t(s[f] ? 'protect.on' : 'protect.off') })).join('\n')
    const body = ctx.t('protect.status', { lines, mood: ctx.say('senang') })
    const off = FEATURES.filter((f) => !s[f]).slice(0, 5)
    await sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('protect.footer'),
      replies: [
        ...off.map((f) => ({ text: ctx.t('protect.enable', { feature: f }), id: `.protect ${f} on` })),
        { text: ctx.t('protect.menuGroup'), id: '.menu group' },
      ],
      textFallback: body,
    })
  }
  if (!feature) return showStatus()
  if (!FEATURES.includes(feature)) return ctx.reply(ctx.t('protect.unknown', { feature, features: FEATURES.join(', ') }))
  if (!['on', 'off'].includes((stateRaw || '').toLowerCase())) return ctx.reply(ctx.t('protect.usage', { features: FEATURES.join(', ') }))
  const value = stateRaw.toLowerCase() === 'on'
  await updateGroupSettings(ctx.storage, ctx.chat, { [feature]: value })
  const body = ctx.t('protect.changed', { feature, state: ctx.t(value ? 'protect.on' : 'protect.off'), mood: ctx.say('senang') })
  const s = await getGroupSettings(ctx.storage, ctx.chat)
  const off = FEATURES.filter((f) => !s[f]).slice(0, 5)
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('protect.footer'),
    replies: [
      ...off.map((f) => ({ text: ctx.t('protect.enable', { feature: f }), id: `.protect ${f} on` })),
      { text: ctx.t('protect.menuGroup'), id: '.menu group' },
    ],
    textFallback: body,
  })
}
