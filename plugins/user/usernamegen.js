import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'usernamegen',
  alias: ['genusername', 'buatusername'],
  category: 'user',
  description: { id: 'Buat saran username acak dari kata kunci pilihanmu', en: 'Generate random username suggestions from your keyword' },
  usage: '.usernamegen [kata kunci]',
  example: '.usernamegen kana',
  cooldown: 3,
}

const PREFIX = ['hey', 'its', 'the', 'mr', 'ms', 'x', 'im', 'real', 'just', 'not']
const SUFFIX = ['_dev', 'x', 'z', '_id', 'kun', 'chan', 'sama', '_san', 'byte', 'labs', 'hq', 'verse']
const SEPARATORS = ['', '_', '.', '_x', '__']

export const i18n = {
  id: {
    usernamegen: {
      title: 'Generator Username',
      ask: '╭─❏ ✨ 「 *GENERATOR USERNAME* 」\n┊ Kasih kata kuncinya dulu yaa, contoh: *.usernamegen kana*\n╰━━━━━━━ {mood}',
      body: '╭─❏ ✨ 「 *SARAN USERNAME* 」\n┊ ᴋᴀᴛᴀ ᴋᴜɴᴄɪ: *"{keyword}"*\n{list}\n╰━━━━━━━\nPencet tombol buat variasi lain yaa~ {mood}',
      btnAgain: '✨ Buat Lagi',
    },
  },
  en: {
    usernamegen: {
      title: 'Username Generator',
      ask: '╭─❏ ✨ 「 *USERNAME GENERATOR* 」\n┊ Give me a keyword first, example: *.usernamegen kana*\n╰━━━━━━━ {mood}',
      body: '╭─❏ ✨ 「 *USERNAME IDEAS* 」\n┊ ᴋᴇʏᴡᴏʀᴅ: *"{keyword}"*\n{list}\n╰━━━━━━━\nTap the button for more variations~ {mood}',
      btnAgain: '✨ Generate Again',
    },
  },
}

export const test = { input: '.usernamegen kana', expect: /username/i }

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function generateUsernames(keyword) {
  const base = keyword.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14) || 'kana'
  const out = new Set()
  while (out.size < 5) {
    const style = Math.floor(Math.random() * 5)
    if (style === 0) out.add(`${pick(PREFIX)}${pick(SEPARATORS)}${base}`)
    else if (style === 1) out.add(`${base}${pick(SUFFIX)}`)
    else if (style === 2) out.add(`${base}${pick(SEPARATORS)}${Math.floor(Math.random() * 999)}`)
    else if (style === 3) out.add(`${base}${base.slice(0, 3)}`)
    else out.add(`x${pick(SEPARATORS)}${base}${pick(SEPARATORS)}x`)
  }
  return [...out]
}

export async function handler(ctx) {
  const keyword = (ctx.text || '').trim()
  if (!keyword) return ctx.reply(ctx.t('usernamegen.ask', { mood: ctx.say('mikir') }))
  const list = generateUsernames(keyword).map((u) => `┊ • ${u}`).join('\n')
  const body = ctx.t('usernamegen.body', { keyword, list, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('usernamegen.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('usernamegen.btnAgain'), id: `.usernamegen ${keyword.slice(0, 30)}` }],
    textFallback: body,
  })
}
