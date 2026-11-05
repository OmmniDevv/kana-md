import { handler as jadwalgrupHandler } from './jadwalgrup.js'

export const config = {
  name: 'jadwalgroup',
  alias: [],
  category: 'group',
  description: { id: 'Jadwal buka/tutup grup otomatis (nama lain .jadwalgrup, logika yang sama)', en: 'Automatic group open/close schedule (alternate name of .jadwalgrup, same logic)' },
  usage: '.jadwalgroup <HH:mm buka> <HH:mm tutup> atau .jadwalgroup off',
  example: '.jadwalgroup 07:00 22:00',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const test = { input: '.jadwalgroup 21:00 06:00', expect: /JADWAL GRUP DIATUR|GROUP SCHEDULE SET/ }

// Delegasi penuh ke handler .jadwalgrup: satu logika jadwal untuk dua
// nama perintah, supaya perilaku dan teksnya tidak pernah bercabang.
export async function handler(ctx) {
  return jadwalgrupHandler(ctx)
}
