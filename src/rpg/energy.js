// Energi RPG: nilai 0-100 di profil pemakai (field energy). Default 100
// untuk profil lama yang belum punya field ini. Aktivitas berat memotong
// energi; heal dan istirahat memulihkannya.
import { getProfile, updateProfile } from '../services/user-service.js'

export const MAX_ENERGY = 100

export function energyOf(profile) {
  const value = Number(profile?.energy)
  return Number.isFinite(value) ? Math.max(0, Math.min(MAX_ENERGY, value)) : MAX_ENERGY
}

export async function consumeEnergy(storage, digits, amount) {
  const profile = await getProfile(storage, digits)
  const current = energyOf(profile)
  if (current < amount) return { ok: false, energy: current }
  const next = current - amount
  await updateProfile(storage, digits, { energy: next })
  return { ok: true, energy: next }
}

export async function restoreEnergy(storage, digits, amount) {
  const profile = await getProfile(storage, digits)
  const next = Math.min(MAX_ENERGY, energyOf(profile) + amount)
  await updateProfile(storage, digits, { energy: next })
  return next
}
