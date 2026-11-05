import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { getProfile, xpForLevel, wibDateString, DEFAULT_DAILY_LIMIT } from '../src/services/user-service.js'
import { getUsage } from '../src/services/limit.js'
import { getGroupSettings } from '../src/services/group-service.js'
import * as addenergiall from '../plugins/owner/addenergiall.js'
import * as dellevel from '../plugins/owner/dellevel.js'
import * as deluserall from '../plugins/owner/deluserall.js'
import * as hapusdata from '../plugins/owner/hapusdata.js'
import * as resetdb from '../plugins/owner/resetdb.js'
import * as liatgacha from '../plugins/owner/liatgacha.js'
import * as listpc from '../plugins/owner/listpc.js'
import * as templateplugin from '../plugins/owner/templateplugin.js'
import * as grepplugin from '../plugins/owner/grepplugin.js'
import * as scanplugin from '../plugins/owner/scanplugin.js'
import * as creator2 from '../plugins/main/creator2.js'
import * as credit from '../plugins/main/credit.js'
import * as donasi from '../plugins/main/donasi.js'
import * as enable from '../plugins/main/enable.js'
import * as gbbot from '../plugins/main/gbbot.js'
import * as saluran from '../plugins/main/saluran.js'
import * as listch from '../plugins/main/listch.js'
import * as resetlimit from '../plugins/main/resetlimit.js'
import * as stats from '../plugins/main/stats.js'
import * as system from '../plugins/main/system.js'
import * as tqto from '../plugins/main/tqto.js'

const ALL = [addenergiall, dellevel, deluserall, hapusdata, resetdb, liatgacha, listpc, templateplugin, grepplugin, scanplugin, creator2, credit, donasi, enable, gbbot, saluran, listch, resetlimit, stats, system, tqto]
for (const plugin of ALL) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

const PRIVATE = '628111111111@s.whatsapp.net'
const GROUP = '120363000@g.us'
const OWNER_DIGITS = '6285869074622'

function fakeSock({ groups = {}, channels = [] } = {}) {
  const sent = []
  return {
    sent,
    async sendMessage(jid, content, opts) {
      sent.push({ jid, content, opts })
      return { key: { id: 'fake' } }
    },
    async groupFetchAllParticipating() {
      return groups
    },
    async newsletterSubscribed() {
      return channels
    },
  }
}

function makeCtx({ storage, sock, chat = PRIVATE, sender = PRIVATE, args = [], isOwner = true, registry } = {}) {
  const replies = []
  return {
    replies,
    sock,
    chat,
    sender,
    senderDigits: sender.replace(/\D/g, ''),
    pushName: 'Tes',
    isGroup: chat.endsWith('@g.us'),
    isOwner,
    isAdmin: true,
    isBotAdmin: true,
    args,
    text: args.join(' '),
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    storage,
    registry,
    raw: { key: { remoteJid: chat, id: 'msg1' }, message: {} },
    quoted: null,
    mentionedJids: [],
    botJid: '6285187605007@s.whatsapp.net',
    reply: async (replyText, extra) => {
      replies.push({ text: replyText, extra })
      return { key: { id: 'reply' } }
    },
  }
}

test('addenergiall: energi semua user naik dan dibatasi maksimal', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { energy: 10 })
  await storage.set('users', '628222222222', { energy: 95 })
  await storage.set('users', '628333333333:lang', 'id')
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['25'] })
  await addenergiall.handler(ctx)
  assert.match(ctx.replies[0].text, /ADDENERGIALL/)
  assert.match(ctx.replies[0].text, /2 user/)
  assert.equal((await getProfile(storage, '628111111111')).energy, 35)
  assert.equal((await getProfile(storage, '628222222222')).energy, 100)
})

test('addenergiall: tanpa jumlah hanya membalas format', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { energy: 10 })
  const ctx = makeCtx({ storage, sock: fakeSock(), args: [] })
  await addenergiall.handler(ctx)
  assert.match(ctx.replies[0].text, /Format/)
  assert.equal((await getProfile(storage, '628111111111')).energy, 10)
})

test('dellevel: level target turun dan XP dihitung ulang', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { xp: xpForLevel(5) })
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['628111111111', '2'] })
  await dellevel.handler(ctx)
  assert.match(ctx.replies[0].text, /DELLEVEL/)
  assert.equal((await getProfile(storage, '628111111111')).xp, xpForLevel(3))
})

