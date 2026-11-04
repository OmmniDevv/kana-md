import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekngantuk',
  alias: ['ngantuk'],
  category: 'fun',
  description: { id: 'Cek persen ngantuk seseorang sekarang, buat hiburan saja', en: 'Check how sleepy someone is right now, just for fun' },
  usage: '.cekngantuk <nama> atau kosongkan untuk dirimu',
  example: '.cekngantuk Budi',
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
    cekngantuk: {
      title: 'Cek Ngantuk 😪',
      result: '╭─❏ 😪 「 *CEK NGANTUK* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴛɪɴɢᴋᴀᴛ ɴɢᴀɴᴛᴜᴋ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Segar bugar, mata masih full baterai~',
      mid: 'Mulai ngantuk, kopi atau tidur siang bisa menyelamatkan~',
      high: 'Ngantuk parah, mata tinggal lima watt~',
      max: 'NGANTUK MAKSIMAL! Berdiri saja bisa tidur ini mah~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekngantuk: {
      title: 'Sleepiness Check 😪',
      result: '╭─❏ 😪 「 *SLEEPINESS CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ꜱʟᴇᴇᴘɪɴᴇꜱꜱ ʟᴇᴠᴇʟ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Fresh and fit, eyes still fully charged~',
      mid: 'Getting sleepy, coffee or a nap could save the day~',
      high: 'Very sleepy, the eyes are at five watts~',
      max: 'MAXIMUM SLEEPY! Could sleep while standing~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekngantuk', expect: /ngantuk|sleepy/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:ngantuk`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekngantuk.result', {
    name: target,
    percent,
    comment: ctx.t(`cekngantuk.${band}`),
    disclaimer: ctx.t('cekngantuk.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekngantuk.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekngantuk.btnAgain'), id: '.cekngantuk' },
    ],
    textFallback: body,
  })
}
