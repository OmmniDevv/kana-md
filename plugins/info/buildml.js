import { ML_BUILDS, findMlHero } from '../../src/data/kindb-games.js'

export const config = {
  name: 'buildml',
  alias: [],
  category: 'info',
  description: { id: 'Contoh build item hero Mobile Legends dari dataset lokal kurasi (item inti yang umum dipakai per hero)', en: 'Sample Mobile Legends hero item builds from a curated local dataset (commonly used core items per hero)' },
  usage: '.buildml <nama hero>',
  example: '.buildml ling',
  cooldown: 5,
}

export const i18n = {
  id: {
    buildml: {
      hint: '╭─❏ 🛠️ 「 *BUILD ML* 」\n┊ Tulis nama heronya dulu yaa~\n┊ ʜᴇʀᴏ ᴛᴇʀꜱᴇᴅɪᴀ: {heroes}\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *BELUM ADA BUILD* 」\n┊ Mouu, build untuk *{q}* belum ada di dataset~\n┊ ʜᴇʀᴏ ᴛᴇʀꜱᴇᴅɪᴀ: {heroes}\n╰━━━━━━━',
      card: '╭─❏ 🛠️ 「 *BUILD {name}* 」\n┊ ʀᴏʟᴇ: *{role}*\n{itemList}\n┊ ᴄᴀᴛᴀᴛᴀɴ: build contoh dari dataset lokal, sesuaikan dengan lawan dan situasi match yaa~\n╰━━━━━━━',
      item: '┊ {n}. {item}',
    },
  },
  en: {
    buildml: {
      hint: '╭─❏ 🛠️ 「 *ML BUILD* 」\n┊ Write the hero name first~\n┊ ᴀᴠᴀɪʟᴀʙʟᴇ ʜᴇʀᴏᴇꜱ: {heroes}\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *NO BUILD YET* 」\n┊ Mouu, no build for *{q}* in the dataset yet~\n┊ ᴀᴠᴀɪʟᴀʙʟᴇ ʜᴇʀᴏᴇꜱ: {heroes}\n╰━━━━━━━',
      card: '╭─❏ 🛠️ 「 *{name} BUILD* 」\n┊ ʀᴏʟᴇ: *{role}*\n{itemList}\n┊ ɴᴏᴛᴇ: sample build from a local dataset, adapt it to the enemy and the match situation~\n╰━━━━━━━',
      item: '┊ {n}. {item}',
    },
  },
}

export const test = { input: '.buildml ling', expect: /Berserker|Heptaseas|Ling/i }

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  const heroes = Object.keys(ML_BUILDS).join(', ')
  if (!q) return ctx.reply(ctx.t('buildml.hint', { heroes }))
  const hero = findMlHero(q)
  if (!hero || !hero.build) return ctx.reply(ctx.t('buildml.notfound', { q, heroes }))
  const itemList = hero.build.map((item, i) => ctx.t('buildml.item', { n: i + 1, item })).join('\n')
  return ctx.reply(ctx.t('buildml.card', { name: hero.name, role: hero.role, itemList }))
}
