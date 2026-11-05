// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { buyItem, sellItem, craftItem, petAdopt } from '../../src/rpg/engine.js'
import { ITEM_MAP, SHOP_MAP, RECIPE_MAP, JOBS, PET_MAP } from '../../src/rpg/data.js'
import { isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
export const config = {
  name: "adopt",
  alias: [],
  category: "rpg",
  description: { id: "Adopsi pet sungguhan lewat engine pet: kucing, anjing, burung, naga kecil", en: "Adopt a real pet via the pet engine: cat, dog, bird, small dragon" },
  usage: ".adopt [jenis]",
  example: ".adopt [jenis]",
  cooldown: 5,
}

export const i18n = {
  id: { "adopt": {
    "unknown": "╭─❏ 🐾 「 *ADOPT* 」\n┊ Jenis pet tidak dikenal. Pilihan: *{list}*\n╰━━━━━━━",
    "has": "╭─❏ 🐾 「 *ADOPT* 」\n┊ Kamu sudah punya pet ({reason}). Satu dulu yaa~\n╰━━━━━━━",
    "done": "╭─❏ 🐾 「 *ADOPT* 」\n┊ {emoji} Kamu mengadopsi *{pet}*! Level 1, rawat baik baik~\n╰━━━━━━━"
} },
  en: { "adopt": {
    "unknown": "╭─❏ 🐾 「 *ADOPT* 」\n┊ Unknown pet kind. Options: *{list}*\n╰━━━━━━━",
    "has": "╭─❏ 🐾 「 *ADOPT* 」\n┊ You already have a pet ({reason}). One at a time~\n╰━━━━━━━",
    "done": "╭─❏ 🐾 「 *ADOPT* 」\n┊ {emoji} You adopted a *{pet}*! Level 1, take good care~\n╰━━━━━━━"
} },
}

export const test = { input: ".adopt kucing", expect: /mengadopsi|adopted|sudah punya pet|already have/i }
export async function handler(ctx) {

  const kind = ((ctx.args ?? [])[0] || 'kucing').toLowerCase()
  if (!PET_MAP[kind]) {
    const list = Object.keys(PET_MAP).join(', ')
    return ctx.reply(ctx.t('adopt.unknown', { list }))
  }
  const result = await petAdopt(ctx.storage, ctx.senderDigits, kind)
  if (!result.ok) return ctx.reply(ctx.t('adopt.has', { reason: result.reason }))
  return ctx.reply(ctx.t('adopt.done', { pet: ctx.lang === 'en' ? PET_MAP[kind].name.en : PET_MAP[kind].name.id, emoji: PET_MAP[kind].emoji }))
}
