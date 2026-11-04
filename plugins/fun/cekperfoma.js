import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekperfoma',
  alias: ['cekperforma'],
  category: 'fun',
  description: { id: 'Cek persen perfoma kamu hari ini, stabil sepanjang hari', en: 'Check your performance percentage today, stable all day' },
  usage: '.cekperfoma',
  example: '.cekperfoma',
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

export function wibDateString(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export const i18n = {
  id: {
    cekperfoma: {
      title: 'Cek Perfoma',
      body: '🚀 CEK PERFOMA\n\nPerfomamu hari ini: *{percent}%*\n\n{comment} {mood}',
      low: ['Hari ini mesinmu lagi mode hemat daya. Istirahat yang cukup yaa.', 'Pelan-pelan saja, yang penting tetap jalan.'],
      mid: ['Perfoma standar, cukup buat menyelesaikan hari.', 'Lumayan stabil, tinggal tambah sedikit bensin semangat.'],
      high: ['Mesinmu lagi panas dan efisien, gas terus!', 'Hari ini kamu tajam, manfaatkan momentum ini.'],
      max: ['PERFOMA PUNCAK! Hari ini kamu tidak terbendung.', 'Seratus persen, semua sistem menyala sempurna.'],
      btnAgain: '🚀 Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    cekperfoma: {
      title: 'Performance Check',
      body: '🚀 PERFORMANCE CHECK\n\nYour performance today: *{percent}%*\n\n{comment} {mood}',
      low: ['Your engine is on power saving mode today. Get enough rest.', 'Take it slow, what matters is you keep moving.'],
      mid: ['Standard performance, enough to finish the day.', 'Fairly stable, just add a little fuel of spirit.'],
      high: ['Your engine is hot and efficient, keep pushing!', 'You are sharp today, use this momentum.'],
      max: ['PEAK PERFORMANCE! Nothing can stop you today.', 'One hundred percent, all systems firing perfectly.'],
      btnAgain: '🚀 Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.cekperfoma', expect: /perfoma|performance/i }

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length]

export async function handler(ctx) {
  const percent = hashPercent(`${ctx.senderDigits}:performa:${wibDateString()}`)
  const band = percent <= 30 ? 'low' : percent <= 65 ? 'mid' : percent <= 90 ? 'high' : 'max'
  const pool = i18n[ctx.lang]?.cekperfoma?.[band] ?? i18n.id.cekperfoma[band]
  const body = ctx.t('cekperfoma.body', { percent, comment: pick(pool, percent), mood: ctx.say(percent > 65 ? 'senang' : 'sukses') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekperfoma.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekperfoma.btnAgain'), id: '.cekperfoma' },
    ],
    textFallback: body,
  })
}
