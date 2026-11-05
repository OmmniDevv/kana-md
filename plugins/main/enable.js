import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'

// Fitur grup boolean yang bisa dinyalakan/dimatikan lewat .enable.
// Kunci harus persis field di DEFAULT_GROUP_SETTINGS (group-service).
export const ENABLE_FEATURES = {
  welcome: 'welcome',
  goodbye: 'goodbye',
  antilink: 'antilink',
  antispam: 'antispam',
  antitoxic: 'antitoxic',
  antijudol: 'antijudol',
  antiphising: 'antiphising',
  antidocument: 'antidocument',
  antisticker: 'antisticker',
  antiflood: 'antiflood',
  antitagsw: 'antitagsw',
  antivirtex: 'antivirtex',
  antihidetag: 'antihidetag',
  anticulik: 'anticulik',
  autoai: 'autoai',
  automedia: 'automedia',
  autosticker: 'autosticker',
  autoreply: 'autoreply',
}

export const config = {
  name: 'enable',
  alias: [],
  category: 'main',
  description: { id: 'Nyalakan atau matikan fitur grup (welcome, antilink, antitoxic, dan lain lain) untuk grup ini', en: 'Turn group features (welcome, antilink, antitoxic, and more) on or off for this group' },
  usage: '.enable [fitur] [off]',
  example: '.enable antilink',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    enable: {
      list: '╭─❏ ⚙️ 「 *FITUR GRUP* 」\n┊ Keadaan fitur di grup ini:\n{rows}\n┊ Nyalakan: *.enable <fitur>*\n┊ Matikan: *.enable <fitur> off*\n╰━━━━━━━',
      row: '┊ {feature}: *{state}*',
      on: 'AKTIF',
      off: 'MATI',
      changed: '╭─❏ ⚙️ 「 *FITUR {feature}* 」\n┊ Siap~ fitur *{feature}* sekarang *{state}* di grup ini~\n╰━━━━━━━',
      unknown: '╭─❏ ⚠️ 「 *FITUR TIDAK DIKENAL* 」\n┊ Fitur *{feature}* nggak ada di daftar.\n┊ Pilihan: {choices}\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    enable: {
      list: '╭─❏ ⚙️ 「 *GROUP FEATURES* 」\n┊ Feature states in this group:\n{rows}\n┊ Turn on: *.enable <feature>*\n┊ Turn off: *.enable <feature> off*\n╰━━━━━━━',
      row: '┊ {feature}: *{state}*',
      on: 'ON',
      off: 'OFF',
      changed: '╭─❏ ⚙️ 「 *FEATURE {feature}* 」\n┊ Done~ the *{feature}* feature is now *{state}* in this group~\n╰━━━━━━━',
      unknown: '╭─❏ ⚠️ 「 *UNKNOWN FEATURE* 」\n┊ Feature *{feature}* is not on the list.\n┊ Options: {choices}\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.enable welcome', expect: /welcome/i }

export async function handler(ctx) {
  const feature = (ctx.args?.[0] || '').toLowerCase()
  try {
    const settings = await getGroupSettings(ctx.storage, ctx.chat)
    if (!feature) {
      const rows = Object.keys(ENABLE_FEATURES)
        .map((name) => ctx.t('enable.row', {
          feature: name,
          state: settings[ENABLE_FEATURES[name]] ? ctx.t('enable.on') : ctx.t('enable.off'),
        }))
        .join('\n')
      return ctx.reply(ctx.t('enable.list', { rows }))
    }
    const key = ENABLE_FEATURES[feature]
    if (!key) {
      return ctx.reply(ctx.t('enable.unknown', { feature, choices: Object.keys(ENABLE_FEATURES).join(', ') }))
    }
    const turnOff = (ctx.args?.[1] || '').toLowerCase() === 'off'
    await updateGroupSettings(ctx.storage, ctx.chat, { [key]: !turnOff })
    return ctx.reply(ctx.t('enable.changed', {
      feature,
      state: !turnOff ? ctx.t('enable.on') : ctx.t('enable.off'),
    }))
  } catch (err) {
    return ctx.reply(ctx.t('enable.fail', { error: err.message }))
  }
}
