// Tes perbaikan klaster game gelombang 2 (audit templat 2026-11-05):
// membuktikan perilaku nyata, bukan teks doang. Kuis berjalan di mesin
// sehat repo dan ditutup lewat answerQuiz; togel mengubah saldo sesuai
// tabel pembayaran; pou menyimpan stat; akinator menebak dari jawaban;
// tukar menukar inventaris dua profil; confirmorder mengubah status;
// confess benar terkirim; pinsearch memakai scraper terinjeksi; cek
// menghitung dari data asli; koleksi fun bertambah; audio Quran lolos
// cek magic MP3; file nonaktif hilang dari plugins/.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { getProfile, updateProfile } from '../src/services/user-service.js'
import { answerQuiz, getSession } from '../src/quiz/engine.js'
import { getReplyBinding, dispatchReply } from '../src/ui/reply-router.js'
import * as kuis from '../plugins/game/kuis.js'
import * as benaratausalah from '../plugins/game/benaratausalah.js'
import * as lengkapikalimat from '../plugins/game/lengkapikalimat.js'
import * as surah from '../plugins/game/surah.js'
import * as mathPlugin from '../plugins/game/math.js'
import * as hint from '../plugins/game/hint.js'
import * as togel from '../plugins/game/togel.js'
import * as pou from '../plugins/game/pou.js'
import * as akinator from '../plugins/game/akinator.js'
import * as mlbb from '../plugins/game/mlbb.js'
import * as genshinprofile from '../plugins/game/genshinprofile.js'
import * as karakterff from '../plugins/game/karakterff.js'
import * as tukar from '../plugins/game/tukar.js'
import * as confirmorder from '../plugins/store/confirmorder.js'
import * as pinsearch from '../plugins/fun/pinsearch.js'
import * as confess from '../plugins/fun/confess.js'
import * as cekowner from '../plugins/cek/cekowner.js'
import * as ceksisaumur from '../plugins/cek/ceksisaumur.js'
import * as cekumur from '../plugins/cek/cekumur.js'
import * as gachafemboy from '../plugins/fun/gachafemboy.js'
import * as kulitkerang from '../plugins/fun/kulitkerang.js'
import * as purba from '../plugins/fun/purba.js'
import * as murothal from '../plugins/islamic/murothal.js'
import * as audioquran from '../plugins/islamic/audioquran.js'

const ALL = [kuis, benaratausalah, lengkapikalimat, surah, mathPlugin, hint, togel, pou, akinator, mlbb, genshinprofile, karakterff, tukar, confirmorder, pinsearch, confess, cekowner, ceksisaumur, cekumur, gachafemboy, kulitkerang, purba, murothal, audioquran]
for (const plugin of ALL) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

const CHAT = '120363111@g.us'
const A = '628111111111'
const B = '628222222222'
let seq = 0

function fakeSock() {
  const sent = []
  const relayed = []
  return {
    sent,
    relayed,
    user: { id: '6285187605007@s.whatsapp.net' },
    async sendMessage(jid, content, opts) {
      sent.push({ jid, content, opts })
      seq += 1
      return { key: { id: 'fake' + seq } }
    },
    async relayMessage(jid, message) {
      relayed.push({ jid, message })
      seq += 1
      return { key: { id: 'fake' + seq } }
    },
    async onWhatsApp() {
      return [{ exists: true }]
    },
  }
}

function makeCtx({ storage, sock = fakeSock(), sender = A, text = '', isOwner = false }) {
  const replies = []
  const args = text.split(/\s+/).filter(Boolean)
  return {
    replies,
    sock,
    chat: CHAT,
    sender: sender + '@s.whatsapp.net',
    senderDigits: sender,
    pushName: 'Tes',
    isGroup: true,
    isOwner,
    isAdmin: true,
    isBotAdmin: true,
    command: args[0] ?? '',
    args: args.slice(1),
    text: args.slice(1).join(' '),
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    storage,
    raw: { key: { remoteJid: CHAT, id: 'msg1', participant: sender + '@s.whatsapp.net' }, message: {} },
    quoted: null,
    mentionedJids: [],
    botJid: '6285187605007@s.whatsapp.net',
    reply: async (replyText, extra) => {
      replies.push({ text: replyText, extra })
      return { key: { id: 'reply' } }
    },
  }
}

