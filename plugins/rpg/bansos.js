// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "bansos",
  alias: [],
  category: "rpg",
  description: { id: "Bantuan sosial harian 400 koin, hanya untuk saldo di bawah 1.500", en: "Daily social aid of 400 coins, only for balances under 1,500" },
  usage: ".bansos",
  example: ".bansos",
  cooldown: 5,
}

export const i18n = {
  id: { "bansos": {
    "done": "╭─❏ 🧺 「 *BANSOS* 」\n┊ Bantuan sosial cair: *+400 KOIN*. Semoga membantu yaa~\n┊ SALDO: *{balance} KOIN*\n╰━━━━━━━",
    "rich": "╭─❏ 🧺 「 *BANSOS* 」\n┊ Saldomu *{balance} KOIN*, masih di atas ambang bansos (1.500). Bansos buat yang saldonya tipis dulu yaa~\n╰━━━━━━━",
    "wait": "╭─❏ 🧺 「 *BANSOS* 」\n┊ Bansos hari ini sudah kamu ambil. Besok lagi~\n╰━━━━━━━"
} },
  en: { "bansos": {
    "done": "╭─❏ 🧺 「 *SOCIAL AID* 」\n┊ Social aid disbursed: *+400 COINS*. Hope it helps~\n┊ BALANCE: *{balance} COINS*\n╰━━━━━━━",
    "rich": "╭─❏ 🧺 「 *SOCIAL AID* 」\n┊ Your balance is *{balance} COINS*, above the aid threshold (1,500). Aid goes to thinner wallets first~\n╰━━━━━━━",
    "wait": "╭─❏ 🧺 「 *SOCIAL AID* 」\n┊ You already took today's aid. Come back tomorrow~\n╰━━━━━━━"
} },
}

export const test = { input: ".bansos", expect: /bantuan sosial cair|social aid disbursed|ambang bansos|aid threshold|sudah kamu ambil/i }
export async function handler(ctx) {

  const { wibDateString } = await import('../../src/services/user-service.js')
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if ((profile.balance ?? 0) >= 1500) return ctx.reply(ctx.t('bansos.rich', { balance: profile.balance ?? 0 }))
  const today = wibDateString()
  if (profile.last_bansos === today) return ctx.reply(ctx.t('bansos.wait'))
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: (profile.balance ?? 0) + 400, last_bansos: today })
  await addXp(ctx.storage, ctx.senderDigits, 5)
  const fresh = await getProfile(ctx.storage, ctx.senderDigits)
  return ctx.reply(ctx.t('bansos.done', { balance: fresh.balance ?? 0 }))
}
