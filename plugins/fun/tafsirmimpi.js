import { TAFSIR_MIMPI } from '../../src/data/primbon.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tafsirmimpi',
  alias: ['mimpi', 'artimimpi', 'primbon', 'tafsir'],
  category: 'fun',
  description: { id: 'Tafsir arti mimpi menurut primbon populer (hiburan)', en: 'Dream meanings from popular old lore (for fun)' },
  usage: '.tafsirmimpi <kata kunci mimpi>',
  example: '.tafsirmimpi ular',
  cooldown: 3,
}

export const i18n = {
  id: {
    tafsirmimpi: {
      title: 'Tafsir Mimpi',
      body: '🌙 TAFSIR MIMPI: {key}\n\n{arti}\n\nCatatan: ini hiburan ala primbon yaa, bukan ramalan pasti. {mood}',
      notFound: 'Kata kunci "{key}" belum ada di buku primbon Kana. Coba kata lain seperti ular, terbang, gigi copot, ikan, atau hujan. Atau pencet tombol daftar di bawah yaa~ {mood}',
      listTitle: '🌙 DAFTAR KATA KUNCI MIMPI\n\n{list}\n\nPakai: .tafsirmimpi <kata kunci>',
      btnList: '🌙 Daftar Kata Kunci',
      btnMenu: 'Menu Fun',
      disclaimer: 'Tafsir mimpi primbon KANA',
    },
  },
  en: {
    tafsirmimpi: {
      title: 'Dream Meaning',
      body: '🌙 DREAM MEANING: {key}\n\n{arti}\n\nNote: this is old lore entertainment, not a certain prediction. {mood}',
      notFound: 'The keyword "{key}" is not in Kana lore book yet. Try another word like snake, flying, tooth, fish, or rain. Or tap the list button below~ {mood}',
      listTitle: '🌙 DREAM KEYWORD LIST\n\n{list}\n\nUse: .tafsirmimpi <keyword>',
      btnList: '🌙 Keyword List',
      btnMenu: 'Fun Menu',
      disclaimer: 'KANA dream lore',
    },
  },
}

export const test = { input: '.tafsirmimpi ular', expect: /tafsir mimpi|dream meaning/i }

export async function handler(ctx) {
  const key = (ctx.text || '').trim().toLowerCase()
  if (!key) {
    const list = TAFSIR_MIMPI.map((d) => d.keys[0]).join(', ')
    return ctx.reply(ctx.t('tafsirmimpi.listTitle', { list }))
  }
  const found = TAFSIR_MIMPI.find((d) => d.keys.some((k) => key.includes(k) || k.includes(key)))
  if (!found) {
    const body = ctx.t('tafsirmimpi.notFound', { key, mood: ctx.say('mikir') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('tafsirmimpi.title'),
      body,
      footer: ctx.t('tafsirmimpi.disclaimer'),
      replies: [
        { text: ctx.t('tafsirmimpi.btnList'), id: '.tafsirmimpi' },
      ],
      textFallback: body,
    })
  }
  const body = ctx.t('tafsirmimpi.body', {
    key: found.keys[0],
    arti: found.arti[ctx.lang] ?? found.arti.id,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tafsirmimpi.title'),
    body,
    footer: ctx.t('tafsirmimpi.disclaimer'),
    replies: [
      { text: ctx.t('tafsirmimpi.btnList'), id: '.tafsirmimpi' },
    ],
    textFallback: body,
  })
}
