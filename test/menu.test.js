import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatMenu, formatWibDateTime, sortCategories } from '../src/ui/format.js'
import { t as translate } from '../src/i18n/index.js'
import { handler as menuHandler } from '../plugins/main/menu.js'

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
}

test('formatMenu: header, info, kategori, dan perintah contoh muncul bergaya MD klasik', () => {
  const out = formatMenu({
    botName: 'KANA',
    runtimeMs: 65 * 60 * 1000,
    mode: 'Publik, semua bisa pakai',
    pluginCount: 3,
    commandCount: 5,
    dateTime: 'Rabu, 4 November 2026 • 13:52 WIB',
    categories: [
      { key: 'main', icon: '🏠', title: 'MENU UTAMA', commands: ['menu', 'ping'] },
      { key: 'download', icon: '📥', title: 'DOWNLOADER', commands: ['spotify'] },
    ],
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

test('formatWibDateTime: pola tanggal Indonesia plus jam WIB', () => {
  const out = formatWibDateTime(new Date('2026-11-04T06:52:00Z'), 'id')
  assert.match(out, /Rabu, 4 November 2026 • 13:52 WIB/)
})

test('sortCategories: urutan kenal dulu, sisanya alfabetis', () => {
  assert.deepEqual(sortCategories(['owner', 'zzz', 'main', 'download']), ['main', 'download', 'owner', 'zzz'])
})

test('handler menu: kirim gambar header dan teks menu dari registry contoh', async () => {
  const fakePlugins = [
    { config: { name: 'ping', category: 'main', alias: [] } },
    { config: { name: 'spotify', category: 'download', alias: ['sp'] } },
    { config: { name: 'owner', category: 'owner', alias: ['status'] } },
  ]
  const sent = []
  const ctx = {
    sock: {
      sendMessage: async (jid, content, opts) => {
        sent.push({ jid, content, opts })
        return {}
      },
    },
    chat: '628123@s.whatsapp.net',
    raw: { pushName: 'Senpai' },
    lang: 'id',
    t: (k, vars) => translate('id', k, vars),
    registry: {
      list: () => fakePlugins,
      resolve: (n) => fakePlugins.find((p) => p.config.name === n),
      quarantined: [],
    },
  }
  await menuHandler(ctx)
  assert.ok(sent.length >= 1)
  assert.ok(sent.some((s) => s.content.image), 'ada pesan gambar header')
  const texts = sent.map((s) => s.content.caption ?? s.content.text ?? '').join('\n')
  assert.match(texts, /KANA/)
  assert.match(texts, /│ ◦ \.ping/)
  assert.match(texts, /│ ◦ \.spotify/)
  assert.match(texts, /Haii Senpai~/)
})
