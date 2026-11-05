// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "gaji",
  alias: [],
  category: "rpg",
  description: { id: "Gaji mingguan: 800 koin + level x100 + bonus pekerjaan terdaftar", en: "Weekly salary: 800 coins + level x100 + registered job bonus" },
  usage: ".gaji",
  example: ".gaji",
  cooldown: 5,
}

export const i18n = {
  id: { "gaji": {
    "done": "╭─❏ 💰 「 *GAJI* 」\n┊ Gaji mingguan cair: *+{pay} KOIN* (pekerjaan: {job}).\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "wait": "╭─❏ 💰 「 *GAJI* 」\n┊ Gaji minggu ini sudah cair. Tunggu *{days} hari* lagi~\n╰━━━━━━━"
} },
  en: { "gaji": {
    "done": "╭─❏ 💰 「 *SALARY* 」\n┊ Weekly salary paid: *+{pay} COINS* (job: {job}).\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "wait": "╭─❏ 💰 「 *SALARY* 」\n┊ This week's salary is already paid. Wait *{days} more days*~\n╰━━━━━━━"
} },
}

export const test = { input: ".gaji", expect: /gaji mingguan cair|weekly salary paid|sudah cair/i }
export async function handler(ctx) {

  const { wibDateString } = await import('../../src/services/user-service.js')
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const last = Date.parse(profile.last_gaji || '') || 0
  const weekMs = 7 * 24 * 3600000
  if (Date.now() - last < weekMs) return ctx.reply(ctx.t('gaji.wait', { days: Math.ceil((weekMs - (Date.now() - last)) / 86400000) }))
  const { JOB_MAP } = await import('../../src/rpg/data.js')
  const job = JOB_MAP[profile.job]
  const level = levelFromXp(profile.xp ?? 0)
  const pay = 800 + level * 100 + (job ? 250 : 0)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) + pay, last_gaji: new Date().toISOString() })
  await addXp(ctx.storage, ctx.senderDigits, 30)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('gaji.done', { pay, job: job ? (ctx.lang === 'en' ? job.name.en : job.name.id) : '-', balance: fresh.balance ?? 0 }))
}
