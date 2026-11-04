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
      body: '╭─❏ 🌙 「 *TAFSIR MIMPI: {key}* 」\n┊ {arti}\n┊ ᴄᴀᴛᴀᴛᴀɴ: ini hiburan ala primbon yaa, bukan ramalan pasti.\n╰━━━━━━━ {mood}',
      notFound: '╭─❏ 🌙 「 *TAFSIR MIMPI* 」\n┊ Kata kunci "{key}" belum ada di buku primbon Kana. Coba kata lain seperti ular, terbang, gigi copot, ikan, atau hujan. Atau pencet tombol daftar di bawah yaa~\n╰━━━━━━━ {mood}',
      listTitle: '╭─❏ 🌙 「 *DAFTAR KATA KUNCI MIMPI* 」\n┊ {list}\n┊ ᴘᴀᴋᴀɪ: .tafsirmimpi <kata kunci>\n╰━━━━━━━',
      btnList: '🌙 Daftar Kata Kunci',
      disclaimer: 'Tafsir mimpi primbon KANA',
    },
  },
  en: {
    tafsirmimpi: {
      title: 'Dream Meaning',
      body: '╭─❏ 🌙 「 *DREAM MEANING: {key}* 」\n┊ {arti}\n┊ ɴᴏᴛᴇ: this is old lore entertainment, not a certain prediction.\n╰━━━━━━━ {mood}',
      notFound: '╭─❏ 🌙 「 *DREAM MEANING* 」\n┊ The keyword "{key}" is not in Kana lore book yet. Try another word like snake, flying, tooth, fish, or rain. Or tap the list button below~\n╰━━━━━━━ {mood}',
      listTitle: '╭─❏ 🌙 「 *DREAM KEYWORD LIST* 」\n┊ {list}\n┊ ᴜꜱᴇ: .tafsirmimpi <keyword>\n╰━━━━━━━',
      btnList: '🌙 Keyword List',
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
