import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { updateGroupSettings } from '../src/services/group-service.js'
import { onParticipantsUpdate, i18n as welcomeI18n } from '../plugins/group/welcome.js'
import { renderIntro, handler as introHandler, i18n as introI18n } from '../plugins/group/intro.js'
import { handler as promoteHandler, isForbiddenError as promoteForbidden, i18n as promoteI18n } from '../plugins/group/promote.js'
import { handler as demoteHandler, isForbiddenError as demoteForbidden, i18n as demoteI18n } from '../plugins/group/demote.js'
import { handler as listmemberHandler, i18n as listmemberI18n } from '../plugins/group/listmember.js'

for (const mod of [welcomeI18n, introI18n, promoteI18n, demoteI18n, listmemberI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}
const t = (k, vars) => translate('id', k, vars)

const CHAT = '120363409948890046@g.us'
// Peserta Grup KANA bentuk LID, persis pola screenshot user 2026-11-05.
const OWNER_LID = { id: '121693670506723@lid', phoneNumber: '6285869074622@s.whatsapp.net', admin: 'superadmin' }
const BOT_LID = { id: '238311041949721@lid', phoneNumber: '6285187605007@s.whatsapp.net', admin: 'admin' }
const TARGET_LID = { id: '258793741017241@lid', phoneNumber: '6283157555852@s.whatsapp.net', admin: null }
const TARGET_LID_ID = '258793741017241@lid'

function fakeSock(meta) {
  const sent = []
  return {
    sent,
    async sendMessage(jid, content, opts) {
      sent.push({ jid, content, opts })
      return { key: { id: 'fake' } }
    },
    async groupMetadata() {
      return meta
    },
  }
}

function sentTexts(sock) {
  return sock.sent.map((m) => String(m.content.text ?? m.content.caption ?? '')).join('\n')
}

function participantsCtx({ sock, storage, cachedMeta, action, participants }) {
  return {
    sock,
    chat: CHAT,
    action,
    participants,
    storage,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    sendText: async (txt, mentions) => sock.sendMessage(CHAT, { text: txt, ...(mentions?.length ? { mentions } : {}) }),
    getGroupMetadata: async () => cachedMeta,
  }
}

/* ---------- 1. welcome/goodbye: resolusi nomor asli + hitungan segar ---------- */

test('goodbye: peserta LID disebut dengan nomor telepon asli, bukan LID, walau metadata segar masih basi', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { goodbye: true })
  const meta = { subject: 'Grup KANA', participants: [OWNER_LID, BOT_LID, TARGET_LID] }
  const sock = fakeSock(meta) // metadata sock masih memuat target (basi)
  const ctx = participantsCtx({ sock, storage, cachedMeta: meta, action: 'remove', participants: [TARGET_LID_ID] })
  await onParticipantsUpdate(ctx)
  const texts = sentTexts(sock)
  assert.ok(texts.includes('6283157555852'), 'sapaan harus menyebut nomor telepon asli')
  assert.ok(!texts.includes('258793741017241'), 'LID mentah tidak boleh tampil')
  assert.ok(texts.includes('2 member'), 'hitungan remove harus 2, bukan 3')
})

test('goodbye: target yang sudah hilang dari metadata segar tetap teresolve dari cache, hitungan 2', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { goodbye: true })
  const fresh = { subject: 'Grup KANA', participants: [OWNER_LID, BOT_LID] }
  const cached = { subject: 'Grup KANA', participants: [OWNER_LID, BOT_LID, TARGET_LID] }
  const sock = fakeSock(fresh)
  const ctx = participantsCtx({ sock, storage, cachedMeta: cached, action: 'remove', participants: [TARGET_LID_ID] })
  await onParticipantsUpdate(ctx)
  const texts = sentTexts(sock)
  assert.ok(texts.includes('6283157555852'), 'nomor asli teresolve dari metadata cache')
  assert.ok(!texts.includes('258793741017241'), 'LID mentah tidak boleh tampil')
  assert.ok(texts.includes('2 member'), 'hitungan dari metadata segar = 2')
})

test('welcome: peserta LID disapa dan dimention dengan nomor asli, hitungan 3', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { welcome: true })
  const meta = { subject: 'Grup KANA', participants: [OWNER_LID, BOT_LID, TARGET_LID] }
  const sock = fakeSock(meta)
  const ctx = participantsCtx({ sock, storage, cachedMeta: meta, action: 'add', participants: [TARGET_LID_ID] })
  await onParticipantsUpdate(ctx)
  const texts = sentTexts(sock)
  assert.ok(texts.includes('@6283157555852'), 'sapaan harus mention nomor asli')
  assert.ok(!texts.includes('258793741017241'), 'LID mentah tidak boleh tampil')
  assert.ok(texts.includes('3 member'), 'hitungan add = 3')
  const withMention = sock.sent.find((m) => m.content.mentions?.length)
  assert.deepEqual(withMention.content.mentions, ['6283157555852@s.whatsapp.net'])
})

