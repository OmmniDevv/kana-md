import { DEFAULT_DAILY_LIMIT, updateProfile, wibDateString } from '../../src/services/user-service.js'
import { LIMIT_GROUPS, LIMITS_NS, usageKey } from '../../src/services/limit.js'

export const config = {
  name: 'resetlimit',
  alias: [],
  category: 'main',
  description: { id: 'Reset limit harian semua user ke penuh (khusus owner)', en: 'Reset every user daily limit back to full (owner only)' },
  usage: '.resetlimit',
  example: '.resetlimit',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    resetlimit: {
      done: '╭─❏ 🎫 「 *RESET LIMIT SELESAI* 」\n┊ Limit harian *{count} user* sudah dikembalikan ke *{limit}* per hari.\n┊ Catatan pemakaian fitur berat hari ini ({groups}) juga sudah dikosongkan~\n╰━━━━━━━',
      empty: '╭─❏ 🎫 「 *RESET LIMIT* 」\n┊ Belum ada user tercatat di database bot, jadi tidak ada limit yang perlu direset~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    resetlimit: {
      done: '╭─❏ 🎫 「 *LIMIT RESET DONE* 」\n┊ The daily limit of *{count} users* has been restored to *{limit}* per day.\n┊ Today heavy feature usage records ({groups}) have been cleared too~\n╰━━━━━━━',
      empty: '╭─❏ 🎫 「 *LIMIT RESET* 」\n┊ No users are recorded in the bot database yet, so there is no limit to reset~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.resetlimit', expect: /limit/i }

export async function handler(ctx) {
  try {
    const keys = (await ctx.storage.keys('users')).filter((k) => /^\d+$/.test(k))
    if (!keys.length) return ctx.reply(ctx.t('resetlimit.empty'))
    const today = wibDateString()
    for (const digits of keys) {
      await updateProfile(ctx.storage, digits, { limitDate: today, limitLeft: DEFAULT_DAILY_LIMIT })
      // Kosongkan catatan pemakaian grup limit (download/upscale) hari ini.
      for (const group of Object.keys(LIMIT_GROUPS)) {
        await ctx.storage.delete(LIMITS_NS, usageKey(digits, group))
      }
    }
    return ctx.reply(ctx.t('resetlimit.done', {
      count: keys.length,
      limit: DEFAULT_DAILY_LIMIT,
      groups: Object.keys(LIMIT_GROUPS).join(', '),
    }))
  } catch (err) {
    return ctx.reply(ctx.t('resetlimit.fail', { error: err.message }))
  }
}
