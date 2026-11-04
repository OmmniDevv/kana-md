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
      current: 'Template intro grup ini:\n\n{template}\n\nGanti dengan .setintro <template baru>, placeholder: {nama} {nomor} {grup}. Reset dengan .setintro reset yaa~',
      saved: '✅ Template intro tersimpan. Member bisa coba dengan .intro yaa~ {mood}',
      reset: '✅ Template intro dikembalikan ke bawaan KANA. {mood}',
      tooLong: 'Templatenya kepanjangan, maksimal 500 karakter yaa~ {mood}',
    },
  },
  en: {
    setintro: {
      current: 'This group intro template:\n\n{template}\n\nChange it with .setintro <new template>, placeholders: {nama} {nomor} {grup}. Reset with .setintro reset~',
      saved: '✅ Intro template saved. Members can try it with .intro~ {mood}',
      reset: '✅ Intro template restored to the KANA default. {mood}',
      tooLong: 'That template is too long, maximum 500 characters~ {mood}',
    },
  },
}

export const test = { input: '.setintro', expect: /intro/i }

export async function handler(ctx) {
  const arg = (ctx.text || '').trim()
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  if (!arg) {
    const template = settings.introTemplate || (DEFAULT_INTRO[ctx.lang] ?? DEFAULT_INTRO.id)
    return ctx.reply(ctx.t('setintro.current', { template }))
  }
  if (arg.toLowerCase() === 'reset') {
    await updateGroupSettings(ctx.storage, ctx.chat, { introTemplate: '' })
    return ctx.reply(ctx.t('setintro.reset', { mood: ctx.say('sukses') }))
  }
  if (arg.length > 500) return ctx.reply(ctx.t('setintro.tooLong', { mood: ctx.say('gagal') }))
  await updateGroupSettings(ctx.storage, ctx.chat, { introTemplate: arg })
  return ctx.reply(ctx.t('setintro.saved', { mood: ctx.say('sukses') }))
}
