import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderProfileCard, PROFILE_CARD_WIDTH, PROFILE_CARD_HEIGHT } from '../src/ui/profile-card.js'
import { t as translate, addMessages } from '../src/i18n/index.js'
import { memoryStorage } from './user-service.test.js'
import { wibDateString } from '../src/services/user-service.js'
import { i18n as profilI18n, handler as profilHandler, rankKeyForLevel } from '../plugins/user/profil.js'

addMessages('id', profilI18n.id)
addMessages('en', profilI18n.en)

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  'base64'
)

function assertPng(buffer, label) {
  assert.ok(Buffer.isBuffer(buffer), `${label}: hasil berupa Buffer`)
  assert.deepEqual([...buffer.subarray(0, 8)], PNG_MAGIC, `${label}: magic bytes PNG valid`)
  assert.equal(buffer.readUInt32BE(16), PROFILE_CARD_WIDTH, `${label}: lebar 1000`)
  assert.equal(buffer.readUInt32BE(20), PROFILE_CARD_HEIGHT, `${label}: tinggi 560`)
  assert.ok(buffer.length > 20000 && buffer.length < 5000000, `${label}: ukuran wajar (${buffer.length} byte)`)
}

function baseData(overrides = {}) {
  return {
    name: 'OmniDev',
    number: '6285869074622',
    level: 12,
    xp: 2450,
    progress: 350,
    needed: 550,
    percent: 63,
    balance: 12500,
    limitLeft: 21,
    rankLabel: 'Petualang',
    registeredLabel: 'Terdaftar sejak 2026-10-02',
    avatarBuffer: null,
    botName: 'KANA',
    labels: { level: 'LEVEL', xp: 'XP', balance: 'Saldo', limit: 'Limit Hari Ini', rank: 'Gelar' },
    ...overrides,
  }
}

test('renderProfileCard: PNG valid 1000x560 tanpa avatar', async () => {
  const buffer = await renderProfileCard(baseData())
  assertPng(buffer, 'tanpa avatar')
})

test('renderProfileCard: nama sangat panjang tetap menghasilkan PNG valid', async () => {
  const buffer = await renderProfileCard(
    baseData({
      name: 'Nama Yang Sangat Panjang Sekali Sampai Melebihi Lebar Panel Kartu Profil',
      rankLabel: 'Legenda KANA Dengan Gelar Yang Juga Panjang Sekali',
      registeredLabel: 'Terdaftar sejak 2026-10-02 dengan label yang panjang sekali juga',
    })
  )
  assertPng(buffer, 'nama panjang')
})

test('renderProfileCard: percent 0 dan 100 tetap menghasilkan PNG valid', async () => {
  assertPng(await renderProfileCard(baseData({ percent: 0, progress: 0 })), 'percent 0')
  assertPng(await renderProfileCard(baseData({ percent: 100, progress: 550 })), 'percent 100')
})

test('renderProfileCard: avatar Buffer valid digambar tanpa error', async () => {
  const buffer = await renderProfileCard(baseData({ avatarBuffer: TINY_PNG }))
  assertPng(buffer, 'dengan avatar')
})

test('renderProfileCard: avatar Buffer rusak jatuh ke inisial tanpa error', async () => {
  const buffer = await renderProfileCard(baseData({ avatarBuffer: Buffer.from('ini bukan gambar') }))
  assertPng(buffer, 'avatar rusak')
})

test('rankKeyForLevel: lima tingkat gelar', () => {
  assert.equal(rankKeyForLevel(1), 'profil.rank1')
  assert.equal(rankKeyForLevel(4), 'profil.rank2')
  assert.equal(rankKeyForLevel(8), 'profil.rank3')
  assert.equal(rankKeyForLevel(15), 'profil.rank4')
  assert.equal(rankKeyForLevel(25), 'profil.rank5')
})

const CALLER = '6281234567890'

function fakeSock({ withRelay = true, profilePictureUrl } = {}) {
  const sent = []
  const relayed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return {}
    },
    waUploadToServer: async () => ({
      mediaUrl: 'https://mmg.whatsapp.net/fake-profile',
      directPath: '/fake-profile',
    }),
  }
  if (profilePictureUrl) sock.profilePictureUrl = profilePictureUrl
  if (withRelay) {
    sock.relayMessage = async (jid, message, opts) => {
      relayed.push({ jid, message, opts })
      return {}
    }
  }
  return { sock, sent, relayed }
}

