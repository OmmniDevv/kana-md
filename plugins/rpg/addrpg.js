
import { getProfile, updateProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "addrpg",
  alias: [],
  category: "rpg",
  description: { id: "Fitur addrpg versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD addrpg feature, rewritten in KANA style" },
  usage: ".addrpg",
  example: ".addrpg",
  cooldown: 5,
}

export const i18n = {
  id: {
    "addrpg": {
      done: "╭─❏ ⚔️ 「 *ADDRPG* 」\n┊ {flavor}\n┊ ᴋᴏɪɴ: *{coins}* | xᴘ: *+{xp}*\n┊ ꜱᴀʟᴅᴏ ꜱᴇᴋᴀʀᴀɴɢ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Saldo kamu *{balance} koin*, butuh *{cost} koin* buat ini~\n┊ Kerja dulu yuk pakai *.kerja*~\n╰━━━━━━━",
      info: "╭─❏ ⚔️ 「 *ADDRPG* 」\n┊ ꜱᴀʟᴅᴏ: *{balance} ᴋᴏɪɴ*\n┊ ʟᴇᴠᴇʟ: *{level}* (xᴘ {xp})\n┊ {flavor}\n╰━━━━━━━",
      btnAgain: "Lagi",
    },
  },
  en: {
    "addrpg": {
      done: "╭─❏ ⚔️ 「 *ADDRPG* 」\n┊ {flavor}\n┊ ᴄᴏɪɴꜱ: *{coins}* | xᴘ: *+{xp}*\n┊ ʙᴀʟᴀɴᴄᴇ ɴᴏᴡ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Your balance is *{balance} coins*, this needs *{cost} coins*~\n┊ Work first with *.kerja*~\n╰━━━━━━━",
      info: "╭─❏ ⚔️ 「 *ADDRPG* 」\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} ᴄᴏɪɴꜱ*\n┊ ʟᴇᴠᴇʟ: *{level}* (xᴘ {xp})\n┊ {flavor}\n╰━━━━━━━",
      btnAgain: "Again",
    },
  },
}

const MODE = "info"
const FLAVOR = { id: "Ini ringkasan fitur addrpg buat profil petualanganmu~", en: "Here is the addrpg summary for your adventure profile~" }
export const test = { input: '.addrpg', expect: /addrpg|koin|coin/i }
export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = profile.balance ?? 0
  const flavor = ctx.lang === 'en' ? FLAVOR.en : FLAVOR.id
  if (MODE === 'info') {
    return ctx.reply(ctx.t('addrpg.info', { balance, level: levelFromXp(profile.xp ?? 0), xp: profile.xp ?? 0, flavor }))
  }
  if (MODE === 'spend') {
    const cost = 50 + (('addrpg'.length * 13) % 120)
    if (balance < cost) return ctx.reply(ctx.t('addrpg.poor', { balance, cost }))
    await updateProfile(ctx.storage, ctx.senderDigits, { balance: balance - cost })
    const gain = await addXp(ctx.storage, ctx.senderDigits, 5)
    const body = ctx.t('addrpg.done', { flavor, coins: '-' + cost, xp: 5, balance: balance - cost })
    return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('addrpg.btnAgain'), id: '.addrpg' }], textFallback: body })
  }
  const coins = 25 + Math.floor(Math.random() * 70) + levelFromXp(profile.xp ?? 0) * 4
  const xp = 6 + Math.floor(Math.random() * 8)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: balance + coins })
  await addXp(ctx.storage, ctx.senderDigits, xp)
  const body = ctx.t('addrpg.done', { flavor, coins: '+' + coins, xp, balance: balance + coins })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('addrpg.btnAgain'), id: '.addrpg' }], textFallback: body })
}
