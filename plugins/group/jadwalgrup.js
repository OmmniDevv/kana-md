import { updateGroupSettings } from '../../src/services/group-service.js'
import { isValidTime } from '../../src/services/guard-rules.js'
import { sendButtons } from '../../src/ui/buttons.js'

export { isValidTime }

export const config = {
  name: 'jadwalgrup',
  alias: ['bukajam'],
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
      usage: '╭─❏ 🗓️ 「 *JADWAL GRUP* 」\n┊ Pakai: *.jadwalgrup 07:00 22:00* atau *.jadwalgrup off*\n┊ Format jam *HH:mm* yaa~\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *FORMAT JAM SALAH* 」\n┊ Format jam *{time}* nggak valid~\n┊ Pakai *HH:mm*, contoh *07:00* yaa~\n╰━━━━━━━',
      same: '╭─❏ ⚠️ 「 *JAMNYA SAMA* 」\n┊ Jam buka dan tutup grup nggak boleh sama yaa~\n╰━━━━━━━',
      set: '╭─❏ 🗓️ 「 *JADWAL GRUP DIATUR* 」\n┊ ʙᴜᴋᴀ: *{open}*\n┊ ᴛᴜᴛᴜᴘ: *{close}*\n┊ Scheduler KANA yang jalanin tiap menit yaa~\n╰━━━━━━━ {mood}',
      off: '╭─❏ 🗓️ 「 *JADWAL DIMATIKAN* 」\n┊ Siap~ jadwal buka tutup grup otomatis dimatikan~\n╰━━━━━━━ {mood}',
      footer: 'Jadwal grup KANA', infoBtn: 'Info grup',
    },
  },
  en: {
    jadwalgrup: {
      usage: '╭─❏ 🗓️ 「 *GROUP SCHEDULE* 」\n┊ Use: *.jadwalgrup 07:00 22:00* or *.jadwalgrup off*\n┊ Time format is *HH:mm*~\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *INVALID TIME FORMAT* 」\n┊ Time format *{time}* is not valid~\n┊ Use *HH:mm*, for example *07:00*~\n╰━━━━━━━',
      same: '╭─❏ ⚠️ 「 *SAME TIMES* 」\n┊ Group open and close times cannot be the same~\n╰━━━━━━━',
      set: '╭─❏ 🗓️ 「 *GROUP SCHEDULE SET* 」\n┊ ᴏᴘᴇɴ: *{open}*\n┊ ᴄʟᴏꜱᴇ: *{close}*\n┊ KANA scheduler runs it every minute~\n╰━━━━━━━ {mood}',
      off: '╭─❏ 🗓️ 「 *SCHEDULE TURNED OFF* 」\n┊ Got it~ automatic group open close schedule is turned off~\n╰━━━━━━━ {mood}',
      footer: 'KANA group schedule', infoBtn: 'Group info',
    },
  },
}

export const test = { input: '.jadwalgrup 21:00 06:00', expect: /grup|group/i }

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
