import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import * as infopremium from '../plugins/user/infopremium.js'

for (const [lang, msgs] of Object.entries(infopremium.i18n ?? {})) addMessages(lang, msgs)

const here = dirname(fileURLToPath(import.meta.url))
const QRIS_PATH = join(here, '..', 'web', 'public', 'qris.png')
const PRIVATE = '628111111111@s.whatsapp.net'
const OWNER_DIGITS = '6285869074622'

const PRICES = [
  'Rp3.000', 'Rp8.000', 'Rp20.000', 'Rp50.000',
  'Rp2.000', 'Rp5.000', 'Rp12.000', 'Rp30.000',
  'Rp4.000', 'Rp10.000', 'Rp25.000', 'Rp65.000',
]

function fakeSock({ failSend = false } = {}) {
  const sent = []
  return {
    sent,
    async sendMessage(jid, content, opts) {
      if (failSend) throw new Error('kirim gagal uji')
      sent.push({ jid, content, opts })
      return { key: { id: 'fake' } }
    },
  }
}

function fakeRegistry(plugins = []) {
  return { list: () => plugins }
}

function makeCtx({ sock, registry, lang = 'id' } = {}) {
  const replies = []
  return {
    replies,
    sock,
    chat: PRIVATE,
    registry,
    raw: { key: { remoteJid: PRIVATE, id: 'msg1' }, message: {} },
    t: (k, vars) => translate(lang, k, vars),
    say: (mood) => say(lang, mood),
    reply: async (text, extra) => {
      replies.push({ text, extra })
      return { key: { id: 'reply' } }
    },
  }
}

test('infopremium: mengirim gambar QRIS repo dengan caption pricelist lengkap', async () => {
  process.env.OWNER_NUMBER = OWNER_DIGITS
  const sock = fakeSock()
  const ctx = makeCtx({ sock, registry: fakeRegistry() })
  await infopremium.handler(ctx)
  const img = sock.sent.find((m) => m.content.image)
  assert.ok(img, 'gambar QRIS harus terkirim')
  const qrisBytes = await readFile(QRIS_PATH)
  assert.ok(Buffer.isBuffer(img.content.image))
  assert.ok(img.content.image.equals(qrisBytes), 'gambar harus persis web/public/qris.png')
  assert.equal(img.opts.quoted, ctx.raw)
  for (const price of PRICES) {
    assert.ok(img.content.caption.includes(price), `caption harus memuat ${price}`)
  }
  assert.match(img.content.caption, /PREMIUM DAN SEWA BOT/)
  assert.match(img.content.caption, /QRIS/)
  assert.match(img.content.caption, /tidak termasuk jadibot/)
  assert.ok(img.content.caption.includes(`https://wa.me/${OWNER_DIGITS}`))
  assert.ok(img.content.caption.length <= 1024, 'caption harus muat batas WhatsApp')
  assert.equal(ctx.replies.length, 0)
})

test('infopremium: caption bahasa Inggris memuat pricelist yang sama', async () => {
  process.env.OWNER_NUMBER = OWNER_DIGITS
  const sock = fakeSock()
  const ctx = makeCtx({ sock, registry: fakeRegistry(), lang: 'en' })
  await infopremium.handler(ctx)
  const img = sock.sent.find((m) => m.content.image)
  assert.ok(img, 'gambar QRIS harus terkirim')
  assert.match(img.content.caption, /Price list/)
  for (const price of PRICES) {
    assert.ok(img.content.caption.includes(price), `caption EN harus memuat ${price}`)
  }
})

test('infopremium: ringkasan fitur premium dihitung dari registry', async () => {
  process.env.OWNER_NUMBER = OWNER_DIGITS
  const sock = fakeSock()
  const registry = fakeRegistry([
    { config: { name: 'satu', category: 'ai', premium: true } },
    { config: { name: 'dua', category: 'game', premium: true } },
    { config: { name: 'tiga', category: 'ai' } },
    { config: { name: 'empat', category: 'search', limitGroup: 'download' } },
  ])
  const ctx = makeCtx({ sock, registry })
  await infopremium.handler(ctx)
  const img = sock.sent.find((m) => m.content.image)
  assert.ok(img)
  assert.match(img.content.caption, /\*2 fitur premium\*/)
  assert.match(img.content.caption, /download gratis \*5x\*/)
})

test('infopremium: kegagalan kirim gambar dibalas pesan gagal, bukan crash', async () => {
  process.env.OWNER_NUMBER = OWNER_DIGITS
  const sock = fakeSock({ failSend: true })
  const ctx = makeCtx({ sock, registry: fakeRegistry() })
  await infopremium.handler(ctx)
  assert.equal(ctx.replies.length, 1)
  assert.match(ctx.replies[0].text, /GAGAL/)
  assert.match(ctx.replies[0].text, /kirim gagal uji/)
})