// Pipeline nyata: args adalah token sesudah nama perintah, text sisanya.
function cmdCtx(opts, command, rest = '') {
  const ctx = makeCtx({ ...opts, text: '' })
  ctx.command = command
  ctx.args = rest.split(/\s+/).filter(Boolean)
  ctx.text = rest
  return ctx
}

const allText = (ctx) => JSON.stringify({ r: ctx.replies, s: ctx.sock.sent, rel: ctx.sock.relayed })

async function startAndAnswer(plugin, command) {
  const storage = memoryStorage()
  const sock = fakeSock()
  const ctx = cmdCtx({ storage, sock }, command)
  await plugin.handler(ctx)
  const session = await getSession(storage, CHAT)
  assert.ok(session, command + ': sesi kuis harus tersimpan')
  const answer = session.answerIndex !== undefined && session.options
    ? 'abcd'[session.answerIndex]
    : session.accepted[0]
  const xpBefore = (await getProfile(storage, A)).xp ?? 0
  const result = await answerQuiz(storage, CHAT, A, answer)
  assert.equal(result.correct, true, command + ': jawaban benar harus diterima')
  assert.equal(result.finished, true, command + ': sesi harus selesai')
  assert.equal(await getSession(storage, CHAT), null, command + ': sesi harus tertutup')
  assert.ok(((await getProfile(storage, A)).xp ?? 0) > xpBefore, command + ': XP harus bertambah')
  return { storage, sock, ctx, session }
}

test('game2 kuis: .kuis MC berjalan di mesin sehat dan ditutup dengan jawaban benar', async () => {
  const { session } = await startAndAnswer(kuis, 'kuis')
  assert.equal(session.type, 'kuisumum')
  assert.equal(session.options.length, 4)
})

test('game2 kuis: .benaratausalah set teks dengan jawaban benar atau salah', async () => {
  const { session } = await startAndAnswer(benaratausalah, 'benaratausalah')
  assert.equal(session.type, 'benaratausalah')
  assert.ok(session.accepted.includes('benar') || session.accepted.includes('salah'))
})

test('game2 kuis: .lengkapikalimat memakai dataset kalimat sendiri', async () => {
  const { session } = await startAndAnswer(lengkapikalimat, 'lengkapikalimat')
  assert.equal(session.type, 'lengkapikalimat')
  assert.match(session.question, /_/)
})

test('game2 kuis: .surah memakai dataset surah', async () => {
  const { session } = await startAndAnswer(surah, 'surah')
  assert.equal(session.type, 'surah')
})

test('game2 kuis: .math membangkitkan soal aritmetika yang hasilnya konsisten', async () => {
  const storage = memoryStorage()
  const ctx = cmdCtx({ storage }, 'math')
  await mathPlugin.handler(ctx)
  const session = await getSession(storage, CHAT)
  assert.ok(session, 'sesi math harus tersimpan')
  const m = session.question.match(/^(\d+) ([+x:-]) (\d+) = \?$/)
  assert.ok(m, 'format soal math: ' + session.question)
  const [a, op, b] = [Number(m[1]), m[2], Number(m[3])]
  const expected = op === '+' ? a + b : op === '-' ? a - b : op === 'x' ? a * b : a / b
  assert.equal(session.accepted[0], String(expected))
  const result = await answerQuiz(storage, CHAT, A, String(expected))
  assert.equal(result.correct, true)
})

