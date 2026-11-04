import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatMenu, formatMenuCategory, formatWibDateTime, sortCategories } from '../src/ui/format.js'
import { t as translate } from '../src/i18n/index.js'
import { buildSubMenuButtons, handler as menuHandler } from '../plugins/main/menu.js'

const labels = {
  greeting: 'Haii Senpai~ KANA dateng nih!',
  runtime: 'Runtime',
  mode: 'Mode',
  plugins: 'Plugin',
  commands: 'perintah',
  date: 'Tanggal',
  hint: 'Ketik .ping yaa~',
  closing: 'Makasih udah mampir~',
  footer: 'KANA, bot WhatsApp moe',
  subHint: 'Pencet tombol buat balik yaa~',
}

const sampleCategories = [
  { key: 'main', icon: '🏠', title: 'MENU UTAMA', commands: ['menu', 'ping'] },
  { key: 'download', icon: '📥', title: 'DOWNLOADER', commands: ['spotify'] },
  { key: 'owner', icon: '👑', title: 'OWNER', commands: ['owner'] },
]

test('formatMenu: header, info, kategori, dan perintah contoh muncul bergaya MD klasik', () => {
  const out = formatMenu({
    botName: 'KANA',
    runtimeMs: 65 * 60 * 1000,
    mode: 'Publik, semua bisa pakai',
    pluginCount: 3,
    commandCount: 5,
    dateTime: 'Rabu, 4 November 2026 • 13:52 WIB',
    categories: sampleCategories,
    labels,
  })
  assert.match(out, /╭───「 KANA 」───/)
  assert.match(out, /Haii Senpai~/)
  assert.match(out, /│ ◦ Runtime : 1j 05m/)
  assert.match(out, /│ ◦ Mode : Publik/)
  assert.match(out, /│ ◦ Plugin : 3 • 5 perintah/)
  assert.match(out, /Rabu, 4 November 2026 • 13:52 WIB/)
  assert.match(out, /╭─❏ 🏠 「 MENU UTAMA 」/)
  assert.match(out, /│ ◦ \.ping/)
  assert.match(out, /│ ◦ \.spotify/)
  assert.match(out, /│ ◦ \.owner/)
  assert.match(out, /Makasih udah mampir~/)
  assert.match(out, /_KANA, bot WhatsApp moe_/)
})

test('formatMenu: perintah dari beberapa kategori tampil semua, tidak ada yang disembunyikan', () => {
  const out = formatMenu({
    botName: 'KANA',
    runtimeMs: 60 * 1000,
    mode: 'Publik, semua bisa pakai',
    pluginCount: 4,
    commandCount: 4,
    dateTime: 'Rabu, 4 November 2026 • 13:52 WIB',
    categories: sampleCategories,
    labels,
  })
  for (const cmd of ['.menu', '.ping', '.spotify', '.owner']) {
    assert.ok(out.includes(`│ ◦ ${cmd}`), `perintah ${cmd} tampil di menu penuh`)
  }
  for (const title of ['MENU UTAMA', 'DOWNLOADER', 'OWNER']) {
    assert.ok(out.includes(`「 ${title} 」`), `seksi ${title} tampil di menu penuh`)
  }
})

test('formatMenuCategory: hanya perintah kategori itu', () => {
  const out = formatMenuCategory({ category: sampleCategories[1], labels })
  assert.match(out, /╭─❏ 📥 「 DOWNLOADER 」/)
  assert.match(out, /│ ◦ \.spotify/)
  assert.ok(!out.includes('.ping'))
})

test('formatWibDateTime: pola tanggal Indonesia plus jam WIB', () => {
  const out = formatWibDateTime(new Date('2026-11-04T06:52:00Z'), 'id')
  assert.match(out, /Rabu, 4 November 2026 • 13:52 WIB/)
})

test('sortCategories: urutan kenal dulu, sisanya alfabetis', () => {
  assert.deepEqual(sortCategories(['owner', 'zzz', 'main', 'download']), ['main', 'download', 'owner', 'zzz'])
})

test('buildSubMenuButtons: tombol kembali .menu di depan, kategori sendiri disembunyikan', () => {
  const buttons = buildSubMenuButtons(sampleCategories, 'download', { backLabel: '⬅ Menu Utama' })
  assert.equal(buttons[0].id, '.menu')
  assert.deepEqual(
    buttons.map((b) => b.id),
    ['.menu', '.menu main', '.menu owner']
  )
})

