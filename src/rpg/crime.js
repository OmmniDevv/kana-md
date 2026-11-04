// Sistem kriminal dan penjara RPG: maling/merampok/copet bisa gagal dan
// masuk penjara (profile.jailUntil, timestamp ms). Selama di penjara
// aksi kriminal dan kerja ditolak oleh plugin masing-masing lewat
// isJailed(). Bebas dengan menunggu, membayar denda, atau kabur.
export function isJailed(profile, now = Date.now()) {
  return Boolean(profile?.jailUntil && profile.jailUntil > now)
}

export function jailMinutesLeft(profile, now = Date.now()) {
  if (!isJailed(profile, now)) return 0
  return Math.ceil((profile.jailUntil - now) / 60000)
}

export function sendToJail(profile, minutes, now = Date.now()) {
  profile.jailUntil = now + minutes * 60000
  return profile
}

export function fineAmount(profile) {
  return 300 + Math.floor((profile.level ?? 1) * 40)
}
