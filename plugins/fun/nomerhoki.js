import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'nomerhoki',
  alias: ['nomorhoki', 'angkaberkah'],
  category: 'fun',
  description: { id: 'Angka hoki deterministik dari nama dan tanggal lahirmu (hiburan)', en: 'Deterministic lucky numbers from your name and birth date (fun)' },
  usage: '.nomerhoki <nama> [DD-MM-YYYY]',
  example: '.nomerhoki Sinta 17-08-2000',
  cooldown: 3,
}

export function hashNum(seed) {
  let h = 2166136261
  const s = String(seed)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const i18n = {
  id: {
    nomerhoki: {
      title: 'Nomer Hoki',
      ask: 'Tulis namamu yaa, boleh sekalian tanggal lahir: .nomerhoki Sinta 17-08-2000 {mood}',
      body: '🍀 NOMER HOKI {name}\n\nAngka utama: *{main}*\nAngka pendamping: {extra}\nHari baik versimu: *{day}*\nWarna hoki: *{color}*\n\nSimpan baik-baik, semoga harimu seberuntung angka-angkamu~ {mood}',
      days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      colors: ['Merah', 'Oranye', 'Kuning', 'Hijau', 'Biru', 'Ungu', 'Fuchsia', 'Emas', 'Perak', 'Putih'],
      btnAgain: '🍀 Cek Lagi',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    nomerhoki: {
      title: 'Lucky Numbers',
      ask: 'Write your name, birth date is welcome too: .nomerhoki Sinta 17-08-2000 {mood}',
      body: '🍀 LUCKY NUMBERS FOR {name}\n\nMain number: *{main}*\nCompanion numbers: {extra}\nYour lucky day: *{day}*\nLucky color: *{color}*\n\nKeep them well, may your day be as lucky as your numbers~ {mood}',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      colors: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Fuchsia', 'Gold', 'Silver', 'White'],
      btnAgain: '🍀 Check Again',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.nomerhoki Sinta 17-08-2000', expect: /hoki|lucky/i }

export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  if (!raw) return ctx.reply(ctx.t('nomerhoki.ask', { mood: ctx.say('mikir') }))
  const dateMatch = raw.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/)
  const name = (dateMatch ? raw.replace(dateMatch[0], '') : raw).trim().slice(0, 40) || 'Kamu'
  const seed = `${name.toLowerCase()}|${dateMatch ? dateMatch[0] : ctx.senderDigits}`
  const packs = i18n[ctx.lang]?.nomerhoki ?? i18n.id.nomerhoki
  const main = hashNum(`${seed}:main`) % 100
  const extraSet = new Set()
  let i = 0
  while (extraSet.size < 3) {
    const n = hashNum(`${seed}:extra:${i}`) % 100
    if (n !== main) extraSet.add(n)
    i += 1
  }
  const body = ctx.t('nomerhoki.body', {
    name,
    main,
    extra: [...extraSet].join(', '),
    day: packs.days[hashNum(`${seed}:day`) % packs.days.length],
    color: packs.colors[hashNum(`${seed}:color`) % packs.colors.length],
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('nomerhoki.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('nomerhoki.btnAgain'), id: `.nomerhoki ${raw.slice(0, 60)}` },
    ],
    textFallback: body,
  })
}
