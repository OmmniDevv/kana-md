import { KISAH_NABI } from '../../src/data/religi.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'kisahnabi',
  alias: ['nabi'],
  category: 'fun',
  description: { id: 'Kisah ringkas 25 nabi: daftar, acak, atau per nama nabi', en: 'Short stories of the 25 prophets: list, random, or by prophet name' },
  usage: '.kisahnabi [nama nabi | acak]',
  example: '.kisahnabi yusuf',
  cooldown: 3,
}

export const i18n = {
  id: {
    kisahnabi: {
      title: 'Kisah Nabi',
      story: '╭─❏ 📖 「 *KISAH NABI {nama}* 」\n┊ {kisah}\n┊\n┊ Semoga bisa diambil hikmahnya yaa~\n╰━━━━━━━ {mood}',
      listTitle: '╭─❏ 📖 「 *DAFTAR 25 NABI* 」\n',
      listHint: '\n╰━━━━━━━\nPakai *.kisahnabi <nama>* untuk membaca kisahnya, contoh *.kisahnabi yusuf*~',
      notFound: '╭─❏ 🔍 「 *NABI TIDAK KETEMU* 」\n┊ KANA tidak menemukan nabi bernama *"{q}"* di daftar 25 nabi.\n┊ Coba *.kisahnabi* untuk lihat daftarnya yaa~\n╰━━━━━━━',
      randomBtn: '🎲 Kisah Acak',
      listBtn: '📜 Daftar Nabi',
      asmaBtn: '🕌 Asmaul Husna',
    },
  },
  en: {
    kisahnabi: {
      title: 'Prophet Stories',
      story: '╭─❏ 📖 「 *STORY OF PROPHET {nama}* 」\n┊ {kisah}\n┊\n┊ May you take wisdom from it~\n╰━━━━━━━ {mood}',
      listTitle: '╭─❏ 📖 「 *LIST OF 25 PROPHETS* 」\n',
      listHint: '\n╰━━━━━━━\nUse *.kisahnabi <name>* to read the story, for example *.kisahnabi yusuf*~',
      notFound: '╭─❏ 🔍 「 *PROPHET NOT FOUND* 」\n┊ KANA could not find a prophet named *"{q}"* in the 25 prophets list.\n┊ Try *.kisahnabi* to see the list~\n╰━━━━━━━',
      randomBtn: '🎲 Random Story',
      listBtn: '📜 Prophet List',
      asmaBtn: '🕌 Asmaul Husna',
    },
  },
}

export const test = { input: '.kisahnabi yusuf', expect: /yusuf/i }

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const replies = [
    { text: ctx.t('kisahnabi.randomBtn'), id: '.kisahnabi acak' },
    { text: ctx.t('kisahnabi.listBtn'), id: '.kisahnabi' },
    { text: ctx.t('kisahnabi.asmaBtn'), id: '.asmaulhusna' },
  ]
  if (!arg) {
    const lines = KISAH_NABI.map((x, i) => `┊ ${i + 1}. Nabi ${x.nama}`)
    const body = ctx.t('kisahnabi.listTitle') + lines.join('\n') + ctx.t('kisahnabi.listHint')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('kisahnabi.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }
  let item
  if (arg === 'acak' || arg === 'random') {
    item = KISAH_NABI[Math.floor(Math.random() * KISAH_NABI.length)]
  } else if (/^\d+$/.test(arg)) {
    item = KISAH_NABI[Number(arg) - 1]
  } else {
    item = KISAH_NABI.find((x) => x.nama.toLowerCase() === arg)
  }
  if (!item) {
    const body = ctx.t('kisahnabi.notFound', { q: arg })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('kisahnabi.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }
  const body = ctx.t('kisahnabi.story', {
    nama: item.nama.toUpperCase(),
    kisah: item.kisah,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kisahnabi.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
