import { test } from 'node:test'
import assert from 'node:assert/strict'
import { t as translate, addMessages } from '../src/i18n/index.js'
import { memoryStorage } from './user-service.test.js'
import { getProfile, wibDateString } from '../src/services/user-service.js'
import { i18n as daftarI18n, handler as daftarHandler } from '../plugins/user/daftar.js'
import { i18n as profilI18n, handler as profilHandler } from '../plugins/user/profil.js'
import { i18n as levelI18n, handler as levelHandler } from '../plugins/user/level.js'
import { i18n as limitI18n, handler as limitHandler } from '../plugins/user/limit.js'
import { i18n as leaderboardI18n, handler as leaderboardHandler } from '../plugins/user/leaderboard.js'
import { i18n as carifiturI18n, handler as carifiturHandler } from '../plugins/user/carifitur.js'

for (const mod of [daftarI18n, profilI18n, levelI18n, limitI18n, leaderboardI18n, carifiturI18n]) {
  addMessages('id', mod.id)
  addMessages('en', mod.en)
}

const CALLER = '6281234567890'

const fakePlugins = [
  { config: { name: 'ping', alias: ['p'], category: 'main', description: { id: 'Cek bot hidup', en: 'Check bot alive' } } },
  { config: { name: 'spotify', alias: ['sp'], category: 'download', description: { id: 'Unduh lagu Spotify', en: 'Download Spotify songs' } } },
  { config: { name: 'profil', alias: ['me'], category: 'user', description: { id: 'Lihat profil', en: 'See profile' } } },
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

function fakeCtx(sock, storage, { args = [], chat = '6281234567890@s.whatsapp.net' } = {}) {
  const replies = []
  const ctx = {
    sock,
    chat,
    sender: chat,
    senderDigits: CALLER,
    pushName: 'PushSenpai',
    isGroup: false,
    isOwner: false,
    isAdmin: false,
    isBotAdmin: false,
    args,
    text: args.join(' '),
    command: 'profil',
    lang: 'id',
    t: (k, vars) => translate('id', k, vars),
    say: () => 'Ehehe~',
    reply: async (txt) => {
      replies.push(txt)
    },
    storage,
    registry: {
      list: () => fakePlugins,
      resolve: (n) => fakePlugins.find((p) => p.config.name === n),
      quarantined: [],
    },
    raw: { pushName: 'PushSenpai' },
    mentionedJids: [],
  }
  return { ctx, replies }
}

async function seedCaller(storage) {
  await storage.set('users', CALLER, {
    name: 'Senpai',
    xp: 120,
    balance: 500,
    registeredAt: '2026-11-01T00:00:00.000Z',
    limitDate: wibDateString(),
    limitLeft: 7,
  })
}

function allText(sent) {
  return sent.map((s) => s.content.caption ?? s.content.text ?? '').join('\n')
}

test('daftar: nama tersimpan dan registeredAt terisi', async () => {
  const storage = memoryStorage()
  const { sock } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, storage, { args: ['Nama', 'Baru'] })
  await daftarHandler(ctx)
  const profile = await getProfile(storage, CALLER)
  assert.equal(profile.name, 'Nama Baru')
  assert.ok(profile.registeredAt)
})

test('daftar: tanpa nama membalas petunjuk', async () => {
  const storage = memoryStorage()
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, storage)
  await daftarHandler(ctx)
  const text = allText(sent)
  assert.match(text, /namanya dulu/)
})

test('profil: kartu berisi data dari storage contoh', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, storage)
  await profilHandler(ctx)
  const text = allText(sent)
  assert.match(text, /Senpai/)
  assert.match(text, /6281234567890/)
  assert.match(text, /Level : 2/)
  assert.match(text, /XP : 120/)
  assert.match(text, /Limit hari ini : 7/)
  assert.match(text, /Saldo : 500/)
  assert.match(text, /Terdaftar sejak 2026-11-01/)
})

test('profil: tombol terkirim lewat relay dengan id perintah lengkap', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  const { sock, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, storage)
  await profilHandler(ctx)
  assert.equal(relayed.length, 1, 'satu pesan tombol ter-relay')
  const payload = JSON.stringify(relayed[0].message)
  assert.ok(payload.includes('.level'), 'ada tombol .level')
  assert.ok(payload.includes('.limit'), 'ada tombol .limit')
  assert.ok(payload.includes('.leaderboard'), 'ada tombol .leaderboard')
  assert.ok(payload.includes('.menu user'), 'ada tombol .menu user')
})

test('profil: relayMessage absen, fallback teks tetap terkirim', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, storage)
  await profilHandler(ctx)
  assert.ok(sent.length >= 1, 'ada pesan fallback terkirim')
  assert.match(allText(sent), /Senpai/)
  assert.match(allText(sent), /Level : 2/)
})

test('level: detail level dan sisa XP dari storage', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, storage)
  await levelHandler(ctx)
  const text = allText(sent)
  assert.match(text, /Level kamu sekarang: 2/)
  assert.match(text, /XP total: 120/)
  assert.match(text, /Sisa ke level 3: 80 XP/)
})

test('limit: sisa limit hari ini dari storage', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, storage)
  await limitHandler(ctx)
  assert.match(allText(sent), /tersisa 7 dari 30/)
})

test('leaderboard: urutan XP dan penanda pemanggil dari storage', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  await storage.set('users', '628999888777', { name: 'Master', xp: 500 })
  await storage.set('users', `${CALLER}:lang`, 'id')
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, storage)
  await leaderboardHandler(ctx)
  const text = allText(sent)
  const masterIdx = text.indexOf('Master')
  const senpaiIdx = text.indexOf('Senpai')
  assert.ok(masterIdx >= 0 && senpaiIdx > masterIdx, 'Master (500 XP) di atas Senpai (120 XP)')
  assert.match(text, /Senpai : Lv 2 : 120 XP \(kamu\)/)
})

test('leaderboard: storage kosong membalas pesan moe', async () => {
  const storage = memoryStorage()
  const { sock, sent } = fakeSock({ withRelay: false })
  const { ctx } = fakeCtx(sock, storage)
  await leaderboardHandler(ctx)
  assert.match(allText(sent), /belum ada data XP/)
})

test('carifitur: menemukan perintah dan tombol hasil pertama terkirim', async () => {
  const storage = memoryStorage()
  const { sock, relayed } = fakeSock()
  const { ctx } = fakeCtx(sock, storage, { args: ['spot'] })
  await carifiturHandler(ctx)
  assert.equal(relayed.length, 1)
  const payload = JSON.stringify(relayed[0].message)
  assert.ok(payload.includes('.spotify'), 'hasil spotify tampil dan jadi tombol')
  assert.ok(payload.includes('Unduh lagu Spotify'), 'deskripsi bahasa id tampil')
})

test('carifitur: tanpa hasil membalas pesan moe, tanpa kata membalas petunjuk', async () => {
  const storage = memoryStorage()
  const { sock } = fakeSock()
  const miss = fakeCtx(sock, storage, { args: ['zzzqqq'] })
  await carifiturHandler(miss.ctx)
  assert.match(miss.replies[0], /nggak ada perintah yang cocok/)
  const empty = fakeCtx(sock, storage)
  await carifiturHandler(empty.ctx)
  assert.match(empty.replies[0], /kata kuncinya dulu/)
})
