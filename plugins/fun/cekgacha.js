import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekgacha',
  alias: ['hokigacha'],
  category: 'fun',
  description: { id: 'Cek persen keberuntungan gacha seseorang, buat hiburan', en: 'Check someone gacha luck percent, just for fun' },
  usage: '.cekgacha <nama> atau kosongkan untuk dirimu',
  example: '.cekgacha Budi',
  cooldown: 3,
}

// Hash deterministik kecil jadi persen 0 sampai 100. Duplikasi disengaja
// di tiap plugin cek-* supaya plugin tetap mandiri satu file.
export function hashPercent(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 101
}

export const i18n = {
  id: {
    cekgacha: {
      title: 'Cek Hoki Gacha 🎰',
      result: 'Hoki gacha {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Ampas alert! Simpan dulu primogem dan tiketmu hari ini~',
      mid: 'Lumayan, ada peluang dapat bintang empat~',
      high: 'Hokinya naik! Sekali multi bisa pulang emas nih~',
      max: 'DEWA GACHA! Sekali tarik langsung pulang yang paling langka~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekgacha: {
      title: 'Gacha Luck Check 🎰',
      result: 'Gacha luck of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Bad pull alert! Save your currency and tickets today~',
      mid: 'Decent, there is a chance for a four star pull~',
      high: 'Luck is rising! One multi pull could bring gold home~',
      max: 'GACHA GOD! One pull brings home the rarest one~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekgacha', expect: /gacha/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:gacha`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekgacha.result', {
    name: target,
    percent,
    comment: ctx.t(`cekgacha.${band}`),
    disclaimer: ctx.t('cekgacha.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekgacha.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekgacha.btnAgain'), id: '.cekgacha' },
      { text: ctx.t('cekgacha.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
