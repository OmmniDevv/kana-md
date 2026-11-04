import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'soulmatch',
  alias: ['kecocokanjiwa'],
  category: 'fun',
  description: { id: 'Cek kecocokan jiwa dua nama: hati, pikiran, dan nasib (hiburan)', en: 'Check the soul match of two names: heart, mind, and fate (fun)' },
  usage: '.soulmatch <nama1> & <nama2>',
  example: '.soulmatch Raka & Sinta',
  cooldown: 3,
}

export function hashPercent(seed) {
  let h = 2166136261
  const s = String(seed)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 101 + 101) % 101
}

export const i18n = {
  id: {
    soulmatch: {
      title: 'Soulmatch',
      ask: 'Tulis dua nama dipisah tanda &, contohnya: .soulmatch Raka & Sinta {mood}',
      body: '💞 SOULMATCH\n\n{a} x {b}\nKecocokan hati: *{hati}%*\nKecocokan pikiran: *{pikiran}%*\nKecocokan nasib: *{nasib}%*\nRata-rata jiwa: *{total}%*\n\n{verdict} {mood}',
      vLow: 'Jiwa kalian jalan di rel yang berbeda, tapi bukan berarti mustahil.',
      vMid: 'Ada percikan yang bisa tumbuh kalau sama-sama mau merawat.',
      vHigh: 'Kuat sekali ikatan jiwanya, seperti sudah kenal dari lama.',
      vMax: 'Soulmate level maksimal. Semesta pun ikut tersenyum.',
      btnAgain: '💞 Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    soulmatch: {
      title: 'Soulmatch',
      ask: 'Write two names separated by &, for example: .soulmatch Raka & Sinta {mood}',
      body: '💞 SOULMATCH\n\n{a} x {b}\nHeart match: *{hati}%*\nMind match: *{pikiran}%*\nFate match: *{nasib}%*\nSoul average: *{total}%*\n\n{verdict} {mood}',
      vLow: 'Your souls run on different tracks, but that does not mean impossible.',
      vMid: 'There is a spark that can grow if both of you nurture it.',
      vHigh: 'A very strong soul bond, like you have known each other forever.',
      vMax: 'Maximum soulmate level. Even the universe is smiling.',
      btnAgain: '💞 Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.soulmatch Raka & Sinta', expect: /soulmatch/i }

function parsePair(text) {
  const raw = (text || '').trim()
  if (!raw) return null
  const parts = raw.includes('&') ? raw.split('&') : raw.split(/\s+(?:dan|x|with)\s+/i)
  if (parts.length >= 2) return [parts[0].trim().slice(0, 40), parts[1].trim().slice(0, 40)]
  const words = raw.split(/\s+/)
  if (words.length >= 2) return [words[0], words.slice(1).join(' ').slice(0, 40)]
  return null
}

export async function handler(ctx) {
  const pair = parsePair(ctx.text)
  if (!pair || !pair[0] || !pair[1]) return ctx.reply(ctx.t('soulmatch.ask', { mood: ctx.say('mikir') }))
  const [a, b] = pair
  const seed = [a.toLowerCase(), b.toLowerCase()].sort().join('|')
  const hati = hashPercent(`soul:hati:${seed}`)
  const pikiran = hashPercent(`soul:pikiran:${seed}`)
  const nasib = hashPercent(`soul:nasib:${seed}`)
  const total = Math.round((hati + pikiran + nasib) / 3)
  const verdict = total <= 35 ? ctx.t('soulmatch.vLow') : total <= 65 ? ctx.t('soulmatch.vMid') : total <= 90 ? ctx.t('soulmatch.vHigh') : ctx.t('soulmatch.vMax')
  const body = ctx.t('soulmatch.body', { a, b, hati, pikiran, nasib, total, verdict, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('soulmatch.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('soulmatch.btnAgain'), id: `.soulmatch ${a} & ${b}` },
    ],
    textFallback: body,
  })
}