test('game2 hint: tanpa sesi jujur, dengan sesi memberi petunjuk sekali saja', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const noCtx = cmdCtx({ storage, sock }, 'hint')
  await hint.handler(noCtx)
  assert.match(allText(noCtx), /Belum ada sesi/)
  const startCtx = cmdCtx({ storage, sock }, 'math')
  await mathPlugin.handler(startCtx)
  const h1 = cmdCtx({ storage, sock }, 'hint')
  await hint.handler(h1)
  assert.match(allText(h1), /PETUNJUK MATH/)
  const session = await getSession(storage, CHAT)
  assert.equal(session.hintUsed, true)
  const h2 = cmdCtx({ storage, sock }, 'hint')
  await hint.handler(h2)
  assert.match(allText(h2), /sudah pernah dipakai/)
})

test('game2 togel: tabel pembayaran resolveTogel di semua tier', () => {
  assert.deepEqual(togel.resolveTogel('42', '42', 100), { tier: 'exact', multiplier: 70 })
  assert.deepEqual(togel.resolveTogel('1234', '1234', 100), { tier: 'exact', multiplier: 3000 })
  assert.deepEqual(togel.resolveTogel('9999', '1999', 100), { tier: 'last3', multiplier: 50 })
  assert.deepEqual(togel.resolveTogel('188', '2888', 100), { tier: 'last2', multiplier: 5 })
  assert.deepEqual(togel.resolveTogel('11', '22', 100), { tier: 'lose', multiplier: 0 })
  assert.equal(togel.drawNumber(4, () => 0).length, 4)
})

test('game2 togel: saldo berubah konsisten dengan angka keluar dan tabel bayar', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, A, { balance: 1000 })
  const ctx = cmdCtx({ storage }, 'togel', '42 100')
  await togel.handler(ctx)
  const text = allText(ctx)
  const drawn = text.match(/ANGKA KELUAR: \*(\d{2,4})\*/)?.[1] ?? text.match(/\*(\d{2,4})\*/)?.[1]
  assert.ok(drawn, 'angka keluar harus tampil: ' + text.slice(0, 300))
  const r = togel.resolveTogel('42', drawn, 100)
  const profile = await getProfile(storage, A)
  assert.equal(profile.balance, 1000 - 100 + r.multiplier * 100)
  // saldo kurang: ditolak tanpa perubahan
  const poor = cmdCtx({ storage }, 'togel', '42 5000')
  await togel.handler(poor)
  assert.match(allText(poor), /kurang|SALDO/)
  assert.equal((await getProfile(storage, A)).balance, profile.balance)
})

test('game2 pou: stat membusuk seiring waktu dan aksi mengubah stat serta saldo', async () => {
  const now = Date.now()
  const decayed = pou.decayPou({ name: 'Pou', kenyang: 80, bahagia: 80, energi: 90, updatedAt: now - 5 * 3600000 }, now)
  assert.equal(decayed.kenyang, 60)
  assert.equal(decayed.bahagia, 65)
  assert.equal(decayed.energi, 80)
  const fed = pou.applyPouAction({ name: 'Pou', kenyang: 50, bahagia: 50, energi: 50, updatedAt: now }, 'makan')
  assert.equal(fed.error, undefined)
  assert.equal(fed.state.kenyang, 85)
  const tired = pou.applyPouAction({ name: 'Pou', kenyang: 50, bahagia: 50, energi: 5, updatedAt: now }, 'main')
  assert.equal(tired.error, 'tired')
  const storage = memoryStorage()
  await updateProfile(storage, A, { balance: 100 })
  const ctx = cmdCtx({ storage }, 'pou', 'makan')
  await pou.handler(ctx)
  const profile = await getProfile(storage, A)
  assert.equal(profile.balance, 85)
  assert.ok(profile.pou, 'stat pou harus tersimpan di profil')
  assert.ok(profile.pou.kenyang > 80, 'kenyang naik sesudah makan: ' + profile.pou.kenyang)
  const status = cmdCtx({ storage }, 'pou')
  await pou.handler(status)
  assert.match(allText(status), /kenyang/i)
})

