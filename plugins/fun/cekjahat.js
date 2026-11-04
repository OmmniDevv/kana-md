import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekjahat',
  alias: ['jahat'],
  category: 'fun',
  description: { id: 'Cek persen jahat iseng seseorang, buat hiburan saja', en: 'Check how mischievously evil someone is, just for fun' },
  usage: '.cekjahat <nama> atau kosongkan untuk dirimu',
  example: '.cekjahat Budi',
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
    cekjahat: {
      title: 'Cek Jahat 😈',
      result: 'Tingkat jahat iseng {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Hatinya bersih, jahat saja tidak tega~',
      mid: 'Jahatnya standar, cuma kalau lagi diganggu duluan~',
      high: 'Jahat iseng terdeteksi, suka ngerjain orang diam-diam~',
      max: 'PENJAHAT KELAS KAKAP versi iseng! Rencana jahilnya berlapis-lapis~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekjahat: {
      title: 'Mischief Check 😈',
      result: 'Mischief level of {name}: {percent}%!\n{comment}\n\n{disclaimer}',
      low: 'Pure heart, cannot even bring themselves to be mean~',
      mid: 'Standard mischief, only when disturbed first~',
      high: 'Mischief detected, secretly loves pranking people~',
      max: 'MASTER VILLAIN of pranks! Layered evil plans~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekjahat', expect: /jahat|evil/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:jahat`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekjahat.result', {
    name: target,
    percent,
    comment: ctx.t(`cekjahat.${band}`),
    disclaimer: ctx.t('cekjahat.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekjahat.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekjahat.btnAgain'), id: '.cekjahat' },
      { text: ctx.t('cekjahat.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
