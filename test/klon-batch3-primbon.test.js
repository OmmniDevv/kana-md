import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say as sayPersona } from '../src/persona/moe.js'
import {
  parseNomorHoki,
  parsePotensiPenyakit,
  parseZodiak,
  parseZodiakString,
  parseKecocokanNama,
  parseSifatUsaha,
} from '../src/scrapers/search/primbon.js'
import {
  i18n as nomerhokiI18n,
  handler as nomerhokiHandler,
  cleanPhone,
  formatNomorHoki,
  test as nomerhokiTest,
} from '../plugins/fun/nomerhoki.js'
import {
  i18n as penyakitI18n,
  handler as penyakitHandler,
  parseTanggalArgs as parseTanggalPenyakit,
  formatPotensiPenyakit,
  test as penyakitTest,
} from '../plugins/fun/potensipenyakit.js'
import {
  i18n as zodiakI18n,
  handler as zodiakHandler,
  normalizeZodiacName,
  formatZodiak,
  test as zodiakTest,
} from '../plugins/fun/zodiak.js'
import {
  i18n as cocokI18n,
  handler as cocokHandler,
  parsePasanganArgs,
  formatKecocokanNama,
  test as cocokTest,
} from '../plugins/primbon/kecocokannamapasangan.js'
import {
  i18n as bisnisI18n,
  handler as bisnisHandler,
  parseTanggalArgs as parseTanggalBisnis,
  formatSifatUsaha,
  test as bisnisTest,
} from '../plugins/primbon/sifatusahabisnis.js'

for (const mod of [nomerhokiI18n, penyakitI18n, zodiakI18n, cocokI18n, bisnisI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}

const tId = (k, vars) => translate('id', k, vars)

function fakeStorage() {
  const map = new Map()
  return {
    map,
    async get(ns, key) {
      return map.get(`${ns}:${key}`)
    },
    async set(ns, key, value) {
      map.set(`${ns}:${key}`, value)
    },
    async delete(ns, key) {
      map.delete(`${ns}:${key}`)
    },
    async keys(ns) {
      return [...map.keys()].filter((k) => k.startsWith(`${ns}:`)).map((k) => k.slice(ns.length + 1))
    },
  }
}

function fakeSock(extra = {}) {
  const sent = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return { key: { id: `MSG${sent.length}` } }
    },
    relayMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return { key: { id: `MSG${sent.length}` } }
    },
    profilePictureUrl: async () => null,
    ...extra,
  }
  return { sock, sent }
}

function fakeCtx(sock, over = {}) {
  const replies = []
  const ctx = {
    sock,
    chat: '120363000000000000@g.us',
    sender: '628111@s.whatsapp.net',
    senderDigits: '628111',
    pushName: 'Penguji',
    isGroup: true,
    isOwner: false,
    isAdmin: false,
    isBotAdmin: false,
    args: [],
    text: '',
    command: '',
    lang: 'id',
    raw: { key: { id: 'RAW1' } },
    botJid: '6285187605007@s.whatsapp.net',
    mentionedJids: [],
    quoted: null,
    groupMetadata: null,
    t: tId,
    say: (mood) => sayPersona('id', mood),
    reply: async (txt) => {
      replies.push(txt)
      return { key: { id: 'REPLY1' } }
    },
    storage: fakeStorage(),
    getGroupMetadata: async () => ctx.groupMetadata,
    downloadMedia: async () => { throw new Error('tidak ada media') },
    downloadQuoted: async () => { throw new Error('tidak ada kutipan') },
    ...over,
  }
  return { ctx, replies }
}

/* ---------------- Fixture realistis (bentuk persis probe Siputzx) ---------------- */

const NOMOR_HOKI_JSON = {
  status: true,
  data: {
    nomor: '6281234567890',
    angka_bagua_shuzi: { value: 92.31, description: 'Persentase Angka Bagua Shuzi menunjukkan tingkat kecocokan nomor.' },
    energi_positif: { total: 92.31, details: { kekayaan: 2, kesehatan: 2, cinta: 2, kestabilan: 2 } },
    energi_negatif: { total: 45.45, details: { perselisihan: 3, kehilangan: 3, malapetaka: 3, kehancuran: 3 } },
    analisis: { status: true, description: 'Nomor dianggap hoki jika persentase Energi Positif di atas 60%.' },
  },
}