test('game2 akinator: filter kandidat dan pilihan pertanyaan konsisten', () => {
  const all = akinator.CHARACTERS.map((c) => c.name)
  assert.equal(all.length, 20)
  assert.deepEqual(akinator.filterCandidates(all, { hewan: true, kuning: true }), ['Pikachu', 'SpongeBob SquarePants'])
  assert.deepEqual(akinator.filterCandidates(all, { detektif: true }), ['Conan Edogawa'])
  const key = akinator.pickQuestion(all, [])
  assert.ok(akinator.TRAITS.some((tr) => tr.key === key))
  // tidak ada dua karakter dengan profil sifat identik
  const profiles = new Set(akinator.CHARACTERS.map((c) => [...c.traits].sort().join(',')))
  assert.equal(profiles.size, 20)
})

test('game2 akinator: alur penuh menjawab jujur untuk Pikachu sampai tebakan benar', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const target = akinator.CHARACTERS.find((c) => c.name === 'Pikachu')
  const start = cmdCtx({ storage, sock }, 'akinator')
  await akinator.handler(start)
  assert.match(allText(start), /pertanyaan 1/i)
  let finalText = ''
  for (let step = 0; step < 30; step += 1) {
    const binding = await getReplyBinding(storage, CHAT)
    if (!binding) break
    // Salin fase dari snapshot: objek binding storage bisa berupa
    // referensi hidup yang berubah selama handler berjalan.
    const phase = binding.data.phase
    const guess = binding.data.guess
    const current = binding.data.current
    const answer = phase === 'guess'
      ? (guess === 'Pikachu' ? 'benar' : 'salah')
      : (target.traits.includes(current) ? 'ya' : 'tidak')
    const ctx = cmdCtx({ storage, sock }, 'akinator', answer)
    await akinator.handler(ctx)
    finalText = allText(ctx)
  }
  assert.match(finalText, /Pikachu/)
  assert.equal(await getReplyBinding(storage, CHAT), null, 'sesi akinator harus tertutup sesudah tebakan benar')
})

test('game2 info game: mlbb, genshinprofile, karakterff menjawab dari dataset lokal', async () => {
  const storage = memoryStorage()
  const m = cmdCtx({ storage }, 'mlbb', 'fanny')
  await mlbb.handler(m)
  assert.match(allText(m), /Fanny/)
  assert.equal(mlbb.findHero('fanny').name, 'Fanny')
  const list = cmdCtx({ storage }, 'mlbb')
  await mlbb.handler(list)
  assert.match(allText(list), /Fanny/)
  const g = cmdCtx({ storage }, 'genshinprofile', 'raiden')
  await genshinprofile.handler(g)
  assert.match(allText(g), /Raiden/)
  const f = cmdCtx({ storage }, 'karakterff', 'alok')
  await karakterff.handler(f)
  assert.match(allText(f), /Alok/)
})

test('game2 tukar: tawaran diterima lewat reply dan inventaris dua pihak bertukar', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  await updateProfile(storage, A, { inventory: { batu: 1 } })
  await updateProfile(storage, B, { inventory: { besi: 1 } })
  const offer = cmdCtx({ storage, sock, sender: A }, 'tukar', B + ' batu besi')
  await tukar.handler(offer)
  assert.match(allText(offer), /TAWARAN TUKAR/)
  const binding = await getReplyBinding(storage, CHAT)
  assert.ok(binding, 'tawaran harus terikat sebagai sesi reply')
  assert.equal(binding.kind, 'tukar')
  const replyCtx = cmdCtx({ storage, sock, sender: B }, '', 'terima')
  replyCtx.quoted = { stanzaId: binding.messageId }
  replyCtx.raw = { key: { remoteJid: CHAT, id: 'ans1', participant: B + '@s.whatsapp.net' }, message: { conversation: 'terima' } }
  await dispatchReply(replyCtx)
  const pa = await getProfile(storage, A)
  const pb = await getProfile(storage, B)
  assert.equal(tukar.invCount(pa, 'batu'), 0)
  assert.equal(tukar.invCount(pa, 'besi'), 1)
  assert.equal(tukar.invCount(pb, 'besi'), 0)
  assert.equal(tukar.invCount(pb, 'batu'), 1)
  assert.equal(await getReplyBinding(storage, CHAT), null)
  // yang tidak punya item tidak bisa menawar
  const poor = cmdCtx({ storage, sock, sender: A }, 'tukar', B + ' berlian besi')
  await tukar.handler(poor)
  assert.match(allText(poor), /belum punya/)
})

