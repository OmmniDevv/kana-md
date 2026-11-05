// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "selectskill",
  alias: [],
  category: "rpg",
  description: { id: "Pilih pekerjaan/skill dari daftar pekerjaan engine; bonusnya berlaku di aktivitas yang cocok", en: "Pick a job/skill from the engine job list; its bonus applies to matching activities" },
  usage: ".selectskill [nama]",
  example: ".selectskill [nama]",
  cooldown: 5,
}

export const i18n = {
  id: { "selectskill": {
    "list": "╭─❏ 🛠️ 「 *PILIH SKILL* 」\n┊ DAFTAR PEKERJAAN/SKILL:\n┊ {list}\n┊ SKILL KAMU SEKARANG: *{current}*\n┊ PILIH: *.selectskill <nama>* (bonus sesuai aktivitasnya)\n╰━━━━━━━",
    "unknown": "╭─❏ 🛠️ 「 *PILIH SKILL* 」\n┊ Skill *{item}* tidak ada~\n╰━━━━━━━",
    "done": "╭─❏ 🛠️ 「 *PILIH SKILL* 」\n┊ Skill aktif sekarang: *{job}*. Bonusnya berlaku di aktivitas yang cocok!\n╰━━━━━━━"
} },
  en: { "selectskill": {
    "list": "╭─❏ 🛠️ 「 *SELECT SKILL* 」\n┊ JOB/SKILL LIST:\n┊ {list}\n┊ YOUR CURRENT SKILL: *{current}*\n┊ PICK: *.selectskill <name>* (bonus applies to matching activities)\n╰━━━━━━━",
    "unknown": "╭─❏ 🛠️ 「 *SELECT SKILL* 」\n┊ Skill *{item}* does not eXist~\n╰━━━━━━━",
    "done": "╭─❏ 🛠️ 「 *SELECT SKILL* 」\n┊ Active skill now: *{job}*. Its bonus applies to matching activities!\n╰━━━━━━━"
} },
}

export const test = { input: ".selectskill", expect: /daftar pekerjaan|job list|skill list|skill/i }
export async function handler(ctx) {

  const arg = ((ctx.args ?? [])[0] || '').toLowerCase()
  const { JOB_MAP } = await import('../../src/rpg/data.js')
  if (!arg) {
    const profile = await getProfile(ctx.storage, ctx.senderDigits)
    const list = JOBS.map((j) => '• ' + j.emoji + ' ' + j.id + ' : ' + (ctx.lang === 'en' ? j.name.en : j.name.id)).join('\n┊ ')
    return ctx.reply(ctx.t('selectskill.list', { list, current: profile.job || '-' }))
  }
  if (!JOB_MAP[arg]) return ctx.reply(ctx.t('selectskill.unknown', { item: arg }))
  await updateProfile(ctx.storage, ctx.senderDigits, { job: arg })
  return ctx.reply(ctx.t('selectskill.done', { job: ctx.lang === 'en' ? JOB_MAP[arg].name.en : JOB_MAP[arg].name.id }))
}
