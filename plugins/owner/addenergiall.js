import { restoreEnergy, MAX_ENERGY } from '../../src/rpg/energy.js'

export const config = {
  name: 'addenergiall',
  alias: [],
  category: 'owner',
  description: { id: 'Tambah energi RPG ke semua user yang tercatat di database bot', en: 'Add RPG energy to every user recorded in the bot database' },
  usage: '.addenergiall <jumlah>',
  example: '.addenergiall 25',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    addenergiall: {
      done: '╭─❏ ⚡ 「 *ADDENERGIALL* 」\n┊ Energi *+{amount}* diberikan ke *{count} user*.\n┊ Energi tiap user dibatasi maksimal *{max}* yaa~\n╰━━━━━━━',
      empty: '╭─❏ ⚡ 「 *ADDENERGIALL* 」\n┊ Belum ada user tercatat di database bot, jadi belum ada yang bisa diberi energi~\n╰━━━━━━━',
      usage: '╭─❏ ⚡ 「 *ADDENERGIALL* 」\n┊ Format: *.addenergiall <jumlah>*\n┊ Contoh: *.addenergiall 25*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    addenergiall: {
      done: '╭─❏ ⚡ 「 *ADDENERGIALL* 」\n┊ Energy *+{amount}* given to *{count} users*.\n┊ Each user energy is capped at *{max}*~\n╰━━━━━━━',
      empty: '╭─❏ ⚡ 「 *ADDENERGIALL* 」\n┊ There are no recorded users in the bot database yet, so nobody can receive energy~\n╰━━━━━━━',
      usage: '╭─❏ ⚡ 「 *ADDENERGIALL* 」\n┊ Format: *.addenergiall <amount>*\n┊ Example: *.addenergiall 25*\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.addenergiall 10', expect: /energi|energy/i }

export async function handler(ctx) {
  const amountRaw = (ctx.args || []).map((a) => Number(a)).filter((x) => Number.isFinite(x) && x > 0)
  const amount = amountRaw.length ? Math.min(100000, Math.floor(amountRaw[amountRaw.length - 1])) : 0
  if (!amount) return ctx.reply(ctx.t('addenergiall.usage'))
  try {
    const keys = (await ctx.storage.keys('users')).filter((k) => /^\d+$/.test(k))
    if (!keys.length) return ctx.reply(ctx.t('addenergiall.empty'))
    for (const digits of keys) {
      await restoreEnergy(ctx.storage, digits, amount)
    }
    return ctx.reply(ctx.t('addenergiall.done', { amount, count: keys.length, max: MAX_ENERGY }))
  } catch (err) {
    return ctx.reply(ctx.t('addenergiall.fail', { error: err.message }))
  }
}
