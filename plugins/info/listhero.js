import { ML_HEROES } from '../../src/data/kindb-games.js'

export const config = {
  name: 'listhero',
  alias: [],
  category: 'info',
  description: { id: 'Daftar hero Mobile Legends per role dari dataset lokal kurasi (Assassin, Fighter, Marksman, Mage, Tank, Support)', en: 'Mobile Legends hero list by role from a curated local dataset (Assassin, Fighter, Marksman, Mage, Tank, Support)' },
  usage: '.listhero [role]',
  example: '.listhero assassin',
  cooldown: 5,
}

export const i18n = {
  id: {
    listhero: {
      notfound: '╭─❏ 🔍 「 *ROLE TIDAK KETEMU* 」\n┊ Role *{q}* tidak ada nih. Pilih: Assassin, Fighter, Marksman, Mage, Tank, Support~\n╰━━━━━━━',
      title: '╭─❏ 🎮 「 *HERO ML: {role}* 」\n{list}\n┊ ᴛᴏᴛᴀʟ: *{count} hero* (dataset lokal kurasi)\n╰━━━━━━━',
      group: '┊ *{role}*: {names}',
    },
  },
  en: {
    listhero: {
      notfound: '╭─❏ 🔍 「 *ROLE NOT FOUND* 」\n┊ Role *{q}* does not exist. Pick: Assassin, Fighter, Marksman, Mage, Tank, Support~\n╰━━━━━━━',
      title: '╭─❏ 🎮 「 *ML HEROES: {role}* 」\n{list}\n┊ ᴛᴏᴛᴀʟ: *{count} heroes* (curated local dataset)\n╰━━━━━━━',
      group: '┊ *{role}*: {names}',
    },
  },
}

export const test = { input: '.listhero assassin', expect: /Ling|Fanny|Hayabusa/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim().toLowerCase()
  const roles = [...new Set(ML_HEROES.map(([, r]) => r))]
  const wanted = q ? roles.filter((r) => r.toLowerCase() === q) : roles
  if (!wanted.length) return ctx.reply(ctx.t('listhero.notfound', { q }))
  const groups = wanted.map((role) => ctx.t('listhero.group', {
    role,
    names: ML_HEROES.filter(([, r]) => r === role).map(([n]) => n).join(', '),
  }))
  const count = wanted.reduce((a, role) => a + ML_HEROES.filter(([, r]) => r === role).length, 0)
  return ctx.reply(ctx.t('listhero.title', { role: wanted.join(', '), list: groups.join('\n'), count }))
}
