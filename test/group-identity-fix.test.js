import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createCanvas } from '@napi-rs/canvas'
import { createPipeline, jidUserDigits } from '../src/core/pipeline.js'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { participantPhoneJid, resolveGroupMembers } from '../src/services/group-members.js'
import { memberJids, formatTop, handler as topHandler, i18n as topI18n } from '../plugins/fun/top.js'
import { before as topchatBefore, handler as topchatHandler, aggregateTopchat, i18n as topchatI18n } from '../plugins/group/topchat.js'
import { handler as shipHandler, resolveShipTarget, i18n as shipI18n } from '../plugins/canvas/ship.js'

for (const mod of [topI18n, topchatI18n, shipI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}
const tId = (k, vars) => translate('id', k, vars)
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])

function tinyPngBuffer() {
  const canvas = createCanvas(2, 2)
  return canvas.toBuffer('image/png')
}

/* ---------- 1. Gerbang botAdmin: digit bot dari sock.user ---------- */

test('jidUserDigits memotong suffix perangkat dari JID koneksi', () => {
  assert.equal(jidUserDigits('6285187605007:14@s.whatsapp.net'), '6285187605007')
  assert.equal(jidUserDigits('99887766554433:14@lid'), '99887766554433')
  assert.equal(jidUserDigits('6285187605007@s.whatsapp.net'), '6285187605007')
  assert.equal(jidUserDigits(''), '')
  assert.equal(jidUserDigits(undefined), '')
})

function gateSetup({ participants, botUser }) {
  const storage = memoryStorage()
  const origGet = storage.get.bind(storage)
  storage.get = async (ns, key) => {
    const value = await origGet(ns, key)
    if (ns === 'users' && key === '628123') return { registered: true, ...(value ?? {}) }
    return value
  }
  let handled = 0
  const linkgrup = {
    config: { name: 'linkgrup', cooldown: 0, isGroup: true, isBotAdmin: true },
    handler: async () => { handled += 1 },
  }
  const registry = {
    resolve: (c) => (c === 'linkgrup' ? linkgrup : undefined),
    list: () => [linkgrup],
    quarantined: [],
    befores: [],
    participantHandlers: [],
  }
  const pipeline = createPipeline({ registry, storage, owners: ['628999'], defaultLang: 'id' })
  const sent = []
  const sock = {
    user: botUser,
    sendMessage: async (jid, content) => { sent.push({ jid, content }); return {} },
    groupMetadata: async () => ({ participants }),
  }
  const raw = {
    key: { remoteJid: '120363409948890046@g.us', participant: '628123@s.whatsapp.net', fromMe: false, id: `g${Math.random()}` },
    pushName: 'Senpai',
    message: { conversation: '.linkgrup' },
  }
  return { pipeline, sock, sent, raw, handledCount: () => handled }
}

const BOT_USER_SUFFIXED = { id: '6285187605007:14@s.whatsapp.net', lid: '99887766554433:14@lid' }

test('botAdmin gate: lolos untuk peserta PN walau sock.user.id bersuffix perangkat', async () => {
  const s = gateSetup({
    botUser: BOT_USER_SUFFIXED,
    participants: [
      { id: '628123@s.whatsapp.net', admin: 'admin' },
      { id: '6285187605007@s.whatsapp.net', admin: 'admin' },
    ],
  })
  await s.pipeline.handle(s.sock, s.raw)
  assert.equal(s.handledCount(), 1)
  assert.ok(!s.sent.some((m) => /harus jadi admin grup/.test(m.content.text || '')))
})

test('botAdmin gate: lolos untuk peserta bentuk LID dengan phoneNumber dan lid bot', async () => {
  const s = gateSetup({
    botUser: BOT_USER_SUFFIXED,
    participants: [
      { id: '121111111111111@lid', phoneNumber: '628123@s.whatsapp.net', admin: 'admin' },
      { id: '121693670506723@lid', phoneNumber: '6285187605007@s.whatsapp.net', lid: '99887766554433@lid', admin: 'admin' },
    ],
  })
  await s.pipeline.handle(s.sock, s.raw)
  assert.equal(s.handledCount(), 1)
  assert.ok(!s.sent.some((m) => /harus jadi admin grup/.test(m.content.text || '')))
})

