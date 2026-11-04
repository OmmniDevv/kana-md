import { hashPercent } from './cekmood.js'
import { sendButtons } from '../../src/ui/buttons.js'

// Ramalan kecocokan dua nama: deterministik dari gabungan namanya.
export function nameMatch(a, b) {
  const key = [a.toLowerCase().trim(), b.toLowerCase().trim()].sort().join('|')
  return hashPercent(key)
}

export const config = {
  name: 'kecocokannama',
  alias: ['ramalanjodoh', 'kecocokannamapasangan'],
  category: 'fun',
  description: { id: 'Cek persen kecocokan dua nama', en: 'Check the match percentage of two names' },
  usage: '.kecocokannama <nama1> & <nama2>',
  example: '.kecocokannama Budi & Sari',
  cooldown: 3,
}

export const i18n = {
  id: {
    kecocokannama: {
      title: 'Kecocokan Nama',
      hint: 'Tulis dua namanya dipisah tanda & yaa~ Contoh: .kecocokannama Budi & Sari',
      body: '💘 KECOCOKAN NAMA\n\n{a} x {b}: {pct}%\n\n{verdict}',
      high: 'Wahh cocok banget! Chemistry-nya kuat nih~',
      mid: 'Lumayan cocok, tinggal diasah komunikasinya~',
      low: 'Hmm, perlu usaha ekstra nih. Namanya juga ramalan~',
      retryBtn: '💘 Cek Lagi (.kecocokannama {a} & {b})',
    },
  },
  en: {
    kecocokannama: {
      title: 'Name Match',
      hint: 'Write two names separated by & please~ Example: .kecocokannama Budi & Sari',
      body: '💘 NAME MATCH\n\n{a} x {b}: {pct}%\n\n{verdict}',
      high: 'Wow, a great match! Strong chemistry~',
      mid: 'Pretty compatible, just needs better communication~',
      low: 'Hmm, needs extra effort. It is just a fortune game anyway~',
      retryBtn: '💘 Check Again (.kecocokannama {a} & {b})',
    },
  },
}

export const test = { input: '.kecocokannama', expect: /nama|name/i }

export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  const sep = raw.indexOf('&')
  if (sep < 1) return ctx.reply(ctx.t('kecocokannama.hint'))
  const a = raw.slice(0, sep).trim().slice(0, 30)
  const b = raw.slice(sep + 1).trim().slice(0, 30)
  if (!a || !b) return ctx.reply(ctx.t('kecocokannama.hint'))
  const pct = nameMatch(a, b)
  const verdict = pct >= 75 ? ctx.t('kecocokannama.high') : pct >= 45 ? ctx.t('kecocokannama.mid') : ctx.t('kecocokannama.low')
  const body = ctx.t('kecocokannama.body', { a, b, pct, verdict })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('kecocokannama.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('kecocokannama.retryBtn', { a, b }), id: `.kecocokannama ${a} & ${b}` }],
    textFallback: body,
  })
}
