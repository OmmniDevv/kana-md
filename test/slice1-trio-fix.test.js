import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import * as listpc from '../plugins/owner/listpc.js'
import { parseGithubRepoUrl, isZipBuffer, repoZipCandidates } from '../src/scrapers/download/gitclone.js'
import { parseLivechartCards, cleanPremiereDateText } from '../src/scrapers/anime/livechart.js'

const here = dirname(fileURLToPath(import.meta.url))

for (const [lang, msgs] of Object.entries(listpc.i18n ?? {})) addMessages(lang, msgs)
const t = (k, vars) => translate('id', k, vars)

const OWNER_LID = '121693670506723'
const OWNER_PN = '6285869074622'

function makeCtx({ storage, sock }) {
  const replies = []
  return {
    replies,
    sock,
    chat: `${OWNER_PN}@s.whatsapp.net`,
    sender: `${OWNER_PN}@s.whatsapp.net`,
    senderDigits: OWNER_PN,
    pushName: 'Tes',
    isGroup: false,
    isOwner: true,
    args: [],
    text: '',
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    storage,
    raw: { key: { remoteJid: `${OWNER_PN}@s.whatsapp.net`, id: 'msg1' }, message: {} },
    quoted: null,
    mentionedJids: [],
    botJid: '6285187605007@s.whatsapp.net',
    reply: async (replyText, extra) => {
      replies.push({ text: replyText, extra })
      return { key: { id: 'reply' } }
    },
  }
}

function sockWithLidMapping(map) {
  return {
    signalRepository: {
      lidMapping: {
        async getPNForLID(lidJid) {
          return map[String(lidJid)] ?? null
        },
      },
    },
  }
}

test('listpc: record berkunci LID owner tampil sebagai nomor telepon asli', async () => {
  const storage = memoryStorage()
  await storage.set('users', OWNER_LID, { registered: true, regName: 'Abdul Malik | Omnidevv', lastSeen: 3000 })
  await storage.set('users', OWNER_PN, { registered: false, name: 'LiveTest', lastSeen: 2000 })
  await storage.set('users', '628222222222', { registered: false, name: 'Sari', lastSeen: 1000 })
  const sock = sockWithLidMapping({ [`${OWNER_LID}@lid`]: `${OWNER_PN}@s.whatsapp.net` })
  const ctx = makeCtx({ storage, sock })
  await listpc.handler(ctx)
  const text = ctx.replies[0].text
  assert.match(text, /CHAT PRIBADI TERCATAT \(3\)/)
  // Baris owner (aktivitas terbaru) memakai nomor asli, bukan LID.
  assert.match(text, new RegExp(`Abdul Malik \\| Omnidevv\\* \\(${OWNER_PN}\\)`))
  assert.ok(!text.includes(OWNER_LID), 'LID owner tidak boleh tercetak')
  // Record PN biasa tidak berubah.
  assert.match(text, /LiveTest\* \(6285869074622\)/)
  assert.match(text, /Sari\* \(628222222222\)/)
})

test('listpc: tanpa pemetaan LID yang dikenal, digit tampil apa adanya', async () => {
  const storage = memoryStorage()
  await storage.set('users', '228054844588215', { registered: true, regName: 'dim', lastSeen: 1000 })
  const ctx = makeCtx({ storage, sock: sockWithLidMapping({}) })
  await listpc.handler(ctx)
  assert.match(ctx.replies[0].text, /dim\* \(228054844588215\)/)
})

test('listpc: sock tanpa lidMapping tidak merusak daftar', async () => {
  const storage = memoryStorage()
  await storage.set('users', OWNER_PN, { registered: false, name: 'LiveTest', lastSeen: 1000 })
  const ctx = makeCtx({ storage, sock: {} })
  await listpc.handler(ctx)
  assert.match(ctx.replies[0].text, /LiveTest\* \(6285869074622\)/)
})

test('gitclone: urutan kandidat codeload HEAD, zipball API, codeload branch', () => {
  const parsed = parseGithubRepoUrl('https://github.com/octocat/Hello-World')
  assert.deepEqual(parsed, { owner: 'octocat', repo: 'Hello-World' })
  assert.deepEqual(repoZipCandidates(parsed), [
    'https://codeload.github.com/octocat/Hello-World/zip/HEAD',
    'https://api.github.com/repos/octocat/Hello-World/zipball',
  ])
  assert.deepEqual(repoZipCandidates(parsed, 'master'), [
    'https://codeload.github.com/octocat/Hello-World/zip/HEAD',
    'https://api.github.com/repos/octocat/Hello-World/zipball',
    'https://codeload.github.com/octocat/Hello-World/zip/refs/heads/master',
  ])
  assert.equal(parseGithubRepoUrl('https://example.com/octocat/Hello-World'), null)
  assert.ok(isZipBuffer(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00])))
  assert.ok(!isZipBuffer(Buffer.from('bukan zip sama sekali')))
})

test('livechart musim: tanggal dari data-timestamp, artefak countdown dibuang', () => {
  const fixture = readFileSync(join(here, 'fixtures', 'livechart-season-card.html'), 'utf8')
  const rows = parseLivechartCards(fixture)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].id, '13226')
  assert.match(rows[0].title, /Kusuriya|Apothecary/)
  assert.equal(rows[0].premiereDate, new Date(1793975400 * 1000).toDateString())
  assert.ok(!/~~?[dhms]/.test(rows[0].premiereDate))
})

test('livechart: teks tanggal artefak selalu dikosongkan', () => {
  assert.equal(cleanPremiereDateText('~d ~~h ~~m ~~s'), '')
  assert.equal(cleanPremiereDateText('  '), '')
  assert.equal(cleanPremiereDateText('Oct 3, 2026'), 'Oct 3, 2026')
})
