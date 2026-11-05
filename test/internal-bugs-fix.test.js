// Penjaga regresi klaster bug internal dari verifikasi live 2026-11-06:
// 1) .playcall "fn is not a function": withTempDir dipanggil dua argumen
//    (prefix, fn) padahal runner hanya menerima fn. Runner kini sah untuk
//    kedua bentuk; kelas yang sama di hdvid/imgtools/resizevideo ikut sembuh.
// 2) .selectskill error generik: handler memakai JOBS tetapi hanya mengimpor
//    JOB_MAP dari src/rpg/data.js.
// 3) Perintah tertutup alias: .dino dan .report mati total karena nama mereka
//    kalah dari alias plugin lain; 7 konflik alias lain mengotori karantina.
//    Tes ini juga menangkap konflik ke-10 yang tidak tercatat di matriks:
//    user/konversi.js (duplikat murni .converter) selalu dikarantina karena
//    namanya menabrak alias .converter; file itu kini diarsipkan ke
//    disabled-plugins/ dan .konversi terlayani sebagai alias .converter.
//    Registry akhir tidak boleh punya bentrok nama/alias sama sekali dan
//    semua token sengketa harus resolve ke pemilik yang diputuskan.
// 4) Kosmetik: kode alasan mesin RPG (no_item dst.) tidak boleh tampil
//    mentah; leaderboard harus meresolusi kunci LID ke nomor telepon.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, writeFile, readFile, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { getProfile, updateProfile } from '../src/services/user-service.js'
import { withTempDir } from '../src/scrapers/runner.js'
import { reasonText } from '../src/rpg/reasons.js'
import { loadPlugins } from '../src/core/plugin-loader.js'
import * as playcall from '../plugins/search/playcall.js'
import * as selectskill from '../plugins/rpg/selectskill.js'
import * as trading from '../plugins/rpg/trading.js'
import * as miskin from '../plugins/economy/leaderboard-orang-miskin.js'

const run = promisify(execFile)
const PLUGINS_DIR = fileURLToPath(new URL('../plugins', import.meta.url))
const ME = '628111111111'
const t = (k, vars) => translate('id', k, vars)
for (const plugin of [selectskill, trading, miskin]) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}

function makeCtx({ storage, args = [], sock = null } = {}) {
  const replies = []
  return {
    replies,
    sock: sock ?? { async sendMessage() { return { key: { id: 'x' } } } },
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
    raw: null,
    quoted: null,
    mentionedJids: [],
    reply: async (replyText) => { replies.push(String(replyText)); return { key: { id: 'r' } } },
  }
}

test('withTempDir sah untuk bentuk (fn) dan (prefix, fn), folder selalu dibersihkan', async () => {
  let dirA
  const outA = await withTempDir(async (dir) => { dirA = dir; return 42 })
  assert.equal(outA, 42)
  await assert.rejects(stat(dirA))

  let dirB
  const outB = await withTempDir('kana-playcall-', async (dir) => {
    dirB = dir
    await writeFile(join(dir, 'x.txt'), 'isi')
    return readFile(join(dir, 'x.txt'), 'utf8')
  })
  assert.equal(outB, 'isi')
  assert.ok(dirB.split('/').pop().startsWith('kana-playcall-'))
  await assert.rejects(stat(dirB))

  await assert.rejects(withTempDir('kana-x-'), /callback/)
})

test('playcall.toVoiceNote mengonversi mp3 asli menjadi ogg opus (magic OggS)', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kana-playcall-test-'))
  const mp3 = join(dir, 'nada.mp3')
  await run('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-codec:a', 'libmp3lame', mp3])
  const note = await playcall.toVoiceNote(await readFile(mp3))
  assert.ok(Buffer.isBuffer(note) && note.length > 100)
  assert.equal(note.subarray(0, 4).toString('latin1'), 'OggS')
})

