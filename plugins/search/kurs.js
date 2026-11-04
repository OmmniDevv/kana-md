import { getRates, convertAmount } from '../../src/scrapers/search/kurs.js'

export const config = {
  name: 'kurs',
  alias: ['currency'],
  category: 'search',
  description: { id: 'Konversi kurs mata uang, tanpa arg untuk ringkasan ke IDR', en: 'Currency conversion, no args for an IDR summary' },
  usage: '.kurs <jumlah> <DARI> <KE>',
  example: '.kurs 100 USD IDR',
  cooldown: 8,
  limit: 5,
}

export const i18n = {
  id: {
    kurs: {
      failed: 'Mouu, data kurs lagi nggak bisa diambil: {message}. Coba lagi nanti ya~',
      invalid: 'Formatnya: .kurs <jumlah> <DARI> <KE>, contoh: .kurs 100 USD IDR. Kode mata uang 3 huruf yaa~',
      unknownCurrency: 'Mouu, kode mata uang "{code}" nggak dikenal. Coba USD, EUR, SGD, JPY, IDR, dan sejenisnya ya~',
      result: '{amount} {from} = {result} {to}\nKurs: 1 {from} = {rate} {to}',
      summaryHeader: 'Kurs ke IDR hari ini:',
      summaryItem: '1 {code} = {value} IDR',
    },
  },
  en: {
    kurs: {
      failed: 'Mouu, exchange rate data cannot be fetched: {message}. Try again later~',
      invalid: 'Format: .kurs <amount> <FROM> <TO>, example: .kurs 100 USD IDR. Currency codes are 3 letters~',
      unknownCurrency: 'Mouu, the currency code "{code}" is not recognized. Try USD, EUR, SGD, JPY, IDR, and similar~',
      result: '{amount} {from} = {result} {to}\nRate: 1 {from} = {rate} {to}',
      summaryHeader: "Today's rates to IDR:",
      summaryItem: '1 {code} = {value} IDR',
    },
  },
}

const SUMMARY_CODES = ['USD', 'EUR', 'SGD', 'JPY']

export const test = { input: '.kurs', expect: /kurs/i }

export async function handler(ctx) {
  const locale = ctx.lang === 'id' ? 'id-ID' : 'en-US'
  const num = (value, digits = 2) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(value)
  const args = ctx.args.map((a) => a.trim()).filter(Boolean)
  try {
    if (!args.length) {
      const usd = await getRates('USD')
      const idrPerUsd = usd.rates.IDR
      if (!idrPerUsd) return ctx.reply(ctx.t('kurs.failed', { message: 'IDR rate missing' }))
      const lines = [ctx.t('kurs.summaryHeader')]
      for (const code of SUMMARY_CODES) {
        const perUsd = code === 'USD' ? 1 : usd.rates[code]
        if (!perUsd) continue
        lines.push(ctx.t('kurs.summaryItem', { code, value: num(idrPerUsd / perUsd, code === 'JPY' ? 2 : 0) }))
      }
      return ctx.reply(lines.join('\n'))
    }
    if (args.length < 3) return ctx.reply(ctx.t('kurs.invalid'))
    const amount = Number(String(args[0]).replace(/\./g, '').replace(',', '.'))
    const from = args[1].toUpperCase()
    const to = args[2].toUpperCase()
    if (!Number.isFinite(amount) || !/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
      return ctx.reply(ctx.t('kurs.invalid'))
    }
    const rates = await getRates(from)
    const converted = convertAmount(rates, amount, to)
    if (!converted) return ctx.reply(ctx.t('kurs.unknownCurrency', { code: to }))
    return ctx.reply(
      ctx.t('kurs.result', {
        amount: num(amount),
        from,
        result: num(converted.result),
        to,
        rate: num(converted.rate, converted.rate < 1 ? 6 : 2),
      })
    )
  } catch (err) {
    const code = (err.message.match(/[A-Z]{3}/) || [])[0]
    if (/tidak valid|not valid/i.test(err.message) && code) return ctx.reply(ctx.t('kurs.unknownCurrency', { code }))
    return ctx.reply(ctx.t('kurs.failed', { message: err.message }))
  }
}
