
import { getProfile, updateProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "absenmonthly",
  alias: [],
  category: "rpg",
  description: { id: "Fitur absenmonthly versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD absenmonthly feature, rewritten in KANA style" },
  usage: ".absenmonthly",
  example: ".absenmonthly",
  cooldown: 5,
}

export const i18n = {
  id: {
    "absenmonthly": {
      done: "╭─❏ ⚔️ 「 *ABSENMONTHLY* 」\n┊ {flavor}\n┊ ᴋᴏɪɴ: *{coins}* | xᴘ: *+{xp}*\n┊ ꜱᴀʟᴅᴏ ꜱᴇᴋᴀʀᴀɴɢ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Saldo kamu *{balance} koin*, butuh *{cost} koin* buat ini~\n┊ Kerja dulu yuk pakai *.kerja*~\n╰━━━━━━━",
      info: "╭─❏ ⚔️ 「 *ABSENMONTHLY* 」\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n┊ ʟᴇᴠᴇʟ: *{level}* (xᴘ {xp})\n┊ {flavor}\n╰━━━━━━━",
      btnAgain: "Lagi",
    },
  },
  en: {
    "absenmonthly": {
      done: "╭─❏ ⚔️ 「 *ABSENMONTHLY* 」\n┊ {flavor}\n┊ ᴄᴏɪɴꜱ: *{coins}* | xᴘ: *+{xp}*\n┊ ʙᴀʟᴀɴᴄᴇ ɴᴏᴡ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Your balance is *{balance} coins*, this needs *{cost} coins*~\n┊ Work first with *.kerja*~\n╰━━━━━━━",
      info: "╭─❏ ⚔️ 「 *ABSENMONTHLY* 」\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n┊ ʟᴇᴠᴇʟ: *{level}* (xᴘ {xp})\n┊ {flavor}\n╰━━━━━━━",
      btnAgain: "Again",
    },
  },
}

const MODE = "info"
const FLAVOR = { id: "Ini ringkasan fitur absenmonthly buat profil petualanganmu~", en: "Here is the absenmonthly summary for your adventure profile~" }
export const test = { input: '.absenmonthly', expect: /absenmonthly|koin|coin/i }
export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance ?? 0
  const flavor = ctx.lang === 'en' ? FLAVOR.en : FLAVOR.id
  if (MODE === 'info') {
    return ctx.reply(ctx.t('absenmonthly.info', { balance, level: levelFromXp(profile.xp ?? 0), xp: profile.xp ?? 0, flavor }))
  }
  if (MODE === 'spend') {
    const cost = 50 + (('absenmonthly'.length * 13) % 120)
    if (balance < cost) return ctx.reply(ctx.t('absenmonthly.poor', { balance, cost }))
    await updateProfile(ctx.storage, ctx.senderDigits, { balance: balance - cost })
    const gain = await addXp(ctx.storage, ctx.senderDigits, 5)
    const body = ctx.t('absenmonthly.done', { flavor, coins: '-' + cost, xp: 5, balance: balance - cost })
    return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('absenmonthly.btnAgain'), id: '.absenmonthly' }], textFallback: body })
  }
  const coins = 25 + Math.floor(Math.random() * 70) + levelFromXp(profile.xp ?? 0) * 4
  const xp = 6 + Math.floor(Math.random() * 8)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: balance + coins })
  await addXp(ctx.storage, ctx.senderDigits, xp)
  const body = ctx.t('absenmonthly.done', { flavor, coins: '+' + coins, xp, balance: balance + coins })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('absenmonthly.btnAgain'), id: '.absenmonthly' }], textFallback: body })
}
