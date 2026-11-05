import { sendButtons } from '../../src/ui/buttons.js'
import {
  getRandomNames,
  normalizeCount,
  normalizeGender,
  parseCategories,
} from '../../src/scrapers/random/randomname.js'

// Randomname: nama asli hasil scrape BehindTheName, format argumen
// pipa ala Elaina: gender|jumlah|surname|kategori. Dulu plugin ini
// klon berisi fakta acak yang tidak ada hubungannya dengan nama.
export const config = {
  name: 'randomname',
  alias: [],
  category: 'random',
  description: { id: 'Nama acak asli dari BehindTheName', en: 'Real random names from BehindTheName' },
  usage: '.randomname <gender|jumlah|surname|kategori>',
  example: '.randomname cowok|3|random|eng,spa',
  cooldown: 5,
}

export const i18n = {
  id: {
    randomname: {
      title: 'Nama Acak',
      usage: '╭─❏ ✨ 「 *NAMA ACAK* 」\n┊ ꜰᴏʀᴍᴀᴛ: *.randomname gender|jumlah|surname|kategori*\n┊ ɢᴇɴᴅᴇʀ: cowok, cewek, bebas\n┊ ᴊᴜᴍʟᴀʜ: 1 sampai 4 kata\n┊ ꜱᴜʀɴᴀᴍᴇ: random, teks bebas, atau kosongkan\n┊ ᴋᴀᴛᴇɢᴏʀɪ: kode seperti eng, spa, jap, ind (pisah koma)\n┊ ᴄᴏɴᴛᴏʜ: *.randomname cowok|3|random|eng,spa*\n╰━━━━━━━',
      result: '╭─❏ ✨ 「 *NAMA ACAK* 」\n┊ ɢᴇɴᴅᴇʀ: *{genderLabel}*\n┊ ᴊᴜᴍʟᴀʜ ᴋᴀᴛᴀ: *{number}*\n┊ ꜱᴜʀɴᴀᴍᴇ: *{surnameLabel}*\n┊ ᴋᴀᴛᴇɢᴏʀɪ: *{categoryLabel}*\n┊\n┊ *{name}*\n┊\n┊ Sumber: BehindTheName\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *NAMA ACAK GAGAL* 」\n┊ Mouu, sumber namanya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      genderM: 'Cowok',
      genderF: 'Cewek',
      genderBoth: 'Bebas',
      surnameRandom: 'Acak',
      surnameNone: 'Tidak ada',
      categoryAll: 'Semua',
      btnAgain: 'Nama Lain',
    },
  },
  en: {
    randomname: {
      title: 'Random Name',
      usage: '╭─❏ ✨ 「 *RANDOM NAME* 」\n┊ ꜰᴏʀᴍᴀᴛ: *.randomname gender|count|surname|category*\n┊ ɢᴇɴᴅᴇʀ: male, female, any\n┊ ᴄᴏᴜɴᴛ: 1 to 4 words\n┊ ꜱᴜʀɴᴀᴍᴇ: random, free text, or leave empty\n┊ ᴄᴀᴛᴇɢᴏʀʏ: codes like eng, spa, jap, ind (comma separated)\n┊ ᴇxᴀᴍᴘʟᴇ: *.randomname male|3|random|eng,spa*\n╰━━━━━━━',
      result: '╭─❏ ✨ 「 *RANDOM NAME* 」\n┊ ɢᴇɴᴅᴇʀ: *{genderLabel}*\n┊ ᴡᴏʀᴅ ᴄᴏᴜɴᴛ: *{number}*\n┊ ꜱᴜʀɴᴀᴍᴇ: *{surnameLabel}*\n┊ ᴄᴀᴛᴇɢᴏʀʏ: *{categoryLabel}*\n┊\n┊ *{name}*\n┊\n┊ Source: BehindTheName\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *RANDOM NAME FAILED* 」\n┊ Mouu, the name source cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      genderM: 'Male',
      genderF: 'Female',
      genderBoth: 'Any',
      surnameRandom: 'Random',
      surnameNone: 'None',
      categoryAll: 'All',
      btnAgain: 'Another Name',
    },
  },
}

export const test = { input: '.randomname cowok|2||eng', expect: /nama acak|random name/i }

// Urai teks pipa "gender|jumlah|surname|kategori" ala Elaina.
export function parseRandomNameArgs(text) {
  const raw = String(text || '').trim()
  if (!raw) return null
  const [genderRaw = '', countRaw = '', surnameRaw = '', categoryRaw = ''] = raw.split('|').map((v) => v.trim())
  let surnameType = 'none'
  let customSurname = ''
  if (surnameRaw) {
    if (surnameRaw.toLowerCase() === 'random') surnameType = 'random'
    else {
      surnameType = 'custom'
      customSurname = surnameRaw.slice(0, 40)
    }
  }
  return {
    gender: normalizeGender(genderRaw),
    number: normalizeCount(countRaw),
    surnameType,
    customSurname,
    usage: parseCategories(categoryRaw),
  }
}

export function formatRandomName(t, input, names) {
  const genderLabel = t(input.gender === 'm' ? 'randomname.genderM' : input.gender === 'f' ? 'randomname.genderF' : 'randomname.genderBoth')
  const surnameLabel =
    input.surnameType === 'random' ? t('randomname.surnameRandom') : input.customSurname || t('randomname.surnameNone')
  const categoryLabel = input.usage.length ? input.usage.join(', ') : t('randomname.categoryAll')
  return t('randomname.result', {
    genderLabel,
    number: input.number,
    surnameLabel,
    categoryLabel,
    name: names.join(' '),
  })
}

export async function handler(ctx, { fetchNames = getRandomNames } = {}) {
  const input = parseRandomNameArgs(ctx.text || '')
  if (!input) return ctx.reply(ctx.t('randomname.usage'))
  let names
  try {
    names = await fetchNames(input)
  } catch (err) {
    return ctx.reply(ctx.t('randomname.fail', { message: err.message }))
  }
  const body = formatRandomName(ctx.t, input, names)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('randomname.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('randomname.btnAgain'), id: `.randomname ${ctx.text.trim().slice(0, 60)}` }],
    textFallback: body,
  })
}
