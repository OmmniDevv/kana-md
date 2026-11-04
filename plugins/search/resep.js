import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'resep',
  alias: ['recipe'],
  category: 'search',
  description: { id: 'Cari resep masakan dari TheMealDB', en: 'Search recipes from TheMealDB' },
  usage: '.resep <kata kunci>',
  example: '.resep chicken',
  cooldown: 5,
  limit: 3,
}

export const i18n = {
  id: {
    resep: {
      needQuery: '╭─❏ 🍳 「 *CARI RESEP* 」\n┊ Ketik nama makanannya dulu yaa~\n┊ Contoh: *.resep chicken*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *RESEP TIDAK KETEMU* 」\n┊ Mouu, resep *{query}* nggak ketemu di TheMealDB~\n┊ Coba kata bahasa Inggris lain yaa~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencarian resep gagal: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      header: '╭─❏ 🍳 「 *{name}* 」',
      meta: '┊ ᴋᴀᴛᴇɢᴏʀɪ: *{category}*\n┊ ᴀꜱᴀʟ: *{area}*',
      ingredientsTitle: '┊ ʙᴀʜᴀɴ ᴜᴛᴀᴍᴀ:',
      stepsTitle: '┊ ᴄᴀʀᴀ ᴍᴀꜱᴀᴋ (ʀɪɴɢᴋᴀꜱ):',
      others: '┊ ʜᴀꜱɪʟ ʟᴀɪɴ: {names}',
      btnOther: 'Resep {name}',
    },
  },
  en: {
    resep: {
      needQuery: '╭─❏ 🍳 「 *RECIPE SEARCH* 」\n┊ Type a food name first~\n┊ Example: *.resep chicken*\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *RECIPE NOT FOUND* 」\n┊ Mouu, recipe *{query}* was not found on TheMealDB~\n┊ Try another English keyword~\n╰━━━━━━━',
      failed: '╭─❏ 😖 「 *SEARCH FAILED* 」\n┊ Mouu, recipe search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      header: '╭─❏ 🍳 「 *{name}* 」',
      meta: '┊ ᴄᴀᴛᴇɢᴏʀʏ: *{category}*\n┊ ᴏʀɪɢɪɴ: *{area}*',
      ingredientsTitle: '┊ ᴍᴀɪɴ ɪɴɢʀᴇᴅɪᴇɴᴛꜱ:',
      stepsTitle: '┊ ꜱᴛᴇᴘꜱ (ꜱʜᴏʀᴛ ᴠᴇʀꜱɪᴏɴ):',
      others: '┊ ᴏᴛʜᴇʀ ʀᴇꜱᴜʟᴛꜱ: {names}',
      btnOther: '{name} recipe',
    },
  },
}

function mealIngredients(meal) {
  const list = []
  for (let i = 1; i <= 20; i++) {
    const ing = String(meal[`strIngredient${i}`] ?? '').trim()
    if (!ing) continue
    const measure = String(meal[`strMeasure${i}`] ?? '').trim()
    list.push(measure ? `${ing} (${measure})` : ing)
  }
  return list
}

export const test = { input: '.resep Chicken', expect: /Chicken/i }

export async function handler(ctx) {
  const query = ctx.text.trim()
  if (!query) return ctx.reply(ctx.t('resep.needQuery'))
  let meals
  try {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    const { buffer } = await downloadBuffer(url, { timeout: 20000 })
    meals = JSON.parse(buffer.toString('utf8'))?.meals
  } catch (err) {
    return ctx.reply(ctx.t('resep.failed', { message: err.message }))
  }
  if (!Array.isArray(meals) || !meals.length) return ctx.reply(ctx.t('resep.notFound', { query }))
  const meal = meals[0]
  const ingredients = mealIngredients(meal).slice(0, 10)
  const steps = String(meal.strInstructions ?? '').replace(/\s+/g, ' ').trim().slice(0, 1200)
  const others = meals.slice(1, 6)
  const lines = [
    ctx.t('resep.header', { name: meal.strMeal }),
    ctx.t('resep.meta', { category: meal.strCategory || '-', area: meal.strArea || '-' }),
    ctx.t('resep.ingredientsTitle'),
    ...ingredients.map((ing) => `┊ • ${ing}`),
    ctx.t('resep.stepsTitle'),
    `┊ ${steps}`,
  ]
  if (others.length) lines.push(ctx.t('resep.others', { names: others.map((m) => m.strMeal).join(', ') }))
  lines.push('╰━━━━━━━')
  const body = lines.join('\n')
  const replies = others.slice(0, 3).map((m) => ({
    text: ctx.t('resep.btnOther', { name: String(m.strMeal).slice(0, 14) }),
    id: `.resep ${m.strMeal}`,
  }))
  if (!replies.length) return ctx.reply(body)
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
