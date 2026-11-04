import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import {
  applyWarnToSettings,
  detectGambling,
  detectLinks,
  detectPhishing,
  detectToxic,
  floodCheck,
  isValidTime,
} from '../src/services/guard-rules.js'
import { getGroupSettings } from '../src/services/group-service.js'
import * as guard from '../plugins/group/guard.js'
import * as welcome from '../plugins/group/welcome.js'
import * as warnPlugin from '../plugins/group/warn.js'
import { parsePoll } from '../plugins/group/poll.js'

for (const plugin of [guard, welcome, warnPlugin]) {
  for (const [lang, msgs] of Object.entries(plugin.i18n)) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

const CHAT = '120363000@g.us'
const MEMBER = '628111111111@s.whatsapp.net'
const ADMIN = '628222222222@s.whatsapp.net'
const TARGET = '628333333333@s.whatsapp.net'

function fakeSock() {
  const sent = []
  const participantUpdates = []
  return {
    sent,
    participantUpdates,
    async sendMessage(jid, content, opts) {
      sent.push({ jid, content, opts })
      return { key: { id: 'fake' } }
    },
    async groupParticipantsUpdate(jid, jids, action) {
      participantUpdates.push({ jid, jids, action })
      return []
    },
    async groupSettingUpdate() {},
  }
}

function metaWith(adminJids = []) {
  return {
    subject: 'Grup Tes',
    participants: [
      { id: MEMBER, admin: adminJids.includes(MEMBER) ? 'admin' : null },
      { id: ADMIN, admin: adminJids.includes(ADMIN) ? 'admin' : null },
      { id: TARGET, admin: null },
    ],
  }
}

function beforeCtx({ storage, sock, sender = MEMBER, text, adminJids = [] }) {
  return {
    sock,
    chat: CHAT,
    sender,
    senderDigits: sender.replace(/\D/g, ''),
    pushName: 'Tes',
    isGroup: true,
    isOwner: false,
    text,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    storage,
    raw: { key: { remoteJid: CHAT, id: 'msg1', participant: sender } },
    mentionedJids: [],
    getGroupMetadata: async () => metaWith(adminJids),
  }
}

test('guard-rules: deteksi link, judi, phishing, toxic', () => {
  assert.ok(detectLinks('cek https://example.com/x').includes('http'))
  assert.ok(detectLinks('gabung chat.whatsapp.com/abcdef').includes('whatsapp-group'))
  assert.ok(detectLinks('ke www.situs.net/page').length)
  assert.equal(detectLinks('halo semua apa kabar').length, 0)
  assert.ok(detectGambling('main slot gacor maxwin zeus').includes('gacor'))
  assert.equal(detectGambling('besok kita belajar coding').length, 0)
  assert.ok(detectPhishing('klaim hadiah gratis sekarang di bit.ly/abc123').length)
  assert.equal(detectPhishing('selamat pagi semua').length, 0)
  assert.ok(detectToxic('dasar tolol').includes('tolol'))
  assert.ok(detectToxic('kamu custombad', ['custombad']).includes('custombad'))
})

test('guard-rules: floodCheck dan applyWarnToSettings', () => {
  const now = 100000
  assert.equal(floodCheck([now - 100, now - 200, now - 300, now - 400, now - 500, now - 600], now), true)
  assert.equal(floodCheck([now - 100, now - 200], now), false)
  assert.equal(floodCheck([now - 60000, now - 50000], now), false)
  let settings = { warns: {}, warnLimit: 3 }
  let r = applyWarnToSettings(settings, '6283', 3)
  assert.equal(r.count, 1); assert.equal(r.shouldKick, false)
  settings = { warns: r.warns, warnLimit: 3 }
  r = applyWarnToSettings(settings, '6283', 3)
  assert.equal(r.count, 2)
  settings = { warns: r.warns, warnLimit: 3 }
  r = applyWarnToSettings(settings, '6283', 3)
  assert.equal(r.count, 3); assert.equal(r.shouldKick, true)
  assert.equal(r.warns['6283'], undefined)
})

test('jadwalgrup: isValidTime', () => {
  assert.equal(isValidTime('07:00'), true)
  assert.equal(isValidTime('23:59'), true)
  assert.equal(isValidTime('24:00'), false)
  assert.equal(isValidTime('7:00'), false)
  assert.equal(isValidTime('12:60'), false)
  assert.equal(isValidTime('pagi'), false)
})

test('poll: parsePoll memisahkan pertanyaan dan opsi', () => {
  const { question, values } = parsePoll('Makan apa? | Nasi goreng | Mie ayam | Soto')
  assert.equal(question, 'Makan apa?')
  assert.deepEqual(values, ['Nasi goreng', 'Mie ayam', 'Soto'])
})

test('guard before: antilink menghapus pesan link member biasa dan memberi warn', async () => {
  const storage = memoryStorage()
  await storage.set('groups', CHAT, { antilink: true, warnLimit: 3 })
  const sock = fakeSock()
  const ctx = beforeCtx({ storage, sock, text: 'nih link https://example.com/jahat' })
  const result = await guard.before(ctx)
  assert.equal(result, false)
  const deletes = sock.sent.filter((m) => m.content.delete)
  assert.equal(deletes.length, 1)
  assert.deepEqual(deletes[0].content.delete, ctx.raw.key)
  const settings = await getGroupSettings(storage, CHAT)
  assert.equal(settings.warns['628111111111'], 1)
  assert.ok(sock.sent.some((m) => String(m.content.text || '').includes('warn 1/3')))
})

test('guard before: pesan admin tidak disentuh walau berisi link', async () => {
  const storage = memoryStorage()
  await storage.set('groups', CHAT, { antilink: true, warnLimit: 3 })
  const sock = fakeSock()
  const ctx = beforeCtx({ storage, sock, sender: ADMIN, text: 'info resmi https://example.com/ok', adminJids: [ADMIN] })
  const result = await guard.before(ctx)
  assert.notEqual(result, false)
  assert.equal(sock.sent.length, 0)
  const settings = await getGroupSettings(storage, CHAT)
  assert.deepEqual(settings.warns ?? {}, {})
})

test('guard before: antitoxic menghapus tanpa warn', async () => {
  const storage = memoryStorage()
  await storage.set('groups', CHAT, { antitoxic: true })
  const sock = fakeSock()
  const ctx = beforeCtx({ storage, sock, text: 'kamu tolol banget' })
  const result = await guard.before(ctx)
  assert.equal(result, false)
  assert.equal(sock.sent.filter((m) => m.content.delete).length, 1)
  const settings = await getGroupSettings(storage, CHAT)
  assert.deepEqual(settings.warns ?? {}, {})
})

test('welcome: onParticipantsUpdate add mengirim gambar welcome saat aktif', async () => {
  const storage = memoryStorage()
  await storage.set('groups', CHAT, { welcome: true, goodbye: false })
  const sock = fakeSock()
  await welcome.onParticipantsUpdate({
    sock,
    chat: CHAT,
    participants: [MEMBER],
    action: 'add',
    author: ADMIN,
    storage,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    sendText: (txt, mentions) => sock.sendMessage(CHAT, { text: txt, mentions }),
    getGroupMetadata: async () => metaWith(),
  })
  assert.equal(sock.sent.length, 1)
  assert.ok(Buffer.isBuffer(sock.sent[0].content.image))
  assert.ok(sock.sent[0].content.image.length > 0)
  assert.ok(String(sock.sent[0].content.caption).includes('Grup Tes'))
  assert.deepEqual(sock.sent[0].content.mentions, [MEMBER])
})

test('welcome: tidak mengirim apa pun saat welcome mati', async () => {
  const storage = memoryStorage()
  await storage.set('groups', CHAT, { welcome: false })
  const sock = fakeSock()
  await welcome.onParticipantsUpdate({
    sock, chat: CHAT, participants: [MEMBER], action: 'add', author: ADMIN, storage, lang: 'id', t,
    say: (mood) => say('id', mood),
    sendText: (txt, mentions) => sock.sendMessage(CHAT, { text: txt, mentions }),
    getGroupMetadata: async () => metaWith(),
  })
  assert.equal(sock.sent.length, 0)
})

test('warn handler: mencapai batas memicu kick dan reset warn', async () => {
  const storage = memoryStorage()
  await storage.set('groups', CHAT, { warns: { '628333333333': 2 }, warnLimit: 3 })
  const sock = fakeSock()
  const replies = []
  await warnPlugin.handler({
    sock,
    chat: CHAT,
    sender: ADMIN,
    senderDigits: '628222222222',
    isGroup: true,
    isAdmin: true,
    args: [],
    text: '',
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    reply: async (txt) => { replies.push(txt) },
    storage,
    raw: { key: { remoteJid: CHAT, id: 'w1' } },
    quoted: null,
    mentionedJids: [TARGET],
  })
  assert.equal(sock.participantUpdates.length, 1)
  assert.equal(sock.participantUpdates[0].action, 'remove')
  assert.deepEqual(sock.participantUpdates[0].jids, [TARGET])
  const settings = await getGroupSettings(storage, CHAT)
  assert.equal(settings.warns['628333333333'], undefined)
})
