import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createCanvas } from '@napi-rs/canvas'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say as sayPersona } from '../src/persona/moe.js'
import { dispatchReply, getReplyBinding } from '../src/ui/reply-router.js'
import { renderWaProfileCard, formatWaNumber } from '../src/ui/wa-profile-card.js'
import {
  handler as topHandler,
  i18n as topI18n,
  pickTop,
  memberJids,
  formatTop,
} from '../plugins/fun/top.js'
import {
  handler as waCanvasHandler,
  i18n as waCanvasI18n,
  resolveTargetJid,
} from '../plugins/fun/wa-canvas.js'
import { handler as tembakHandler } from '../plugins/fun/tembak.js'
import { handler as terimaHandler, i18n as terimaI18n } from '../plugins/fun/terima.js'
import { handler as tolakHandler, i18n as tolakI18n } from '../plugins/fun/tolak.js'
import { i18n as nembakI18n } from '../plugins/fun/nembak.js'

for (const mod of [topI18n, waCanvasI18n, terimaI18n, tolakI18n, nembakI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}

const tId = (k, vars) => translate('id', k, vars)
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])

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
      return { key: { id: 'MSG1' } }
    },
    relayMessage: async () => ({}),
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
    pushName: 'Penembak',
    isGroup: true,
    isOwner: false,
    args: [],
    text: '',
    command: '',
    lang: 'id',
    raw: { key: { id: 'RAW1' } },
    botJid: '6285187605007@s.whatsapp.net',
    mentionedJids: [],
    quoted: null,
    t: tId,
    say: (mood) => sayPersona('id', mood),
    reply: async (txt) => {
      replies.push(txt)
      return {}
    },
    storage: fakeStorage(),
    getGroupMetadata: async () => null,
    ...over,
  }
  return { ctx, replies }
}

/* ---------------- D: .top leaderboard grup ---------------- */

const GROUP_PARTICIPANTS = [
  ...Array.from({ length: 12 }, (_, i) => ({ id: `62820${i}@s.whatsapp.net`, admin: null })),
  { id: '6285187605007@s.whatsapp.net', admin: null }, // bot, wajib tersaring
  { id: '628200@s.whatsapp.net', admin: null }, // duplikat digit peserta pertama
]

test('top: memberJids menyaring bot dan duplikat', () => {
  const members = memberJids(GROUP_PARTICIPANTS, '6285187605007@s.whatsapp.net')
  assert.equal(members.length, 12)
  assert.ok(!members.some((j) => j.startsWith('6285187605007@')))
})

test('top: pickTop menghormati count dan rng yang disuntik', () => {
  const picked = pickTop(GROUP_PARTICIPANTS, { botJid: '6285187605007@s.whatsapp.net', count: 10, rng: () => 0.42 })
  assert.equal(picked.length, 10)
  assert.equal(new Set(picked).size, 10)
  const all = pickTop(GROUP_PARTICIPANTS.slice(0, 3), { botJid: '', count: 10, rng: () => 0.1 })
  assert.equal(all.length, 3, 'kurang dari 10 member: ambil semua')
})

test('top: formatTop memuat medali, mention digit, dan judul topik', () => {
  const picked = ['628201@s.whatsapp.net', '628202@s.whatsapp.net']
  const text = formatTop(tId, 'gay', picked)
  assert.match(text, /TOP 2 GAY/)
  assert.match(text, /🥇 @628201/)
  assert.match(text, /🥈 @628202/)
})

test('top: handler mengirim 10 mention beneran dengan judul topik', async () => {
  const { sock, sent } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, {
    text: 'gay',
    groupMetadata: { participants: GROUP_PARTICIPANTS },
  })
  await topHandler(ctx)
  assert.equal(replies.length, 0)
  assert.equal(sent.length, 1)
  const { content } = sent[0]
  assert.match(content.text, /TOP 10 GAY/)
  assert.equal(content.mentions.length, 10)
  assert.ok(!content.mentions.some((j) => j.startsWith('6285187605007@')))
  for (const jid of content.mentions) {
    assert.ok(content.text.includes(`@${jid.split('@')[0]}`), `teks harus men-tag ${jid}`)
  }
})

