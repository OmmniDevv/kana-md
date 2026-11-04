import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekgila',
  alias: ['gila'],
  category: 'fun',
  description: { id: 'Cek persen kegilaan seru seseorang, buat hiburan saja', en: 'Check how wildly fun someone is, just for fun' },
  usage: '.cekgila <nama> atau kosongkan untuk dirimu',
  example: '.cekgila Budi',
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
    cekgila: {
      title: 'Cek Kegilaan 🤪',
      result: 'Tingkat kegilaan seru {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Waras dan terkendali, aman jadi teman curhat~',
      mid: 'Ada gila-gilanya kalau lagi kumpul sama teman dekat~',
      high: 'Gila seru terdeteksi! Hidupnya jarang yang membosankan~',
      max: 'GILA TOTAL! Ide liarnya tidak habis-habis, tongkrongan auto hidup~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekgila: {
      title: 'Wildness Check 🤪',
      result: 'Wild fun level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Sane and controlled, safe as a confidant~',
      mid: 'Gets wild when hanging out with close friends~',
      high: 'Fun wildness detected! Life is rarely boring~',
      max: 'TOTALLY WILD! Endless crazy ideas, the hangout instantly livens up~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekgila', expect: /kegilaan|wild/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:gila`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekgila.result', {
    name: target,
    percent,
    comment: ctx.t(`cekgila.${band}`),
    disclaimer: ctx.t('cekgila.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekgila.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekgila.btnAgain'), id: '.cekgila' },
      { text: ctx.t('cekgila.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
