import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekcreative',
  alias: ['kreatif'],
  category: 'fun',
  description: { id: 'Cek persen kreativitas seseorang dari namanya, buat hiburan', en: 'Check how creative someone is from their name, just for fun' },
  usage: '.cekcreative <nama> atau kosongkan untuk dirimu',
  example: '.cekcreative Budi',
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
    cekcreative: {
      title: 'Cek Kreativitas 🎨',
      result: 'Tingkat kreativitas {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Kreativitasnya masih malu-malu, perlu dipancing dikit~',
      mid: 'Idenya lumayan sering muncul di saat tidak terduga~',
      high: 'Kreatif nih! Kepalanya penuh ide yang tidak kepikiran orang lain~',
      max: 'KREATIVITAS MELEDAK! Tiap hari ada saja karya barunya~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekcreative: {
      title: 'Creativity Check 🎨',
      result: 'Creativity level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Creativity is still shy, needs a little spark~',
      mid: 'Ideas pop up quite often at unexpected moments~',
      high: 'Creative! A head full of ideas others never think of~',
      max: 'EXPLODING CREATIVITY! A new creation every day~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekcreative', expect: /kreativitas|creativity/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:kreatif`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekcreative.result', {
    name: target,
    percent,
    comment: ctx.t(`cekcreative.${band}`),
    disclaimer: ctx.t('cekcreative.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekcreative.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekcreative.btnAgain'), id: '.cekcreative' },
      { text: ctx.t('cekcreative.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
