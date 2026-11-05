// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// membalas ringkasan generik. Sekarang ringkasan inventaris RPG nyata:
// jumlah jenis dan total barang, nilai total tas, saldo, bank, DM, energi,
// pet, dan guild, semuanya dari profil tersimpan. Daftar barang per item
// ada di .inventory dan nilai jual per item ada di .karung.
import { getProfile, levelFromXp } from '../../src/services/user-service.js'
import { ITEM_MAP } from '../../src/rpg/data.js'
import { energyOf } from '../../src/rpg/energy.js'

export const config = {
  name: 'inv',
  alias: [],
  category: 'rpg',
  description: { id: 'Ringkasan inventaris RPG nyata: isi tas, saldo, bank, DM, energi, pet, dan guildmu', en: 'Real RPG inventory summary: bag contents, balance, bank, DM, energy, pet, and your guild' },
  usage: '.inv',
  example: '.inv',
  cooldown: 5,
}

export const i18n = {
  id: {
    inv: {
      info: '╭─❏ 🎒 「 *INV RPG* 」\n┊ Tas: *{kinds} jenis*, total *{total}* barang (nilai *{value} koin*)\n┊ Saldo: *{balance} koin* | Bank: *{bank} koin* | DM: *{dm}*\n┊ Level: *{level}* | Energi: *{energy}*\n┊ Pet: *{pet}* | Guild: *{guild}*\n┊ Rincian barang: .inventory | Jual semua: .sellall\n╰━━━━━━━',
    },
  },
  en: {
    inv: {
      info: '╭─❏ 🎒 「 *RPG INV* 」\n┊ Bag: *{kinds} kinds*, *{total}* items total (worth *{value} coins*)\n┊ Balance: *{balance} coins* | Bank: *{bank} coins* | DM: *{dm}*\n┊ Level: *{level}* | Energy: *{energy}*\n┊ Pet: *{pet}* | Guild: *{guild}*\n┊ Item details: .inventory | Sell all: .sellall\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.inv', expect: /inv rpg|rpg inv/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const entries = Object.entries(profile.inventory ?? {}).filter(([, q]) => q > 0)
  const total = entries.reduce((a, [, q]) => a + q, 0)
  const value = entries.reduce((a, [id, q]) => a + (ITEM_MAP[id]?.price ?? 0) * q, 0)
  return ctx.reply(ctx.t('inv.info', {
    kinds: entries.length,
    total,
    value,
    balance: profile.balance ?? 0,
    bank: profile.bank ?? 0,
    dm: Math.max(0, Math.floor(Number(profile.dm) || 0)),
    level: levelFromXp(profile.xp ?? 0),
    energy: energyOf(profile),
    pet: profile.pet ? profile.pet.name + ' lv' + (profile.pet.level ?? 1) : '-',
    guild: profile.clanId || '-',
  }))
}