function fakeCtx(sock, storage) {
  const replies = []
  const chat = `${CALLER}@s.whatsapp.net`
  const ctx = {
    sock,
    chat,
    sender: chat,
    senderDigits: CALLER,
    pushName: 'PushSenpai',
    isGroup: false,
    isOwner: false,
    args: [],
    text: '',
    command: 'profil',
    lang: 'id',
    t: (k, vars) => translate('id', k, vars),
    say: () => 'Ehehe~',
    reply: async (txt) => {
      replies.push(txt)
    },
    storage,
    registry: { list: () => [], resolve: () => undefined, quarantined: [] },
    raw: { key: { remoteJid: chat, fromMe: false, id: 'msg-1' }, pushName: 'PushSenpai' },
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

function quickReplyIds(interactive) {
  return (interactive.nativeFlowMessage?.buttons ?? [])
    .map((button) => ({ name: button.name, params: JSON.parse(button.buttonParamsJson || '{}') }))
    .filter((button) => button.name === 'quick_reply')
    .map((button) => button.params.id)
}

test('handler profil: jalur utama mengirim MB.Button berisi gambar kartu', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    arrayBuffer: async () => TINY_PNG.buffer.slice(TINY_PNG.byteOffset, TINY_PNG.byteOffset + TINY_PNG.byteLength),
  })
  let relayed
  try {
    const fake = fakeSock({
      profilePictureUrl: async () => 'https://example.invalid/avatar.jpg',
    })
    relayed = fake.relayed
    const { ctx } = fakeCtx(fake.sock, storage)
    await profilHandler(ctx)
  } finally {
    globalThis.fetch = originalFetch
  }
  assert.equal(relayed.length, 1, 'satu pesan interaktif ter-relay')
  const interactive = relayed[0].message.interactiveMessage
  assert.equal(interactive.header.hasMediaAttachment, true)
  assert.ok(interactive.header.imageMessage, 'header MB.Button memuat gambar kartu hasil render')
  assert.match(interactive.body.text, /Senpai/)
})

test('handler profil: payload MB.Button berisi gambar, caption ringkas, dan tombol lengkap', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  const { sock, sent, relayed } = fakeSock({
    profilePictureUrl: async () => {
      throw new Error('tidak ada foto')
    },
  })
  const { ctx } = fakeCtx(sock, storage)
  await profilHandler(ctx)
  assert.equal(sent.length, 0, 'jalur utama tidak memakai sendMessage')
  assert.equal(relayed.length, 1, 'satu pesan interaktif ter-relay walau foto gagal')
  const interactive = relayed[0].message.interactiveMessage
  assert.equal(interactive.header.hasMediaAttachment, true)
  assert.ok(interactive.header.imageMessage, 'header MB.Button memuat gambar kartu')
  assert.match(interactive.body.text, /Senpai/)
  assert.match(interactive.body.text, /Level 2/)
  assert.match(interactive.body.text, /Saldo: 500/)
  assert.match(interactive.body.text, /Limit tersisa: 7/)
  assert.equal(interactive.footer.text, 'KANA, bot WhatsApp moe')
  assert.deepEqual(quickReplyIds(interactive), ['.level', '.limit', '.leaderboard'])
})

test('handler profil: builder gagal jatuh ke fallback gambar plus kartu teks lama', async () => {
  const storage = memoryStorage()
  await seedCaller(storage)
  const { sock, sent, relayed } = fakeSock({
    withRelay: false,
    profilePictureUrl: async () => {
      throw new Error('tidak ada foto')
    },
  })
  const { ctx } = fakeCtx(sock, storage)
  await profilHandler(ctx)
  assert.equal(relayed.length, 0)
  assert.ok(sent.length >= 2, 'fallback mengirim gambar lalu pesan tombol atau teks')
  const imageMessage = sent.find((item) => Buffer.isBuffer(item.content.image))
  assert.ok(imageMessage, 'fallback pertama adalah pesan gambar')
  assert.deepEqual([...imageMessage.content.image.subarray(0, 8)], PNG_MAGIC, 'gambar fallback adalah PNG kartu')
  assert.match(imageMessage.content.caption, /Senpai/)
  const allText = sent.map((item) => item.content.caption ?? item.content.text ?? '').join('\n')
  assert.match(allText, /ʟᴇᴠᴇʟ: \*2\*/)
  assert.match(allText, /xᴘ: \*120\*/)
  assert.match(allText, /ꜱᴀʟᴅᴏ: \*500\*/)
  assert.match(allText, /Terdaftar sejak 2026-11-01/)
})
