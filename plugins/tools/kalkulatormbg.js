// Kalkulator dana MBG (Makan Bergizi Gratis) lokal, mengikuti niat
// perintah aslinya: harga per porsi dan pengeluaran harian nasional
// menjadi dasar hitungan porsi, biaya sekolah, dan durasi dana.
export const HARGA_PORSI = 15000
export const PENGELUARAN_PER_HARI = 319600000000
export const config = {
  name: 'kalkulatormbg',
  alias: ['hitungmbg', 'mbg'],
  category: 'tools',
  description: { id: 'Kalkulator dana MBG: porsi, biaya per sekolah, durasi dana', en: 'MBG fund calculator: portions, per-school cost, fund duration' },
  usage: '.kalkulatormbg [jumlah siswa | dana <nominal>]',
  example: '.kalkulatormbg 500',
  cooldown: 3,
}

export const i18n = {
  id: {
    kalkulatormbg: {
      needInput: '╭─❏ 🍱 「 *FORMAT MBG* 」\n┊ *.kalkulatormbg* ringkasan nasional\n┊ *.kalkulatormbg 500* biaya untuk 500 siswa\n┊ *.kalkulatormbg dana 100000000* berapa porsi dari dana itu\n╰━━━━━━━',
      summary: '╭─❏ 🍱 「 *KALKULATOR MBG* 」\n┊ ʜᴀʀɢᴀ ᴘᴇʀ ᴘᴏʀꜱɪ: *{harga}*\n┊ ᴘᴇɴɢᴇʟᴜᴀʀᴀɴ ɴᴀꜱɪᴏɴᴀʟ ᴘᴇʀ ʜᴀʀɪ: *{perhari}*\n┊ ꜱᴇᴛᴀʀᴀ: *{porsi} porsi per hari*\n╰━━━━━━━',
      school: '╭─❏ 🍱 「 *MBG {siswa} SISWA* 」\n┊ ʜᴀʀɢᴀ ᴘᴇʀ ᴘᴏʀꜱɪ: *{harga}*\n┊ ʙɪᴀʏᴀ ᴘᴇʀ ʜᴀʀɪ: *{perhari}*\n┊ ʙɪᴀʏᴀ ᴘᴇʀ ʙᴜʟᴀɴ (22 ʜᴀʀɪ ꜱᴇᴋᴏʟᴀʜ): *{perbulan}*\n┊ ʙɪᴀʏᴀ ᴘᴇʀ ᴛᴀʜᴜɴ (220 ʜᴀʀɪ): *{pertahun}*\n╰━━━━━━━',
      fund: '╭─❏ 🍱 「 *DANA MBG* 」\n┊ ᴅᴀɴᴀ: *{dana}*\n┊ ʜᴀʀɢᴀ ᴘᴇʀ ᴘᴏʀꜱɪ: *{harga}*\n┊ ᴊᴜᴍʟᴀʜ ᴘᴏʀꜱɪ: *{porsi} porsi*\n┊ ᴄᴜᴋᴜᴘ ᴜɴᴛᴜᴋ *{siswa} siswa selama 1 hari*\n╰━━━━━━━',
    },
  },
  en: {
    kalkulatormbg: {
      needInput: '╭─❏ 🍱 「 *MBG FORMAT* 」\n┊ *.kalkulatormbg* national summary\n┊ *.kalkulatormbg 500* cost for 500 students\n┊ *.kalkulatormbg dana 100000000* portions from that fund\n╰━━━━━━━',
      summary: '╭─❏ 🍱 「 *MBG CALCULATOR* 」\n┊ ᴘʀɪᴄᴇ ᴘᴇʀ ᴘᴏʀᴛɪᴏɴ: *{harga}*\n┊ ɴᴀᴛɪᴏɴᴀʟ ꜱᴘᴇɴᴅ ᴘᴇʀ ᴅᴀʏ: *{perhari}*\n┊ ᴇǫᴜᴀʟꜱ: *{porsi} portions per day*\n╰━━━━━━━',
      school: '╭─❏ 🍱 「 *MBG {siswa} STUDENTS* 」\n┊ ᴘʀɪᴄᴇ ᴘᴇʀ ᴘᴏʀᴛɪᴏɴ: *{harga}*\n┊ ᴄᴏꜱᴛ ᴘᴇʀ ᴅᴀʏ: *{perhari}*\n┊ ᴄᴏꜱᴛ ᴘᴇʀ ᴍᴏɴᴛʜ (22 school days): *{perbulan}*\n┊ ᴄᴏꜱᴛ ᴘᴇʀ ʏᴇᴀʀ (220 days): *{pertahun}*\n╰━━━━━━━',
      fund: '╭─❏ 🍱 「 *MBG FUND* 」\n┊ ꜰᴜɴᴅ: *{dana}*\n┊ ᴘʀɪᴄᴇ ᴘᴇʀ ᴘᴏʀᴛɪᴏɴ: *{harga}*\n┊ ᴘᴏʀᴛɪᴏɴꜱ: *{porsi} portions*\n┊ ᴇɴᴏᴜɢʜ ꜰᴏʀ *{siswa} students for 1 day*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.kalkulatormbg 500', expect: /7\.500\.000/ }

export function rp(n) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID')
}

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  const harga = rp(HARGA_PORSI)
  if (!text) {
    return ctx.reply(ctx.t('kalkulatormbg.summary', {
      harga,
      perhari: rp(PENGELUARAN_PER_HARI),
      porsi: Math.floor(PENGELUARAN_PER_HARI / HARGA_PORSI).toLocaleString('id-ID'),
    }))
  }
  const fundMatch = text.match(/^dana\s+([\d.,]+)$/i)
  if (fundMatch) {
    const dana = Number(fundMatch[1].replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'))
    if (!Number.isFinite(dana) || dana <= 0) return ctx.reply(ctx.t('kalkulatormbg.needInput'))
    const porsi = Math.floor(dana / HARGA_PORSI)
    return ctx.reply(ctx.t('kalkulatormbg.fund', {
      dana: rp(dana), harga, porsi: porsi.toLocaleString('id-ID'), siswa: porsi.toLocaleString('id-ID'),
    }))
  }
  const siswa = Number(text.replace(/[^\d]/g, ''))
  if (!siswa || siswa <= 0) return ctx.reply(ctx.t('kalkulatormbg.needInput'))
  const perhari = siswa * HARGA_PORSI
  return ctx.reply(ctx.t('kalkulatormbg.school', {
    siswa: siswa.toLocaleString('id-ID'),
    harga,
    perhari: rp(perhari),
    perbulan: rp(perhari * 22),
    pertahun: rp(perhari * 220),
  }))
}