const NOMOR_HOKI_JSON_2 = {
  status: true,
  data: {
    nomor: '628999111222',
    angka_bagua_shuzi: { value: 38.46 },
    energi_positif: { total: 38.46, details: { kekayaan: 1, kesehatan: 0, cinta: 1, kestabilan: 0 } },
    energi_negatif: { total: 81.82, details: { perselisihan: 4, kehilangan: 5, malapetaka: 4, kehancuran: 5 } },
    analisis: { status: false },
  },
}

const PENYAKIT_JSON = {
  status: true,
  data: {
    analisa: 'Hasil analisa Pitagoras untuk tgl. lahir 12 Mei 1998 1 2 5 1 9 9 8 3 5 1 8 89 6 = 2 481 8 = 9 8 7 6The Holy Tetraktys',
    sektor: '8 = API 9 = KAYU 8 = API 8 = API 7 = AIR',
    elemen: 'Anda tidak memiliki elemen LOGAM dan TANAH, sehingga potensi penyakit ditentukan oleh elemen tersebut. LOGAM: Paru-paru atau masalah usus besar, isolasi, sinisme, alergi/masalah kulit, masalah sekitar pernapasan, asma.TANAH: Masalah perut, pankreas atau limpa kecil, masalah kekebalan tubuh, masalah pencernaan.',
    catatan: 'Potensi penyakit harus dipandang secara positif. Sakit pada daftar tidak berarti anda akan mengalami semuanya.',
  },
}

const ZODIAK_ARIES_STRING = '2,5,11,34,47 Aroma Keberuntungan: Lada Hitam, Cengkeh, Ketumbar, Kemenyan, Jahe, Pohon Cemara, Kayu-kayuan. Planet Yang Mengitari: Mars Bunga Keberuntungan: Bunga Daisy Warna Keberuntungan: Merah Batu Keberuntungan: Batu Delima Elemen Keberuntungan: Api Pasangan Serasi: Sagitarius Aries adalah simbol sebuah permulaan baru. Orang Aries menjadi pemimpin zodiak-zodiak lainnya, agresif dan penuh kreativitas.'

const ZODIAK_JSON = {
  status: true,
  data: {
    zodiak: ZODIAK_ARIES_STRING,
    nomor_keberuntungan: '2,5,11,34,47',
    aroma_keberuntungan: 'Lada Hitam, Cengkeh, Ketumbar, Kemenyan, Jahe, Pohon Cemara, Kayu-kayuan.',
    planet_yang_mengitari: 'Mars',
    bunga_keberuntungan: 'Bunga Daisy',
    warna_keberuntungan: 'Merah',
    batu_keberuntungan: 'Batu Delima',
    elemen_keberuntungan: 'Api',
    pasangan_zodiak: 'Sagitarius Aries adalah simbol sebuah permulaan baru. Orang Aries menjadi pemimpin zodiak-zodiak lainnya, agresif dan penuh kreativitas.',
  },
}

const ZODIAK_LEO_STRING_ONLY = {
  status: true,
  data: {
    zodiak: 'Nomor Keberuntungan: 1,9,18,27 Aroma Keberuntungan: Jeruk, Lemon Planet Yang Mengitari: Matahari Bunga Keberuntungan: Bunga Matahari Warna Keberuntungan: Emas Batu Keberuntungan: Ruby Elemen Keberuntungan: Api Pasangan Zodiak: Aries Leo adalah raja zodiak yang percaya diri dan hangat.',
  },
}

const KECOCOKAN_JSON = {
  status: true,
  data: {
    nama_anda: 'putu',
    nama_pasangan: 'keyla',
    sisi_positif: 'Menyukai pertemanan, Kekeluargaan, Harmonis, Supel',
    sisi_negatif: 'Penggosip, Mengurusi orang lain. Anda kurang cocok dengan dia. Prinsip hidup yang berlainan bisa membuat Anda dan pasangan selalu beradu mulut.',
    gambar: 'https://primbon.com/ramalan_kecocokan_cinta2.png',
    catatan: 'Untuk melihat kecocokan jodoh dengan pasangan, dapat dikombinasikan dengan primbon Ramalan Jodoh (Jawa).',
  },
}

const BISNIS_JSON = {
  status: true,
  data: {
    hari_lahir: 'Sabtu Legi, Tgl. 1 Januari',
    usaha: 'Dalam penggunaan uang sangat hemat, memiliki bakat kaya dari apapun yang diusahakan. Bisnis yang cukup menantang amat menarik hati anda.',
    catatan: 'Setiap manusia memiliki sifat atau karakter yang berbeda-beda dalam menjalankan bisnis atau usaha.',
  },
}

