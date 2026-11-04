import { sendButtons } from '../../src/ui/buttons.js'
import { JOBS, JOB_MAP } from '../../src/rpg/data.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'job',
  alias: ['pekerjaan'],
  category: 'rpg',
  description: { id: 'Pekerjaan RPG dengan bonus aktivitas, pilih pakai .job pilih <id>', en: 'RPG job with activity bonuses, pick with .job pilih <id>' },
  usage: '.job | .job pilih <id>',
  example: '.job pilih penambang',
  cooldown: 3,
}

export const i18n = {
  id: {
    job: {
      body: '💼 PEKERJAAN RPG 💼\nJob kamu sekarang: {current}\n\n{list}\n\nPilih: .job pilih <id>',
      currentNone: 'belum ada',
      line: '{emoji} {name} ({id}): bonus {activity} +{percent}%',
      picked: '💼 Berhasil! Job kamu sekarang {emoji} {name}~\nBonusnya langsung aktif lho ✨\n{mood}',
      unknown: 'Ehh? Job {id} nggak ada... cek daftar di .job dulu yaa',
      btnProfile: 'Profil RPG',
      btnMenu: 'Menu RPG',
    },
  },
  en: {
    job: {
      body: '💼 RPG JOBS 💼\nYour current job: {current}\n\n{list}\n\nPick: .job pilih <id>',
      currentNone: 'none yet',
      line: '{emoji} {name} ({id}): {activity} bonus +{percent}%',
      picked: '💼 Done! Your job is now {emoji} {name}~\nThe bonus is active right away ✨\n{mood}',
      unknown: 'Eh? Job {id} does not exist... check the list in .job first',
      btnProfile: 'RPG Profile',
      btnMenu: 'RPG Menu',
    },
  },
}

export async function handler(ctx) {
  const action = (ctx.args?.[0] || '').toLowerCase()
  if (['pilih', 'pick', 'ambil'].includes(action)) {
    const id = (ctx.args?.[1] || '').toLowerCase()
    const job = JOB_MAP[id]
    if (!job) {
      const body = ctx.t('job.unknown', { id })
      return sendButtons(ctx.sock, ctx.chat, {
        title: 'KANA RPG',
        body,
        footer: ctx.t('menu.footer'),
        replies: [{ text: ctx.t('job.btnProfile'), id: '.rpg' }],
        textFallback: body,
      })
    }
    await updateProfile(ctx.storage, ctx.senderDigits, { job: id })
    const body = ctx.t('job.picked', { emoji: job.emoji, name: job.name[ctx.lang] ?? job.name.id, mood: ctx.say('senang') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA RPG',
      body,
      footer: ctx.t('menu.footer'),
      replies: [
        { text: ctx.t('job.btnProfile'), id: '.rpg' },
        { text: ctx.t('job.btnMenu'), id: '.menurpg' },
      ],
      textFallback: body,
    })
  }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const current = profile.job && JOB_MAP[profile.job]
    ? `${JOB_MAP[profile.job].emoji} ${JOB_MAP[profile.job].name[ctx.lang] ?? JOB_MAP[profile.job].name.id}`
    : ctx.t('job.currentNone')
  const list = JOBS.map((j) =>
    ctx.t('job.line', { emoji: j.emoji, name: j.name[ctx.lang] ?? j.name.id, id: j.id, activity: j.bonus.activity, percent: j.bonus.percent })
  ).join('\n')
  const body = ctx.t('job.body', { current, list })
  const replies = [
    ...JOBS.slice(0, 6).map((j) => ({ text: `${j.emoji} ${j.name[ctx.lang] ?? j.name.id}`.slice(0, 25), id: `.job pilih ${j.id}` })),
    { text: ctx.t('job.btnProfile'), id: '.rpg' },
  ]
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
}
