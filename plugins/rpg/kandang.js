// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// membalas ringkasan generik. Sekarang kandang membaca pet nyata milikmu
// (profile.pet dari engine petAdopt/petFeed) plus stok makanan pet.
import { getProfile } from '../../src/services/user-service.js'
import { PETS, PET_MAP } from '../../src/rpg/data.js'

export const config = {
  name: 'kandang',
  alias: [],
  category: 'rpg',
  description: { id: 'Kandang pet nyata: pet yang kamu pelihara, level, XP, dan stok makanan pet', en: 'Your real pet pen: the pet you keep, its level, XP, and pet food stock' },
  usage: '.kandang',
  example: '.kandang',
  cooldown: 5,
}

export const i18n = {
  id: {
    kandang: {
      empty: '╭─❏ 🐾 「 *KANDANG* 」\n┊ Kandangmu kosong, belum ada pet. Pilihan adopsi: {list}\n┊ Adopsi pakai .petshop adopsi <jenis> atau .pet adopsi <jenis>. Stok makanan pet: *{food}*\n╰━━━━━━━',
      info: '╭─❏ 🐾 「 *KANDANG* 」\n┊ {emoji} *{name}* ({kind})\n┊ Level pet: *{level}* | XP pet: *{xp}*\n┊ Terakhir makan: *{fed}*\n┊ Stok makanan pet: *{food}* (kasih makan pakai .pet makan)\n╰━━━━━━━',
      neverFed: 'belum pernah',
    },
  },
  en: {
    kandang: {
      empty: '╭─❏ 🐾 「 *PET PEN* 」\n┊ Your pen is empty, no pet yet. Adoption choices: {list}\n┊ Adopt with .petshop adopsi <kind> or .pet adopsi <kind>. Pet food stock: *{food}*\n╰━━━━━━━',
      info: '╭─❏ 🐾 「 *PET PEN* 」\n┊ {emoji} *{name}* ({kind})\n┊ Pet level: *{level}* | Pet XP: *{xp}*\n┊ Last fed: *{fed}*\n┊ Pet food stock: *{food}* (feed with .pet makan)\n╰━━━━━━━',
      neverFed: 'never',
    },
  },
}

export const test = { input: '.kandang', expect: /kandangmu kosong|level pet|pen is empty|pet level/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const food = (profile.inventory ?? {}).makananpet ?? 0
  if (!profile.pet) {
    const list = PETS.map((p) => p.emoji + ' ' + (ctx.lang === 'en' ? p.name.en : p.name.id) + ' (' + p.id + ')').join(', ')
    return ctx.reply(ctx.t('kandang.empty', { list, food }))
  }
  const def = PET_MAP[profile.pet.kind]
  return ctx.reply(ctx.t('kandang.info', {
    emoji: def?.emoji ?? '🐾',
    name: profile.pet.name,
    kind: profile.pet.kind,
    level: profile.pet.level ?? 1,
    xp: profile.pet.xp ?? 0,
    fed: profile.pet.fedAt ? String(profile.pet.fedAt).slice(0, 10) : ctx.t('kandang.neverFed'),
    food,
  }))
}