test('top: tanpa topik membalas cara pakai, grup kecil membalas member kurang', async () => {
  const { sock } = fakeSock()
  const noTopic = fakeCtx(sock, { text: '', groupMetadata: { participants: GROUP_PARTICIPANTS } })
  await topHandler(noTopic.ctx)
  assert.match(noTopic.replies[0], /Contoh: \*\.top gay\*/)

  const small = fakeCtx(sock, {
    text: 'jago',
    groupMetadata: { participants: [{ id: '628201@s.whatsapp.net' }, { id: '6285187605007@s.whatsapp.net' }] },
  })
  await topHandler(small.ctx)
  assert.match(small.replies[0], /kurang dari 2/)
})

/* ---------------- E: .wa-canvas kartu profil WA ---------------- */

test('wa-profile-card: formatWaNumber ala tampilan WA', () => {
  assert.equal(formatWaNumber('6281234567890'), '+62 812-3456-7890')
  assert.equal(formatWaNumber('081234567890'), '+62 812-3456-7890')
  assert.equal(formatWaNumber(''), '')
})

test('wa-profile-card: render menghasilkan PNG valid, placeholder maupun berfoto', async () => {
  const plain = await renderWaProfileCard({ name: 'Budi Santoso', number: '6281234567890', status: 'Sibuk' })
  assert.ok(Buffer.isBuffer(plain))
  assert.ok(plain.subarray(0, 4).equals(PNG_MAGIC), 'magic bytes harus PNG')
  assert.ok(plain.length > 5000, `PNG terlalu kecil: ${plain.length}`)

  const avatarCanvas = createCanvas(64, 64)
  const actx = avatarCanvas.getContext('2d')
  actx.fillStyle = '#00a884'
  actx.fillRect(0, 0, 64, 64)
  const withPhoto = await renderWaProfileCard({
    name: 'Budi Santoso',
    number: '6281234567890',
    status: 'Halo',
    avatarBuffer: avatarCanvas.toBuffer('image/png'),
  })
  assert.ok(withPhoto.subarray(0, 4).equals(PNG_MAGIC))
  assert.notEqual(withPhoto.length, plain.length, 'kartu berfoto harus beda dari placeholder')
})

test('wa-canvas: resolveTargetJid mengutamakan mention, lalu reply, lalu pengirim', () => {
  const base = { sender: '628111@s.whatsapp.net', mentionedJids: [], quoted: null }
  assert.equal(resolveTargetJid({ ...base, mentionedJids: ['628222@s.whatsapp.net'] }), '628222@s.whatsapp.net')
  assert.equal(resolveTargetJid({ ...base, quoted: { sender: '628333@s.whatsapp.net' } }), '628333@s.whatsapp.net')
  assert.equal(resolveTargetJid(base), '628111@s.whatsapp.net')
})

test('wa-canvas: handler mengirim pesan gambar PNG valid (tanpa foto profil)', async () => {
  const { sock, sent } = fakeSock({ profilePictureUrl: async () => null })
  const { ctx } = fakeCtx(sock, { text: '' })
  await waCanvasHandler(ctx)
  assert.equal(sent.length, 1)
  const { content } = sent[0]
  assert.ok(Buffer.isBuffer(content.image))
  assert.ok(content.image.subarray(0, 4).equals(PNG_MAGIC), 'gambar terkirim harus PNG valid')
  assert.match(content.caption, /FAKE WHATSAPP PROFILE/)
  assert.match(content.caption, /\+62 811-1/)
})

test('wa-canvas: handler memakai gambar yang di-reply dan override Nama | Nomor | Status', async () => {
  const avatarCanvas = createCanvas(48, 48)
  avatarCanvas.getContext('2d').fillRect(0, 0, 48, 48)
  const quotedPng = avatarCanvas.toBuffer('image/png')
  const { sock, sent } = fakeSock({ profilePictureUrl: async () => null })
  const { ctx } = fakeCtx(sock, {
    text: 'Budi | 6281234567890 | Rajin',
    quoted: { sender: '628999@s.whatsapp.net', stanzaId: 'Q1', message: { imageMessage: {} } },
    downloadQuoted: async () => ({ buffer: quotedPng }),
  })
  await waCanvasHandler(ctx)
  const { content } = sent[0]
  assert.ok(content.image.subarray(0, 4).equals(PNG_MAGIC))
  assert.match(content.caption, /Budi/)
  assert.match(content.caption, /\+62 812-3456-7890/)
  assert.match(content.caption, /Rajin/)
})

/* ---------------- F: alur tembak / terima / tolak ---------------- */

const SHOOTER = '628111'
const TARGET = '628222'

async function shoot(storage) {
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, {
    storage,
    sender: `${SHOOTER}@s.whatsapp.net`,
    senderDigits: SHOOTER,
    mentionedJids: [`${TARGET}@s.whatsapp.net`],
  })
  await tembakHandler(ctx)
  return { sock, sent }
}