test('deluserall: tanpa konfirmasi tidak menghapus apa pun', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { registered: true })
  await storage.set('users', '628222222222', { registered: true })
  const ctx = makeCtx({ storage, sock: fakeSock(), args: [] })
  await deluserall.handler(ctx)
  assert.match(ctx.replies[0].text, /menghapus \*2 data user\*/)
  assert.equal((await storage.keys('users')).length, 2)
})

test('deluserall: dengan konfirmasi ya semua user terhapus', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { registered: true })
  await storage.set('users', '628111111111:lang', 'id')
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['ya'] })
  await deluserall.handler(ctx)
  assert.match(ctx.replies[0].text, /DELUSERALL SELESAI/)
  assert.deepEqual(await storage.keys('users'), [])
})

test('hapusdata: mengosongkan data tapi settings bot dipertahankan', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { registered: true })
  await storage.set('groups', GROUP, { antilink: true })
  await storage.set('settings', 'bot', { mode: 'self' })
  const gate = makeCtx({ storage, sock: fakeSock(), args: [] })
  await hapusdata.handler(gate)
  assert.match(gate.replies[0].text, /menghapus/)
  assert.equal((await storage.keys('users')).length, 1)
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['ya'] })
  await hapusdata.handler(ctx)
  assert.match(ctx.replies[0].text, /HAPUSDATA SELESAI/)
  assert.deepEqual(await storage.keys('users'), [])
  assert.deepEqual(await storage.keys('groups'), [])
  assert.deepEqual(await storage.get('settings', 'bot'), { mode: 'self' })
})

test('resetdb: mengosongkan seluruh database termasuk settings', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { registered: true })
  await storage.set('settings', 'bot', { mode: 'self' })
  const ctx = makeCtx({ storage, sock: fakeSock(), args: ['ya'] })
  await resetdb.handler(ctx)
  assert.match(ctx.replies[0].text, /RESETDB SELESAI/)
  assert.deepEqual(await storage.keys('users'), [])
  assert.deepEqual(await storage.keys('settings'), [])
})

test('liatgacha: menampilkan isi pool gacha yang dipakai .gacha', async () => {
  const ctx = makeCtx({ storage: memoryStorage(), sock: fakeSock() })
  await liatgacha.handler(ctx)
  assert.match(ctx.replies[0].text, /DATABASE GACHA/)
  assert.match(ctx.replies[0].text, /\*31 item\*/)
  assert.match(ctx.replies[0].text, /Batu/)
})

test('listpc: menampilkan user tercatat urut aktivitas', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { registered: true, regName: 'Budi', lastSeen: 1000 })
  await storage.set('users', '628222222222', { registered: false, name: 'Sari', lastSeen: 2000 })
  const ctx = makeCtx({ storage, sock: fakeSock() })
  await listpc.handler(ctx)
  assert.match(ctx.replies[0].text, /CHAT PRIBADI TERCATAT \(2\)/)
  assert.ok(ctx.replies[0].text.indexOf('Sari') < ctx.replies[0].text.indexOf('Budi'))
  assert.match(ctx.replies[0].text, /628111111111/)
})

test('templateplugin: menghasilkan kerangka plugin dengan nama yang diminta', async () => {
  const sock = fakeSock()
  const ctx = makeCtx({ storage: memoryStorage(), sock, args: ['contohfitur'] })
  await templateplugin.handler(ctx)
  const doc = sock.sent.find((m) => m.content.document)
  assert.ok(doc, 'dokumen kerangka harus terkirim')
  assert.equal(doc.content.fileName, 'contohfitur.js')
  assert.match(ctx.replies[0].text, /name: 'contohfitur'/)
  assert.match(ctx.replies[0].text, /export async function handler/)
})

test('grepplugin: menemukan teks di isi kode plugin beneran', async () => {
  const result = await grepplugin.grepPlugins('relayMessage')
  assert.ok(result.scanned > 1000, `berkas terpindai: ${result.scanned}`)
  assert.ok(result.total > 0)
  assert.ok(result.hits.some((h) => h.file.endsWith('.js')))
  const ctx = makeCtx({ storage: memoryStorage(), sock: fakeSock(), args: ['relayMessage'] })
  await grepplugin.handler(ctx)
  assert.match(ctx.replies[0].text, /GREP PLUGIN/)
  assert.match(ctx.replies[0].text, /kecocokan/)
})

