import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'artinama',
  alias: [],
  category: 'fun',
  description: { id: 'Baca arti nama versi seru-seruan dari KANA', en: 'Read the fun version of a name meaning from KANA' },
  usage: '.artinama <nama>',
  example: '.artinama Kana',
  cooldown: 3,
}

// Hash deterministik kecil (duplikasi disengaja, sama seperti di cekmood,
// supaya plugin tetap mandiri satu file).
export function hashPercent(seed) {
  let h = 0
  const s = String(seed ?? '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 101
}

export const i18n = {
  id: {
    artinama: {
      usage: 'Tulis namanya dulu yaa, contoh: .artinama Kana~',
      title: 'Arti Nama 🔤',
      result: 'Nama "{name}" versi KANA artinya: pembawa {trait1}, penjaga {trait2}, dan penebar {trait3}!\n\n{disclaimer}',
      disclaimer: 'Ini arti nama versi hiburan buatan KANA yaa, bukan arti bahasa resmi. Yang penting orangnya baik~ (≧▽≦)',
      btnAgain: 'Nama Lain',
      btnMenu: 'Menu Fun',
      traits: [
        'semangat pagi',
        'tawa renyah',
        'ide-ide liar',
        'ketenangan',
        'keberanian kecil',
        'cerita seru',
        'harapan baru',
        'energi positif',
        'kejutan manis',
        'mimpi besar',
        'kehangatan',
        'rasa penasaran',
      ],
    },
  },
  en: {
    artinama: {
      usage: 'Write a name first, example: .artinama Kana~',
      title: 'Name Meaning 🔤',
      result: 'The name "{name}", KANA version, means: bringer of {trait1}, keeper of {trait2}, and spreader of {trait3}!\n\n{disclaimer}',
      disclaimer: 'This is a fun name meaning made by KANA, not an official language meaning. What matters is the person is kind~ (≧▽≦)',
      btnAgain: 'Another Name',
      btnMenu: 'Fun Menu',
      traits: [
        'morning spirit',
        'bright laughter',
        'wild ideas',
        'calmness',
        'small bravery',
        'fun stories',
        'new hope',
        'positive energy',
        'sweet surprises',
        'big dreams',
        'warmth',
        'curiosity',
      ],
    },
  },
}

export async function handler(ctx) {
  const name = ctx.text.trim()
  if (!name) return ctx.reply(ctx.t('artinama.usage'))
  const pool = i18n[ctx.lang]?.artinama?.traits ?? i18n.id.artinama.traits
  const base = hashPercent(name.toLowerCase())
  const pick = (offset) => pool[(base + offset * 5) % pool.length]
  const body = ctx.t('artinama.result', {
    name,
    trait1: pick(0),
    trait2: pick(1),
    trait3: pick(2),
    disclaimer: ctx.t('artinama.disclaimer'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('artinama.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('artinama.btnAgain'), id: '.artinama Kana' },
      { text: ctx.t('artinama.btnMenu'), id: '.menu fun' },
    ],
    textFallback: body,
  })
}
