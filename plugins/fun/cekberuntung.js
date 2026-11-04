import { sendButtons } from '../../src/ui/buttons.js'
import { wibDateString } from '../../src/services/user-service.js'

export const config = {
  name: 'cekberuntung',
  alias: [],
  category: 'fun',
  description: { id: 'Cek persen keberuntungan kamu hari ini, buat hiburan', en: 'Check your luck percent for today, just for fun' },
  usage: '.cekberuntung',
  example: '.cekberuntung',
  cooldown: 3,
}

// Hash deterministik kecil jadi persen 0 sampai 100 (duplikasi disengaja,
// sama seperti di cekmood, supaya plugin tetap mandiri satu file).
export function hashPercent(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 101
}

export const i18n = {
  id: {
    cekberuntung: {
      title: 'Cek Keberuntungan 🍀',
      result: 'Keberuntungan {name} hari ini: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Lagi seret nih... tapi hari buruk bukan berarti minggu buruk, semangat yaa~ (•̀ᴗ•́)و',
      mid: 'Lumayan lah, ada peluang kecil yang bisa kamu jemput hari ini~ 🍀',
      high: 'Beruntung nih! Coba hal baik yang kemarin sempat tertunda~ ✨',
      max: 'Gila sih ini, keberuntunganmu penuh! Manfaatin baik-baik yaa~ 🎉🌟',
      disclaimer: 'Ini cuma hiburan yaa, keberuntungan beneran tetap datang dari usaha dan timing, bukan persen ini~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekberuntung: {
      title: 'Luck Check 🍀',
      result: '{name} luck today: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Running dry today... but a bad day is not a bad week, keep going~ (•̀ᴗ•́)و',
      mid: 'Not bad, there is a small chance you can grab today~ 🍀',
      high: 'Lucky you! Try that good thing you postponed yesterday~ ✨',
      max: 'Wow, your luck is full today! Make the most of it~ 🎉🌟',
      disclaimer: 'This is just for fun, real luck still comes from effort and timing, not this percent~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export async function handler(ctx) {
  const percent = hashPercent(`${ctx.senderDigits}:luck:${wibDateString()}`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekberuntung.result', {
    name: ctx.pushName || ctx.senderDigits,
    percent,
    comment: ctx.t(`cekberuntung.${band}`),
    disclaimer: ctx.t('cekberuntung.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekberuntung.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekberuntung.btnAgain'), id: '.cekberuntung' },
      { text: ctx.t('cekberuntung.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