test('scanplugin: melaporkan kesehatan registry apa adanya', async () => {
  const fakeRegistry = {
    list: () => [
      { config: { name: 'sehat', category: 'main', alias: ['s'], description: { id: 'a', en: 'b' } }, test: { input: '.sehat' }, i18n: {} },
      { config: { name: 'bolong', category: 'owner', alias: [], description: { id: 'a', en: 'b' } } },
    ],
    quarantined: [{ file: '/x/rusak.js', reason: 'gagal impor: boom' }],
  }
  const report = scanplugin.buildScanReport(fakeRegistry)
  assert.equal(report.plugins, 2)
  assert.equal(report.commands, 3)
  assert.deepEqual(report.noTest, ['bolong'])
  assert.equal(report.quarantined.length, 1)
  const ctx = makeCtx({ storage: memoryStorage(), sock: fakeSock(), registry: fakeRegistry })
  await scanplugin.handler(ctx)
  assert.match(ctx.replies[0].text, /Plugin termuat: \*2\*/)
  assert.match(ctx.replies[0].text, /bolong/)
})

test('creator2: mengirim kartu kontak owner dan info teks', async () => {
  process.env.OWNER_NUMBER = OWNER_DIGITS
  const sock = fakeSock()
  const ctx = makeCtx({ storage: memoryStorage(), sock })
  await creator2.handler(ctx)
  const card = sock.sent.find((m) => m.content.contacts)
  assert.ok(card, 'kartu kontak harus terkirim')
  assert.match(card.content.contacts.contacts[0].vcard, new RegExp(OWNER_DIGITS))
  assert.match(ctx.replies[0].text, /OWNER BOT/)
  assert.match(ctx.replies[0].text, /wa\.me\/6285869074622/)
})

test('credit: memuat kredit proyek yang sebenarnya', async () => {
  const ctx = makeCtx({ storage: memoryStorage(), sock: fakeSock() })
  await credit.handler(ctx)
  assert.match(ctx.replies[0].text, /OmniDev/)
  assert.match(ctx.replies[0].text, /elaina-baileys/)
})

test('donasi: mengirim gambar QRIS repo dengan caption donasi', async () => {
  process.env.OWNER_NUMBER = OWNER_DIGITS
  const sock = fakeSock()
  const ctx = makeCtx({ storage: memoryStorage(), sock })
  await donasi.handler(ctx)
  const img = sock.sent.find((m) => m.content.image)
  assert.ok(img, 'gambar QRIS harus terkirim')
  assert.ok(Buffer.isBuffer(img.content.image) && img.content.image.length > 10000)
  assert.match(img.content.caption, /DONASI/)
  assert.match(img.content.caption, /QRIS/)
})

test('enable: menyalakan dan mematikan fitur grup di settings', async () => {
  const storage = memoryStorage()
  const on = makeCtx({ storage, sock: fakeSock(), chat: GROUP, args: ['antilink'] })
  await enable.handler(on)
  assert.match(on.replies[0].text, /AKTIF/)
  assert.equal((await getGroupSettings(storage, GROUP)).antilink, true)
  const off = makeCtx({ storage, sock: fakeSock(), chat: GROUP, args: ['antilink', 'off'] })
  await enable.handler(off)
  assert.match(off.replies[0].text, /MATI/)
  assert.equal((await getGroupSettings(storage, GROUP)).antilink, false)
  const list = makeCtx({ storage, sock: fakeSock(), chat: GROUP, args: [] })
  await enable.handler(list)
  assert.match(list.replies[0].text, /welcome/)
})

test('gbbot: owner menanam link, pengguna membacanya', async () => {
  const storage = memoryStorage()
  const unset = makeCtx({ storage, sock: fakeSock() })
  await gbbot.handler(unset)
  assert.match(unset.replies[0].text, /belum diatur/)
  const denied = makeCtx({ storage, sock: fakeSock(), args: ['set', 'https://chat.whatsapp.com/AbCdEfGh12'], isOwner: false })
  await gbbot.handler(denied)
  assert.match(denied.replies[0].text, /KHUSUS OWNER/)
  const save = makeCtx({ storage, sock: fakeSock(), args: ['set', 'https://chat.whatsapp.com/AbCdEfGh12'], isOwner: true })
  await gbbot.handler(save)
  assert.match(save.replies[0].text, /DISIMPAN/)
  const show = makeCtx({ storage, sock: fakeSock(), isOwner: false })
  await gbbot.handler(show)
  assert.match(show.replies[0].text, /chat\.whatsapp\.com\/AbCdEfGh12/)
})

