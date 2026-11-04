import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { DEFAULT_INTRO } from './intro.js'

export const config = {
  name: 'setintro',
  alias: [],
  category: 'group',
  description: { id: 'Atur template kartu intro grup (placeholder {nama} {nomor} {grup})', en: 'Set the group intro card template (placeholders {nama} {nomor} {grup})' },
  usage: '.setintro <template> atau .setintro reset',
  example: '.setintro Halo, aku {nama} dari grup {grup}',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    setintro: {
      current: '╭─❏ 🎤 「 *TEMPLATE INTRO GRUP* 」\n┊ {template}\n╰━━━━━━━\nGanti dengan *.setintro <template baru>*, placeholder: *{nama} {nomor} {grup}*\nReset dengan *.setintro reset* yaa~',
      saved: '╭─❏ ✅ 「 *TEMPLATE INTRO DISIMPAN* 」\n┊ Template intro tersimpan~\n┊ Member bisa coba dengan *.intro* yaa~\n╰━━━━━━━ {mood}',
      reset: '╭─❏ ✅ 「 *TEMPLATE INTRO DIRESET* 」\n┊ Template intro dikembalikan ke bawaan KANA~\n╰━━━━━━━ {mood}',
      tooLong: '╭─❏ ⚠️ 「 *TEMPLATE KEPANJANGAN* 」\n┊ Templatenya kepanjangan, maksimal *500* karakter yaa~\n╰━━━━━━━ {mood}',
    },
  },
  en: {
    setintro: {
      current: '╭─❏ 🎤 「 *GROUP INTRO TEMPLATE* 」\n┊ {template}\n╰━━━━━━━\nChange it with *.setintro <new template>*, placeholders: *{nama} {nomor} {grup}*\nReset with *.setintro reset*~',
      saved: '╭─❏ ✅ 「 *INTRO TEMPLATE SAVED* 」\n┊ Intro template saved~\n┊ Members can try it with *.intro*~\n╰━━━━━━━ {mood}',
      reset: '╭─❏ ✅ 「 *INTRO TEMPLATE RESET* 」\n┊ Intro template restored to the KANA default~\n╰━━━━━━━ {mood}',
      tooLong: '╭─❏ ⚠️ 「 *TEMPLATE TOO LONG* 」\n┊ That template is too long, maximum *500* characters~\n╰━━━━━━━ {mood}',
    },
  },
}

export const test = { input: '.setintro', expect: /intro/i }

export async function handler(ctx) {
  const arg = (ctx.text || '').trim()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  if (!arg) {
    const template = settings.introTemplate || (DEFAULT_INTRO[ctx.lang] ?? DEFAULT_INTRO.id)
    const templateLines = String(template).split('\n').join('\n┊ ')
    return ctx.reply(ctx.t('setintro.current', { template: templateLines }))
  }
  if (arg.toLowerCase() === 'reset') {
    await updateGroupSettings(ctx.storage, ctx.chat, { introTemplate: '' })
    return ctx.reply(ctx.t('setintro.reset', { mood: ctx.say('sukses') }))
  }
  if (arg.length > 500) return ctx.reply(ctx.t('setintro.tooLong', { mood: ctx.say('gagal') }))
  await updateGroupSettings(ctx.storage, ctx.chat, { introTemplate: arg })
  return ctx.reply(ctx.t('setintro.saved', { mood: ctx.say('sukses') }))
}
