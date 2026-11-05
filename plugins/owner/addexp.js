
import { getProfile, updateProfile, xpForLevel, levelFromXp } from '../../src/services/user-service.js'
import { consumeEnergy, restoreEnergy } from '../../src/rpg/energy.js'
export const config = {
  name: "addexp",
  alias: [],
  category: "owner",
  description: { id: "Tambah exp user (max 9 Miliar)", en: "KANA version of the Elaina-MD addexp feature, rewritten in KANA style" },
  usage: ".addexp",
  example: ".addexp",
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    "addexp": {
      done: "╭─❏ 👑 「 *ADDEXP* 」\n┊ Target *{target}*: {field} sekarang *{value}*\n╰━━━━━━━",
      usage: "╭─❏ 👑 「 *ADDEXP* 」\n┊ Format: *.addexp <nomor> <jumlah>*\n╰━━━━━━━",
    },
  },
  en: {
    "addexp": {
      done: "╭─❏ 👑 「 *ADDEXP* 」\n┊ Target *{target}*: {field} is now *{value}*\n╰━━━━━━━",
      usage: "╭─❏ 👑 「 *ADDEXP* 」\n┊ Format: *.addexp <number> <amount>*\n╰━━━━━━━",
    },
  },
}

const FIELD = "xp"
const SIGN = 1
export const test = { input: '.addexp', expect: /format/i }
export async function handler(ctx) {
  const mentioned = (ctx.mentionedJids?.[0] || '').replace(/\D/g, '')
  const nums = (ctx.args || []).map((a) => String(a).replace(/\D/g, '')).filter(Boolean)
  const target = mentioned || nums.find((x) => x.length >= 9) || ''
  const amountRaw = (ctx.args || []).map((a) => Number(a)).filter((x) => Number.isFinite(x) && x > 0 && x <= 100000000)
  const amount = amountRaw.length ? amountRaw[amountRaw.length - 1] : 0
  if (!target || !amount) return ctx.reply(ctx.t('addexp.usage'))
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
  return ctx.reply(ctx.t('addexp.done', { target, field: FIELD, value }))
}
