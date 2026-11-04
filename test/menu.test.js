import { test } from 'node:test'
import assert from 'node:assert/strict'
import jpeg from 'jpeg-js'
import {
  formatMenu,
  formatMenuCategory,
  formatWibClock,
  formatWibDate,
  formatWibDateTime,
  sortCategories,
} from '../src/ui/format.js'
import { t as translate } from '../src/i18n/index.js'
import { handler as menuHandler, visibleCategories } from '../plugins/main/menu.js'

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
  subHint: 'Ketik .menu untuk menu utama yaa~',
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

test('formatMenu: perintah dari beberapa kategori tampil semua', () => {
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
})

test('formatMenuCategory: hanya perintah kategori itu', () => {
  const out = formatMenuCategory({ category: sampleCategories[1], labels })
  assert.match(out, /╭─❏ 📥 「 DOWNLOADER 」/)
  assert.match(out, /│ ◦ \.spotify/)
  assert.ok(!out.includes('.ping'))
})

test('formatWibDateTime dan bagian tanggal/jam: pola Indonesia WIB', () => {
  const date = new Date('2026-11-04T06:52:00Z')
  assert.equal(formatWibDate(date, 'id'), 'Rabu, 4 November 2026')
  assert.equal(formatWibClock(date, 'id'), '13:52')
  assert.match(formatWibDateTime(date, 'id'), /Rabu, 4 November 2026 • 13:52 WIB/)
})

test('sortCategories: urutan kenal dulu, sisanya alfabetis', () => {
  assert.deepEqual(sortCategories(['owner', 'zzz', 'main', 'download']), ['main', 'download', 'owner', 'zzz'])
})

test('visibleCategories: owner disembunyikan dari non-owner', () => {
  assert.deepEqual(visibleCategories(sampleCategories, false).map((c) => c.key), ['main', 'download'])
  assert.deepEqual(visibleCategories(sampleCategories, true).map((c) => c.key), ['main', 'download', 'owner'])
})

const fakePlugins = [
  { config: { name: 'ping', category: 'main', alias: [] } },
  { config: { name: 'menu', category: 'main', alias: ['m'] } },
  { config: { name: 'spotify', category: 'download', alias: ['sp'] } },
  { config: { name: 'joke', category: 'fun', alias: [] } },
  { config: { name: 'owner', category: 'owner', alias: ['status'] } },
]
const TOTAL_FAKE_COMMANDS = 8

function fakeSock({ withRelay = true } = {}) {
  const sent = []
  const relayed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return {}
    },
    waUploadToServer: async () => ({
      mediaUrl: 'https://mmg.whatsapp.net/fake-menu',
      directPath: '/fake-menu',
    }),
  }
  if (withRelay) {
    sock.relayMessage = async (jid, message, opts) => {
      relayed.push({ jid, message, opts })
      return {}
    }
  }
  return { sock, sent, relayed }
}

