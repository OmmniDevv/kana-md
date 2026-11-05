// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama membalas
// ringkasan profil generik. Sekarang konverter mata uang nyata IDR ke
// SAR dua arah memakai kurs API publik gratis (src/services/fx-rates.js,
// diverifikasi dari VM); balasan selalu menyebut kurs dan tanggalnya.
import { getIdrRates, convertIdr, convertToIdr } from '../../src/services/fx-rates.js'

export const config = {
  name: 'riyal',
  alias: ["rial"],
  category: 'economy',
  description: { id: 'Konversi Rupiah ke Riyal Saudi (SAR) dan sebaliknya dengan kurs asli hari ini', en: 'Convert Rupiah to Saudi Riyal (SAR) and back at today real rate' },
  usage: '.riyal <jumlah> [idr|sar]',
  example: '.riyal 100000',
  cooldown: 5,
}

export const i18n = {
  id: {
    riyal: {
      hint: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ Tulis jumlahnya yaa: .riyal 100000 (IDR ke SAR) atau .riyal 100 sar (SAR ke IDR)\n╰━━━━━━━',
      bad: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ Jumlahnya harus angka lebih dari 0 yaa~\n╰━━━━━━━',
      down: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ Kurs SAR sedang tidak bisa diambil dari sumbernya sekarang, coba lagi nanti yaa. KANA tidak mau mengarang angka~\n╰━━━━━━━',
      fromIdr: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ *Rp{amount}* = *{result} SAR*\n┊ Kurs: 1 SAR = Rp{rate} (kurs {date})\n╰━━━━━━━',
      toIdr: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ *{amount} SAR* = *Rp{result}*\n┊ Kurs: 1 SAR = Rp{rate} (kurs {date})\n╰━━━━━━━',
    },
  },
  en: {
    riyal: {
      hint: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ Write the amount: .riyal 100000 (IDR to SAR) or .riyal 100 sar (SAR to IDR)\n╰━━━━━━━',
      bad: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ The amount must be a number above 0~\n╰━━━━━━━',
      down: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ The SAR rate cannot be fetched from its source right now, try again later. KANA will not make up numbers~\n╰━━━━━━━',
      fromIdr: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ *Rp{amount}* = *{result} SAR*\n┊ Rate: 1 SAR = Rp{rate} (rate dated {date})\n╰━━━━━━━',
      toIdr: '╭─❏ 🇸🇦 「 *RIYAL* 」\n┊ *{amount} SAR* = *Rp{result}*\n┊ Rate: 1 SAR = Rp{rate} (rate dated {date})\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.riyal 100000', expect: /SAR|kurs|rate/i }

const DECIMALS = 2
function fmt(n, dec = DECIMALS) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export async function handler(ctx) {
  const raw = (ctx.args ?? [])[0]
  if (!raw) return ctx.reply(ctx.t('riyal.hint'))
  const amount = Number(String(raw).replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(amount) || amount <= 0) return ctx.reply(ctx.t('riyal.bad'))
  const unit = String((ctx.args ?? [])[1] ?? 'idr').toLowerCase()
  const rates = await getIdrRates()
  if (!rates) return ctx.reply(ctx.t('riyal.down'))
  const perUnit = rates.SAR
  const rate = fmt(perUnit, 2)
  if (unit === 'sar') {
    const result = fmt(convertToIdr(amount, perUnit), 0)
    return ctx.reply(ctx.t('riyal.toIdr', { amount: fmt(amount), result, rate, date: rates.date }))
  }
  const result = fmt(convertIdr(amount, perUnit))
  return ctx.reply(ctx.t('riyal.fromIdr', { amount: fmt(amount, 0), result, rate, date: rates.date }))
}
