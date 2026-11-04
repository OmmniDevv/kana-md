import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPipeline } from '../src/core/pipeline.js'
import { addMessages } from '../src/i18n/index.js'
import { memoryStorage } from './user-service.test.js'
import { getProfile } from '../src/services/user-service.js'
import { config as daftarConfig, i18n as daftarI18n, handler as daftarHandler } from '../plugins/user/daftar.js'

addMessages('id', daftarI18n.id)
addMessages('en', daftarI18n.en)

const BOT = '6285187605007@s.whatsapp.net'
const OWNER = '6285869074622'
const USER = '6281234567890'

function stubPlugin(name, calls) {
  return {
    config: { name, alias: [], category: 'main', description: { id: name, en: name }, cooldown: 0 },
    handler: async (ctx) => {
      calls.push(name)
      await ctx.reply(`stub:${name}`)
    },
  }
}

function makeHarness() {
  const storage = memoryStorage()
  const calls = []
  const plugins = new Map()
  const daftar = { config: daftarConfig, handler: daftarHandler }
  plugins.set('daftar', daftar)
  for (const name of ['ping', 'menu', 'help']) plugins.set(name, stubPlugin(name, calls))
  const registry = {
    resolve: (name) => plugins.get(name) ?? null,
    befores: [],
    participantHandlers: [],
    list: () => [...plugins.values()],
  }
  const sent = []
  const sock = {
    user: { id: BOT },
    sendMessage: async (jid, content) => {
      sent.push({ jid, content })
      return {}
    },
    // Sengaja tanpa relayMessage: sendButtons jatuh ke fallback teks.
  }
  const pipeline = createPipeline({ registry, storage, owners: [OWNER], defaultLang: 'id' })
  const msg = (fromDigits, text, pushName = 'Tester') => ({
    key: { remoteJid: `${fromDigits}@s.whatsapp.net`, fromMe: false },
    message: { conversation: text },
    pushName,
  })
  const allText = () => sent.map((s) => s.content.text ?? s.content.caption ?? '').join('\n')
  return { storage, calls, sock, pipeline, msg, allText, sent }
}

test('gate: user belum daftar ditolak perintah biasa dan dapat peringatan daftar', async () => {
  const h = makeHarness()
  await h.pipeline.handle(h.sock, h.msg(USER, '.ping'))
  assert.deepEqual(h.calls, [])
  assert.match(h.allText(), /belum daftar/)
})

test('gate: .menu dari user belum daftar menampilkan peringatan, bukan menu', async () => {
  const h = makeHarness()
  await h.pipeline.handle(h.sock, h.msg(USER, '.menu'))
  assert.deepEqual(h.calls, [])
  assert.match(h.allText(), /belum daftar/)
})

test('gate: .help daftar tetap boleh untuk user belum daftar', async () => {
  const h = makeHarness()
  await h.pipeline.handle(h.sock, h.msg(USER, '.help daftar'))
  assert.deepEqual(h.calls, ['help'])
})

test('gate: .daftar auto mendaftarkan memakai pushName, sesudahnya perintah lolos', async () => {
  const h = makeHarness()
  await h.pipeline.handle(h.sock, h.msg(USER, '.daftar auto', 'Nama WA Ku'))
  const profile = await getProfile(h.storage, USER)
  assert.equal(profile.registered, true)
  assert.equal(profile.regName, 'Nama WA Ku')
  assert.ok(profile.registeredAt)
  await h.pipeline.handle(h.sock, h.msg(USER, '.ping'))
  assert.deepEqual(h.calls, ['ping'])
})

test('gate: .daftar <nama> mendaftarkan dengan nama pilihan', async () => {
  const h = makeHarness()
  await h.pipeline.handle(h.sock, h.msg(USER, '.daftar Senpai'))
  const profile = await getProfile(h.storage, USER)
  assert.equal(profile.registered, true)
  assert.equal(profile.regName, 'Senpai')
})

test('gate: owner lolos tanpa daftar', async () => {
  const h = makeHarness()
  await h.pipeline.handle(h.sock, h.msg(OWNER, '.ping'))
  assert.deepEqual(h.calls, ['ping'])
  const profile = await getProfile(h.storage, OWNER)
  assert.equal(profile.registered, false)
})
