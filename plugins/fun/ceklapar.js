import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'ceklapar',
  alias: ['lapar'],
  category: 'fun',
  description: { id: 'Cek persen lapar seseorang sekarang, buat hiburan saja', en: 'Check how hungry someone is right now, just for fun' },
  usage: '.ceklapar <nama> atau kosongkan untuk dirimu',
  example: '.ceklapar Budi',
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
    ceklapar: {
      title: 'Cek Lapar 🍔',
      result: 'Tingkat lapar {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Masih kenyang, baru selesai makan kayaknya~',
      mid: 'Mulai lapar dikit, waktunya cari cemilan~',
      high: 'Lapar parah! Suara perutnya sudah konser~',
      max: 'LAPAR MAKSIMAL! Lihat gambar makanan saja langsung ngiler~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    ceklapar: {
      title: 'Hunger Check 🍔',
      result: 'Hunger level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Still full, probably just finished eating~',
      mid: 'Getting a bit hungry, time to find snacks~',
      high: 'Very hungry! The stomach is holding a concert~',
      max: 'MAXIMUM HUNGER! Drooling just from food pictures~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.ceklapar', expect: /lapar|hungry/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:lapar`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('ceklapar.result', {
    name: target,
    percent,
    comment: ctx.t(`ceklapar.${band}`),
    disclaimer: ctx.t('ceklapar.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('ceklapar.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('ceklapar.btnAgain'), id: '.ceklapar' },
      { text: ctx.t('ceklapar.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
