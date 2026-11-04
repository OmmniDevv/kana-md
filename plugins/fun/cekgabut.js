import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekgabut',
  alias: ['gabut'],
  category: 'fun',
  description: { id: 'Cek persen gabut seseorang hari ini, buat hiburan', en: 'Check how idle someone is today, just for fun' },
  usage: '.cekgabut <nama> atau kosongkan untuk dirimu',
  example: '.cekgabut Budi',
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
    cekgabut: {
      title: 'Cek Gabut 🥱',
      result: 'Tingkat gabut {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Produktif sekali hari ini, tidak ada celah buat gabut~',
      mid: 'Gabutnya sedang, masih bisa diselamatkan dengan cemilan~',
      high: 'Gabut parah, scroll layar saja sudah bosan~',
      max: 'GABUT MAKSIMAL! Melamun adalah pekerjaan utama hari ini~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekgabut: {
      title: 'Idle Check 🥱',
      result: 'Idle level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Very productive today, no room for idling~',
      mid: 'Moderately idle, still saveable with snacks~',
      high: 'Severely idle, even scrolling feels boring~',
      max: 'MAXIMUM IDLE! Daydreaming is the main job today~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekgabut', expect: /gabut|idle/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:gabut`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekgabut.result', {
    name: target,
    percent,
    comment: ctx.t(`cekgabut.${band}`),
    disclaimer: ctx.t('cekgabut.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekgabut.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekgabut.btnAgain'), id: '.cekgabut' },
      { text: ctx.t('cekgabut.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
