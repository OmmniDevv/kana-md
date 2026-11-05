import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeWaDigits,
  countryFromDigits,
  parseWaStatus,
  parseBusinessProfile,
  fetchWaProfile,
} from '../src/services/wa-profile.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import * as wastalk from '../plugins/search/wastalk.js'

// Tes penilaian ulang fitur stalk RYO-YAMADA-MD (2026-11-05): wastalk
// diport sebagai penampil profil PUBLIK WhatsApp. Fixture status meniru
// bentuk asli keluaran USyncStatusProtocol library 1.4.7
// ({ status, setAt } per pengguna), dan profil bisnis meniru bentuk
// getBusinessProfile Baileys (website array, categories display_name).

test('wastalk: normalisasi nomor dari teks, JID, dan mention', () => {
  assert.equal(normalizeWaDigits('6285869074622'), '6285869074622')
  assert.equal(normalizeWaDigits('+62 858-6907-4622'), '6285869074622')
  assert.equal(normalizeWaDigits('6285869074622@s.whatsapp.net'), '6285869074622')
  assert.equal(normalizeWaDigits('halo semua'), null)
  assert.equal(normalizeWaDigits('12345'), null)
  assert.equal(normalizeWaDigits(''), null)
})

test('wastalk: negara dari awalan kode telepon', () => {
  assert.deepEqual(countryFromDigits('6285869074622'), { iso: 'ID', name: 'Indonesia' })
  assert.equal(countryFromDigits('60123456789').iso, 'MY')
  assert.equal(countryFromDigits('819012345678').iso, 'JP')
  assert.equal(countryFromDigits('999123456789'), null)
})

test('wastalk: parse status USync menjadi bio bersih', () => {
  const setAt = new Date('2026-01-15T00:00:00Z')
  const raw = [{ id: '6285869074622@s.whatsapp.net', status: { status: 'Sibuk belajar', setAt } }]
  assert.deepEqual(parseWaStatus(raw, '6285869074622@s.whatsapp.net'), { text: 'Sibuk belajar', setAt })
  // Kode privasi 401 diterjemahkan parser library menjadi string kosong.
  const hidden = [{ id: '6285869074622@s.whatsapp.net', status: { status: '', setAt } }]
  assert.equal(parseWaStatus(hidden, '6285869074622@s.whatsapp.net').text, '')
  assert.equal(parseWaStatus(null, 'x'), null)
  assert.equal(parseWaStatus([], 'x'), null)
})

test('wastalk: parse profil bisnis, akun standar menjadi null', () => {
  const raw = {
    description: 'Toko kopi',
    email: 'halo@toko.id',
    address: 'Bandung',
    website: ['https://toko.id', 'https://lain.id'],
    categories: [{ id: '1', display_name: 'Kedai Kopi' }],
    business_hours: { timezone: 'Asia/Jakarta' },
  }
  assert.deepEqual(parseBusinessProfile(raw), {
    description: 'Toko kopi',
    email: 'halo@toko.id',
    address: 'Bandung',
    website: 'https://toko.id',
    category: 'Kedai Kopi',
    timezone: 'Asia/Jakarta',
  })
  assert.equal(parseBusinessProfile(null), null)
  assert.equal(parseBusinessProfile({}), null)
})

function fakeSock({ exists = true, photoUrl = null, bio = 'Halo dunia', business = null } = {}) {
  const calls = []
  return {
    calls,
    async onWhatsApp(digits) {
      calls.push(['onWhatsApp', digits])
      return [{ exists, jid: `${digits}@s.whatsapp.net` }]
    },
    async profilePictureUrl(jid) {
      calls.push(['profilePictureUrl', jid])
      if (!photoUrl) throw new Error('404')
      return photoUrl
    },
    async fetchStatus(jid) {
      calls.push(['fetchStatus', jid])
      return [{ id: jid, status: { status: bio, setAt: new Date('2026-01-15T00:00:00Z') } }]
    },
    async getBusinessProfile(jid) {
      calls.push(['getBusinessProfile', jid])
      if (!business) throw new Error('not a business')
      return business
    },
  }
}

