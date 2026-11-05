import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import * as groupstats from '../plugins/group/groupstats.js'
import * as totalpesan from '../plugins/group/totalpesan.js'
import * as groupinfo from '../plugins/group/groupinfo.js'

for (const plugin of [groupstats, totalpesan, groupinfo]) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

// Penjaga regresi bug 2026-11-06: balasan .groupstats dan .totalpesan di
// Grup KANA memuat literal "{digits}" dan "{count}" karena handler membaca
// .digits/.count/.jid dari tuple [digits, count] keluaran aggregateTopchat.
// Tes ini merender handler dengan data tiruan realistis (grup mode LID,
// angka meniru screenshot owner) dan melarang sisa pola {placeholder}.

const CHAT = '120363409948890046@g.us'
const OWNER_PN = '6285869074622'
const OWNER_LID = '121693670506723'
const MEMBER_PN = '6283157555852'
const MEMBER_LID = '998877665544321'
const BOT_PN = '6285187605007'

const PLACEHOLDER = /\{[a-zA-Z]+\}/

function lidParticipants() {
  return [
    { id: `${OWNER_LID}@lid`, phoneNumber: `${OWNER_PN}@s.whatsapp.net`, admin: 'superadmin' },
    { id: `${MEMBER_LID}@lid`, phoneNumber: `${MEMBER_PN}@s.whatsapp.net`, admin: null },
    { id: `${BOT_PN}@s.whatsapp.net`, admin: 'admin' },
  ]
}

function metaWith(participants, owner) {
  return {
    id: CHAT,
    subject: 'Grup KANA',
    owner,
    creation: 1762272000,
    desc: 'Grup seru untuk belajar dan berbagi',
    announce: false,
    participants,
  }
}

function makeCtx({ storage, meta }) {
  const replies = []
  return {
    replies,
    chat: CHAT,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    storage,
    sock: {
      async groupMetadata() {
        return meta
      },
    },
    reply: async (text, extra) => {
      replies.push({ text, extra })
      return { key: { id: 'reply' } }
    },
  }
}

async function seededStorage(counts) {
  const storage = memoryStorage()
  if (counts) await storage.set('chatcount', CHAT, counts)
  return storage
}

test('groupstats: baris teraktif terender nomor dan jumlah pesan asli, tanpa placeholder bocor', async () => {
  const storage = await seededStorage({ [OWNER_PN]: 150, [MEMBER_PN]: 129 })
  const ctx = makeCtx({ storage, meta: metaWith(lidParticipants(), `${OWNER_LID}@lid`) })
  await groupstats.handler(ctx)
  const { text, extra } = ctx.replies[0]
  assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
  assert.ok(text.includes(`@${OWNER_PN}`), `nomor teraktif tidak tampil: ${text}`)
  assert.ok(text.includes('(150 pesan)'), `jumlah pesan teraktif tidak tampil: ${text}`)
  assert.ok(text.includes('279 pesan'), `total pesan salah: ${text}`)
  assert.deepEqual(extra?.mentions, [`${OWNER_PN}@s.whatsapp.net`])
})

test('groupstats: kunci hitungan lama berbentuk LID tetap teragregasi ke nomor asli', async () => {
  const storage = await seededStorage({ [OWNER_LID]: 200, [MEMBER_PN]: 10 })
  const ctx = makeCtx({ storage, meta: metaWith(lidParticipants(), `${OWNER_LID}@lid`) })
  await groupstats.handler(ctx)
  const { text, extra } = ctx.replies[0]
  assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
  assert.ok(text.includes(`@${OWNER_PN}`), `LID tidak teresolve: ${text}`)
  assert.ok(!text.includes(OWNER_LID), `LID tercetak mentah: ${text}`)
  assert.ok(text.includes('(200 pesan)'), `jumlah gabungan salah: ${text}`)
  assert.deepEqual(extra?.mentions, [`${OWNER_PN}@s.whatsapp.net`])
})

test('totalpesan: baris terbanyak terender nomor dan jumlah pesan asli, tanpa placeholder bocor', async () => {
  const storage = await seededStorage({ [OWNER_PN]: 150, [MEMBER_PN]: 129 })
  const ctx = makeCtx({ storage, meta: metaWith(lidParticipants(), `${OWNER_LID}@lid`) })
  await totalpesan.handler(ctx)
  const { text, extra } = ctx.replies[0]
  assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
  assert.ok(text.includes(`@${OWNER_PN}`), `nomor terbanyak tidak tampil: ${text}`)
  assert.ok(text.includes('(150 pesan)'), `jumlah pesan terbanyak tidak tampil: ${text}`)
  assert.ok(text.includes('279 pesan'), `total pesan salah: ${text}`)
  assert.deepEqual(extra?.mentions, [`${OWNER_PN}@s.whatsapp.net`])
})

test('totalpesan: grup tanpa data tetap bersih dari placeholder', async () => {
  const storage = await seededStorage(null)
  const ctx = makeCtx({ storage, meta: metaWith(lidParticipants(), `${OWNER_LID}@lid`) })
  await totalpesan.handler(ctx)
  const { text } = ctx.replies[0]
  assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
})

test('groupinfo: pemilik mode LID teresolve ke nomor telepon asli', async () => {
  const storage = await seededStorage(null)
  const ctx = makeCtx({ storage, meta: metaWith(lidParticipants(), `${OWNER_LID}@lid`) })
  await groupinfo.handler(ctx)
  const { text, extra } = ctx.replies[0]
  assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
  assert.ok(text.includes(`@${OWNER_PN}`), `nomor pemilik asli tidak tampil: ${text}`)
  assert.ok(!text.includes(OWNER_LID), `LID tercetak sebagai nomor pemilik: ${text}`)
  assert.deepEqual(extra?.mentions, [`${OWNER_PN}@s.whatsapp.net`])
})

test('groupinfo: pemilik mode nomor biasa tetap tampil benar', async () => {
  const storage = await seededStorage(null)
  const participants = [
    { id: `${OWNER_PN}@s.whatsapp.net`, admin: 'superadmin' },
    { id: `${MEMBER_PN}@s.whatsapp.net`, admin: null },
    { id: `${BOT_PN}@s.whatsapp.net`, admin: 'admin' },
  ]
  const ctx = makeCtx({ storage, meta: metaWith(participants, `${OWNER_PN}@s.whatsapp.net`) })
  await groupinfo.handler(ctx)
  const { text, extra } = ctx.replies[0]
  assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
  assert.ok(text.includes(`@${OWNER_PN}`), `nomor pemilik tidak tampil: ${text}`)
  assert.deepEqual(extra?.mentions, [`${OWNER_PN}@s.whatsapp.net`])
})
