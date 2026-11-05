import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { resolveTargetJids } from '../src/services/guard-rules.js'
import { updateProfile } from '../src/services/user-service.js'
import { updateGroupSettings } from '../src/services/group-service.js'
import * as kick from '../plugins/group/kick.js'
import * as promote from '../plugins/group/promote.js'
import * as demote from '../plugins/group/demote.js'
import * as warn from '../plugins/group/warn.js'
import * as claninfo from '../plugins/clan/claninfo.js'
import * as clanxp from '../plugins/clan/clanxp.js'
import { onParticipantsUpdate, i18n as welcomeI18n } from '../plugins/group/welcome.js'

for (const plugin of [kick, promote, demote, warn, claninfo, clanxp]) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
for (const [lang, msgs] of Object.entries(welcomeI18n)) addMessages(lang, msgs)
const t = (k, vars) => translate('id', k, vars)

// Penjaga regresi temuan owner 2026-11-06 di Grup KANA: konfirmasi .kick
// tampil "@" kosong dan identitas target bukan mention asli. Dua lapis
// cacatnya: (1) resolveTargetJids menelan token mention "@6283..." mentah
// sebagai JID semu yang digitnya kosong, jadi aksi jalan dua kali dan
// konfirmasi kedua tampil "*@*" dengan mentions yang tidak teresolve;
// (2) target berbentuk LID dan balasan lewat ctx.reply tidak pernah jadi
// tag @Nama karena mentions tidak diteruskan pipeline / tidak memakai
// JID nomor telepon. Tes ini mengunci: satu aksi, satu konfirmasi, teks
// memuat @<nomor telepon>, mentions berisi JID nomor telepon target.

const CHAT = '120363409948890046@g.us'
const OWNER = '6285869074622'
const TARGET = '6283157555852'
const TARGET_JID = `${TARGET}@s.whatsapp.net`
const TARGET_LID = '258793741017241@lid'

function actionCtx({ mentionedJids = [], args = [], quoted = null, meta = null, storage = null } = {}) {
  const updates = []
  const sent = []
  const replies = []
  return {
    updates,
    sent,
    replies,
    chat: CHAT,
    raw: { key: { id: 'm1' } },
    lang: 'id',
    t,
    mentionedJids,
    quoted,
    args,
    senderDigits: OWNER,
    storage,
    sock: {
      async groupParticipantsUpdate(chat, jids, action) {
        updates.push({ chat, jids, action })
        return []
      },
      async sendMessage(chat, content, opts) {
        sent.push(content)
        return { key: { id: 's1' } }
      },
    },
    reply: async (text, extra) => {
      replies.push({ text, extra })
      return { key: { id: 'r1' } }
    },
    getGroupMetadata: async () => meta ?? { id: CHAT, subject: 'Grup KANA', participants: [] },
  }
}

function assertSingleTagConfirmation(ctx, label) {
  assert.equal(ctx.updates.length, 1, `${label}: aksi harus jalan tepat satu kali`)
  assert.deepEqual(ctx.updates[0].jids, [TARGET_JID], `${label}: aksi harus ke JID nomor telepon`)
  assert.equal(ctx.sent.length, 1, `${label}: konfirmasi harus tepat satu pesan`)
  const content = ctx.sent[0]
  assert.ok(content.text.includes(`@${TARGET}`), `${label}: teks harus memuat @nomor target: ${content.text}`)
  assert.ok(!content.text.includes('*@*'), `${label}: teks tidak boleh memuat @ kosong: ${content.text}`)
  assert.deepEqual(content.mentions, [TARGET_JID], `${label}: mentions harus JID nomor telepon target`)
}

test('resolveTargetJids: token mention @nomor tidak jadi JID semu digit kosong', () => {
  assert.deepEqual(
    resolveTargetJids({ mentionedJids: [TARGET_JID], quoted: null, args: [`@${TARGET}`] }),
    [TARGET_JID],
  )
  assert.deepEqual(
    resolveTargetJids({ mentionedJids: [], quoted: null, args: [`@${TARGET}`] }),
    [TARGET_JID],
  )
  assert.deepEqual(
    resolveTargetJids({ mentionedJids: [], quoted: null, args: [TARGET] }),
    [TARGET_JID],
  )
})

test('kick: bentuk persis kejadian live (mention + token @nomor) menghasilkan satu tag asli', async () => {
  const ctx = actionCtx({ mentionedJids: [TARGET_JID], args: [`@${TARGET}`] })
  await kick.handler(ctx)
  assertSingleTagConfirmation(ctx, 'kick')
})

test('kick: token @nomor tanpa payload mention tetap menyebut nomor target', async () => {
  const ctx = actionCtx({ mentionedJids: [], args: [`@${TARGET}`] })
  await kick.handler(ctx)
  assertSingleTagConfirmation(ctx, 'kick')
})

test('kick: target berbentuk LID diresolusi ke nomor telepon untuk teks dan mentions', async () => {
  const meta = {
    id: CHAT,
    subject: 'Grup KANA',
    participants: [{ id: TARGET_LID, phoneNumber: TARGET_JID, admin: null }],
  }
  const ctx = actionCtx({ mentionedJids: [TARGET_LID], args: [], meta })
  await kick.handler(ctx)
  assertSingleTagConfirmation(ctx, 'kick')
  assert.ok(!ctx.sent[0].text.includes('258793741017241'), 'LID mentah tidak boleh tampil sebagai nomor')
})

