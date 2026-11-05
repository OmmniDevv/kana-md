// Penjaga regresi bug 2026-11-06 (verifikasi live Irisan 2): balasan .work
// mencetak "XP: *+{Xp}*" mentah. Template keluarga aksi RPG memakai {Xp}
// (X besar) sementara semua handler mengirim variabel xp (huruf kecil), dan
// interpolasi i18n peka huruf, jadi placeholder lolos apa adanya. Kelas yang
// sama ditemukan di 21 plugin. Tes ini merender handler jalur "done" dengan
// data tiruan realistis dan melarang sisa pola {placeholder} di keluaran,
// sekaligus menegaskan angka XP asli benar-benar tampil.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { updateProfile } from '../src/services/user-service.js'
import * as work from '../plugins/rpg/work.js'
import * as beg from '../plugins/rpg/beg.js'
import * as freelance from '../plugins/rpg/freelance.js'
import * as koboy from '../plugins/rpg/koboy.js'
import * as kurir from '../plugins/rpg/kurir.js'
import * as mulung from '../plugins/rpg/mulung.js'
import * as nambalban from '../plugins/rpg/nambalban.js'
import * as ngamen from '../plugins/rpg/ngamen.js'
import * as ngemis from '../plugins/rpg/ngemis.js'
import * as nyapu from '../plugins/rpg/nyapu.js'
import * as ojek from '../plugins/rpg/ojek.js'
import * as parkir from '../plugins/rpg/parkir.js'
import * as pelabuhan from '../plugins/rpg/pelabuhan.js'
import * as streamer from '../plugins/rpg/streamer.js'
import * as taksi from '../plugins/rpg/taksi.js'
import * as berlatih from '../plugins/rpg/berlatih.js'
import * as training from '../plugins/rpg/training.js'
import * as airdrop from '../plugins/rpg/airdrop.js'
import * as absenweekly from '../plugins/rpg/absenweekly.js'
import * as moneytopoin from '../plugins/rpg/moneytopoin.js'
import * as pointomoney from '../plugins/rpg/pointomoney.js'

const ALL = [work, beg, freelance, koboy, kurir, mulung, nambalban, ngamen, ngemis, nyapu, ojek, parkir, pelabuhan, streamer, taksi, berlatih, training, airdrop, absenweekly, moneytopoin, pointomoney]
for (const plugin of ALL) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)
const ME = '628111111111'
const PLACEHOLDER = /\{[A-Za-z]+\}/

function makeCtx({ storage, args = [] } = {}) {
  const replies = []
  return {
    replies,
    sock: { async sendMessage() { return { key: { id: 'x' } } } },
    chat: ME + '@s.whatsapp.net',
    sender: ME + '@s.whatsapp.net',
    senderDigits: ME,
    pushName: 'Tes',
    isGroup: false,
    isOwner: false,
    args,
    text: args.join(' '),
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    storage,
    quoted: null,
    mentionedJids: [],
    reply: async (replyText) => { replies.push({ text: replyText }); return { key: { id: 'r' } } },
  }
}

async function seededStorage(patch = {}) {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { energy: 100, balance: 100000, xp: 0, ...patch })
  return storage
}

// Math.random dipatok 0.99 supaya cabang gagal acak (peluang 10-15 persen)
// tidak menutupi jalur "done" yang sedang diuji.
async function runDone(plugin, { args = [], patch = {} } = {}) {
  const storage = await seededStorage(patch)
  const ctx = makeCtx({ storage, args })
  const orig = Math.random
  Math.random = () => 0.99
  try {
    await plugin.handler(ctx)
  } finally {
    Math.random = orig
  }
  assert.ok(ctx.replies.length > 0, 'handler tidak membalas')
  return ctx.replies.at(-1).text
}

const XP_DONE = /XP: \*\+\d+\*/
const JOBS = [
  ['work', work], ['beg', beg], ['freelance', freelance], ['koboy', koboy],
  ['kurir', kurir], ['mulung', mulung], ['nambalban', nambalban],
  ['ngamen', ngamen], ['ngemis', ngemis], ['nyapu', nyapu], ['ojek', ojek],
  ['parkir', parkir], ['pelabuhan', pelabuhan], ['streamer', streamer],
  ['taksi', taksi], ['airdrop', airdrop], ['absenweekly', absenweekly],
]
for (const [name, plugin] of JOBS) {
  test(`${name}: balasan done memuat angka XP asli, tanpa placeholder bocor`, async () => {
    const text = await runDone(plugin)
    assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
    assert.ok(XP_DONE.test(text), `angka XP tidak tampil: ${text}`)
  })
}

for (const [name, plugin] of [['berlatih', berlatih], ['training', training]]) {
  test(`${name}: balasan done memuat angka XP latihan asli, tanpa placeholder bocor`, async () => {
    const text = await runDone(plugin)
    assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
    assert.ok(/XP LATIHAN: \*\+\d+\*/.test(text), `angka XP latihan tidak tampil: ${text}`)
  })
}

test('moneytopoin: balasan done memuat XP hasil tukar asli, tanpa placeholder bocor', async () => {
  const text = await runDone(moneytopoin, { args: ['100'] })
  assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
  assert.ok(text.includes('*+10 XP*'), `XP hasil tukar tidak tampil: ${text}`)
  assert.ok(text.includes('TOTAL XP: *10*'), `total XP tidak tampil: ${text}`)
})

test('pointomoney: balasan poor memuat XP asli, tanpa placeholder bocor', async () => {
  const storage = await seededStorage({ xp: 5 })
  const ctx = makeCtx({ storage, args: ['50'] })
  await pointomoney.handler(ctx)
  const text = ctx.replies.at(-1).text
  assert.ok(!PLACEHOLDER.test(text), `placeholder bocor: ${text}`)
  assert.ok(text.includes('XP kamu *5*'), `angka XP tidak tampil: ${text}`)
})