test('game2 confirmorder: status order berubah menjadi terkonfirmasi dan buyer diberi tahu', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  await storage.set('kv', 'store:orders', [{ id: 'o1', buyer: B, name: 'Pulsa 10k', qty: 1, total: 12000, status: 'baru', at: Date.now() }])
  const ctx = cmdCtx({ storage, sock, isOwner: true }, 'confirmorder', 'o1')
  await confirmorder.handler(ctx)
  assert.match(allText(ctx), /TERKONFIRMASI/)
  const orders = await storage.get('kv', 'store:orders')
  assert.equal(orders[0].status, 'terkonfirmasi')
  const note = sock.sent.find((m) => m.jid === B + '@s.whatsapp.net')
  assert.ok(note, 'buyer harus menerima pemberitahuan')
  const again = cmdCtx({ storage, sock, isOwner: true }, 'confirmorder', 'o1')
  await confirmorder.handler(again)
  assert.match(allText(again), /sudah terkonfirmasi/)
  const missing = cmdCtx({ storage, sock, isOwner: true }, 'confirmorder', 'tidakada')
  await confirmorder.handler(missing)
  assert.match(allText(missing), /tidak ditemukan/)
})

test('game2 confess: pesan terkirim anonim ke target dan pengirim hanya dapat konfirmasi', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const ctx = cmdCtx({ storage, sock, sender: A }, 'confess', B + ' | Aku suka kamu sejak lama')
  await confess.handler(ctx)
  assert.match(allText(ctx), /CONFESS TERKIRIM/)
  const toTarget = sock.sent.find((m) => m.jid === B + '@s.whatsapp.net')
  assert.ok(toTarget, 'pesan confess harus terkirim ke target')
  assert.match(toTarget.content.text, /Aku suka kamu sejak lama/)
  assert.ok(!toTarget.content.text.includes(A), 'nama atau nomor pengirim tidak boleh bocor')
  assert.deepEqual(confess.parseConfess('bukanformat'), null)
  assert.deepEqual(confess.parseConfess(B + ' | halo'), { number: B, message: 'halo' })
})

test('game2 pinsearch: hasil scraper terinjeksi dikirim sebagai gambar dengan tautan pin', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47]), Buffer.alloc(64, 1)])
  const search = async () => ({ results: [{ image: 'https://i.pinimg.com/x.jpg', url: 'https://www.pinterest.com/pin/123/' }] })
  const download = async () => ({ buffer: png })
  const ctx = cmdCtx({ storage, sock }, 'pinsearch', 'kucing')
  await pinsearch.handler(ctx, { search, download })
  const img = sock.sent.find((m) => m.content.image)
  assert.ok(img, 'gambar hasil pin harus terkirim')
  assert.match(img.content.caption, /pinterest\.com\/pin\/123/)
  const empty = cmdCtx({ storage, sock }, 'pinsearch')
  await pinsearch.handler(empty, { search, download })
  assert.match(allText(empty), /kata kunci/)
})

test('game2 cekowner: boolean nyata dari nomor owner dan status isOwner', async () => {
  const storage = memoryStorage()
  process.env.OWNER_NUMBER = '6285869074622'
  try {
    const ownerCtx = cmdCtx({ storage, sender: '6285869074622', isOwner: true }, 'cekowner')
    await cekowner.handler(ownerCtx)
    assert.match(allText(ownerCtx), /OWNER: \*YA\*/)
    const userCtx = cmdCtx({ storage, sender: A }, 'cekowner')
    await cekowner.handler(userCtx)
    assert.match(allText(userCtx), /OWNER: \*BUKAN\*/)
    assert.equal(cekowner.decideOwner({ targetDigits: '1', senderDigits: '1', isOwnerFlag: true, ownerEnvDigits: '2' }), true)
    assert.equal(cekowner.decideOwner({ targetDigits: '3', senderDigits: '1', isOwnerFlag: true, ownerEnvDigits: '2' }), false)
  } finally {
    delete process.env.OWNER_NUMBER
  }
})