const fakePlugins = [
  { config: { name: 'ping', category: 'main', alias: [] } },
  { config: { name: 'menu', category: 'main', alias: ['m'] } },
  { config: { name: 'spotify', category: 'download', alias: ['sp'] } },
  { config: { name: 'joke', category: 'fun', alias: [] } },
  { config: { name: 'owner', category: 'owner', alias: ['status'] } },
]

function fakeSock({ withRelay = true } = {}) {
  const sent = []
  const relayed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return {}
    },
  }
  if (withRelay) {
    sock.relayMessage = async (jid, message, opts) => {
      relayed.push({ jid, message, opts })
      return {}
    }
  }
  return { sock, sent, relayed }
}

function fakeCtx(sock, { args = [] } = {}) {
  const replies = []
  const ctx = {
    sock,
    chat: '628123@s.whatsapp.net',
    raw: { pushName: 'Senpai' },
    lang: 'id',
    args,
    text: args.join(' '),
    t: (k, vars) => translate('id', k, vars),
    reply: async (txt) => {
      replies.push(txt)
    },
    registry: {
      list: () => fakePlugins,
      resolve: (n) => fakePlugins.find((p) => p.config.name === n),
      quarantined: [],
    },
  }
  return { ctx, replies }
}

test('handler menu utama: SATU pesan teks penuh + thumbnail palsu, tanpa gambar terpisah, tanpa tombol', async () => {
  const { sock, sent, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await menuHandler(ctx)
  assert.equal(sent.length, 1, 'menu utama hanya mengirim satu pesan')
  assert.equal(relayed.length, 0, 'menu utama tidak memakai tombol')
  const content = sent[0].content
  assert.ok(!('image' in content), 'tidak ada pesan gambar terpisah')
  assert.match(content.text, /Haii Senpai~/)
  for (const cmd of ['.ping', '.spotify', '.joke', '.owner']) {
    assert.ok(content.text.includes(`│ ◦ ${cmd}`), `perintah ${cmd} tampil di menu utama`)
  }
  const card = content.externalAdReply
  assert.ok(card, 'payload memuat externalAdReply')
  assert.equal(card.title, 'KANA MD')
  assert.equal(card.mediaType, 1)
  assert.ok(Buffer.isBuffer(card.thumbnail), 'thumbnail berupa Buffer dari banner menu')
  assert.ok(card.thumbnail.length < 374285, 'thumbnail sudah diperkecil dari banner asli')
  assert.match(card.url, /github\.com\/OmmniDevv\/kana-md/)
})

test('handler .menu download: hanya kategori download + tombol kembali, tanpa gambar terpisah', async () => {
  const { sock, sent, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['download'] })
  await menuHandler(ctx)
  assert.ok(!sent.some((s) => s.content.image), 'sub-menu tidak mengirim gambar terpisah')
  assert.equal(relayed.length, 1)
  const payload = JSON.stringify(relayed[0].message)
  assert.ok(payload.includes('◦ .spotify'), 'perintah download tampil')
  assert.ok(!payload.includes('◦ .ping'), 'perintah kategori lain tidak tampil')
  assert.ok(payload.includes('\\"id\\":\\".menu\\"'), 'ada tombol kembali .menu')
  assert.ok(payload.includes('.menu main'), 'ada tombol pindah kategori')
})

test('handler .menu download: tombol gagal, fallback teks sub-menu terkirim', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, { args: ['download'] })
  await menuHandler(ctx)
  const texts = sent.map((s) => s.content.caption ?? s.content.text ?? '').join('\n')
  assert.match(texts, /│ ◦ \.spotify/)
  assert.ok(!texts.includes('│ ◦ .ping'), 'fallback hanya berisi kategori download')
})

test('handler .menu all: sama seperti .menu, teks penuh satu pesan + thumbnail palsu', async () => {
  const { sock, sent, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['all'] })
  await menuHandler(ctx)
  assert.equal(sent.length, 1)
  assert.equal(relayed.length, 0)
  const content = sent[0].content
  assert.match(content.text, /│ ◦ \.ping/)
  assert.match(content.text, /│ ◦ \.spotify/)
  assert.match(content.text, /│ ◦ \.owner/)
  assert.equal(content.externalAdReply?.title, 'KANA MD')
})

test('handler .menu <kategori tak dikenal>: balasan jelas berisi daftar kategori', async () => {
  const { sock } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, { args: ['ngawur'] })
  await menuHandler(ctx)
  assert.equal(replies.length, 1)
  assert.match(replies[0], /nggak ada/)
  assert.match(replies[0], /download/)
})
