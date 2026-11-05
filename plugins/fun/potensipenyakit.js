import { sendButtons } from '../../src/ui/buttons.js'
import { getPotensiPenyakit, hitungWeton } from '../../src/scrapers/search/primbon.js'

// Potensi penyakit primbon: analisa Pitagoras tanggal lahir dari API
// primbon Siputzx, sama seperti padanan Elaina-MD. Ini bacaan primbon
// untuk hiburan, bukan diagnosis medis.
export const config = {
  name: 'potensipenyakit',
  alias: ['cekpenyakit', 'penyakit'],
  category: 'fun',
  description: { id: 'Cek potensi penyakit dari tanggal lahir menurut data primbon', en: 'Check illness potential from a birth date in primbon data' },
  usage: '.potensipenyakit <tgl> <bln> <thn>',
  example: '.potensipenyakit 12 5 1998',
  cooldown: 5,
}

export const i18n = {
  id: {
    potensipenyakit: {
      usage: '╭─❏ 🏥 「 *POTENSI PENYAKIT* 」\n┊ Formatnya tanggal bulan tahun yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.potensipenyakit 12 5 1998*\n╰━━━━━━━',
      badDate: '╭─❏ 🏥 「 *POTENSI PENYAKIT* 」\n┊ Tanggal lahirnya tidak nyata nih, cek lagi yaa~\n╰━━━━━━━',
      title: 'Potensi Penyakit Primbon',
      result: '╭─❏ 🏥 「 *POTENSI PENYAKIT PRIMBON* 」\n┊ ᴛᴀɴɢɢᴀʟ: *{tanggal}*\n┊\n┊ 🔢 *ᴀɴᴀʟɪꜱᴀ:*\n┊ {analisa}\n┊\n┊ 📊 *ᴇʟᴇᴍᴇɴ:*\n┊ {sektor}\n┊\n┊ ⚠️ *ᴘᴏᴛᴇɴꜱɪ:*\n┊ {elemen}\n┊\n┊ _{catatan}_\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *POTENSI PENYAKIT GAGAL* 」\n┊ Mouu, sumber data primbonnya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Tanggal Lain',
    },
  },
  en: {
    potensipenyakit: {
      usage: '╭─❏ 🏥 「 *ILLNESS POTENTIAL* 」\n┊ Format is day month year please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.potensipenyakit 12 5 1998*\n╰━━━━━━━',
      badDate: '╭─❏ 🏥 「 *ILLNESS POTENTIAL* 」\n┊ That birth date is not a real date, please check again~\n╰━━━━━━━',
      title: 'Primbon Illness Potential',
      result: '╭─❏ 🏥 「 *PRIMBON ILLNESS POTENTIAL* 」\n┊ ᴅᴀᴛᴇ: *{tanggal}*\n┊\n┊ 🔢 *ᴀɴᴀʟʏꜱɪꜱ:*\n┊ {analisa}\n┊\n┊ 📊 *ᴇʟᴇᴍᴇɴᴛ:*\n┊ {sektor}\n┊\n┊ ⚠️ *ᴘᴏᴛᴇɴᴛɪᴀʟ:*\n┊ {elemen}\n┊\n┊ _{catatan}_\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *ILLNESS POTENTIAL FAILED* 」\n┊ Mouu, the primbon data source cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Date',
    },
  },
}

export const test = { input: '.potensipenyakit 12 5 1998', expect: /potensi penyakit primbon|primbon illness potential/i }

// Uraikan tiga token tanggal ala Elaina: tgl bln thn. Token tunggal
// bertanda pisah (12-5-1998) juga diterima. Tanggal tidak nyata (31
// Februari dan sejenisnya) ditandai invalidDate lewat hitungWeton.
export function parseTanggalArgs(tokens) {
  const args = (tokens ?? [])
    .flatMap((v) => String(v).split(/[-/]/))
    .map((v) => v.trim())
    .filter(Boolean)
  if (args.length < 3) return null
  const [tgl, bln, thn] = args.slice(0, 3).map(Number)
  const input = { tgl, bln, thn }
  if (!Number.isInteger(tgl) || !Number.isInteger(bln) || !Number.isInteger(thn) || !hitungWeton(thn, bln, tgl)) {
    return { ...input, invalidDate: true }
  }
  return input
}

export function formatPotensiPenyakit(t, input, data) {
  return t('potensipenyakit.result', {
    tanggal: `${input.tgl}-${input.bln}-${input.thn}`,
    analisa: data.analisa,
    sektor: data.sektor,
    elemen: data.elemen,
    catatan: data.catatan,
  })
}

export async function handler(ctx) {
  const input = parseTanggalArgs(ctx.args?.length ? ctx.args : (ctx.text || '').split(/\s+/))
  if (!input) return ctx.reply(ctx.t('potensipenyakit.usage'))
  if (input.invalidDate) return ctx.reply(ctx.t('potensipenyakit.badDate'))
  let data
  try {
    data = await getPotensiPenyakit(input)
  } catch (err) {
    return ctx.reply(ctx.t('potensipenyakit.fail', { message: err.message }))
  }
  const body = formatPotensiPenyakit(ctx.t, input, data)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('potensipenyakit.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('potensipenyakit.btnAgain'), id: '.potensipenyakit' }],
    textFallback: body,
  })
}