test('selectskill tanpa argumen menampilkan daftar pekerjaan, dengan argumen memilih skill', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { balance: 1000, xp: 0 })

  const ctxList = makeCtx({ storage })
  await selectskill.handler(ctxList)
  assert.equal(ctxList.replies.length, 1)
  assert.match(ctxList.replies[0], /penambang/)
  assert.match(ctxList.replies[0], /nelayan/)
  assert.doesNotMatch(ctxList.replies[0], /\{[A-Za-z]+\}/)

  const ctxPick = makeCtx({ storage, args: ['petani'] })
  await selectskill.handler(ctxPick)
  assert.match(ctxPick.replies[0], /Petani/)
  const profile = await getProfile(storage, ME)
  assert.equal(profile.job, 'petani')
})

test('registry bebas bentrok nama/alias dan token sengketa resolve ke pemilik yang benar', async () => {
  const registry = await loadPlugins(PLUGINS_DIR)
  const clashes = registry.quarantined.filter((q) => /bentrok/.test(q.reason))
  assert.deepEqual(clashes, [])
  const expectResolve = {
    dino: 'dino', purba: 'purba',
    report: 'report', lapor: 'lapor',
    kerang: 'kerangajaib', kulitkerang: 'kulitkerang',
    matematika: 'matematika', math: 'math', maths: 'math',
    bola: 'tebakbola', livescore: 'livescore',
    ayat: 'ayat', audioquran: 'audioquran',
    murottal: 'murottal', murrotal: 'murothal', murothal: 'murothal',
    weton: 'weton', primbon: 'primbon',
    serverstat: 'statserver', speedbot: 'speedbot', statserver: 'statserver',
    konversi: 'converter', converter: 'converter',
  }
  for (const [token, owner] of Object.entries(expectResolve)) {
    assert.equal(registry.resolve(token)?.config.name, owner, `token ${token} harus resolve ke ${owner}`)
  }
})

test('reasonText memetakan kode mesin ke teks manusia dan tidak pernah mengembalikan kode mentah', () => {
  assert.equal(reasonText('no_item', 'id'), 'itemnya tidak ada di karungmu')
  assert.equal(reasonText('already_in_clan', 'id'), 'kamu sudah tergabung di clan/guild')
  assert.equal(reasonText('not_found', 'en'), 'not found')
  assert.equal(reasonText('no_clan', 'id'), 'kamu belum punya clan/guild')
  assert.doesNotMatch(reasonText('kode_aneh_baru', 'id'), /kode_aneh_baru/)
  assert.doesNotMatch(reasonText(undefined, 'id'), /undefined/)
})

test('trading dengan karung kosong membalas alasan manusia, bukan kode (no_item)', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { balance: 1000, xp: 0, inventory: {} })
  const ctx = makeCtx({ storage, args: ['besi', '1'] })
  await trading.handler(ctx)
  assert.equal(ctx.replies.length, 1)
  assert.match(ctx.replies[0], /tidak ada di karungmu/)
  assert.doesNotMatch(ctx.replies[0], /no_item/)
})

test('leaderboard-orang-miskin meresolusi kunci LID ke nomor telepon', async () => {
  const storage = memoryStorage()
  const LID = '121693670506723'
  const PN = '6285869074622'
  await updateProfile(storage, LID, { balance: 5, xp: 0, regName: 'Pemilik' })
  await updateProfile(storage, ME, { balance: 900, xp: 0 })
  const sock = {
    async sendMessage() { return { key: { id: 'x' } } },
    signalRepository: {
      lidMapping: {
        async getPNForLID(jid) { return jid === `${LID}@lid` ? `${PN}@s.whatsapp.net` : null },
      },
    },
  }
  const ctx = makeCtx({ storage, sock })
  await miskin.handler(ctx)
  assert.equal(ctx.replies.length, 1)
  assert.match(ctx.replies[0], new RegExp(PN))
  assert.doesNotMatch(ctx.replies[0], new RegExp(LID))
})
