import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatMenu, formatMenuCategory, formatMenuHome, formatWibDateTime, sortCategories } from '../src/ui/format.js'
import { t as translate } from '../src/i18n/index.js'
import { buildCategoryButtons, buildSubMenuButtons, handler as menuHandler } from '../plugins/main/menu.js'

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
  categoriesTitle: 'KATEGORI PERINTAH',
  navHint: 'Pencet tombol kategorinya yaa~',
  subHint: 'Pencet tombol buat balik yaa~',
}

const sampleCategories = [
  { key: 'main', icon: '🏠', title: 'MENU UTAMA', commands: ['menu', 'ping'] },
  { key: 'download', icon: '📥', title: 'DOWNLOADER', commands: ['spotify'] },
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
  assert.match(out, /Makasih udah mampir~/)
  assert.match(out, /_KANA, bot WhatsApp moe_/)
})

test('formatMenuHome: header info bot + daftar kategori saja, tanpa daftar perintah', () => {
  const out = formatMenuHome({
    botName: 'KANA',
    runtimeMs: 5 * 60 * 1000,
    mode: 'Publik, semua bisa pakai',
    pluginCount: 3,
    commandCount: 5,
    dateTime: 'Rabu, 4 November 2026 • 13:52 WIB',
    categories: sampleCategories.map((c) => ({ ...c, count: c.commands.length })),
    labels,
  })
  assert.match(out, /╭───「 KANA 」───/)
  assert.match(out, /Haii Senpai~/)
  assert.match(out, /KATEGORI PERINTAH/)
  assert.match(out, /MENU UTAMA \(2\)/)
  assert.match(out, /DOWNLOADER \(1\)/)
  assert.match(out, /Pencet tombol kategorinya/)
  assert.ok(!out.includes('◦ .ping'), 'perintah tidak ditampilkan di menu utama')
  assert.ok(!out.includes('◦ .spotify'), 'perintah tidak ditampilkan di menu utama')
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

test('buildCategoryButtons: id tombol = perintah .menu <kategori>', () => {
  const buttons = buildCategoryButtons(sampleCategories, { allLabel: '📋 Semua Perintah' })
  assert.deepEqual(
    buttons.map((b) => b.id),
    ['.menu main', '.menu download']
  )
  assert.match(buttons[1].text, /DOWNLOADER/)
})

test('buildCategoryButtons: lebih dari 10 kategori jadi 9 + .menu all', () => {
  const many = Array.from({ length: 12 }, (_, i) => ({ key: `cat${i}`, icon: '✦', title: `CAT ${i}`, commands: [] }))
  const buttons = buildCategoryButtons(many, { allLabel: '📋 Semua Perintah' })
  assert.equal(buttons.length, 10)
  assert.equal(buttons[8].id, '.menu cat8')
  assert.equal(buttons[9].id, '.menu all')
})

test('buildSubMenuButtons: tombol kembali .menu di depan, kategori sendiri disembunyikan', () => {
  const buttons = buildSubMenuButtons(sampleCategories, 'download', { backLabel: '⬅ Menu Utama' })
  assert.equal(buttons[0].id, '.menu')
  assert.deepEqual(
    buttons.map((b) => b.id),
    ['.menu', '.menu main']
  )
})

const fakePlugins = [
  { config: { name: 'ping', category: 'main', alias: [] } },
  { config: { name: 'menu', category: 'main', alias: ['m'] } },
  { config: { name: 'spotify', category: 'download', alias: ['sp'] } },
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

test('handler menu utama: gambar header terkirim dan tombol kategori ter-relay', async () => {
  const { sock, sent, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await menuHandler(ctx)
  assert.ok(sent.some((s) => s.content.image), 'ada pesan gambar header')
  assert.equal(relayed.length, 1, 'satu pesan tombol ter-relay')
  const payload = JSON.stringify(relayed[0].message)
  assert.ok(payload.includes('.menu download'), 'ada tombol kategori download')
  assert.ok(payload.includes('.menu main'), 'ada tombol kategori main')
  assert.ok(payload.includes('.menu owner'), 'ada tombol kategori owner')
})

test('handler .menu download: hanya kategori download + tombol kembali', async () => {
  const { sock, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['download'] })
  await menuHandler(ctx)
  assert.equal(relayed.length, 1)
  const payload = JSON.stringify(relayed[0].message)
  assert.ok(payload.includes('◦ .spotify'), 'perintah download tampil')
  assert.ok(!payload.includes('◦ .ping'), 'perintah kategori lain tidak tampil')
  assert.ok(payload.includes('\\"id\\":\\".menu\\"'), 'ada tombol kembali .menu')
  assert.ok(payload.includes('.menu main'), 'ada tombol pindah kategori')
})

test('handler menu: tombol gagal, fallback teks penuh terkirim', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock)
  await menuHandler(ctx)
  const texts = sent.map((s) => s.content.caption ?? s.content.text ?? '').join('\n')
  assert.match(texts, /│ ◦ \.ping/)
  assert.match(texts, /│ ◦ \.spotify/)
  assert.match(texts, /Haii Senpai~/)
})

test('handler .menu all: teks penuh semua kategori', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['all'] })
  await menuHandler(ctx)
  const texts = sent.map((s) => s.content.caption ?? s.content.text ?? '').join('\n')
  assert.match(texts, /│ ◦ \.ping/)
  assert.match(texts, /│ ◦ \.spotify/)
  assert.match(texts, /│ ◦ \.owner/)
})

test('handler .menu <kategori tak dikenal>: balasan jelas berisi daftar kategori', async () => {
  const { sock } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, { args: ['ngawur'] })
  await menuHandler(ctx)
  assert.equal(replies.length, 1)
  assert.match(replies[0], /nggak ada/)
  assert.match(replies[0], /download/)
})