function fakeCtx(sock, { args = [], isOwner = false } = {}) {
  const replies = []
  const chat = '628123@s.whatsapp.net'
  const ctx = {
    sock,
    chat,
    sender: chat,
    senderDigits: '628123',
    botJid: '6285187605007@s.whatsapp.net',
    raw: {
      key: { remoteJid: chat, fromMe: false, id: 'msg-1' },
      pushName: 'Senpai',
    },
    lang: 'id',
    args,
    text: args.join(' '),
    isOwner,
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

function interactiveOf(relayed) {
  assert.equal(relayed.length, 1, 'menu utama mengirim satu relayMessage')
  return relayed[0].message.interactiveMessage
}

function parsedButtons(interactive) {
  return (interactive.nativeFlowMessage?.buttons ?? []).map((button) => ({
    name: button.name,
    params: JSON.parse(button.buttonParamsJson || '{}'),
  }))
}

function selectionRows(interactive) {
  return parsedButtons(interactive)
    .filter((button) => button.name === 'single_select')
    .flatMap((button) => button.params.sections ?? [])
    .flatMap((section) => section.rows ?? [])
}

function quickReplyIds(interactive) {
  return parsedButtons(interactive)
    .filter((button) => button.name === 'quick_reply')
    .map((button) => button.params.id)
}

function assertNoExternalCard(value) {
  assert.ok(!JSON.stringify(value).includes('external' + 'AdReply'), 'payload tidak memakai kartu iklan eksternal')
  assert.ok(!JSON.stringify(value).includes('forwardedNewsletterMessageInfo'), 'payload tidak mengarang info newsletter')
}

function assertTroli(quoted, { itemCount }) {
  assert.deepEqual(quoted.key, {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
  })
  const order = quoted.message.orderMessage
  assert.equal(order.orderId, '1337')
  assert.equal(order.itemCount, itemCount)
  assert.equal(order.status, 'INQUIRY')
  assert.equal(order.surface, 'CATALOG')
  assert.equal(order.message, `KANA - ${itemCount} Commands`)
  assert.equal(order.orderTitle, `📋 ${itemCount} Commands`)
  assert.equal(order.sellerJid, '6285187605007@s.whatsapp.net')
  assert.equal(order.token, 'ARpfsm5NXcUGrAkaExuw')
  assert.equal(order.totalAmount1000, 0)
  assert.equal(order.totalCurrencyCode, 'IDR')
  assert.deepEqual(order.contextInfo, { isForwarded: true, forwardingScore: 9999 })
  assert.ok(Buffer.isBuffer(order.thumbnail), 'thumbnail troli berupa Buffer')
  const decoded = jpeg.decode(order.thumbnail, { useTArray: true })
  assert.equal(decoded.width, 300)
  assert.equal(decoded.height, 300)
}

test('handler menu utama: MB.Button Cantarella dengan gambar, selection kategori, dan quick reply', async () => {
  const { sock, sent, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await menuHandler(ctx)

  assert.equal(sent.length, 1, 'hanya reaksi loading yang lewat sendMessage')
  assert.equal(sent[0].content.react.text, '⏳')

  const interactive = interactiveOf(relayed)
  assert.equal(interactive.header.title, 'KANA')
  assert.equal(interactive.header.hasMediaAttachment, true)
  assert.ok(interactive.header.imageMessage, 'header MB.Button memuat gambar banner')
  assert.match(interactive.body.text, /Haii @628123~/)
  assert.match(interactive.body.text, /Nama : KANA/)
  assert.match(interactive.body.text, /Owner : OmniDevv/)
  assert.match(interactive.body.text, /Uptime :/)
  assert.match(interactive.body.text, /Memori : .* MB/)
  assert.match(interactive.body.text, /Total Perintah : 8 perintah/)
  assert.match(interactive.body.text, /Jam : \d{2}:\d{2} WIB/)
  assert.match(interactive.body.text, /Tanggal : /)
  assert.match(interactive.body.text, /github\.com\/OmmniDevv\/kana-md/)
  assert.equal(interactive.footer.text, 'KANA, bot WhatsApp moe')
  assert.deepEqual(interactive.contextInfo.mentionedJid, ['628123@s.whatsapp.net'])
  assert.equal(interactive.contextInfo.forwardingScore, 999)
  assert.equal(interactive.contextInfo.isForwarded, true)
  assert.equal(interactive.contextInfo.quotedMessage.contactMessage.displayName, 'KANA')
  assert.match(interactive.contextInfo.quotedMessage.contactMessage.vcard, /FN:KANA/)

  const params = JSON.parse(interactive.nativeFlowMessage.messageParamsJson)
  assert.equal(params.limited_time_offer.url, 'https://github.com/OmmniDevv/kana-md')
  assert.equal(params.bottom_sheet.list_title, 'Pilih Kategori Menu')
  assert.equal(params.bottom_sheet.button_title, 'Jelajahi Menu Sekarang')

  const buttons = parsedButtons(interactive)
  assert.ok(buttons.some((button) => button.name === 'single_select'), 'ada tombol single_select')
  assert.ok(buttons.some((button) => button.name === 'cta_url'), 'ada tombol repo')
  assert.ok(buttons.some((button) => button.name === 'cta_copy'), 'ada tombol salin')
  assert.deepEqual(
    selectionRows(interactive).map((row) => row.id),
    ['.menu main', '.menu download', '.menu fun']
  )
  assert.deepEqual(quickReplyIds(interactive), ['.menu all', '.ping'])
  assertNoExternalCard(relayed[0].message)
})

test('handler menu utama owner: quick reply Panel Owner dan row owner tampil', async () => {
  const { sock, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, { isOwner: true })
  await menuHandler(ctx)
  const interactive = interactiveOf(relayed)
  assert.ok(selectionRows(interactive).some((row) => row.id === '.menu owner'))
  assert.deepEqual(quickReplyIds(interactive), ['.menu all', '.ping', '.menu owner'])
})

test('handler menu utama: MB.Button gagal memicu fallback image+caption berisi daftar kategori', async () => {
  const { sock, sent, relayed } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock)
  await menuHandler(ctx)
  assert.equal(relayed.length, 0)
  assert.equal(sent.length, 2, 'reaksi loading plus satu fallback')
  const fallback = sent[1]
  assert.ok(Buffer.isBuffer(fallback.content.image), 'fallback memakai banner sebagai image')
  assert.match(fallback.content.caption, /Haii @628123~/)
  assert.match(fallback.content.caption, /\*\.menu main\*/)
  assert.match(fallback.content.caption, /\*\.menu download\*/)
  assert.match(fallback.content.caption, /\*\.menu fun\*/)
  assert.ok(!fallback.content.caption.includes('*.menu owner*'), 'kategori owner tidak ditawarkan ke non-owner')
  assert.deepEqual(fallback.content.contextInfo, {
    mentionedJid: ['628123@s.whatsapp.net'],
    forwardingScore: 999,
    isForwarded: true,
  })
  assert.equal(fallback.opts.quoted.message.contactMessage.displayName, 'KANA')
  assert.match(fallback.opts.quoted.message.contactMessage.vcard, /FN:KANA/)
  assertNoExternalCard(fallback.content)
})

test('handler .menu download: satu pesan teks kategori dengan quoted troli', async () => {
  const { sock, sent, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['download'] })
  await menuHandler(ctx)
  assert.equal(relayed.length, 0)
  assert.equal(sent.length, 1, 'kategori hanya mengirim satu pesan')
  const { content, opts } = sent[0]
  assert.match(content.text, /│ ◦ \.spotify/)
  assert.ok(!content.text.includes('│ ◦ .ping'), 'perintah kategori lain tidak tampil')
  assert.deepEqual(content.contextInfo, {
    mentionedJid: ['628123@s.whatsapp.net'],
    forwardingScore: 9,
    isForwarded: true,
  })
  assertTroli(opts.quoted, { itemCount: TOTAL_FAKE_COMMANDS })
  assertNoExternalCard(content)
  assertNoExternalCard(opts.quoted)
})

test('handler .menu all: satu pesan teks penuh dengan quoted troli dan contextInfo sumber', async () => {
  const { sock, sent, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['all'] })
  await menuHandler(ctx)
  assert.equal(relayed.length, 0)
  assert.equal(sent.length, 1, 'menu all hanya mengirim satu pesan')
  const { content, opts } = sent[0]
  assert.match(content.text, /│ ◦ \.ping/)
  assert.match(content.text, /│ ◦ \.spotify/)
  assert.match(content.text, /│ ◦ \.joke/)
  assert.ok(!content.text.includes('│ ◦ .owner'), 'perintah owner disembunyikan dari non-owner')
  assert.deepEqual(content.contextInfo, {
    mentionedJid: ['628123@s.whatsapp.net'],
    forwardingScore: 9,
    isForwarded: true,
  })
  assertTroli(opts.quoted, { itemCount: TOTAL_FAKE_COMMANDS })
  assertNoExternalCard(content)
  assertNoExternalCard(opts.quoted)
})

test('handler .menu all owner: kategori owner tampil untuk owner', async () => {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, { args: ['all'], isOwner: true })
  await menuHandler(ctx)
  assert.match(sent[0].content.text, /│ ◦ \.owner/)
})

test('handler .menu owner: non-owner ditolak tanpa mengirim menu', async () => {
  const { sock, sent, relayed } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, { args: ['owner'] })
  await menuHandler(ctx)
  assert.equal(sent.length, 0)
  assert.equal(relayed.length, 0)
  assert.equal(replies.length, 1)
  assert.match(replies[0], /khusus Master/)
})

test('handler .menu <kategori tak dikenal>: balasan jelas berisi daftar kategori yang terlihat', async () => {
  const { sock } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, { args: ['ngawur'] })
  await menuHandler(ctx)
  assert.equal(replies.length, 1)
  assert.match(replies[0], /nggak ada/)
  assert.match(replies[0], /download/)
  assert.ok(!replies[0].includes('owner'), 'kategori owner tidak dibocorkan ke non-owner')
})
