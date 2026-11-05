import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { isValidTime } from '../../src/services/guard-rules.js'

export const config = {
  name: 'ocgc',
  alias: [],
  category: 'group',
  description: { id: 'Otomatis buka dan tutup grup sesuai jadwal harian (pengaturan openClose yang sama dengan .jadwalgrup, dijalankan scheduler)', en: 'Automatically open and close the group on a daily schedule (same openClose setting as .jadwalgrup, run by the scheduler)' },
  usage: '.ocgc <HH:mm tutup> <HH:mm buka> atau .ocgc off',
  example: '.ocgc 22:00 06:00',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    ocgc: {
      status: '╭─❏ 🕙 「 *OCGC: JADWAL BUKA TUTUP OTOMATIS* 」\n┊ ꜱᴛᴀᴛᴜꜱ: *{state}*\n┊ Atur: *.ocgc 22:00 06:00* (tutup 22:00, buka 06:00)\n┊ Matikan: *.ocgc off*\n╰━━━━━━━',
      on: 'AKTIF, tutup *{close}*, buka *{open}*',
      offState: 'mati (belum ada jadwal)',
      usage: '╭─❏ 🕙 「 *OCGC: JADWAL BUKA TUTUP OTOMATIS* 」\n┊ Pakai: *.ocgc <HH:mm tutup> <HH:mm buka>* atau *.ocgc off*\n┊ ᴄᴏɴᴛᴏʜ: *.ocgc 22:00 06:00*\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *FORMAT JAM SALAH* 」\n┊ Format jam *{time}* nggak valid~\n┊ Pakai *HH:mm*, contoh *22:00* yaa~\n╰━━━━━━━',
      same: '╭─❏ ⚠️ 「 *JAMNYA SAMA* 」\n┊ Jam tutup dan buka grup nggak boleh sama yaa~\n╰━━━━━━━',
      set: '╭─❏ 🕙 「 *OCGC DIATUR* 」\n┊ ᴛᴜᴛᴜᴘ: *{close}*\n┊ ʙᴜᴋᴀ: *{open}*\n┊ Scheduler KANA yang jalanin tiap menit yaa~\n╰━━━━━━━ {mood}',
      off: '╭─❏ 🕙 「 *OCGC DIMATIKAN* 」\n┊ Siap~ jadwal buka tutup grup otomatis dimatikan~\n╰━━━━━━━ {mood}',
    },
  },
  en: {
    ocgc: {
      status: '╭─❏ 🕙 「 *OCGC: AUTO OPEN CLOSE SCHEDULE* 」\n┊ ꜱᴛᴀᴛᴜꜱ: *{state}*\n┊ Set: *.ocgc 22:00 06:00* (close 22:00, open 06:00)\n┊ Turn off: *.ocgc off*\n╰━━━━━━━',
      on: 'ON, close *{close}*, open *{open}*',
      offState: 'off (no schedule yet)',
      usage: '╭─❏ 🕙 「 *OCGC: AUTO OPEN CLOSE SCHEDULE* 」\n┊ Use: *.ocgc <HH:mm close> <HH:mm open>* or *.ocgc off*\n┊ ᴇxᴀᴍᴘʟᴇ: *.ocgc 22:00 06:00*\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *INVALID TIME FORMAT* 」\n┊ Time format *{time}* is not valid~\n┊ Use *HH:mm*, for example *22:00*~\n╰━━━━━━━',
      same: '╭─❏ ⚠️ 「 *SAME TIMES* 」\n┊ Group close and open times cannot be the same~\n╰━━━━━━━',
      set: '╭─❏ 🕙 「 *OCGC SET* 」\n┊ ᴄʟᴏꜱᴇ: *{close}*\n┊ ᴏᴘᴇɴ: *{open}*\n┊ KANA scheduler runs it every minute~\n╰━━━━━━━ {mood}',
      off: '╭─❏ 🕙 「 *OCGC TURNED OFF* 」\n┊ Got it~ automatic group open close schedule is turned off~\n╰━━━━━━━ {mood}',
    },
  },
}

export const test = { input: '.ocgc 22:00 06:00', expect: /OCGC DIATUR|OCGC SET/ }

// OCGC memakai pengaturan openClose yang sama dengan .jadwalgrup; beda
// urutan argumennya saja (tutup dulu, baru buka). Eksekusi hariannya
// tetap di scheduler inti, bukan di plugin ini.
export async function handler(ctx) {
  const [a, b] = ctx.args
  if ((a || '').toLowerCase() === 'off') {
    await updateGroupSettings(ctx.storage, ctx.chat, { openClose: null })
    return ctx.reply(ctx.t('ocgc.off', { mood: ctx.say('senang') }))
  }
  if (!a && !b) {
    const s = await getGroupSettings(ctx.storage, ctx.chat)
    const oc = s.openClose
    const state = oc?.open && oc?.close
      ? ctx.t('ocgc.on', { open: oc.open, close: oc.close })
      : ctx.t('ocgc.offState')
    return ctx.reply(ctx.t('ocgc.status', { state }))
  }
  if (!a || !b) return ctx.reply(ctx.t('ocgc.usage'))
  if (!isValidTime(a)) return ctx.reply(ctx.t('ocgc.invalid', { time: a }))
  if (!isValidTime(b)) return ctx.reply(ctx.t('ocgc.invalid', { time: b }))
  if (a === b) return ctx.reply(ctx.t('ocgc.same'))
  // Argumen pertama jam tutup, kedua jam buka (urutan pakai Elaina).
  await updateGroupSettings(ctx.storage, ctx.chat, { openClose: { open: b, close: a, state: null } })
  return ctx.reply(ctx.t('ocgc.set', { open: b, close: a, mood: ctx.say('senang') }))
}