test('goodbye: setting goodbye mati berarti tidak ada sapaan', async () => {
  const storage = memoryStorage()
  const meta = { subject: 'Grup KANA', participants: [OWNER_LID, BOT_LID, TARGET_LID] }
  const sock = fakeSock(meta)
  const ctx = participantsCtx({ sock, storage, cachedMeta: meta, action: 'remove', participants: [TARGET_LID_ID] })
  await onParticipantsUpdate(ctx)
  assert.equal(sock.sent.length, 0)
})

/* ---------- 2. intro: placeholder {name} dan kawanannya dirender ---------- */

test('intro: renderIntro merender ejaan Indonesia dan Inggris', () => {
  const out = renderIntro('Halo {name}, selamat datang di grup {group}. Aku {nama}, nomor {nomor} / {number}, grup {grup}', {
    nama: 'Rian',
    nomor: '6281234567890',
    grup: 'Grup KANA',
  })
  assert.equal(out, 'Halo Rian, selamat datang di grup Grup KANA. Aku Rian, nomor 6281234567890 / 6281234567890, grup Grup KANA')
  assert.ok(!out.includes('{'))
})

test('intro: handler merender template grup yang memakai {name}', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { introTemplate: 'Halo {name}, selamat datang di grup' })
  const replies = []
  const ctx = {
    storage,
    chat: CHAT,
    lang: 'id',
    pushName: 'Rian',
    sender: '6281234567890@s.whatsapp.net',
    groupMetadata: { subject: 'Grup KANA', participants: [] },
    t,
    reply: async (txt) => { replies.push(txt) },
  }
  await introHandler(ctx)
  assert.equal(replies.length, 1)
  assert.ok(replies[0].includes('Halo Rian, selamat datang di grup'))
  assert.ok(!replies[0].includes('{name}'))
})

/* ---------- 3. promote/demote: error forbidden jadi penolakan ramah ---------- */

test('promote/demote: isForbiddenError mengenali forbidden dan 403 saja', () => {
  assert.equal(promoteForbidden(new Error('forbidden')), true)
  assert.equal(promoteForbidden({ output: { statusCode: 403 } }), true)
  assert.equal(promoteForbidden(new Error('koneksi putus')), false)
  assert.equal(demoteForbidden(new Error('forbidden')), true)
  assert.equal(demoteForbidden(new Error('not-authorized')), true)
  assert.equal(demoteForbidden(null), false)
})

function adminCtx({ plugin, failWith }) {
  const replies = []
  const sent = []
  const ctx = {
    chat: CHAT,
    args: ['6285869074622'],
    mentionedJids: [],
    raw: { key: { id: 'm1' } },
    t,
    reply: async (txt) => { replies.push(txt) },
    sock: {
      groupParticipantsUpdate: async () => { throw failWith },
      sendMessage: async (jid, content) => { sent.push(content); return {} },
    },
  }
  return { ctx, replies, sent, plugin }
}

test('promote: error forbidden dibalas penolakan ramah tanpa error mentah', async () => {
  const { ctx, replies } = adminCtx({ failWith: new Error('forbidden') })
  await promoteHandler(ctx)
  assert.equal(replies.length, 1)
  assert.ok(replies[0].includes('tidak bisa KANA ubah'))
  assert.ok(replies[0].includes('6285869074622'))
  assert.ok(!/forbidden/i.test(replies[0]), 'pesan error mentah tidak boleh bocor')
})

test('demote: error forbidden dibalas penolakan ramah tanpa error mentah', async () => {
  const { ctx, replies } = adminCtx({ failWith: new Error('forbidden') })
  await demoteHandler(ctx)
  assert.equal(replies.length, 1)
  assert.ok(replies[0].includes('tidak bisa KANA ubah'))
  assert.ok(!/forbidden/i.test(replies[0]), 'pesan error mentah tidak boleh bocor')
})

test('promote: error lain tetap dilaporkan lewat format gagal biasa', async () => {
  const { ctx, replies } = adminCtx({ failWith: new Error('koneksi putus') })
  await promoteHandler(ctx)
  assert.equal(replies.length, 1)
  assert.ok(replies[0].includes('GAGAL PROMOSI'))
  assert.ok(replies[0].includes('koneksi putus'))
})

/* ---------- 4. listmember: nomor asli, bukan LID ---------- */

test('listmember: daftar member memakai nomor telepon asli dan melewati yang tak teresolve', async () => {
  const replies = []
  const ctx = {
    storage: memoryStorage(),
    chat: CHAT,
    text: '',
    args: [],
    groupMetadata: {
      subject: 'Grup KANA',
      participants: [OWNER_LID, BOT_LID, TARGET_LID, { id: '999000111222333@lid', admin: null }],
    },
    t,
    reply: async (txt) => { replies.push(txt) },
  }
  await listmemberHandler(ctx)
  assert.equal(replies.length, 1)
  const out = replies[0]
  assert.ok(out.includes('6285869074622'))
  assert.ok(out.includes('6285187605007'))
  assert.ok(out.includes('6283157555852'))
  assert.ok(out.includes('(admin)'))
  assert.ok(!out.includes('121693670506723'), 'LID owner tidak boleh tampil')
  assert.ok(!out.includes('258793741017241'), 'LID target tidak boleh tampil')
  assert.ok(!out.includes('999000111222333'), 'peserta tak teresolve dilewati, bukan ditampilkan')
})
