// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama membalas
// ringkasan profil generik. Sekarang konverter mata uang nyata IDR ke
// JPY dua arah memakai kurs API publik gratis (src/services/fx-rates.js,
// diverifikasi dari VM); balasan selalu menyebut kurs dan tanggalnya.
import { getIdrRates, convertIdr, convertToIdr } from '../../src/services/fx-rates.js'

export const config = {
  name: 'yen',
  alias: [],
  category: 'economy',
  description: { id: 'Konversi Rupiah ke Yen Jepang (JPY) dan sebaliknya dengan kurs asli hari ini', en: 'Convert Rupiah to Japanese Yen (JPY) and back at today real rate' },
  usage: '.yen <jumlah> [idr|jpy]',
  example: '.yen 100000',
  cooldown: 5,
}

export const i18n = {
  id: {
    yen: {
      hint: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ Tulis jumlahnya yaa: .yen 100000 (IDR ke JPY) atau .yen 100 jpy (JPY ke IDR)\n╰━━━━━━━',
      bad: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ Jumlahnya harus angka lebih dari 0 yaa~\n╰━━━━━━━',
      down: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ Kurs JPY sedang tidak bisa diambil dari sumbernya sekarang, coba lagi nanti yaa. KANA tidak mau mengarang angka~\n╰━━━━━━━',
      fromIdr: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ *Rp{amount}* = *{result} JPY*\n┊ Kurs: 1 JPY = Rp{rate} (kurs {date})\n╰━━━━━━━',
      toIdr: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ *{amount} JPY* = *Rp{result}*\n┊ Kurs: 1 JPY = Rp{rate} (kurs {date})\n╰━━━━━━━',
    },
  },
  en: {
    yen: {
      hint: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ Write the amount: .yen 100000 (IDR to JPY) or .yen 100 jpy (JPY to IDR)\n╰━━━━━━━',
      bad: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ The amount must be a number above 0~\n╰━━━━━━━',
      down: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ The JPY rate cannot be fetched from its source right now, try again later. KANA will not make up numbers~\n╰━━━━━━━',
      fromIdr: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ *Rp{amount}* = *{result} JPY*\n┊ Rate: 1 JPY = Rp{rate} (rate dated {date})\n╰━━━━━━━',
      toIdr: '╭─❏ 🇯🇵 「 *YEN* 」\n┊ *{amount} JPY* = *Rp{result}*\n┊ Rate: 1 JPY = Rp{rate} (rate dated {date})\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.yen 100000', expect: /JPY|kurs|rate/i }

const DECIMALS = 0
function fmt(n, dec = DECIMALS) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export async function handler(ctx) {
  const raw = (ctx.args ?? [])[0]
  if (!raw) return ctx.reply(ctx.t('yen.hint'))
  const amount = Number(String(raw).replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(amount) || amount <= 0) return ctx.reply(ctx.t('yen.bad'))
  const unit = String((ctx.args ?? [])[1] ?? 'idr').toLowerCase()
  const rates = await getIdrRates()
  if (!rates) return ctx.reply(ctx.t('yen.down'))
  const perUnit = rates.JPY
  const rate = fmt(perUnit, 2)
  if (unit === 'jpy') {
    const result = fmt(convertToIdr(amount, perUnit), 0)
    return ctx.reply(ctx.t('yen.toIdr', { amount: fmt(amount), result, rate, date: rates.date }))
  }
  const result = fmt(convertIdr(amount, perUnit))
  return ctx.reply(ctx.t('yen.fromIdr', { amount: fmt(amount, 0), result, rate, date: rates.date }))
}
