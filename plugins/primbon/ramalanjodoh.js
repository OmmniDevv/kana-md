import { getRamalanJodoh, hitungWeton, ramalanWetonLokal } from '../../src/scrapers/search/primbon.js'

// Ramalan jodoh primbon Jawa: format Elaina (nama dan tanggal lahir dua
// orang), hasil weton + ramalan dari API primbon Siputzx. Bila API mati,
// dihitung lokal dari neptu hari dan pasaran (metode primbon beneran),
// ditandai jelas sebagai hitungan lokal.
export const config = {
  name: 'ramalanjodoh',
  alias: [],
  category: 'primbon',
  description: { id: 'Ramalan jodoh primbon Jawa dari weton dua orang', en: 'Javanese primbon match reading from two birth weton' },
  usage: '.ramalanjodoh <nama1> <tgl1> <bln1> <thn1> <nama2> <tgl2> <bln2> <thn2>',
  example: '.ramalanjodoh Putu 16 11 2007 Keyla 1 1 2008',
  cooldown: 5,
}

export const i18n = {
  id: {
    ramalanjodoh: {
      usage: '╭─❏ 💑 「 *RAMALAN JODOH* 」\n┊ Formatnya: *.ramalanjodoh nama1 tgl1 bln1 thn1 nama2 tgl2 bln2 thn2*\n┊ ᴄᴏɴᴛᴏʜ: *.ramalanjodoh Putu 16 11 2007 Keyla 1 1 2008*\n╰━━━━━━━',
      badDate: '╭─❏ 💑 「 *RAMALAN JODOH* 」\n┊ Tanggal lahirnya ada yang tidak nyata nih, cek lagi yaa~\n╰━━━━━━━',
      resultApi: '╭─❏ 💑 「 *RAMALAN JODOH PRIMBON* 」\n┊ 👤 *{name1}*\n┊ {lahir1}\n┊\n┊ 👤 *{name2}*\n┊ {lahir2}\n┊\n┊ 📜 *Hasil ramalan:*\n{hasil}\n┊\n┊ ⚠️ _{warning}_\n╰━━━━━━━',
      resultLocal: '╭─❏ 💑 「 *RAMALAN JODOH PRIMBON* 」\n┊ Sumber API lagi mati, KANA hitung lokal dari neptu weton yaa~\n┊\n┊ 👤 *{name1}*: {weton1} (ɴᴇᴘᴛᴜ {neptu1})\n┊ 👤 *{name2}*: {weton2} (ɴᴇᴘᴛᴜ {neptu2})\n┊ ᴛᴏᴛᴀʟ ɴᴇᴘᴛᴜ: *{total}*\n┊ ᴋᴀᴛᴇɢᴏʀɪ: *{kategori}*\n┊\n┊ {arti}\n╰━━━━━━━\n{note}',
      note: 'Ramalan primbon ini kepercayaan tradisi dan cuma buat hiburan yaa, jangan dianggap penentu nasib~',
      fail: '╭─❏ 💦 「 *RAMALAN GAGAL* 」\n┊ Mouu, ramalannya gagal dibuat: *{message}*\n╰━━━━━━━',
      meanings: {
        Pegat: 'Pegat artinya rawan cekcok dan salah paham, sering dipicu urusan ekonomi atau pihak ketiga. Kuncinya komunikasi jujur dan jangan memendam masalah.',
        Ratu: 'Ratu artinya pasangan yang disegani dan dihormati banyak orang. Hubungannya kuat, tapi hati-hati jangan sampai besar kepala.',
        Jodoh: 'Jodoh artinya pasangan yang memang serasi: saling menerima kekurangan dan gampang menemukan jalan tengah.',
        Topo: 'Topo artinya awal hubungan terasa berat dan penuh ujian, tetapi bila sabar melewatinya, ujungnya bahagia dan mapan.',
        Tinari: 'Tinari artinya pasangan yang beruntung: hidupnya cenderung bahagia dan rezekinya gampang dicari.',
        Padu: 'Padu artinya sering bertengkar untuk hal kecil, tetapi tidak sampai berpisah. Belajar mengalah jadi kunci.',
        Sujanan: 'Sujanan artinya rawan godaan dan kecemburuan, termasuk risiko orang ketiga. Jaga kepercayaan dan batas pergaulan.',
        Pesthi: 'Pesthi artinya pasangan yang rukun, tentram, dan damai sampai tua, jarang terlibat pertengkaran besar.',
      },
    },
  },
  en: {
    ramalanjodoh: {
      usage: '╭─❏ 💑 「 *MATCH READING* 」\n┊ Format: *.ramalanjodoh name1 d1 m1 y1 name2 d2 m2 y2*\n┊ ᴇxᴀᴍᴘʟᴇ: *.ramalanjodoh Putu 16 11 2007 Keyla 1 1 2008*\n╰━━━━━━━',
      badDate: '╭─❏ 💑 「 *MATCH READING* 」\n┊ One of the birth dates is not a real date, please check again~\n╰━━━━━━━',
      resultApi: '╭─❏ 💑 「 *PRIMBON MATCH READING* 」\n┊ 👤 *{name1}*\n┊ {lahir1}\n┊\n┊ 👤 *{name2}*\n┊ {lahir2}\n┊\n┊ 📜 *Reading result:*\n{hasil}\n┊\n┊ ⚠️ _{warning}_\n╰━━━━━━━',
      resultLocal: '╭─❏ 💑 「 *PRIMBON MATCH READING* 」\n┊ The API source is down, so KANA calculated locally from weton neptu~\n┊\n┊ 👤 *{name1}*: {weton1} (ɴᴇᴘᴛᴜ {neptu1})\n┊ 👤 *{name2}*: {weton2} (ɴᴇᴘᴛᴜ {neptu2})\n┊ ᴛᴏᴛᴀʟ ɴᴇᴘᴛᴜ: *{total}*\n┊ ᴄᴀᴛᴇɢᴏʀʏ: *{kategori}*\n┊\n┊ {arti}\n╰━━━━━━━\n{note}',
      note: 'This primbon reading is traditional belief and just for fun, not a fate decider~',
      fail: '╭─❏ 💦 「 *READING FAILED* 」\n┊ Mouu, the reading failed: *{message}*\n╰━━━━━━━',
      meanings: {
        Pegat: 'Pegat means prone to quarrels and misunderstandings, often triggered by money matters or third parties. Honest communication is the key.',
        Ratu: 'Ratu means a couple respected by many people. The bond is strong, just do not let pride take over.',
        Jodoh: 'Jodoh means a genuinely matching couple: accepting each other flaws and easily finding middle ground.',
        Topo: 'Topo means a heavy start full of trials, but patience leads to a happy and settled ending.',
        Tinari: 'Tinari means a lucky couple: life tends to be happy and livelihood easy to find.',
        Padu: 'Padu means frequent small quarrels that never lead to separation. Learning to yield is the key.',
        Sujanan: 'Sujanan means prone to temptation and jealousy, including third party risks. Guard trust and social boundaries.',
        Pesthi: 'Pesthi means a harmonious, peaceful couple until old age, rarely in big fights.',
      },
    },
  },
}

