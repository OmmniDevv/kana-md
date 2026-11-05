// Primbon Jawa lokal: hitung hari, pasaran, weton, dan neptu dari
// tanggal lahir. Acuan: 1 Januari 1970 adalah Kamis Legi; siklus
// pasaran 5 hari dan neptu memakai tabel pakem umum primbon.
export const config = {
  name: 'primbon',
  alias: ['weton', 'cekprimbon'],
  category: 'tools',
  description: { id: 'Hitung weton, pasaran, dan neptu dari tanggal lahir', en: 'Calculate Javanese weton, pasaran, and neptu from a birth date' },
  usage: '.primbon <dd-mm-yyyy>',
  example: '.primbon 17-08-1945',
  cooldown: 3,
}

export const i18n = {
  id: {
    primbon: {
      needDate: '╭─❏ 🗓️ 「 *FORMAT TANGGAL LAHIR* 」\n┊ ᴄᴏɴᴛᴏʜ: *.primbon 17-08-1945*\n┊ ꜰᴏʀᴍᴀᴛ: ʜᴀʀɪ ʙᴜʟᴀɴ ᴛᴀʜᴜɴ ᴘᴀᴋᴀɪ ᴘᴇᴍɪꜱᴀʜ ɢᴀʀɪꜱ.\n╰━━━━━━━',
      out: '╭─❏ 🗓️ 「 *PRIMBON JAWA* 」\n┊ ᴛᴀɴɢɢᴀʟ: *{date}*\n┊ ʜᴀʀɪ: *{day}* (neptu {dayNeptu})\n┊ ᴘᴀꜱᴀʀᴀɴ: *{pasaran}* (neptu {pasaranNeptu})\n┊ ᴡᴇᴛᴏɴ: *{day} {pasaran}*\n┊ ᴛᴏᴛᴀʟ ɴᴇᴘᴛᴜ: *{neptu}*\n┊ ᴡᴀᴛᴀᴋ ᴜᴍᴜᴍ: {trait}\n╰━━━━━━━',
    },
  },
  en: {
    primbon: {
      needDate: '╭─❏ 🗓️ 「 *BIRTH DATE FORMAT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.primbon 17-08-1945*\n┊ ꜰᴏʀᴍᴀᴛ: ᴅᴀʏ ᴍᴏɴᴛʜ ʏᴇᴀʀ ꜱᴇᴘᴀʀᴀᴛᴇᴅ ʙʏ ᴅᴀꜱʜᴇꜱ.\n╰━━━━━━━',
      out: '╭─❏ 🗓️ 「 *JAVANESE PRIMBON* 」\n┊ ᴅᴀᴛᴇ: *{date}*\n┊ ᴅᴀʏ: *{day}* (neptu {dayNeptu})\n┊ ᴘᴀꜱᴀʀᴀɴ: *{pasaran}* (neptu {pasaranNeptu})\n┊ ᴡᴇᴛᴏɴ: *{day} {pasaran}*\n┊ ᴛᴏᴛᴀʟ ɴᴇᴘᴛᴜ: *{neptu}*\n┊ ɢᴇɴᴇʀᴀʟ ᴛʀᴀɪᴛ: {trait}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.primbon 01-01-1970', expect: /Legi/ }

const DAYS = [
  { name: 'Minggu', neptu: 5 }, { name: 'Senin', neptu: 4 }, { name: 'Selasa', neptu: 3 },
  { name: 'Rabu', neptu: 7 }, { name: 'Kamis', neptu: 8 }, { name: 'Jumat', neptu: 6 },
  { name: 'Sabtu', neptu: 9 },
]
const PASARAN = [
  { name: 'Legi', neptu: 5 }, { name: 'Pahing', neptu: 9 }, { name: 'Pon', neptu: 7 },
  { name: 'Wage', neptu: 4 }, { name: 'Kliwon', neptu: 8 },
]
const TRAITS = [
  [7, 'pendiam, tekun, dan setia pada pendirian'],
  [9, 'periang, mudah bergaul, dan pandai bicara'],
  [11, 'berjiwa pemimpin, tegas, dan bertanggung jawab'],
  [13, 'kreatif, berwawasan luas, dan suka hal baru'],
  [15, 'ambisius, pekerja keras, dan berani mengambil risiko'],
  [18, 'bijaksana, berwibawa, dan disegani banyak orang'],
]

// Hitung weton dari string tanggal dd-mm-yyyy (UTC agar stabil).
export function computeWeton(text) {
  const m = String(text || '').trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (!m) return null
  const day = Number(m[1]); const month = Number(m[2]); const year = Number(m[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime()) || date.getUTCDate() !== day || date.getUTCMonth() !== month - 1) return null
  const epoch = Date.UTC(1970, 0, 1)
  const days = Math.round((date.getTime() - epoch) / 86400000)
  const dayInfo = DAYS[date.getUTCDay()]
  const pasaranInfo = PASARAN[((days % 5) + 5) % 5]
  const neptu = dayInfo.neptu + pasaranInfo.neptu
  const trait = (TRAITS.find(([limit]) => neptu <= limit) || TRAITS[TRAITS.length - 1])[1]
  return {
    date: `${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}-${m[3]}`,
    day: dayInfo.name,
    dayNeptu: dayInfo.neptu,
    pasaran: pasaranInfo.name,
    pasaranNeptu: pasaranInfo.neptu,
    neptu,
    trait,
  }
}

export async function handler(ctx) {
  const result = computeWeton(ctx.text || '')
  if (!result) return ctx.reply(ctx.t('primbon.needDate'))
  return ctx.reply(ctx.t('primbon.out', result))
}