/* ---------------- Parser scraper ---------------- */

test('nomerhoki: parseNomorHoki memetakan bagua, energi, dan status hoki', () => {
  const parsed = parseNomorHoki(NOMOR_HOKI_JSON)
  assert.equal(parsed.nomor, '6281234567890')
  assert.equal(parsed.bagua, 92.31)
  assert.equal(parsed.positif.total, 92.31)
  assert.equal(parsed.positif.kekayaan, 2)
  assert.equal(parsed.negatif.malapetaka, 3)
  assert.equal(parsed.hoki, true)
  assert.equal(parseNomorHoki({ status: false }), null)
  assert.equal(parseNomorHoki({ status: true, data: { nomor: '62' } }), null)
  const parsed2 = parseNomorHoki(NOMOR_HOKI_JSON_2)
  assert.equal(parsed2.hoki, false)
  const body = formatNomorHoki(tId, parsed)
  assert.match(body, /NOMOR HOKI PRIMBON/)
  assert.match(body, /92\.31%/)
  assert.match(body, /HOKI/)
  assert.ok(nomerhokiTest.expect.test(body))
  const body2 = formatNomorHoki(tId, parsed2)
  assert.match(body2, /TIDAK HOKI/)
  assert.notEqual(body, body2, 'keluaran harus bervariasi per nomor')
  assert.equal(cleanPhone('+62 812-3456-7890'), '6281234567890')
})

test('potensipenyakit: parsePotensiPenyakit memetakan analisa, sektor, elemen, catatan', () => {
  const parsed = parsePotensiPenyakit(PENYAKIT_JSON)
  assert.match(parsed.analisa, /Pitagoras/)
  assert.match(parsed.sektor, /API/)
  assert.match(parsed.elemen, /LOGAM/)
  assert.equal(parsePotensiPenyakit({ status: true, data: {} }), null)
  const body = formatPotensiPenyakit(tId, { tgl: 12, bln: 5, thn: 1998 }, parsed)
  assert.match(body, /POTENSI PENYAKIT PRIMBON/)
  assert.match(body, /12-5-1998/)
  assert.match(body, /asma/)
  assert.ok(penyakitTest.expect.test(body))
})

test('tanggal: parseTanggalArgs menolak 31 Februari dan menerima tanda pisah', () => {
  for (const parse of [parseTanggalPenyakit, parseTanggalBisnis]) {
    assert.deepEqual(parse(['12', '5', '1998']), { tgl: 12, bln: 5, thn: 1998 })
    assert.deepEqual(parse(['12-5-1998']), { tgl: 12, bln: 5, thn: 1998 })
    assert.equal(parse(['31', '2', '2000']).invalidDate, true)
    assert.equal(parse(['30', '2', '2000']).invalidDate, true)
    assert.equal(parse(['12', '5']), null)
    assert.equal(parse(['a', 'b', 'c']).invalidDate, true)
  }
})

test('zodiak: parseZodiakString menguraikan string gabungan Aries per label', () => {
  const parsed = parseZodiakString(ZODIAK_ARIES_STRING)
  assert.equal(parsed.nomor, '2,5,11,34,47')
  assert.match(parsed.aroma, /Lada Hitam/)
  assert.equal(parsed.planet, 'Mars')
  assert.equal(parsed.bunga, 'Bunga Daisy')
  assert.equal(parsed.warna, 'Merah')
  assert.equal(parsed.batu, 'Batu Delima')
  assert.equal(parsed.elemen, 'Api')
  assert.equal(parsed.pasangan, 'Sagitarius')
  assert.match(parsed.deskripsi, /simbol sebuah permulaan baru/)
})

test('zodiak: parseZodiak utuh lengkap, string saja pun lengkap, dan hasilnya beda per tanda', () => {
  const aries = parseZodiak(ZODIAK_JSON)
  assert.equal(aries.lengkap, true)
  assert.equal(aries.planet, 'Mars')
  assert.equal(aries.pasangan, 'Sagitarius')
  const leo = parseZodiak(ZODIAK_LEO_STRING_ONLY)
  assert.equal(leo.lengkap, true)
  assert.equal(leo.nomor, '1,9,18,27')
  assert.equal(leo.planet, 'Matahari')
  assert.equal(leo.pasangan, 'Aries')
  assert.match(leo.deskripsi, /raja zodiak/)
  const bodyAries = formatZodiak(tId, 'aries', aries)
  const bodyLeo = formatZodiak(tId, 'leo', leo)
  assert.match(bodyAries, /ZODIAK ARIES/)
  assert.match(bodyAries, /Mars/)
  assert.match(bodyLeo, /Matahari/)
  assert.notEqual(bodyAries, bodyLeo, 'keluaran harus bervariasi per zodiak')
  assert.ok(zodiakTest.expect.test(bodyAries))
  assert.equal(parseZodiak({ status: false }), null)
})