export const test = {
  input: '.ramalanjodoh Putu 16 11 2007 Keyla 1 1 2008',
  expect: /ramalan jodoh primbon|primbon match reading/i,
}

// Uraikan 8 token ala Elaina: nama1 tgl1 bln1 thn1 nama2 tgl2 bln2 thn2.
// Mengembalikan null bila jumlah token kurang atau tanggal tidak nyata.
export function parseRamalanArgs(tokens) {
  const args = (tokens ?? []).map((v) => String(v).trim()).filter(Boolean)
  if (args.length < 8) return null
  const [nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2] = args.slice(0, 8)
  const input = {
    nama1,
    tgl1: Number(tgl1),
    bln1: Number(bln1),
    thn1: Number(thn1),
    nama2,
    tgl2: Number(tgl2),
    bln2: Number(bln2),
    thn2: Number(thn2),
  }
  if (!hitungWeton(input.thn1, input.bln1, input.tgl1) || !hitungWeton(input.thn2, input.bln2, input.tgl2)) {
    return { ...input, invalidDate: true }
  }
  return input
}

export function formatRamalanApi(t, data) {
  const hasil = data.hasil.map((h, i) => `┊ ${i + 1}. ${h}`).join('\n')
  return t('ramalanjodoh.resultApi', {
    name1: data.first.nama,
    lahir1: data.first.tanggalLahir,
    name2: data.second.nama,
    lahir2: data.second.tanggalLahir,
    hasil,
    warning: data.peringatan,
  })
}

export function formatRamalanLokal(t, local) {
  return t('ramalanjodoh.resultLocal', {
    name1: local.first.nama,
    weton1: local.first.weton,
    neptu1: local.first.neptu,
    name2: local.second.nama,
    weton2: local.second.weton,
    neptu2: local.second.neptu,
    total: local.total,
    kategori: local.kategori,
    arti: t(`ramalanjodoh.meanings.${local.kategori}`),
    note: t('ramalanjodoh.note'),
  })
}

export async function handler(ctx) {
  const input = parseRamalanArgs(ctx.args?.length ? ctx.args : (ctx.text || '').split(/\s+/))
  if (!input) return ctx.reply(ctx.t('ramalanjodoh.usage'))
  if (input.invalidDate) return ctx.reply(ctx.t('ramalanjodoh.badDate'))
  try {
    const data = await getRamalanJodoh(input)
    return ctx.reply(formatRamalanApi(ctx.t, data))
  } catch {
    const local = ramalanWetonLokal(input)
    if (local) return ctx.reply(formatRamalanLokal(ctx.t, local))
    return ctx.reply(ctx.t('ramalanjodoh.fail', { message: 'tanggal tidak valid' }))
  }
}