test('botAdmin gate: tetap menolak bila bot memang bukan admin', async () => {
  const s = gateSetup({
    botUser: BOT_USER_SUFFIXED,
    participants: [
      { id: '628123@s.whatsapp.net', admin: 'admin' },
      { id: '6285187605007@s.whatsapp.net', admin: null },
    ],
  })
  await s.pipeline.handle(s.sock, s.raw)
  assert.equal(s.handledCount(), 0)
  assert.ok(s.sent.some((m) => /harus jadi admin grup/.test(m.content.text || '')))
})

/* ---------- Helper resolusi member ---------- */

test('group-members: phoneNumber didahulukan, LID tanpa nomor tidak teresolve', () => {
  assert.equal(participantPhoneJid({ id: '121693670506723@lid', phoneNumber: '6285869074622@s.whatsapp.net' }), '6285869074622@s.whatsapp.net')
  assert.equal(participantPhoneJid({ id: '121693670506723@lid' }), null)
  assert.equal(participantPhoneJid('121693670506723@lid'), null)
  assert.equal(participantPhoneJid({ id: '628123@s.whatsapp.net' }), '628123@s.whatsapp.net')
  const { members, byDigits } = resolveGroupMembers([
    { id: '121693670506723@lid', phoneNumber: '6285869074622@s.whatsapp.net', notify: 'OmniDev' },
    { id: '555@lid' },
  ])
  assert.equal(members.length, 1)
  assert.equal(byDigits.get('121693670506723').digits, '6285869074622')
  assert.equal(byDigits.get('6285869074622').name, 'OmniDev')
})

/* ---------- 2. .top: mention member asli, bukan LID ---------- */

const LID_PARTICIPANTS = [
  { id: '111111111111@lid', phoneNumber: '628201@s.whatsapp.net' },
  { id: '222222222222@lid', phoneNumber: '628202@s.whatsapp.net' },
  { id: '333333333333@lid', phoneNumber: '628203@s.whatsapp.net' },
  { id: '444444444444@lid' }, // tanpa phoneNumber: wajib dilewati
  { id: '999999999999@lid', phoneNumber: '6285187605007@s.whatsapp.net' }, // bot
]

test('top: memberJids meresolve LID ke nomor asli dan membuang yang tak teresolve', () => {
  const members = memberJids(LID_PARTICIPANTS, '6285187605007:14@s.whatsapp.net')
  assert.deepEqual(members.sort(), ['628201@s.whatsapp.net', '628202@s.whatsapp.net', '628203@s.whatsapp.net'])
  const text = formatTop(tId, 'gay', members)
  assert.ok(!/111111111111|222222222222|333333333333|444444444444/.test(text), 'teks tidak boleh memuat digit LID')
})

test('top: handler mengirim mention nomor asli untuk peserta LID', async () => {
  const sent = []
  const ctx = {
    text: 'gay',
    botJid: '6285187605007@s.whatsapp.net',
    chat: '120363409948890046@g.us',
    raw: { key: { id: 'R1' } },
    groupMetadata: { participants: LID_PARTICIPANTS },
    t: tId,
    reply: async () => { throw new Error('tidak boleh reply petunjuk') },
    sock: { sendMessage: async (jid, content) => { sent.push(content); return {} } },
  }
  await topHandler(ctx)
  assert.equal(sent.length, 1)
  assert.ok(sent[0].mentions.every((j) => j.endsWith('@s.whatsapp.net')))
  assert.ok(!/111111111111|444444444444/.test(sent[0].text))
})

/* ---------- 3. .topchat: JID grup dan LID tidak tampil ---------- */

const TOPCHAT_PARTICIPANTS = [
  { id: '121693670506723@lid', phoneNumber: '6285869074622@s.whatsapp.net', notify: 'OmniDev' },
  { id: '121222333444@lid', phoneNumber: '6285187605007@s.whatsapp.net' },
]

