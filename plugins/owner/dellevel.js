import { getProfile, updateProfile, xpForLevel, levelFromXp } from '../../src/services/user-service.js'

export const config = {
  name: 'dellevel',
  alias: [],
  category: 'owner',
  description: { id: 'Kurangi level user (dihitung ulang dari XP)', en: 'Reduce a user level (recomputed from XP)' },
  usage: '.dellevel',
  example: '.dellevel 6281234567890 2',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    dellevel: {
      done: '╭─❏ 👑 「 *DELLEVEL* 」\n┊ Target *{target}*: level sekarang *{value}*\n╰━━━━━━━',
      usage: '╭─❏ 👑 「 *DELLEVEL* 」\n┊ Format: *.dellevel <nomor> <jumlah>*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    dellevel: {
      done: '╭─❏ 👑 「 *DELLEVEL* 」\n┊ Target *{target}*: level is now *{value}*\n╰━━━━━━━',
      usage: '╭─❏ 👑 「 *DELLEVEL* 」\n┊ Format: *.dellevel <number> <amount>*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.dellevel', expect: /format/i }

export async function handler(ctx) {
  const mentioned = (ctx.mentionedJids?.[0] || '').replace(/\D/g, '')
  const nums = (ctx.args || []).map((a) => String(a).replace(/\D/g, '')).filter(Boolean)
  const target = mentioned || nums.find((x) => x.length >= 9) || ''
  const amountRaw = (ctx.args || []).map((a) => Number(a)).filter((x) => Number.isFinite(x) && x > 0 && x <= 100000000)
  const amount = amountRaw.length ? amountRaw[amountRaw.length - 1] : 0
  if (!target || !amount) return ctx.reply(ctx.t('dellevel.usage'))
  try {
    const profile = await getProfile(ctx.storage, target)
    const cur = levelFromXp(profile.xp ?? 0)
    const next = Math.max(1, cur - Math.floor(amount))
    await updateProfile(ctx.storage, target, { xp: xpForLevel(next) })
    return ctx.reply(ctx.t('dellevel.done', { target, value: next }))
  } catch (err) {
    return ctx.reply(ctx.t('dellevel.fail', { error: err.message }))
  }
}