test('zodiak: parse tidak lengkap jatuh ke string mentah apa adanya', () => {
  const parsed = parseZodiak({ status: true, data: { zodiak: 'Teks bebas tanpa label atribut sama sekali.' } })
  assert.equal(parsed.lengkap, false)
  const body = formatZodiak(tId, 'aries', parsed)
  assert.match(body, /Teks bebas tanpa label atribut sama sekali\./)
})

test('zodiak: normalizeZodiacName memvalidasi 12 nama ala Elaina', () => {
  assert.equal(normalizeZodiacName('Aries'), 'aries')
  assert.equal(normalizeZodiacName('sagittarius'), 'sagitarius')
  assert.equal(normalizeZodiacName('sagitarius'), 'sagitarius')
  assert.equal(normalizeZodiacName('ophiuchus'), null)
  assert.equal(normalizeZodiacName(''), null)
  assert.equal(normalizeZodiacName('17-08'), null)
})

test('kecocokan: parseKecocokanNama memetakan dua nama dan sisi positif negatif', () => {
  const parsed = parseKecocokanNama(KECOCOKAN_JSON)
  assert.equal(parsed.namaAnda, 'putu')
  assert.equal(parsed.namaPasangan, 'keyla')
  assert.match(parsed.positif, /Harmonis/)
  assert.match(parsed.negatif, /beradu mulut/)
  assert.equal(parseKecocokanNama({ status: true, data: { nama_anda: 'a' } }), null)
  const body = formatKecocokanNama(tId, parsed)
  assert.match(body, /KECOCOKAN NAMA PASANGAN/)
  assert.match(body, /Harmonis/)
  assert.ok(cocokTest.expect.test(body))
})

test('kecocokan: parsePasanganArgs butuh dua nama, pemisah didukung', () => {
  assert.deepEqual(parsePasanganArgs('putu keyla'), { nama1: 'putu', nama2: 'keyla' })
  assert.deepEqual(parsePasanganArgs('putu & keyla'), { nama1: 'putu', nama2: 'keyla' })
  assert.deepEqual(parsePasanganArgs('Putu Gede dan Keyla Ayu'), { nama1: 'Putu Gede', nama2: 'Keyla Ayu' })
  assert.equal(parsePasanganArgs('putu'), null)
  assert.equal(parsePasanganArgs(''), null)
})

test('bisnis: parseSifatUsaha memetakan hari lahir, usaha, catatan', () => {
  const parsed = parseSifatUsaha(BISNIS_JSON)
  assert.equal(parsed.hariLahir, 'Sabtu Legi, Tgl. 1 Januari')
  assert.match(parsed.usaha, /sangat hemat/)
  assert.equal(parseSifatUsaha({ status: true, data: { hari_lahir: 'x' } }), null)
  const body = formatSifatUsaha(tId, parsed)
  assert.match(body, /SIFAT USAHA BISNIS PRIMBON/)
  assert.match(body, /Sabtu Legi/)
  assert.ok(bisnisTest.expect.test(body))
})

/* ---------------- Handler jalur usage dan tanggal tidak nyata ---------------- */

