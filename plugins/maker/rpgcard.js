import { getProfile } from '../../src/services/user-service.js'
import { powerOf } from '../../src/rpg/engine.js'
import { energyOf } from '../../src/rpg/energy.js'
import { JOB_MAP, PET_MAP } from '../../src/rpg/data.js'
import { rpgCard } from '../../src/ui/cards.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'rpgcard',
  alias: ['karturpg'],
  category: 'maker',
  description: { id: 'Kartu gambar status RPG kamu: level, power, koin, energi', en: 'Image card of your RPG status: level, power, coins, energy' },
  usage: '.rpgcard',
  example: '.rpgcard',
  cooldown: 5,
}

export const i18n = {
  id: { rpgcard: { caption: '╭─❏ ⚔️ 「 *KARTU RPG* 」\n┊ ᴋᴀʀᴛᴜ ʀᴘɢ: *{name}* ⚔️\n╰━━━━━━━', none: 'belum ada', fail: '╭─❏ 💦 「 *GAGAL BIKIN KARTU RPG* 」\n┊ Mouu, gagal bikin kartu RPG: *{error}*~\n╰━━━━━━━' } },
  en: { rpgcard: { caption: '╭─❏ ⚔️ 「 *RPG CARD* 」\n┊ ʀᴘɢ ᴄᴀʀᴅ: *{name}* ⚔️\n╰━━━━━━━', none: 'none yet', fail: '╭─❏ 💦 「 *RPG CARD FAILED* 」\n┊ Mouu, failed to make the RPG card: *{error}*~\n╰━━━━━━━' } },
}

export const test = { input: '.rpgcard', expect: /rpg/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const { levelFromXp } = await import('../../src/services/user-service.js')
  const job = profile.job ? JOB_MAP[profile.job] : null
  const pet = profile.pet ? PET_MAP[profile.pet.kind] : null
  const name = profile.name || ctx.pushName || ctx.senderDigits
  try {
    const buffer = await rpgCard({
      name,
      level: levelFromXp(profile.xp ?? 0),
      power: powerOf(profile),
      coins: profile.balance ?? 0,
      bank: profile.bank ?? 0,
      energy: energyOf(profile),
      job: job ? (ctx.lang === 'en' ? job.name.en : job.name.id) : ctx.t('rpgcard.none'),
      pet: pet ? `${pet.emoji ?? ''} ${ctx.lang === 'en' ? pet.name.en : pet.name.id}`.trim() : ctx.t('rpgcard.none'),
    })
    return sendImage(ctx, buffer, { caption: ctx.t('rpgcard.caption', { name }) })
  } catch (err) {
    return ctx.reply(ctx.t('rpgcard.fail', { error: err.message }))
  }
}
