import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { getGroupSettings, updateGroupSettings } from '../src/services/group-service.js'
import * as guard from '../plugins/group/guard.js'
import * as botmode from '../plugins/group/botmode.js'
import * as banchat from '../plugins/group/banchat.js'
import * as setantilinkkick from '../plugins/group/setantilinkkick.js'
import * as cekonlyadmin from '../plugins/group/cekonlyadmin.js'
import * as closePlugin from '../plugins/group/close.js'
import * as openPlugin from '../plugins/group/open.js'
import * as ocgc from '../plugins/group/ocgc.js'
import * as jadwalgroup from '../plugins/group/jadwalgroup.js'
import * as jadwalgrup from '../plugins/group/jadwalgrup.js'
import * as customcmd from '../plugins/group/customcmd.js'
import * as goodbye from '../plugins/group/goodbye.js'
import * as autoreply from '../plugins/group/autoreply.js'
import * as totalpesan from '../plugins/group/totalpesan.js'
import * as groupinfo from '../plugins/group/groupinfo.js'
import * as groupstats from '../plugins/group/groupstats.js'
import * as start from '../plugins/group/start.js'

for (const plugin of [guard, botmode, banchat, setantilinkkick, cekonlyadmin, closePlugin, openPlugin, ocgc, jadwalgroup, jadwalgrup, customcmd, goodbye, autoreply, totalpesan, groupinfo, groupstats, start]) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

const CHAT = '120363000@g.us'
const MEMBER = '628111111111@s.whatsapp.net'
const ADMIN = '628222222222@s.whatsapp.net'
const OWNER = '6285869074622@s.whatsapp.net'

function metaWith(adminJids = []) {
  return {
    id: CHAT,
    subject: 'Grup Tes',
    owner: OWNER,
    creation: 1700000000,
    desc: 'Grup buat tes',
    announce: false,
    participants: [
      { id: MEMBER, admin: adminJids.includes(MEMBER) ? 'admin' : null },
      { id: ADMIN, admin: adminJids.includes(ADMIN) ? 'admin' : null },
      { id: OWNER, admin: 'superadmin' },
    ],
  }
}

function fakeSock(adminJids = []) {
  const sent = []
  const participantUpdates = []
  const settingUpdates = []
  return {
    sent,
    participantUpdates,
    settingUpdates,
    async sendMessage(jid, content, opts) {
      sent.push({ jid, content, opts })
      return { key: { id: 'fake' } }
    },
    async groupParticipantsUpdate(jid, jids, action) {
      participantUpdates.push({ jid, jids, action })
      return []
    },
    async groupSettingUpdate(jid, setting) {
      settingUpdates.push({ jid, setting })
    },
    async groupMetadata() {
      return metaWith(adminJids)
    },
  }
}

function makeCtx({ storage, sock, sender = MEMBER, args = [], text = '', isOwner = false, isAdmin = false, adminJids = [] }) {
  const replies = []
  return {
    replies,
    sock,
    chat: CHAT,
    sender,
    senderDigits: sender.replace(/\D/g, ''),
    pushName: 'Tes',
    isGroup: true,
    isOwner,
    isAdmin,
    isBotAdmin: true,
    args,
    text,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    storage,
    raw: { key: { remoteJid: CHAT, id: 'msg1', participant: sender }, message: {} },
    quoted: null,
    mentionedJids: [],
    botJid: '6285187605007@s.whatsapp.net',
    reply: async (replyText, extra) => {
      replies.push({ text: replyText, extra })
      return { key: { id: 'reply' } }
    },
    getGroupMetadata: async () => metaWith(adminJids),
  }
}

test('setantilinkkick: handler memasang aksi kick di settings grup', async () => {
  const storage = memoryStorage()
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['kick'], isAdmin: true })
  await setantilinkkick.handler(ctx)
  const settings = await getGroupSettings(storage, CHAT)
  assert.equal(settings.antilinkAction, 'kick')
  assert.match(ctx.replies[0].text, /AKSI ANTILINK DIUBAH/)
  assert.match(ctx.replies[0].text, /KICK LANGSUNG/)
})