test('topchat: aggregate menggabungkan kunci LID ke nomor asli dan membuang JID grup', () => {
  const counts = { '120363409948890046': 58, '121693670506723': 4, '6285869074622': 104 }
  const rows = aggregateTopchat(counts, TOPCHAT_PARTICIPANTS, '120363409948890046@g.us')
  assert.deepEqual(rows, [['6285869074622', 108]])
})

test('topchat: handler hanya menampilkan member asli', async () => {
  const store = new Map([['chatcount:120363409948890046@g.us', { '120363409948890046': 58, '121693670506723': 4, '6285869074622': 104 }]])
  const sent = []
  const ctx = {
    chat: '120363409948890046@g.us',
    raw: { key: { id: 'R2' } },
    groupMetadata: { participants: TOPCHAT_PARTICIPANTS },
    t: tId,
    say: () => '',
    reply: async (txt) => { sent.push({ text: txt }); return {} },
    storage: { get: async (ns, key) => store.get(`${ns}:${key}`), set: async () => {} },
    sock: { sendMessage: async (jid, content) => { sent.push(content); return {} } },
  }
  await topchatHandler(ctx)
  assert.equal(sent.length, 1)
  assert.match(sent[0].text, /@6285869074622/)
  assert.ok(!sent[0].text.includes('120363409948890046'), 'JID grup tidak boleh tampil')
  assert.ok(!sent[0].text.includes('121693670506723'), 'LID tidak boleh tampil')
  assert.deepEqual(sent[0].mentions, ['6285869074622@s.whatsapp.net'])
})

test('topchat: before menghitung pengirim LID di kunci nomor aslinya', async () => {
  const store = new Map()
  const ctx = {
    isGroup: true,
    chat: '120363409948890046@g.us',
    sender: '121693670506723@lid',
    senderAlt: '6285869074622@s.whatsapp.net',
    raw: { key: { fromMe: false } },
    storage: {
      get: async (ns, key) => store.get(`${ns}:${key}`),
      set: async (ns, key, value) => { store.set(`${ns}:${key}`, value) },
    },
  }
  await topchatBefore(ctx)
  assert.deepEqual(store.get('chatcount:120363409948890046@g.us'), { '6285869074622': 1 })
})

/* ---------- 4. .ship: foto profil dan nickname dari JID nomor asli ---------- */

test('ship: resolveShipTarget meresolve mention LID ke nomor dan nama member', () => {
  const target = resolveShipTarget(TOPCHAT_PARTICIPANTS, '121693670506723@lid')
  assert.deepEqual(target, { jid: '6285869074622@s.whatsapp.net', digits: '6285869074622', name: 'OmniDev' })
})

test('ship: handler mengambil foto profil via JID nomor asli dan caption memakai nomor asli', async () => {
  const ppCalls = []
  const dataUrl = `data:image/png;base64,${tinyPngBuffer().toString('base64')}`
  const sent = []
  const ctx = {
    chat: '120363409948890046@g.us',
    sender: '6285869074622@s.whatsapp.net',
    pushName: 'OmniDev',
    mentionedJids: ['121693670506723@lid', '121222333444@lid'],
    raw: { key: { id: 'R3' } },
    lang: 'id',
    groupMetadata: { participants: TOPCHAT_PARTICIPANTS },
    t: tId,
    reply: async (txt) => { sent.push({ text: txt }); return {} },
    storage: { get: async () => undefined, set: async () => {} },
    sock: {
      profilePictureUrl: async (jid) => { ppCalls.push(jid); return dataUrl },
      sendMessage: async (jid, content) => { sent.push(content); return {} },
    },
  }
  await shipHandler(ctx)
  assert.deepEqual(ppCalls.sort(), ['6285187605007@s.whatsapp.net', '6285869074622@s.whatsapp.net'])
  assert.equal(sent.length, 1)
  assert.ok(sent[0].image.subarray(0, 4).equals(PNG_MAGIC))
  assert.match(sent[0].caption, /@6285869074622/)
  assert.ok(!sent[0].caption.includes('121693670506723'), 'caption tidak boleh memuat LID')
  assert.deepEqual(sent[0].mentions.sort(), ['6285187605007@s.whatsapp.net', '6285869074622@s.whatsapp.net'])
})