test('handler: tanpa argumen menjawab usage, tanggal tidak nyata ditolak', async () => {
  const { sock } = fakeSock()

  const noPhone = fakeCtx(sock, { text: '' })
  await nomerhokiHandler(noPhone.ctx)
  assert.match(noPhone.replies[0], /NOMOR HOKI/)
  assert.match(noPhone.replies[0], /6281234567890/)

  const shortPhone = fakeCtx(sock, { text: '12345' })
  await nomerhokiHandler(shortPhone.ctx)
  assert.match(shortPhone.replies[0], /NOMOR HOKI/)

  const noDate = fakeCtx(sock, { text: '', args: [] })
  await penyakitHandler(noDate.ctx)
  assert.match(noDate.replies[0], /POTENSI PENYAKIT/)

  const badDate = fakeCtx(sock, { text: '31 2 2000', args: ['31', '2', '2000'] })
  await penyakitHandler(badDate.ctx)
  assert.match(badDate.replies[0], /tidak nyata/)

  const badDateBiz = fakeCtx(sock, { text: '31 2 2000', args: ['31', '2', '2000'] })
  await bisnisHandler(badDateBiz.ctx)
  assert.match(badDateBiz.replies[0], /tidak nyata/)

  const badSign = fakeCtx(sock, { text: 'ophiuchus', args: ['ophiuchus'] })
  await zodiakHandler(badSign.ctx)
  assert.match(badSign.replies[0], /ZODIAK/)
  assert.match(badSign.replies[0], /aries/)

  const oneName = fakeCtx(sock, { text: 'putu' })
  await cocokHandler(oneName.ctx)
  assert.match(oneName.replies[0], /KECOCOKAN NAMA/)
})

/* ---------------- Handler sukses dengan fetch ter-stub ---------------- */

function stubFetchJson(payload) {
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => payload })
  return () => { globalThis.fetch = original }
}

test('handler sukses: nomerhoki mengirim hasil asli Siputzx lewat tombol', async () => {
  const restore = stubFetchJson(NOMOR_HOKI_JSON)
  try {
    const { sock, sent } = fakeSock()
    const { ctx } = fakeCtx(sock, { text: '6281234567890', args: ['6281234567890'] })
    await nomerhokiHandler(ctx)
    const payload = JSON.stringify(sent)
    assert.match(payload, /6281234567890/)
    assert.match(payload, /92\.31/)
  } finally {
    restore()
  }
})

test('handler sukses: potensipenyakit mengirim elemen dan potensi asli', async () => {
  const restore = stubFetchJson(PENYAKIT_JSON)
  try {
    const { sock, sent } = fakeSock()
    const { ctx } = fakeCtx(sock, { text: '12 5 1998', args: ['12', '5', '1998'] })
    await penyakitHandler(ctx)
    const payload = JSON.stringify(sent)
    assert.match(payload, /LOGAM/)
    assert.match(payload, /Pitagoras/)
  } finally {
    restore()
  }
})

test('handler sukses: zodiak mengirim atribut terurai Aries', async () => {
  const restore = stubFetchJson(ZODIAK_JSON)
  try {
    const { sock, sent } = fakeSock()
    const { ctx } = fakeCtx(sock, { text: 'aries', args: ['aries'] })
    await zodiakHandler(ctx)
    const payload = JSON.stringify(sent)
    assert.match(payload, /Mars/)
    assert.match(payload, /Batu Delima/)
    assert.match(payload, /Sagitarius/)
  } finally {
    restore()
  }
})

test('handler sukses: kecocokan mengirim sisi positif dan negatif asli', async () => {
  const restore = stubFetchJson(KECOCOKAN_JSON)
  try {
    const { sock, sent } = fakeSock()
    const { ctx } = fakeCtx(sock, { text: 'putu keyla', args: ['putu', 'keyla'] })
    await cocokHandler(ctx)
    const payload = JSON.stringify(sent)
    assert.match(payload, /Harmonis/)
    assert.match(payload, /beradu mulut/)
  } finally {
    restore()
  }
})

test('handler sukses: sifat usaha mengirim analisa hari lahir asli', async () => {
  const restore = stubFetchJson(BISNIS_JSON)
  try {
    const { sock, sent } = fakeSock()
    const { ctx } = fakeCtx(sock, { text: '1 1 2000', args: ['1', '1', '2000'] })
    await bisnisHandler(ctx)
    const payload = JSON.stringify(sent)
    assert.match(payload, /Sabtu Legi/)
    assert.match(payload, /sangat hemat/)
  } finally {
    restore()
  }
})

/* ---------------- Handler jalur gagal (fetch mati) ---------------- */

test('handler gagal: sumber tidak bisa dihubungi disebut jujur di pesan gagal', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('fetch failed') }
  try {
    const { sock } = fakeSock()
    const run = fakeCtx(sock, { text: '6281234567890', args: ['6281234567890'] })
    await nomerhokiHandler(run.ctx)
    assert.match(run.replies[0], /GAGAL/)
    assert.match(run.replies[0], /tidak bisa dihubungi/)
  } finally {
    globalThis.fetch = original
  }
})