test('guard before: aksi antilink kick mengeluarkan pengirim link tanpa warn', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { antilink: true, antilinkAction: 'kick', warnLimit: 3 })
  const sock = fakeSock()
  const ctx = makeCtx({ storage, sock, text: 'nih link https://example.com/jahat' })
  const result = await guard.before(ctx)
  assert.equal(result, false)
  assert.equal(sock.participantUpdates.length, 1)
  assert.equal(sock.participantUpdates[0].action, 'remove')
  assert.deepEqual(sock.participantUpdates[0].jids, [MEMBER])
  assert.ok(sock.sent.some((m) => m.content.delete))
  assert.ok(sock.sent.some((m) => String(m.content.text || '').includes('KELUAR KARENA LINK')))
  const settings = await getGroupSettings(storage, CHAT)
  assert.deepEqual(settings.warns ?? {}, {})
})

test('botmode: handler memasang mode dan before menegakkan mode admin', async () => {
  const storage = memoryStorage()
  const handlerCtx = makeCtx({ storage, sock: fakeSock(), args: ['admin'], isAdmin: true })
  await botmode.handler(handlerCtx)
  assert.match(handlerCtx.replies[0].text, /MODE BOT DIUBAH/)
  const settings = await getGroupSettings(storage, CHAT)
  assert.equal(settings.botMode, 'admin')

  const memberCtx = makeCtx({ storage, sock: fakeSock(), text: '.menu' })
  assert.equal(await botmode.before(memberCtx), false)
  const adminCtx = makeCtx({ storage, sock: fakeSock([ADMIN]), sender: ADMIN, text: '.menu', adminJids: [ADMIN] })
  assert.equal(await botmode.before(adminCtx), undefined)
})

test('botmode: mode diam memblokir admin kecuali perintah botmode sendiri', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { botMode: 'diam' })
  const adminMenu = makeCtx({ storage, sock: fakeSock([ADMIN]), sender: ADMIN, text: '.menu', adminJids: [ADMIN] })
  assert.equal(await botmode.before(adminMenu), false)
  const adminMode = makeCtx({ storage, sock: fakeSock([ADMIN]), sender: ADMIN, text: '.botmode publik', adminJids: [ADMIN] })
  assert.equal(await botmode.before(adminMode), undefined)
  const ownerCtx = makeCtx({ storage, sock: fakeSock(), sender: OWNER, text: '.menu', isOwner: true })
  assert.equal(await botmode.before(ownerCtx), undefined)
})

test('cekonlyadmin: melaporkan AKTIF saat mode bot admin', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { botMode: 'admin' })
  const ctx = makeCtx({ storage, sock: fakeSock() })
  await cekonlyadmin.handler(ctx)
  assert.match(ctx.replies[0].text, /STATUS ONLYADMIN/)
  assert.match(ctx.replies[0].text, /AKTIF/)
})

test('banchat: handler owner memban grup dan before menolak non-owner', async () => {
  const storage = memoryStorage()
  const ownerCtx = makeCtx({ storage, sock: fakeSock(), sender: OWNER, isOwner: true })
  await banchat.handler(ownerCtx)
  assert.match(ownerCtx.replies[0].text, /GRUP DIBAN/)
  const settings = await getGroupSettings(storage, CHAT)
  assert.equal(settings.banchat, true)

  const memberCtx = makeCtx({ storage, sock: fakeSock(), text: '.menu' })
  assert.equal(await banchat.before(memberCtx), false)
  const ownerMsg = makeCtx({ storage, sock: fakeSock(), sender: OWNER, text: '.banchat off', isOwner: true })
  assert.equal(await banchat.before(ownerMsg), undefined)
})

test('close dan open: memanggil groupSettingUpdate yang benar', async () => {
  const storage = memoryStorage()
  const sockClose = fakeSock()
  const ctxClose = makeCtx({ storage, sock: sockClose, isAdmin: true })
  await closePlugin.handler(ctxClose)
  assert.deepEqual(sockClose.settingUpdates, [{ jid: CHAT, setting: 'announcement' }])
  assert.match(ctxClose.replies[0].text, /GRUP DITUTUP/)

  const sockOpen = fakeSock()
  const ctxOpen = makeCtx({ storage, sock: sockOpen, isAdmin: true })
  await openPlugin.handler(ctxOpen)
  assert.deepEqual(sockOpen.settingUpdates, [{ jid: CHAT, setting: 'not_announcement' }])
  assert.match(ctxOpen.replies[0].text, /GRUP DIBUKA/)
})