test('game2 ceksisaumur: hitungan kalender pasti dari tanggal lahir', () => {
  const birth = ceksisaumur.parseBirthdate('2000-01-01')
  assert.ok(birth)
  const info = ceksisaumur.ageInfo(birth, new Date(Date.UTC(2026, 0, 1)))
  assert.equal(info.age, 26)
  assert.equal(info.daysLived, 9497)
  assert.equal(info.remainDays, 365)
  assert.equal(info.nextAge, 27)
  assert.equal(ceksisaumur.parseBirthdate('31-02-2000'), null)
  assert.equal(ceksisaumur.parseBirthdate('halo'), null)
  assert.ok(ceksisaumur.parseBirthdate('17/05/2008'))
})

test('game2 ceksisaumur: handler membalas statistik hidup nyata', async () => {
  const storage = memoryStorage()
  const ctx = cmdCtx({ storage }, 'ceksisaumur', '2008-05-17')
  await ceksisaumur.handler(ctx)
  assert.match(allText(ctx), /sudah hidup/i)
  const bad = cmdCtx({ storage }, 'ceksisaumur', 'kemarin')
  await ceksisaumur.handler(bad)
  assert.match(allText(bad), /tanggal lahir/i)
})

test('game2 cekumur: kuis 5 pertanyaan menghasilkan umur mental dari skor jawaban', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const start = cmdCtx({ storage, sock }, 'cekumur')
  await cekumur.handler(start)
  assert.match(allText(start), /PERTANYAAN 1/)
  let last = start
  for (let i = 0; i < 5; i += 1) {
    last = cmdCtx({ storage, sock }, 'cekumur', 'a')
    await cekumur.handler(last)
  }
  assert.match(allText(last), /UMUR MENTAL/)
  assert.match(allText(last), /\*8 tahun\*/)
  assert.equal(cekumur.mentalAge(5), 8)
  assert.equal(cekumur.mentalAge(20), 50)
  assert.equal(await getReplyBinding(storage, CHAT), null)
})

test('game2 koleksi: gachafemboy, kulitkerang, purba menyimpan koleksi yang bertambah', async () => {
  const storage = memoryStorage()
  const g1 = cmdCtx({ storage }, 'gachafemboy')
  await gachafemboy.handler(g1)
  const g2 = cmdCtx({ storage }, 'gachafemboy')
  await gachafemboy.handler(g2)
  const gState = await storage.get('gachafemboy', 'collection:' + A)
  assert.equal(gState.pulls, 2)
  assert.ok(gState.owned.length >= 1)
  assert.equal(gachafemboy.pickWeighted(gachafemboy.POOL, () => 0).name, 'Nagisa Shiota')
  const k1 = cmdCtx({ storage }, 'kulitkerang')
  await kulitkerang.handler(k1)
  const kState = await storage.get('kulitkerang', 'collection:' + A)
  assert.equal(kState.draws, 1)
  assert.equal(Object.keys(kState.owned).length, 1)
  assert.equal(kulitkerang.SHELLS.length, 12)
  const p1 = cmdCtx({ storage }, 'purba')
  await purba.handler(p1)
  const pState = await storage.get('purba', 'collection:' + A)
  assert.equal(pState.draws, 1)
  assert.equal(purba.CREATURES.length, 12)
})