test('tembak lalu terima: pasangan tercatat dua arah dan sesi tertutup', async () => {
  const storage = fakeStorage()
  const { sent } = await shoot(storage)
  assert.ok(sent[0].content.text.includes(`@${TARGET}`), 'pengumuman harus men-tag target')
  const binding = await getReplyBinding(storage, '120363000000000000@g.us')
  assert.equal(binding?.kind, 'nembak')
  assert.equal(binding?.ownerDigits, TARGET)

  const { sock, sent: sentAccept } = fakeSock()
  const { ctx } = fakeCtx(sock, {
    storage,
    sender: `${TARGET}@s.whatsapp.net`,
    senderDigits: TARGET,
  })
  await terimaHandler(ctx)
  assert.match(sentAccept.at(-1).content.text, /JADIAN/)
  assert.equal((await storage.get('couples', SHOOTER))?.partner, TARGET)
  assert.equal((await storage.get('couples', TARGET))?.partner, SHOOTER)
  assert.equal(await getReplyBinding(storage, '120363000000000000@g.us'), null, 'sesi harus tertutup')
})

test('tembak lalu tolak: tidak ada pasangan dan sesi tertutup', async () => {
  const storage = fakeStorage()
  await shoot(storage)
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, {
    storage,
    sender: `${TARGET}@s.whatsapp.net`,
    senderDigits: TARGET,
  })
  await tolakHandler(ctx)
  assert.match(sent.at(-1).content.text, /DITOLAK/)
  assert.equal(await storage.get('couples', SHOOTER), undefined)
  assert.equal(await storage.get('couples', TARGET), undefined)
  assert.equal(await getReplyBinding(storage, '120363000000000000@g.us'), null)
})

test('terima tanpa ada yang nembak: ditolak sopan, tidak ada pasangan', async () => {
  const storage = fakeStorage()
  const { sock } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, {
    storage,
    sender: `${TARGET}@s.whatsapp.net`,
    senderDigits: TARGET,
  })
  await terimaHandler(ctx)
  assert.match(replies[0], /BELUM ADA TEMBAKAN/)
  assert.equal(await storage.get('couples', TARGET), undefined)
})

test('terima oleh orang yang bukan target: tidak berlaku, sesi tetap menunggu', async () => {
  const storage = fakeStorage()
  await shoot(storage)
  const { sock } = fakeSock()
  const { ctx, replies } = fakeCtx(sock, {
    storage,
    sender: '628333@s.whatsapp.net',
    senderDigits: '628333',
  })
  await terimaHandler(ctx)
  assert.match(replies[0], /BUKAN BUAT KAMU/)
  assert.equal(await storage.get('couples', SHOOTER), undefined)
  const binding = await getReplyBinding(storage, '120363000000000000@g.us')
  assert.equal(binding?.ownerDigits, TARGET, 'tawaran harus tetap menunggu target asli')
})

test('alur reply-first: membalas pesan tembakan dengan kata terima menutup sesi jadi pasangan', async () => {
  const storage = fakeStorage()
  await shoot(storage)
  const { sock } = fakeSock()
  const { ctx } = fakeCtx(sock, {
    storage,
    sender: `${TARGET}@s.whatsapp.net`,
    senderDigits: TARGET,
    text: 'terima',
    quoted: { stanzaId: 'MSG1', sender: `${SHOOTER}@s.whatsapp.net`, message: {} },
  })
  const handled = await dispatchReply(ctx)
  assert.equal(handled, false, 'router mengembalikan false untuk pesan yang dikonsumsi')
  assert.equal((await storage.get('couples', SHOOTER))?.partner, TARGET)
  assert.equal((await storage.get('couples', TARGET))?.partner, SHOOTER)
})

test('tembakan timbal balik langsung jadian (pola Elaina)', async () => {
  const storage = fakeStorage()
  await shoot(storage)
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, {
    storage,
    sender: `${TARGET}@s.whatsapp.net`,
    senderDigits: TARGET,
    mentionedJids: [`${SHOOTER}@s.whatsapp.net`],
  })
  await tembakHandler(ctx)
  assert.match(sent.at(-1).content.text, /JADIAN/)
  assert.equal((await storage.get('couples', SHOOTER))?.partner, TARGET)
  assert.equal(await getReplyBinding(storage, '120363000000000000@g.us'), null)
})