test('fetchWaProfile: nomor terdaftar menghasilkan profil terstruktur', async () => {
  const sock = fakeSock({ business: { description: 'Toko kopi', website: [], categories: [] } })
  const profile = await fetchWaProfile(sock, '6285869074622')
  assert.equal(profile.exists, true)
  assert.equal(profile.jid, '6285869074622@s.whatsapp.net')
  assert.equal(profile.photoUrl, null)
  assert.equal(profile.bio.text, 'Halo dunia')
  assert.equal(profile.business.description, 'Toko kopi')
  assert.equal(profile.country.iso, 'ID')
  assert.deepEqual(sock.calls.map((c) => c[0]), ['onWhatsApp', 'profilePictureUrl', 'fetchStatus', 'getBusinessProfile'])
})

test('fetchWaProfile: nomor tak terdaftar berhenti di onWhatsApp', async () => {
  const sock = fakeSock({ exists: false })
  const profile = await fetchWaProfile(sock, '628000000000')
  assert.equal(profile.exists, false)
  assert.deepEqual(sock.calls.map((c) => c[0]), ['onWhatsApp'])
})

for (const [lang, msgs] of Object.entries(wastalk.i18n ?? {})) addMessages(lang, msgs)
const t = (k, vars) => translate('id', k, vars)

function fakeCtx({ text = '', sock, quoted = null, mentionedJids = [] } = {}) {
  const replies = []
  return {
    replies,
    ctx: {
      text,
      quoted,
      mentionedJids,
      chat: '6285869074622@s.whatsapp.net',
      raw: {},
      sock,
      t,
      say: () => '♪',
      async reply(text) {
        replies.push(text)
        return text
      },
    },
  }
}

test('wastalk handler: tampilkan profil lengkap sebagai teks', async () => {
  const sock = fakeSock({ business: { email: 'halo@toko.id', website: [], categories: [{ display_name: 'Kedai Kopi' }] } })
  const { ctx, replies } = fakeCtx({ text: '6285869074622', sock })
  await wastalk.handler(ctx)
  const out = replies.join('\n')
  assert.match(out, /WHATSAPP/)
  assert.match(out, /\+6285869074622/)
  assert.match(out, /Indonesia/)
  assert.match(out, /wa\.me\/6285869074622/)
  assert.match(out, /Halo dunia/)
  assert.match(out, /INFO BISNIS/)
  assert.match(out, /halo@toko\.id/)
  assert.match(out, /Kedai Kopi/)
})

test('wastalk handler: target dari balasan pesan (quoted sender)', async () => {
  const sock = fakeSock({})
  const { ctx, replies } = fakeCtx({ sock, quoted: { sender: '6283157555852@s.whatsapp.net' } })
  await wastalk.handler(ctx)
  assert.match(replies.join('\n'), /wa\.me\/6283157555852/)
  assert.deepEqual(sock.calls[0], ['onWhatsApp', '6283157555852'])
})

test('wastalk handler: nomor tak terdaftar membalas tidak terdaftar', async () => {
  const sock = fakeSock({ exists: false })
  const { ctx, replies } = fakeCtx({ text: '628000000000', sock })
  await wastalk.handler(ctx)
  assert.match(replies.join('\n'), /TIDAK TERDAFTAR/)
})

test('wastalk handler: tanpa nomor membalas petunjuk', async () => {
  const sock = fakeSock({})
  const { ctx, replies } = fakeCtx({ text: '', sock })
  await wastalk.handler(ctx)
  assert.match(replies.join('\n'), /WASTALK/)
  assert.equal(sock.calls.length, 0)
})

test('wastalk handler: foto gagal diunduh, tetap kirim teks profil', async () => {
  const sock = fakeSock({ photoUrl: 'https://127.0.0.1:1/pp.jpg' })
  const { ctx, replies } = fakeCtx({ text: '6285869074622', sock })
  await wastalk.handler(ctx)
  assert.match(replies.join('\n'), /wa\.me\/6285869074622/)
})
