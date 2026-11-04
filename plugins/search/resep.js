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
      needQuery: 'Ketik nama makanannya dulu yaa, contoh: .resep chicken~ 🍳',
      notFound: 'Mouu, resep "{query}" nggak ketemu di TheMealDB. Coba kata bahasa Inggris lain ya~',
      failed: 'Mouu, pencarian resep gagal: {message}. Coba lagi nanti ya~',
      header: '🍳 {name}',
      meta: 'Kategori: {category} | Asal: {area}',
      ingredientsTitle: 'Bahan utama:',
      stepsTitle: 'Cara masak (ringkas):',
      others: 'Hasil lain: {names}',
      btnOther: 'Resep {name}',
      btnMenu: 'Menu Pencarian',
    },
  },
  en: {
    resep: {
      needQuery: 'Type a food name first, example: .resep chicken~ 🍳',
      notFound: 'Mouu, recipe "{query}" was not found on TheMealDB. Try another English keyword~',
      failed: 'Mouu, recipe search failed: {message}. Try again later~',
      header: '🍳 {name}',
      meta: 'Category: {category} | Origin: {area}',
      ingredientsTitle: 'Main ingredients:',
      stepsTitle: 'Steps (short version):',
      others: 'Other results: {names}',
      btnOther: '{name} recipe',
      btnMenu: 'Search Menu',
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
    '',
    ctx.t('resep.ingredientsTitle'),
    ...ingredients.map((ing) => `• ${ing}`),
    '',
    ctx.t('resep.stepsTitle'),
    steps,
  ]
  if (others.length) lines.push('', ctx.t('resep.others', { names: others.map((m) => m.strMeal).join(', ') }))
  const body = lines.join('\n')
  const replies = others.slice(0, 3).map((m) => ({
    text: ctx.t('resep.btnOther', { name: String(m.strMeal).slice(0, 14) }),
    id: `.resep ${m.strMeal}`,
  }))
  replies.push({ text: ctx.t('resep.btnMenu'), id: '.menu search' })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
