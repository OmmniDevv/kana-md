import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createCanvas } from '@napi-rs/canvas'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say as sayPersona } from '../src/persona/moe.js'
import {
  parseArtiNama,
  parseRamalanJodoh,
  hitungWeton,
  kategoriNeptu,
  ramalanWetonLokal,
} from '../src/scrapers/search/primbon.js'
import { i18n as artinamaI18n, formatArtiNama, test as artinamaTest } from '../plugins/fun/artinama.js'
import {
  i18n as ramalanI18n,
  parseRamalanArgs,
  formatRamalanApi,
  formatRamalanLokal,
  test as ramalanTest,
} from '../plugins/primbon/ramalanjodoh.js'

for (const mod of [artinamaI18n, ramalanI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}

export const tId = (k, vars) => translate('id', k, vars)
export const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
export const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])

export function fakeStorage() {
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

export function fakeSock(extra = {}) {
  const sent = []
  const removed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return { key: { id: `MSG${sent.length}` } }
    },
    relayMessage: async () => ({}),
    groupParticipantsUpdate: async (jid, participants, action) => {
      removed.push({ jid, participants, action })
      return []
    },
    profilePictureUrl: async () => null,
    ...extra,
  }
  return { sock, sent, removed }
}

export function fakeCtx(sock, over = {}) {
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

export function tinyPngBuffer() {
  const canvas = createCanvas(24, 24)
  const c = canvas.getContext('2d')
  c.fillStyle = '#00a884'
  c.fillRect(0, 0, 24, 24)
  return canvas.toBuffer('image/png')
}

/* ---------------- Primbon: Siputzx + weton lokal ---------------- */

test('primbon: parseArtiNama mengambil arti dan catatan asli', () => {
  const parsed = parseArtiNama({
    status: true,
    data: { nama: 'Budi', arti: 'Peduli sesama, dermawan.', catatan: 'Arti bersifat umum.' },
  })
  assert.equal(parsed.nama, 'Budi')
  assert.match(parsed.arti, /dermawan/)
  assert.equal(parseArtiNama({ status: false }), null)
  const body = formatArtiNama(tId, parsed)
  assert.match(body, /ARTI NAMA PRIMBON/)
  assert.match(body, /dermawan/)
  assert.ok(artinamaTest.expect.test(body))
})

test('primbon: parseRamalanJodoh memetakan weton dan hasil ramalan', () => {
  const parsed = parseRamalanJodoh({
    status: true,
    data: {
      peringatan: 'Hanya hiburan.',
      result: {
        orang_pertama: { nama: 'Putu', tanggal_lahir: 'Jumat Pahing, 16 November 2007' },
        orang_kedua: { nama: 'Keyla', tanggal_lahir: 'Selasa Pon, 1 Januari 2008' },
        hasil_ramalan: ['Baris satu.', 'Baris dua.'],
      },
    },
  })
  assert.equal(parsed.first.tanggalLahir, 'Jumat Pahing, 16 November 2007')
  assert.equal(parsed.hasil.length, 2)
  const body = formatRamalanApi(tId, parsed)
  assert.match(body, /RAMALAN JODOH PRIMBON/)
  assert.match(body, /Jumat Pahing/)
  assert.ok(ramalanTest.expect.test(body))
})

test('primbon: hitungWeton cocok dengan data Siputzx untuk dua tanggal contoh', () => {
  const w1 = hitungWeton(2007, 11, 16)
  assert.deepEqual(w1, { hari: 'Jumat', pasaran: 'Pahing', neptu: 15 })
  const w2 = hitungWeton(2008, 1, 1)
  assert.deepEqual(w2, { hari: 'Selasa', pasaran: 'Pon', neptu: 10 })
  assert.equal(hitungWeton(2026, 2, 31), null, '31 Februari bukan tanggal nyata')
})

test('primbon: kategoriNeptu mengikuti tabel delapan kategori', () => {
  assert.equal(kategoriNeptu(18), 'Pegat')
  assert.equal(kategoriNeptu(20), 'Ratu')
  assert.equal(kategoriNeptu(21), 'Jodoh')
  assert.equal(kategoriNeptu(22), 'Topo')
  assert.equal(kategoriNeptu(23), 'Tinari')
  assert.equal(kategoriNeptu(24), 'Padu')
  assert.equal(kategoriNeptu(25), 'Sujanan')
  assert.equal(kategoriNeptu(26), 'Pesthi')
})

test('primbon: ramalan lokal menjumlah neptu dua weton dan formatnya substantif', () => {
  const input = parseRamalanArgs(['Putu', '16', '11', '2007', 'Keyla', '1', '1', '2008'])
  assert.equal(input.nama1, 'Putu')
  const local = ramalanWetonLokal(input)
  assert.equal(local.total, 25)
  assert.equal(local.kategori, 'Sujanan')
  const body = formatRamalanLokal(tId, local)
  assert.match(body, /Jumat Pahing/)
  assert.match(body, /Selasa Pon/)
  assert.match(body, /Sujanan/)
  assert.equal(parseRamalanArgs(['Putu', '16', '11']), null)
  assert.equal(parseRamalanArgs(['A', '31', '2', '2007', 'B', '1', '1', '2008']).invalidDate, true)
})
