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
      usage: '╭─❏ 🧮 「 *KALKULATOR* 」\n┊ Tulis ekspresinya yaa, contoh: *.kalkulator (12+8)*3*\n┊ Bisa pakai + - * / % ^ dan kurung~\n╰━━━━━━━',
      result: '╭─❏ 🧮 「 *HASIL HITUNG* 」\n┊ {expr} = *{value}*\n╰━━━━━━━\n{mood}',
      divZero: '╭─❏ ⚠️ 「 *PEMBAGIAN NOL* 」\n┊ Ehh, ada pembagian dengan nol tuh, itu nggak bisa yaa (╥﹏╥)\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *EKSPRESI TIDAK VALID* 」\n┊ Ekspresinya belum bener nih.\n┊ Pakai angka, + - * / % ^, titik desimal, dan kurung aja yaa~\n╰━━━━━━━',
    },
  },
  en: {
    kalkulator: {
      usage: '╭─❏ 🧮 「 *CALCULATOR* 」\n┊ Write the expression, example: *.kalkulator (12+8)*3*\n┊ You can use + - * / % ^ and parentheses~\n╰━━━━━━━',
      result: '╭─❏ 🧮 「 *HASIL HITUNG* 」\n┊ {expr} = *{value}*\n╰━━━━━━━\n{mood}',
      divZero: '╭─❏ ⚠️ 「 *DIVISION BY ZERO* 」\n┊ Eh, there is a division by zero there, that is not allowed (╥﹏╥)\n╰━━━━━━━',
      invalid: '╭─❏ ⚠️ 「 *INVALID EXPRESSION* 」\n┊ The expression is not right yet.\n┊ Use only numbers, + - * / % ^, decimal points, and parentheses~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.kalkulator (12+8)*3', expect: /60/ }

export async function handler(ctx) {
  const expr = ctx.text.trim()
  if (!expr) return ctx.reply(ctx.t('kalkulator.usage'))
  const result = evaluateExpression(expr)
  if (!result.ok) {
    return ctx.reply(ctx.t(result.reason === 'div-zero' ? 'kalkulator.divZero' : 'kalkulator.invalid'))
  }
  const body = ctx.t('kalkulator.result', { expr, value: formatValue(result.value), mood: ctx.say('senang') })
  return ctx.reply(body)
}