const ID3 = Buffer.concat([Buffer.from('ID3', 'latin1'), Buffer.alloc(256, 2)])
const equranMeta = { data: { namaLatin: 'Al-Fatihah', jumlahAyat: 7 } }
function quranFetch({ length = 1000 } = {}) {
  return async (url, opts) => {
    if (String(url).includes('equran.id')) return { ok: true, json: async () => equranMeta }
    if (opts?.method === 'HEAD') return { ok: true, headers: { get: (h) => (h === 'content-length' ? String(length) : null) } }
    return { ok: true }
  }
}

test('game2 murothal: audio surah valid terkirim, surah raksasa dijawab tautan jujur', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const download = async () => ({ buffer: ID3 })
  const ctx = cmdCtx({ storage, sock }, 'murothal', '1')
  await murothal.handler(ctx, { fetchImpl: quranFetch(), download })
  const audio = sock.sent.find((m) => m.content.audio)
  assert.ok(audio, 'audio murothal harus terkirim')
  assert.equal(audio.content.mimetype, 'audio/mpeg')
  assert.ok(murothal.isMp3Buffer(ID3))
  assert.ok(!murothal.isMp3Buffer(Buffer.from('bukan mp3')))
  assert.equal(murothal.surahAudioUrl(36), 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/36.mp3')
  const bigSock = fakeSock()
  const big = cmdCtx({ storage, sock: bigSock }, 'murothal', '2')
  await murothal.handler(big, { fetchImpl: quranFetch({ length: 200 * 1048576 }), download })
  assert.ok(!bigSock.sent.find((m) => m.content.audio), 'surah raksasa tidak boleh dilampirkan paksa')
  assert.match(allText(big), /cdn\.islamic\.network/)
})

test('game2 audioquran: audio per ayat terkirim dan nomor ayat divalidasi', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const download = async () => ({ buffer: ID3 })
  const ctx = cmdCtx({ storage, sock }, 'audioquran', '1 1')
  await audioquran.handler(ctx, { fetchImpl: quranFetch(), download })
  const audio = sock.sent.find((m) => m.content.audio)
  assert.ok(audio, 'audio ayat harus terkirim')
  assert.equal(audioquran.ayahAudioUrl(1, 1), 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3')
  assert.equal(audioquran.ayahAudioUrl(2, 286), 'https://everyayah.com/data/Alafasy_128kbps/002286.mp3')
  const badSock = fakeSock()
  const bad = cmdCtx({ storage, sock: badSock }, 'audioquran', '1 8')
  await audioquran.handler(bad, { fetchImpl: quranFetch(), download })
  assert.match(allText(bad), /hanya punya \*7\* ayat/)
  assert.ok(!badSock.sent.find((m) => m.content.audio))
})

test('game2 nonaktif: file klon dan tanpa fondasi hilang dari plugins dan tersimpan di disabled-plugins', () => {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const gone = [
    'plugins/game/maths.js', 'plugins/game/wwkill.js', 'plugins/game/wwprotect.js', 'plugins/game/wwsee.js',
    'plugins/game/wwsorcerer.js', 'plugins/game/werewolf.js', 'plugins/game/tetromino.js', 'plugins/game/ccsd.js',
    'plugins/game/angrybirds.js', 'plugins/game/attack.js', 'plugins/game/calo.js', 'plugins/game/checkers.js',
    'plugins/game/colorblock.js', 'plugins/game/fisht.js', 'plugins/game/kyubigame.js', 'plugins/game/mortalkombat.js',
    'plugins/game/nixelgames.js', 'plugins/game/perangsarung.js', 'plugins/game/sonik.js', 'plugins/game/speedydash.js',
    'plugins/game/survival.js', 'plugins/fun/autorimuru.js', 'plugins/fun/jomok.js', 'plugins/islamic/murrotal.js',
  ]
  for (const rel of gone) {
    assert.equal(existsSync(root + rel), false, rel + ' harus sudah tidak aktif')
    const name = rel.split('/').at(-1)
    assert.equal(existsSync(root + 'disabled-plugins/' + name), true, name + ' harus tersimpan di disabled-plugins')
  }
})