test('ocgc: argumen tutup lalu buka tersimpan ke openClose yang sama', async () => {
  const storage = memoryStorage()
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['22:00', '06:00'], isAdmin: true })
  await ocgc.handler(ctx)
  assert.match(ctx.replies[0].text, /OCGC DIATUR/)
  const settings = await getGroupSettings(storage, CHAT)
  assert.deepEqual(settings.openClose, { open: '06:00', close: '22:00', state: null })
})

test('jadwalgroup: delegasi ke jadwalgrup memasang openClose buka lalu tutup', async () => {
  const storage = memoryStorage()
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['21:00', '06:00'], isAdmin: true })
  await jadwalgroup.handler(ctx)
  const settings = await getGroupSettings(storage, CHAT)
  assert.deepEqual(settings.openClose, { open: '21:00', close: '06:00', state: null })
})

test('autoreply: saklar mati membuat customcmd diam, nyala membalas lagi', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { customCommands: { pagi: 'Selamat pagi juga~' } })
  const sockOn = fakeSock()
  const ctxOn = makeCtx({ storage, sock: sockOn, text: 'pagi' })
  await customcmd.before(ctxOn)
  assert.ok(sockOn.sent.some((m) => String(m.content.text || '').includes('Selamat pagi juga~')))

  await updateGroupSettings(storage, CHAT, { autoreply: false })
  const sockOff = fakeSock()
  const ctxOff = makeCtx({ storage, sock: sockOff, text: 'pagi' })
  await customcmd.before(ctxOff)
  assert.equal(sockOff.sent.length, 0)
})

test('autoreply: add menyimpan pemicu ke data yang sama dengan customcmd', async () => {
  const storage = memoryStorage()
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['add', 'tesbalasan', '=', 'Nyala'], text: 'tesbalasan = Balasan otomatis nyala', isAdmin: true })
  await autoreply.handler(ctx)
  assert.match(ctx.replies[0].text, /PEMICU DISIMPAN/)
  const settings = await getGroupSettings(storage, CHAT)
  assert.equal(settings.customCommands.tesbalasan, 'Balasan otomatis nyala')
})

test('goodbye: perintah menampilkan status dan teks goodbye yang berlaku', async () => {
  const storage = memoryStorage()
  const ctx = makeCtx({ storage, sock: fakeSock() })
  await goodbye.handler(ctx)
  assert.match(ctx.replies[0].text, /GOODBYE GRUP/)
  assert.match(ctx.replies[0].text, /SAMPAI JUMPA/)
})

test('totalpesan: menjumlah hitungan chatcount grup', async () => {
  const storage = memoryStorage()
  await storage.set('chatcount', CHAT, { [MEMBER]: 5, [ADMIN]: 3 })
  const ctx = makeCtx({ storage, sock: fakeSock([ADMIN]) })
  await totalpesan.handler(ctx)
  assert.match(ctx.replies[0].text, /TOTAL PESAN GRUP/)
  assert.match(ctx.replies[0].text, /\*8 pesan\*/)
})

test('groupstats: statistik dari chatcount, metadata, dan proteksi', async () => {
  const storage = memoryStorage()
  await storage.set('chatcount', CHAT, { [MEMBER]: 7, [ADMIN]: 2 })
  await updateGroupSettings(storage, CHAT, { antilink: true, antispam: true })
  const ctx = makeCtx({ storage, sock: fakeSock([ADMIN]) })
  await groupstats.handler(ctx)
  assert.match(ctx.replies[0].text, /GROUP STATISTICS/)
  assert.match(ctx.replies[0].text, /\*9 pesan\*/)
})

test('groupinfo: menampilkan id grup, pemilik, dan jumlah member nyata', async () => {
  const storage = memoryStorage()
  const ctx = makeCtx({ storage, sock: fakeSock() })
  await groupinfo.handler(ctx)
  assert.match(ctx.replies[0].text, /INFO GRUP/)
  assert.match(ctx.replies[0].text, /ID GRUP/)
  assert.ok(ctx.replies[0].text.includes(CHAT))
  assert.match(ctx.replies[0].text, /3 orang/)
})

test('start: mengirim kartu pembuka grup', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const ctx = makeCtx({ storage, sock })
  await start.handler(ctx)
  assert.ok(JSON.stringify(sock.sent).includes('MULAI BERSAMA KANA'))
})
