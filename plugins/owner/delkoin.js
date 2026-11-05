
import { getProfile, updateProfile, xpForLevel, levelFromXp } from '../../src/services/user-service.js'
import { consumeEnergy, restoreEnergy } from '../../src/rpg/energy.js'
export const config = {
  name: "delkoin",
  alias: [],
  category: "owner",
  description: { id: "Kurangi koin user", en: "KANA version of the Elaina-MD delkoin feature, rewritten in KANA style" },
  usage: ".delkoin",
  example: ".delkoin",
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    "delkoin": {
      done: "╭─❏ 👑 「 *DELKOIN* 」\n┊ Target *{target}*: {field} sekarang *{value}*\n╰━━━━━━━",
      usage: "╭─❏ 👑 「 *DELKOIN* 」\n┊ Format: *.delkoin <nomor> <jumlah>*\n╰━━━━━━━",
    },
  },
  en: {
    "delkoin": {
      done: "╭─❏ 👑 「 *DELKOIN* 」\n┊ Target *{target}*: {field} is now *{value}*\n╰━━━━━━━",
      usage: "╭─❏ 👑 「 *DELKOIN* 」\n┊ Format: *.delkoin <number> <amount>*\n╰━━━━━━━",
    },
  },
}

const FIELD = "balance"
const SIGN = -1
export const test = { input: '.delkoin', expect: /format/i }
export async function handler(ctx) {
  const mentioned = (ctx.mentionedJids?.[0] || '').replace(/\D/g, '')
  const nums = (ctx.args || []).map((a) => String(a).replace(/\D/g, '')).filter(Boolean)
  const target = mentioned || nums.find((x) => x.length >= 9) || ''
  const amountRaw = (ctx.args || []).map((a) => Number(a)).filter((x) => Number.isFinite(x) && x > 0 && x <= 100000000)
  const amount = amountRaw.length ? amountRaw[amountRaw.length - 1] : 0
  if (!target || !amount) return ctx.reply(ctx.t('delkoin.usage'))
  const profile = await getProfile(ctx.storage, target)
  let value
  if (FIELD === 'balance') { value = Math.max(0, (profile.balance ?? 0) + SIGN * amount); await updateProfile(ctx.storage, target, { balance: value }) }
  else if (FIELD === 'xp') { value = Math.max(0, (profile.xp ?? 0) + SIGN * amount); await updateProfile(ctx.storage, target, { xp: value }) }
  else if (FIELD === 'level') {
    const cur = levelFromXp(profile.xp ?? 0)
    const next = Math.max(1, cur + SIGN * amount)
    value = next
    await updateProfile(ctx.storage, target, { xp: xpForLevel(next) })
  } else if (FIELD === 'limit') { value = Math.max(0, (profile.limitLeft ?? 0) + SIGN * amount); await updateProfile(ctx.storage, target, { limitDate: new Date().toISOString().slice(0, 10), limitLeft: value }) }
  else if (FIELD === 'energy') {
    if (SIGN > 0) { value = await restoreEnergy(ctx.storage, target, amount) } else { const r = await consumeEnergy(ctx.storage, target, amount); value = r.energy }
  } else if (FIELD === 'gacha') { value = Math.max(0, (profile.gachaTokens ?? 0) + SIGN * amount); await updateProfile(ctx.storage, target, { gachaTokens: value }) }
  return ctx.reply(ctx.t('delkoin.done', { target, field: FIELD, value }))
}
