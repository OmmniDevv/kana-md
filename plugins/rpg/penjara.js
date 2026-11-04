import { fineAmount, isJailed, jailMinutesLeft } from '../../src/rpg/crime.js'
import { getProfile, saveProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'penjara',
  alias: ['jail', 'statuspenjara', 'checkjail', 'jailstatus'],
  category: 'rpg',
  description: { id: 'Cek status penjara, bayar denda bebas (.penjara bebas), atau kabur (.penjara kabur)', en: 'Check jail status, pay the fine (.penjara bebas), or escape (.penjara kabur)' },
  usage: '.penjara [bebas|kabur]',
  example: '.penjara',
  cooldown: 5,
}

export const i18n = {
  id: {
    penjara: {
      free: '╭─❏ ✨ 「 *PENJARA* 」\n┊ Kamu tidak sedang di penjara. Bebas merdeka~ {mood}\n╰━━━━━━━',
      status: '╭─❏ 🚔 「 *PENJARA* 」\n┊ 🚔 Kamu lagi di penjara, sisa {minutes} menit. Denda bebas: {fine} koin.\n┊ Pilihanmu: .penjara bebas (bayar denda) atau .penjara kabur (peluang 30 persen, gagal tambah 10 menit).\n╰━━━━━━━',
      paid: '╭─❏ 💸 「 *PENJARA* 」\n┊ 💸 Denda {fine} koin dibayar. Kamu bebas! Jangan nakal lagi yaa~\n╰━━━━━━━',
      poor: '╭─❏ ✨ 「 *PENJARA* 」\n┊ Koinmu kurang buat denda {fine} koin (saldo {balance}). Tunggu waktu habis atau coba kabur.\n╰━━━━━━━',
      escaped: '╭─❏ 🏃 「 *PENJARA* 」\n┊ 🏃 BERHASIL KABUR! Kamu bebas dari penjara. Sembunyi yang rapi yaa~\n╰━━━━━━━',
      escapeFail: '╭─❏ 🚨 「 *PENJARA* 」\n┊ 🚨 Kaburnya gagal! Petugas menambah hukumanmu 10 menit. Sisa {minutes} menit.\n╰━━━━━━━',
    },
  },
  en: {
    penjara: {
      free: '╭─❏ ✨ 「 *PENJARA* 」\n┊ You are not in jail. Free as a bird~ {mood}\n╰━━━━━━━',
      status: '╭─❏ 🚔 「 *PENJARA* 」\n┊ 🚔 You are in jail, {minutes} minutes left. Release fine: {fine} coins.\n┊ Choose with a command: .penjara bebas (pay the fine) or .penjara kabur (30 percent chance, fail adds 10 minutes).\n╰━━━━━━━',
      paid: '╭─❏ 💸 「 *PENJARA* 」\n┊ 💸 Paid the {fine} coin fine. You are free! Be good now~\n╰━━━━━━━',
      poor: '╭─❏ ✨ 「 *PENJARA* 」\n┊ Not enough coins for the {fine} coin fine (balance {balance}). Wait it out or try escaping.\n╰━━━━━━━',
      escaped: '╭─❏ 🏃 「 *PENJARA* 」\n┊ 🏃 ESCAPED! You broke out of jail. Hide well~\n╰━━━━━━━',
      escapeFail: '╭─❏ 🚨 「 *PENJARA* 」\n┊ 🚨 The escape failed! The guards added 10 minutes. {minutes} minutes left.\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.penjara', expect: /penjara|jail/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const arg = (ctx.text || '').trim().toLowerCase()
  if (!isJailed(profile)) return ctx.reply(ctx.t('penjara.free', { mood: ctx.say('senang') }))
  const fine = fineAmount(profile)
  if (arg === 'bebas' || arg === 'bayar') {
    if ((profile.balance ?? 0) < fine) {
      return ctx.reply(ctx.t('penjara.poor', { fine, balance: profile.balance ?? 0 }))
    }
    profile.balance -= fine
    profile.jailUntil = 0
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('penjara.paid', { fine }))
  }
  if (arg === 'kabur') {
    if (Math.random() < 0.3) {
      profile.jailUntil = 0
      await saveProfile(ctx.storage, ctx.senderDigits, profile)
      return ctx.reply(ctx.t('penjara.escaped'))
    }
    profile.jailUntil += 10 * 60000
    await saveProfile(ctx.storage, ctx.senderDigits, profile)
    return ctx.reply(ctx.t('penjara.escapeFail', { minutes: jailMinutesLeft(profile) }))
  }
  return ctx.reply(ctx.t('penjara.status', { minutes: jailMinutesLeft(profile), fine }))
}
