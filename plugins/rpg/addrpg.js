// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "addrpg",
  alias: ["mulai"],
  category: "rpg",
  description: { id: "Daftarkan profil RPG: nama petualang tersimpan + modal awal 250 koin sekali saja", en: "Register your RPG profile: adventurer name stored + a one-time 250 coin starter" },
  usage: ".addrpg [nama]",
  example: ".addrpg [nama]",
  cooldown: 5,
}

export const i18n = {
  id: { "addrpg": {
    "already": "╭─❏ 🪪 「 *PROFIL RPG* 」\n┊ Kamu sudah terdaftar sebagai *{regName}*.\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "done": "╭─❏ 🪪 「 *PROFIL RPG* 」\n┊ PENDAFTARAN BERHASIL! Nama petualang: *{regName}*\n┊ Modal awal *+250 KOIN* masuk. SALDO: *{balance}*\n╰━━━━━━━"
} },
  en: { "addrpg": {
    "already": "╭─❏ 🪪 「 *RPG PROFILE* 」\n┊ You are already registered as *{regName}*.\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "done": "╭─❏ 🪪 「 *RPG PROFILE* 」\n┊ REGISTRATION DONE! Adventurer name: *{regName}*\n┊ Starter *+250 COINS* added. BALANCE: *{balance}*\n╰━━━━━━━"
} },
}

export const test = { input: ".addrpg", expect: /pendaftaran berhasil|registration done|sudah terdaftar|already registered/i }
export async function handler(ctx) {

  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (profile.registered) return ctx.reply(ctx.t('addrpg.already', { regName: profile.regName || profile.name || '-', balance: profile.balance ?? 0 }))
  const regName = ((ctx.args ?? []).join(' ') || ctx.pushName || 'Petualang').trim()
  await updateProfile(ctx.storage, ctx.senderDigits, { registered: true, regName, registeredAt: new Date().toISOString(), balance: (profile.balance ?? 0) + 250 })
  return ctx.reply(ctx.t('addrpg.done', { regName, balance: (profile.balance ?? 0) + 250 }))
}
