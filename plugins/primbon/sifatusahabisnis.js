import { sendButtons } from '../../src/ui/buttons.js'
import { getSifatUsaha, hitungWeton } from '../../src/scrapers/search/primbon.js'

// Sifat usaha bisnis primbon: analisa usaha dari hari lahir tanggal
// lahir lewat API primbon Siputzx, sama seperti padanan Elaina-MD.
// Tidak ada lagi pilihan bisnis karangan dari hash tanggal.
export const config = {
  name: 'sifatusahabisnis',
  alias: ['usahabisnis'],
  category: 'primbon',
  description: { id: 'Cek sifat usaha bisnis dari tanggal lahir menurut data primbon', en: 'Check business nature from a birth date in primbon data' },
  usage: '.sifatusahabisnis <tgl> <bln> <thn>',
  example: '.sifatusahabisnis 1 1 2000',
  cooldown: 5,
}

export const i18n = {
  id: {
    sifatusahabisnis: {
      usage: '╭─❏ 💼 「 *SIFAT USAHA BISNIS* 」\n┊ Formatnya tanggal bulan tahun yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.sifatusahabisnis 1 1 2000*\n╰━━━━━━━',
      badDate: '╭─❏ 💼 「 *SIFAT USAHA BISNIS* 」\n┊ Tanggal lahirnya tidak nyata nih, cek lagi yaa~\n╰━━━━━━━',
      title: 'Sifat Usaha Bisnis Primbon',
      result: '╭─❏ 💼 「 *SIFAT USAHA BISNIS PRIMBON* 」\n┊ ʟᴀʜɪʀ: *{hariLahir}*\n┊\n┊ 📊 *ᴀɴᴀʟɪꜱᴀ:*\n┊ {usaha}\n┊\n┊ _{catatan}_\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *SIFAT USAHA BISNIS GAGAL* 」\n┊ Mouu, sumber data primbonnya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Tanggal Lain',
    },
  },
  en: {
    sifatusahabisnis: {
      usage: '╭─❏ 💼 「 *BUSINESS NATURE* 」\n┊ Format is day month year please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.sifatusahabisnis 1 1 2000*\n╰━━━━━━━',
      badDate: '╭─❏ 💼 「 *BUSINESS NATURE* 」\n┊ That birth date is not a real date, please check again~\n╰━━━━━━━',
      title: 'Primbon Business Nature',
      result: '╭─❏ 💼 「 *PRIMBON BUSINESS NATURE* 」\n┊ ʙᴏʀɴ: *{hariLahir}*\n┊\n┊ 📊 *ᴀɴᴀʟʏꜱɪꜱ:*\n┊ {usaha}\n┊\n┊ _{catatan}_\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *BUSINESS NATURE FAILED* 」\n┊ Mouu, the primbon data source cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Date',
    },
  },
}

export const test = { input: '.sifatusahabisnis 1 1 2000', expect: /sabtu legi/i }

// Uraikan tiga token tanggal ala Elaina: tgl bln thn. Token tunggal
// bertanda pisah (1-1-2000) juga diterima. Tanggal tidak nyata (31
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

export function formatSifatUsaha(t, data) {
  return t('sifatusahabisnis.result', {
    hariLahir: data.hariLahir,
    usaha: data.usaha,
    catatan: data.catatan,
  })
}

export async function handler(ctx) {
  const input = parseTanggalArgs(ctx.args?.length ? ctx.args : (ctx.text || '').split(/\s+/))
  if (!input) return ctx.reply(ctx.t('sifatusahabisnis.usage'))
  if (input.invalidDate) return ctx.reply(ctx.t('sifatusahabisnis.badDate'))
  let data
  try {
    data = await getSifatUsaha(input)
  } catch (err) {
    return ctx.reply(ctx.t('sifatusahabisnis.fail', { message: err.message }))
  }
  const body = formatSifatUsaha(ctx.t, data)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('sifatusahabisnis.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('sifatusahabisnis.btnAgain'), id: '.sifatusahabisnis' }],
    textFallback: body,
  })
}
