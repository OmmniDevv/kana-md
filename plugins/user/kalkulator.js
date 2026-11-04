import { sendButtons } from '../../src/ui/buttons.js'
import { evaluateExpression, formatValue } from '../../src/services/calculator.js'

export const config = {
  name: 'kalkulator',
  alias: ['kalk'],
  category: 'user',
  description: { id: 'Hitung ekspresi matematika sederhana dengan aman', en: 'Safely calculate a simple math expression' },
  usage: '.kalkulator <ekspresi>',
  example: '.kalkulator (12+8)*3',
  cooldown: 3,
}

export const i18n = {
  id: {
    kalkulator: {
      usage: 'Tulis ekspresinya yaa, contoh: .kalkulator (12+8)*3. Bisa pakai + - * / % ^ dan kurung~ 🧮',
      result: '🧮 {expr} = {value}\n\n{mood}',
      divZero: 'Ehh, ada pembagian dengan nol tuh, itu nggak bisa yaa (╥﹏╥)',
      invalid: 'Ekspresinya belum bener nih. Pakai angka, + - * / % ^, titik desimal, dan kurung aja yaa~',
      btnMenu: 'Menu User',
    },
  },
  en: {
    kalkulator: {
      usage: 'Write the expression, example: .kalkulator (12+8)*3. You can use + - * / % ^ and parentheses~ 🧮',
      result: '🧮 {expr} = {value}\n\n{mood}',
      divZero: 'Eh, there is a division by zero there, that is not allowed (╥﹏╥)',
      invalid: 'The expression is not right yet. Use only numbers, + - * / % ^, decimal points, and parentheses~',
      btnMenu: 'User Menu',
    },
  },
}

export async function handler(ctx) {
  const expr = ctx.text.trim()
  if (!expr) return ctx.reply(ctx.t('kalkulator.usage'))
  const result = evaluateExpression(expr)
  if (!result.ok) {
    return ctx.reply(ctx.t(result.reason === 'div-zero' ? 'kalkulator.divZero' : 'kalkulator.invalid'))
  }
  const body = ctx.t('kalkulator.result', { expr, value: formatValue(result.value), mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('kalkulator.btnMenu'), id: '.menu user' }],
    textFallback: body,
  })
}
