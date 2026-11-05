import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { sendHtmlGame } from '../../src/ui/htmlgame.js'

export const config = {
  name: 'hello',
  premium: true,
  alias: [],
  category: 'main',
  description: { id: 'Kirim mini game HTML contoh', en: 'Send the sample HTML mini game' },
  usage: '.hello',
  example: '.hello',
  cooldown: 10,
}

export const i18n = {
  id: { hello: { label: '╭─❏ 🎮 「 *MINI GAME KANA* 」\n┊ Mini game contoh dari KANA. Di luar Android, game tampil sebagai label teks saja ya~\n╰━━━━━━━' } },
  en: { hello: { label: '╭─❏ 🎮 「 *KANA MINI GAME* 」\n┊ Sample mini game from KANA. Outside Android, the game shows as a text label only~\n╰━━━━━━━' } },
}

const here = dirname(fileURLToPath(import.meta.url))

export const test = { input: '.hello', expect: /mini game/i }

export async function handler(ctx) {
  await sendHtmlGame(ctx.sock, ctx.chat, join(here, '../../games/hello/index.html'), {
    title: 'KANA',
    label: ctx.t('hello.label'),
    height: 360,
  })
}