test('promote: bentuk live menghasilkan satu konfirmasi tag asli', async () => {
  const ctx = actionCtx({ mentionedJids: [TARGET_JID], args: [`@${TARGET}`] })
  await promote.handler(ctx)
  assertSingleTagConfirmation(ctx, 'promote')
})

test('demote: bentuk live menghasilkan satu konfirmasi tag asli', async () => {
  const ctx = actionCtx({ mentionedJids: [TARGET_JID], args: [`@${TARGET}`] })
  await demote.handler(ctx)
  assertSingleTagConfirmation(ctx, 'demote')
})

test('warn: token @nomor saja tetap me-warn orang yang benar dengan tag asli', async () => {
  const storage = memoryStorage()
  const ctx = actionCtx({ mentionedJids: [], args: [`@${TARGET}`], storage })
  await warn.handler(ctx)
  assert.equal(ctx.sent.length, 1)
  assert.ok(ctx.sent[0].text.includes(`@${TARGET}`), `teks warn harus memuat @nomor: ${ctx.sent[0].text}`)
  assert.deepEqual(ctx.sent[0].mentions, [TARGET_JID])
})

async function seededClanStorage() {
  const storage = memoryStorage()
  await storage.set('kv', 'clan:naga-sakti', {
    id: 'naga-sakti', name: 'Naga Sakti', leader: OWNER,
    members: { [OWNER]: 'leader', [TARGET]: 'member' },
    xp: 0, bank: 0, desc: '', createdAt: Date.now(), warWins: 0, warLosses: 0, warHistory: [],
  })
  await updateProfile(storage, OWNER, { clanId: 'naga-sakti', xp: 300 })
  await updateProfile(storage, TARGET, { clanId: 'naga-sakti', xp: 225 })
  return storage
}

function clanCtx({ storage }) {
  const replies = []
  return {
    replies,
    chat: CHAT,
    sender: `${OWNER}@s.whatsapp.net`,
    senderDigits: OWNER,
    text: '',
    args: [],
    lang: 'id',
    t,
    storage,
    reply: async (text, extra) => {
      replies.push({ text, extra })
      return { key: { id: 'r1' } }
    },
  }
}

test('claninfo: baris Leader adalah tag asli (teks @nomor + mentions nomor telepon)', async () => {
  const storage = await seededClanStorage()
  const ctx = clanCtx({ storage })
  await claninfo.handler(ctx)
  const { text, extra } = ctx.replies[0]
  assert.ok(text.includes(`Leader: *@${OWNER}*`), `baris Leader harus @nomor: ${text}`)
  assert.deepEqual(extra?.mentions, [`${OWNER}@s.whatsapp.net`])
})

test('clanxp: baris kontribusi member adalah tag asli dengan mentions semua member tampil', async () => {
  const storage = await seededClanStorage()
  const ctx = clanCtx({ storage })
  await clanxp.handler(ctx)
  const { text, extra } = ctx.replies[0]
  assert.ok(text.includes(`*@${OWNER}*`), `kontribusi leader harus @nomor: ${text}`)
  assert.ok(text.includes(`*@${TARGET}*`), `kontribusi member harus @nomor: ${text}`)
  assert.deepEqual(
    [...(extra?.mentions ?? [])].sort(),
    [`${OWNER}@s.whatsapp.net`, TARGET_JID].sort(),
  )
})

test('goodbye: member keluar disebut sebagai tag asli, mentions nomor telepon walau peserta LID', async () => {
  const storage = memoryStorage()
  await updateGroupSettings(storage, CHAT, { goodbye: true })
  const meta = {
    subject: 'Grup KANA',
    participants: [
      { id: '121693670506723@lid', phoneNumber: `${OWNER}@s.whatsapp.net`, admin: 'superadmin' },
      { id: TARGET_LID, phoneNumber: TARGET_JID, admin: null },
    ],
  }
  const sent = []
  const sock = {
    sent,
    async sendMessage(jid, content, opts) {
      sent.push(content)
      return { key: { id: 'fake' } }
    },
    async groupMetadata() {
      return meta
    },
  }
  const ctx = {
    sock,
    chat: CHAT,
    action: 'remove',
    participants: [TARGET_LID],
    storage,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    sendText: async (txt, mentions) => sock.sendMessage(CHAT, { text: txt, ...(mentions?.length ? { mentions } : {}) }),
    getGroupMetadata: async () => meta,
  }
  await onParticipantsUpdate(ctx)
  assert.equal(sent.length, 1)
  const content = sent[0]
  const text = String(content.caption ?? content.text ?? '')
  assert.ok(text.includes(`@${TARGET}`), `goodbye harus memuat @nomor target: ${text}`)
  assert.ok(!text.includes('258793741017241'), 'LID mentah tidak boleh tampil')
  assert.deepEqual(content.mentions, [TARGET_JID], 'goodbye harus membawa mentions nomor telepon target')
})
