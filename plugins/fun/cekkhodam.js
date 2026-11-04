import { KHODAMS } from '../../src/data/fun.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekkhodam',
  alias: ['khodam'],
  category: 'fun',
  description: { id: 'Cek khodam penjagamu untuk hiburan, hasil tetap untuk nama yang sama', en: 'Check your guardian khodam for fun, same name always gives the same result' },
  usage: '.cekkhodam [nama]',
  example: '.cekkhodam Budi',
  cooldown: 3,
}

// Deterministik: hash nama yang sama selalu memilih khodam yang sama.
export function khodamFor(name) {
  const s = String(name ?? '').toLowerCase().trim()
  let hash = 2166136261
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return KHODAMS[Math.abs(hash) % KHODAMS.length]
}

export const i18n = {
  id: {
    cekkhodam: {
      result: '👻 CEK KHODAM 👻\n\nKhodam penjaga {name} adalah...\n\n✨ {khodam} ✨\nSifatnya: {trait}\n\nJaga dia baik-baik yaa, jangan lupa kasih gorengan sesekali~ {mood}\n\n{disclaimer}',
      disclaimer: 'Catatan: ini cuma permainan hiburan dari KANA yaa, bukan beneran ada khodamnya. Jangan dianggap serius~',
      againBtn: '👻 Cek Lagi',
      jodohBtn: '💕 Cek Jodoh',
      footer: 'Cek-cek hiburan KANA',
    },
  },
  en: {
    cekkhodam: {
      result: '👻 KHODAM CHECK 👻\n\nThe guardian khodam of {name} is...\n\n✨ {khodam} ✨\nTrait: {trait}\n\nTake good care of them, and offer fried snacks once in a while~ {mood}\n\n{disclaimer}',
      disclaimer: 'Note: this is just a fun game from KANA, there is no real khodam. Do not take it seriously~',
      againBtn: '👻 Check Again',
      jodohBtn: '💕 Love Check',
      footer: 'KANA fun checks',
    },
  },
}

export const test = { input: '.cekkhodam Budi', expect: /khodam/i }

export async function handler(ctx) {
  const name = (ctx.text || '').trim() || ctx.pushName || ctx.senderDigits
  const khodam = khodamFor(name)
  const body = ctx.t('cekkhodam.result', {
    name,
    khodam: khodam.name[ctx.lang] ?? khodam.name.id,
    trait: khodam.trait[ctx.lang] ?? khodam.trait.id,
    mood: ctx.say('senang'),
    disclaimer: ctx.t('cekkhodam.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('cekkhodam.footer'),
    replies: [
      { text: ctx.t('cekkhodam.againBtn'), id: '.cekkhodam' },
      { text: ctx.t('cekkhodam.jodohBtn'), id: '.cekjodoh' },
    ],
    textFallback: body,
  })
}
