// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama MODE="info"
// membalas ringkasan generik. Sekarang membaca stamina nyata dari
// energy.js (field energy profil, skala 0-100) yang dipakai semua
// aktivitas RPG berat.
import { getProfile } from '../../src/services/user-service.js'
import { energyOf, MAX_ENERGY } from '../../src/rpg/energy.js'

export const config = {
  name: 'stamina',
  alias: [],
  category: 'rpg',
  description: { id: 'Stamina (energi) nyata milikmu yang dipakai aktivitas RPG, dari profilmu langsung', en: 'Your real stamina (energy) used by RPG activities, straight from your profile' },
  usage: '.stamina',
  example: '.stamina',
  cooldown: 5,
}

export const i18n = {
  id: {
    stamina: {
      info: '╭─❏ 🔋 「 *STAMINA* 」\n┊ Stamina kamu: *{energy}/{max}*\n┊ {note}\n┊ Pulihkan pakai .heal, .istirahat, .eat, atau .buyenergi\n╰━━━━━━━',
      low: 'Udah mau habis nih, istirahat dulu yaa~',
      ok: 'Masih cukup buat beraktivitas~',
    },
  },
  en: {
    stamina: {
      info: '╭─❏ 🔋 「 *STAMINA* 」\n┊ Your stamina: *{energy}/{max}*\n┊ {note}\n┊ Restore with .heal, .istirahat, .eat, or .buyenergi\n╰━━━━━━━',
      low: 'Almost empty, take a rest first~',
      ok: 'Still enough for activities~',
    },
  },
}

export const test = { input: '.stamina', expect: /stamina kamu|your stamina/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const energy = energyOf(profile)
  return ctx.reply(ctx.t('stamina.info', {
    energy,
    max: MAX_ENERGY,
    note: energy < 25 ? ctx.t('stamina.low') : ctx.t('stamina.ok'),
  }))
}
