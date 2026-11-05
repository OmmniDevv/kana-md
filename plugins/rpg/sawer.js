
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { digitsOf, resolveTargetJids } from '../../src/services/guard-rules.js'

// Sawer: beri koin ke member lain di grup. Target dari mention atau reply
// (kutipan), jumlah dari argumen angka pertama. Saldo beneran berpindah
// lewat user-service: pengirim berkurang, penerima bertambah jumlah yang
// sama. Elaina memilih penerima acak dari peserta grup; di KANA target
// eksplisit dari mention/reply sesuai aturan tugas, dan tanpa target yang
// jelas perintahnya ditolak dengan contoh pemakaian.
export const config = {
  name: "sawer",
  alias: ["nyawer"],
  category: "rpg",
  description: { id: "Sawer koin ke member grup yang di-mention atau di-reply", en: "Tip coins to a group member you mention or reply to" },
  usage: ".sawer <jumlah> @member",
  example: ".sawer 1000 @628123",
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    "sawer": {
      done: "╭─❏ 💸 「 *SAWER* 」\n┊ *@{giver}* menyawer *@{target}* sebesar *{amount} koin*~\n┊ ꜱᴀʟᴅᴏ ᴋᴀᴍᴜ ꜱᴇᴋᴀʀᴀɴɢ: *{balance} ᴋᴏɪɴ*\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Saldo kamu *{balance} koin*, mau sawer *{amount} koin*~\n┊ Kerja dulu yuk pakai *.kerja*~\n╰━━━━━━━",
      usage: "╭─❏ 💸 「 *SAWER* 」\n┊ Mention atau reply membernya, lalu tulis jumlahnya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.sawer 1000* sambil mention member\n╰━━━━━━━",
      badAmount: "╭─❏ 💸 「 *SAWER* 」\n┊ Jumlahnya harus angka bulat lebih dari 0 yaa~\n╰━━━━━━━",
      noTarget: "╭─❏ 💸 「 *SAWER* 」\n┊ Mention atau reply member yang mau disawer dulu yaa~\n╰━━━━━━━",
      selfTarget: "╭─❏ 💸 「 *SAWER* 」\n┊ Tidak bisa menyawer diri sendiri dong~\n╰━━━━━━━",
    },
  },
  en: {
    "sawer": {
      done: "╭─❏ 💸 「 *SAWER* 」\n┊ *@{giver}* tipped *@{target}* *{amount} coins*~\n┊ ʏᴏᴜʀ ʙᴀʟᴀɴᴄᴇ ɴᴏᴡ: *{balance} ᴄᴏɪɴꜱ*\n╰━━━━━━━",
      poor: "╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Your balance is *{balance} coins*, you want to tip *{amount} coins*~\n┊ Work first with *.kerja*~\n╰━━━━━━━",
      usage: "╭─❏ 💸 「 *SAWER* 」\n┊ Mention or reply to the member, then write the amount~\n┊ ᴇxᴀᴍᴘʟᴇ: *.sawer 1000* while mentioning a member\n╰━━━━━━━",
      badAmount: "╭─❏ 💸 「 *SAWER* 」\n┊ The amount must be a whole number above 0~\n╰━━━━━━━",
      noTarget: "╭─❏ 💸 「 *SAWER* 」\n┊ Mention or reply to the member you want to tip first~\n╰━━━━━━━",
      selfTarget: "╭─❏ 💸 「 *SAWER* 」\n┊ You cannot tip yourself~\n╰━━━━━━━",
    },
  },
}

// Target sawer: mention pertama, lalu pengirim pesan yang di-reply.
// Mengembalikan JID target atau null.
export function resolveSawerTarget(ctx) {
  const jids = resolveTargetJids({ mentionedJids: ctx.mentionedJids ?? [], quoted: ctx.quoted ?? null, args: [] })
  return jids[0] ?? null
}

// Jumlah sawer: token argumen pertama yang angka bulat positif.
export function parseSawerAmount(ctx) {
  for (const arg of ctx.args ?? []) {
    const n = Number(String(arg).replace(/[^\d]/g, ''))
    if (Number.isInteger(n) && n > 0 && /^\d+$/.test(String(arg).trim())) return n
  }
  return null
}

export const test = { input: '.sawer 100', expect: /sawer/i }
export async function handler(ctx) {
  const amount = parseSawerAmount(ctx)
  if (amount === null) {
    if (!(ctx.args ?? []).length) return ctx.reply(ctx.t('sawer.usage'))
    return ctx.reply(ctx.t('sawer.badAmount'))
  }
  const targetJid = resolveSawerTarget(ctx)
  if (!targetJid) return ctx.reply(ctx.t('sawer.noTarget'))
  const targetDigits = digitsOf(targetJid)
  if (!targetDigits || targetDigits === ctx.senderDigits) return ctx.reply(ctx.t('sawer.selfTarget'))
  const giver = await getProfile(ctx.storage, ctx.senderDigits)
  const balance = giver.balance ?? 0
  if (balance < amount) return ctx.reply(ctx.t('sawer.poor', { balance, amount }))
  const receiver = await getProfile(ctx.storage, targetDigits)
  await updateProfile(ctx.storage, ctx.senderDigits, { balance: balance - amount })
  await updateProfile(ctx.storage, targetDigits, { balance: (receiver.balance ?? 0) + amount })
  const body = ctx.t('sawer.done', { giver: ctx.senderDigits, target: targetDigits, amount, balance: balance - amount })
  return ctx.sock.sendMessage(ctx.chat, { text: body, mentions: [ctx.sender, targetJid] }, { quoted: ctx.raw })
}
