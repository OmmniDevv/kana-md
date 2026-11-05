import { getProfile, saveProfile } from '../../src/services/user-service.js'
import { energyOf } from '../../src/rpg/energy.js'
import { isJailed, jailMinutesLeft, sendToJail } from '../../src/rpg/crime.js'

export const CRIMES = {
  maling: { min: 80, max: 260, chance: 0.55, energy: 15, jailMin: 20 },
  merampok: { min: 200, max: 650, chance: 0.42, energy: 25, jailMin: 45 },
  copet: { min: 40, max: 140, chance: 0.68, energy: 10, jailMin: 12 },
}

export const CRIME_I18N = {
  id: {
    success: '😏 Berhasil! Kamu dapat {gain} koin dari {crime}. Saldo: {balance} koin. Energi sisa {energy}.',
    caught: '🚨 KETANGKAP! Aksi {crime} kamu gagal dan kamu masuk penjara {minutes} menit. Pakai .penjara buat cek, .bebaskan buat bayar denda.',
    jailed: 'Kamu masih di penjara, sisa {minutes} menit. Kriminal ditahan dulu yaa~',
    lowEnergy: 'Energimu tinggal {energy}, tidak cukup buat {crime} (perlu {need}). Istirahat atau makan dulu yaa~',
  },
  en: {
    success: '😏 Success! You got {gain} coins from {crime}. Balance: {balance} coins. Energy left {energy}.',
    caught: '🚨 BUSTED! Your {crime} attempt failed and you are jailed for {minutes} minutes. Use .penjara to check, .bebaskan to pay the fine.',
    jailed: 'You are still in jail, {minutes} minutes left. Crime is on hold~',
    lowEnergy: 'Your energy is {energy}, not enough for {crime} (needs {need}). Rest or eat first~',
  },
}

export function crimeHandler(name) {
  return async function handler(ctx) {
    const spec = CRIMES[name]
    const profile = await getProfile(ctx.storage, ctx.senderDigits)
    if (isJailed(profile)) {
      return ctx.reply(ctx.t(`${name}.jailed`, { minutes: jailMinutesLeft(profile) }))
    }
    // Energi dipotong langsung dari profil yang sudah dimuat, lalu
    // disimpan oleh saveProfile di kedua cabang hasil. Versi lama
    // memanggil consumeEnergy (async, tanda tangan storage/digits/
    // amount) tanpa await dan dengan argumen tertukar: janjinya
    // menggantung, meledak sebagai unhandled rejection, dan gerbang
    // energinya tidak pernah bekerja.
    const energyNow = energyOf(profile)
    if (energyNow < spec.energy) {
      return ctx.reply(ctx.t(`${name}.lowEnergy`, { energy: energyNow, crime: name, need: spec.energy }))
    }
    profile.energy = energyNow - spec.energy
    if (Math.random() < spec.chance) {
      const gain = spec.min + Math.floor(Math.random() * (spec.max - spec.min + 1))
      profile.balance = (profile.balance ?? 0) + gain
      profile.xp = (profile.xp ?? 0) + 6
      await saveProfile(ctx.storage, ctx.senderDigits, profile)
      return ctx.reply(ctx.t(`${name}.success`, { gain, crime: name, balance: profile.balance, energy: energyOf(profile) }))
    }
    sendToJail(profile, spec.jailMin)
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t(`${name}.caught`, { crime: name, minutes: spec.jailMin }))
  }
}
