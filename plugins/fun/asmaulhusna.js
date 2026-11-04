import { ASMAUL_HUSNA } from '../../src/data/religi.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'asmaulhusna',
  alias: ['asmaul', 'husna'],
  category: 'fun',
  description: { id: 'Asmaul Husna: 99 nama Allah beserta artinya, acak, per nomor, atau daftar penuh', en: 'Asmaul Husna: the 99 names of Allah with meanings, random, by number, or full list' },
  usage: '.asmaulhusna [nomor 1-99 | list]',
  example: '.asmaulhusna 1',
  cooldown: 3,
}

export const i18n = {
  id: {
    asmaulhusna: {
      title: 'Asmaul Husna',
      body: '🕌 ASMAUL HUSNA\n\n{no}. {latin}\nArtinya: {arti}\n\nSemoga menambah ketenangan hati yaa~ {mood}',
      listTitle: '🕌 DAFTAR ASMAUL HUSNA (99)\n',
      listHint: '\n\nPakai .asmaulhusna <nomor> untuk melihat arti satu nama yaa~',
      notFound: 'Nomornya harus 1 sampai 99 yaa~ Contoh: .asmaulhusna 1',
      randomBtn: '🎲 Acak Lagi',
      listBtn: '📜 Daftar 99',
      ayatBtn: '📖 Ayat Pilihan',
    },
  },
  en: {
    asmaulhusna: {
      title: 'Asmaul Husna',
      body: '🕌 ASMAUL HUSNA\n\n{no}. {latin}\nMeaning: {arti}\n\nMay it bring peace to your heart~ {mood}',
      listTitle: '🕌 LIST OF ASMAUL HUSNA (99)\n',
      listHint: '\n\nUse .asmaulhusna <number> to see one name meaning~',
      notFound: 'The number must be 1 to 99~ Example: .asmaulhusna 1',
      randomBtn: '🎲 Random Again',
      listBtn: '📜 List of 99',
      ayatBtn: '📖 Selected Verse',
    },
  },
}

export const test = { input: '.asmaulhusna 1', expect: /ar-rahman/i }

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const replies = [
    { text: ctx.t('asmaulhusna.randomBtn'), id: '.asmaulhusna' },
    { text: ctx.t('asmaulhusna.listBtn'), id: '.asmaulhusna list' },
    { text: ctx.t('asmaulhusna.ayatBtn'), id: '.ayat' },
  ]
  if (arg === 'list' || arg === 'daftar') {
    const lines = ASMAUL_HUSNA.map((x) => `${x.no}. ${x.latin}`)
    const body = ctx.t('asmaulhusna.listTitle') + lines.join('\n') + ctx.t('asmaulhusna.listHint')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('asmaulhusna.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }
  let item
  if (/^\d+$/.test(arg)) {
    item = ASMAUL_HUSNA[Number(arg) - 1]
    if (!item) {
      const body = ctx.t('asmaulhusna.notFound')
      return sendButtons(ctx.sock, ctx.chat, {
        title: ctx.t('asmaulhusna.title'),
        body,
        footer: ctx.t('menu.footer'),
        replies,
        textFallback: body,
      })
    }
  } else {
    item = ASMAUL_HUSNA[Math.floor(Math.random() * ASMAUL_HUSNA.length)]
  }
  const body = ctx.t('asmaulhusna.body', {
    no: item.no,
    latin: item.latin,
    arti: item.arti,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('asmaulhusna.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