test('saluran: owner menanam link channel, pengguna membacanya', async () => {
  const storage = memoryStorage()
  const save = makeCtx({ storage, sock: fakeSock(), args: ['set', 'https://whatsapp.com/channel/AbCdEfGh12'], isOwner: true })
  await saluran.handler(save)
  assert.match(save.replies[0].text, /DISIMPAN/)
  const show = makeCtx({ storage, sock: fakeSock(), isOwner: false })
  await saluran.handler(show)
  assert.match(show.replies[0].text, /whatsapp\.com\/channel\/AbCdEfGh12/)
})

test('listch: menampilkan channel yang diikuti akun bot', async () => {
  const sock = fakeSock({
    channels: [
      { id: '123@newsletter', name: { text: 'Channel Satu' } },
      { id: '456@newsletter', thread_metadata: { name: { text: 'Channel Dua' } } },
    ],
  })
  const ctx = makeCtx({ storage: memoryStorage(), sock })
  await listch.handler(ctx)
  assert.match(ctx.replies[0].text, /SALURAN DIIKUTI \(2\)/)
  assert.match(ctx.replies[0].text, /Channel Satu/)
  assert.match(ctx.replies[0].text, /Channel Dua/)
})

test('resetlimit: limit profil dan catatan pemakaian kembali penuh', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { limitDate: '2020-01-01', limitLeft: 3 })
  await storage.set('usage_limits', `628111111111:download:${wibDateString()}`, { count: 5 })
  const ctx = makeCtx({ storage, sock: fakeSock() })
  await resetlimit.handler(ctx)
  assert.match(ctx.replies[0].text, /RESET LIMIT SELESAI/)
  const profile = await getProfile(storage, '628111111111')
  assert.equal(profile.limitLeft, DEFAULT_DAILY_LIMIT)
  assert.equal(profile.limitDate, wibDateString())
  assert.equal(await getUsage(storage, '628111111111', 'download'), 0)
})

test('stats: angka berasal dari storage, bot_stats, dan registry', async () => {
  const storage = memoryStorage()
  await storage.set('users', '628111111111', { registered: true })
  await storage.set('users', '628222222222', { registered: false })
  await storage.set('kv', 'bot_stats', { startedAt: 1700000000000, totalCommands: 42, pluginCount: 3 })
  const sock = fakeSock({ groups: { '1@g.us': {}, '2@g.us': {} } })
  const registry = { list: () => [{ config: { name: 'a', alias: ['a1'] } }, { config: { name: 'b', alias: [] } }, { config: { name: 'c', alias: [] } }] }
  const ctx = makeCtx({ storage, sock, registry })
  await stats.handler(ctx)
  assert.match(ctx.replies[0].text, /STATISTIK KANA/)
  assert.match(ctx.replies[0].text, /User tercatat: \*2\*/)
  assert.match(ctx.replies[0].text, /terdaftar: \*1\*/)
  assert.match(ctx.replies[0].text, /Grup diikuti bot: \*2\*/)
  assert.match(ctx.replies[0].text, /Perintah dijalankan: \*42\*/)
  assert.match(ctx.replies[0].text, /Plugin aktif: \*3\*/)
})

test('system: menampilkan data OS, CPU, dan RAM nyata', async () => {
  const ctx = makeCtx({ storage: memoryStorage(), sock: fakeSock() })
  await system.handler(ctx)
  assert.match(ctx.replies[0].text, /INFORMASI SISTEM/)
  assert.match(ctx.replies[0].text, /RAM server/)
  assert.match(ctx.replies[0].text, /Node\.js/)
})

test('tqto: memuat ucapan terima kasih yang sebenarnya', async () => {
  const ctx = makeCtx({ storage: memoryStorage(), sock: fakeSock() })
  await tqto.handler(ctx)
  assert.match(ctx.replies[0].text, /THANKS TO/)
  assert.match(ctx.replies[0].text, /OmniDev/)
  assert.match(ctx.replies[0].text, /rexxhayanasi/)
})
