import { updateGroupSettings } from '../../src/services/group-service.js'
import { isValidTime } from '../../src/services/guard-rules.js'
import { sendButtons } from '../../src/ui/buttons.js'

export { isValidTime }

export const config = {
  name: 'jadwalgrup',
  alias: [],
  category: 'group',
  description: { id: 'Atur jadwal buka tutup grup otomatis', en: 'Set automatic group open and close schedule' },
  usage: '.jadwalgrup <HH:mm buka> <HH:mm tutup> atau .jadwalgrup off',
  example: '.jadwalgrup 07:00 22:00',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    jadwalgrup: {
      usage: 'Pakai: .jadwalgrup 07:00 22:00 atau .jadwalgrup off. Format jam HH:mm yaa~',
      invalid: 'Format jam "{time}" nggak valid. Pakai HH:mm, contoh 07:00~',
      same: 'Jam buka dan tutup nggak boleh sama yaa~',
      set: 'Siap~ jadwal grup diatur: buka {open}, tutup {close}. Scheduler KANA yang jalanin tiap menit yaa. {mood}',
      off: 'Siap~ jadwal buka tutup otomatis dimatikan. {mood}',
      footer: 'Jadwal grup KANA', infoBtn: 'Info grup',
    },
  },
  en: {
    jadwalgrup: {
      usage: 'Use: .jadwalgrup 07:00 22:00 or .jadwalgrup off. Time format is HH:mm~',
      invalid: 'Time format "{time}" is not valid. Use HH:mm, for example 07:00~',
      same: 'Open and close times cannot be the same~',
      set: 'Got it~ group schedule set: open {open}, close {close}. KANA scheduler runs it every minute. {mood}',
      off: 'Got it~ automatic open close schedule is turned off. {mood}',
      footer: 'KANA group schedule', infoBtn: 'Group info',
    },
  },
}

export const test = { input: '.jadwalgrup', expect: /grup|group/i }

export async function handler(ctx) {
  const [a, b] = ctx.args
  if ((a || '').toLowerCase() === 'off') {
    await updateGroupSettings(ctx.storage, ctx.chat, { openClose: null })
    return ctx.reply(ctx.t('jadwalgrup.off', { mood: ctx.say('senang') }))
  }
  if (!a || !b) return ctx.reply(ctx.t('jadwalgrup.usage'))
  if (!isValidTime(a)) return ctx.reply(ctx.t('jadwalgrup.invalid', { time: a }))
  if (!isValidTime(b)) return ctx.reply(ctx.t('jadwalgrup.invalid', { time: b }))
  if (a === b) return ctx.reply(ctx.t('jadwalgrup.same'))
  await updateGroupSettings(ctx.storage, ctx.chat, { openClose: { open: a, close: b, state: null } })
  const body = ctx.t('jadwalgrup.set', { open: a, close: b, mood: ctx.say('senang') })
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('jadwalgrup.footer'),
    replies: [{ text: ctx.t('jadwalgrup.infoBtn'), id: '.grup info' }],
    textFallback: body,
  })
}
