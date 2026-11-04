import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekimut',
  alias: ['imut'],
  category: 'fun',
  description: { id: 'Cek persen keimutan seseorang dari namanya, buat hiburan', en: 'Check how cute someone is from their name, just for fun' },
  usage: '.cekimut <nama> atau kosongkan untuk dirimu',
  example: '.cekimut Budi',
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
    cekimut: {
      title: 'Cek Keimutan 🧸',
      result: '╭─❏ 🧸 「 *CEK KEIMUTAN* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴛɪɴɢᴋᴀᴛ ᴋᴇɪᴍᴜᴛᴀɴ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Imutnya hemat, muncul cuma ke orang tertentu~',
      mid: 'Imutnya cukup buat bikin orang gemas sesekali~',
      high: 'Imut banget! Senyumnya saja bisa bikin hati meleleh~',
      max: 'IMUT MAKSIMAL! Sudah level maskot yang wajib dilindungi~',
      disclaimer: 'Ini cuma hiburan yaa, persennya ramalan iseng KANA dari nama, bukan ukuran beneran~',
      btnAgain: 'Cek Lagi',
    },
  },
  en: {
    cekimut: {
      title: 'Cuteness Check 🧸',
      result: '╭─❏ 🧸 「 *CUTENESS CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴄᴜᴛᴇɴᴇꜱꜱ ʟᴇᴠᴇʟ ᴏꜰ: *{percent}%*\n┊ {comment}\n╰━━━━━━━\n{disclaimer}',
      low: 'Cuteness on budget, shows up only for certain people~',
      mid: 'Cute enough to make people squeal sometimes~',
      high: 'So cute! The smile alone melts hearts~',
      max: 'MAXIMUM CUTE! Mascot level that must be protected~',
      disclaimer: 'Just for fun, the percent is KANA playful name reading, not a real measure~',
      btnAgain: 'Check Again',
    },
  },
}

export const test = { input: '.cekimut', expect: /keimutan|cuteness/i }

export async function handler(ctx) {
  const target = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const percent = hashPercent(`${target.toLowerCase()}:imut`)
  const band = percent < 30 ? 'low' : percent < 60 ? 'mid' : percent < 85 ? 'high' : 'max'
  const body = ctx.t('cekimut.result', {
    name: target,
    percent,
    comment: ctx.t(`cekimut.${band}`),
    disclaimer: ctx.t('cekimut.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekimut.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekimut.btnAgain'), id: '.cekimut' },
    ],
    textFallback: body,
  })
}
