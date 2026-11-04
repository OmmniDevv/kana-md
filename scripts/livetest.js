// Harness tes live MODE A untuk bot KANA (lihat §5 spesifikasi induk).
//
// Cara pakai (hanya saat sesi tes bareng owner, sesi bot sudah tersimpan):
//   LIVETEST=1 node scripts/livetest.js
// dengan TEST_CHATS terisi di .env (daftar JID/digit chat uji, pisah koma).
// package.json tidak diubah; perintah di atas adalah cara menjalankannya.
//
// Pilihan irisan uji (env proses, bukan .env):
// - TEST_FILTER: regex (tidak peka huruf) atas nama plugin atau input uji.
//   Dipakai untuk mengetes SATU plugin saja per giliran, mis.
//   TEST_FILTER='^profil$' hanya menjalankan uji milik plugin profil.
// - TEST_OFFSET dan TEST_LIMIT: memilih irisan berurutan dari daftar uji
//   gabungan (builtin dulu, lalu uji plugin sesuai urutan registry).
//
// Apa itu Mode A:
// - Harness menyuntikkan pesan masuk SINTETIS langsung ke pipeline lewat
//   pipeline.handle(sock, raw), bukan lewat event WhatsApp sungguhan.
// - Balasan bot dikirim SUNGGUHAN oleh pipeline lewat sock yang sama ke
//   chat uji, jadi user melihat hasilnya di HP.
// - Yang diuji: seluruh logika pipeline, gates, handler, dan pengiriman.
//   Yang TIDAK diuji: decode pesan masuk dari jaringan WhatsApp.
//
// Batasan jujur (jangan dibaca sebagai verifikasi balasan):
// - Harness Mode A TIDAK membaca balasan masuk dan TIDAK mencocokkan isi
//   balasan dengan expect secara otomatis.
// - Kolom expect di file hasil hanya PANDUAN tampilan untuk user: user
//   mencocokkan sendiri di HP apakah balasan yang muncul sesuai pola itu.
// - Status tiap uji dicatat sebagai 'sent', artinya pesan sintetis sudah
//   diserahkan ke pipeline. Itu bukan vonis lulus. Penilaian akhir
//   (lulus, rusak, tidak muncul) adalah penilaian visual user di HP.
// - Karena itu ringkasan hasil hanya menghitung penanda yang bisa diamati
//   harness: berapa yang terkirim ke pipeline, berapa yang error saat
//   diserahkan, dan berapa yang menunggu konfirmasi visual user.
//
// Pengaman:
// - Hanya jalan sebagai CLI bila LIVETEST=1 dan NODE_ENV bukan production.
// - Hanya mengirim ke chat di TEST_CHATS; chat lain ditolak sebelum jalan.
// - Cek kesehatan akun sebelum mulai tiap chat; berhenti total bila
//   timelock aktif atau kuota chat baru capped/warned.
// - Jeda acak 2000 sampai 4000 ms antar pesan keluar, maks 20 pesan keluar
//   per menit (jendela geser sederhana).
// - Satu pemanggilan CLI hanya menguji SATU chat: chat pertama di
//   TEST_CHATS. Chat berikutnya diuji pada pemanggilan terpisah, supaya
//   sesi tes tetap satu per satu sesuai protokol §5.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
export const DEFAULT_RESULTS_PATH = join(here, '..', 'test', 'live-results.json')

const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '')

// Mode tes hanya aktif bila LIVETEST persis '1' dan bukan production.
export function isLiveTestEnabled(env = process.env) {
  return String(env?.LIVETEST ?? '') === '1' && env?.NODE_ENV !== 'production'
}

// Penjaga mode: melempar error jelas bila mode tes tidak aktif.
// Dipakai guard di awal main() dan dites unit sebagai penolak mode nonaktif.
export function guardMode(env = process.env) {
  if (String(env?.LIVETEST ?? '') !== '1') {
    throw new Error('Mode tes live nonaktif: set LIVETEST=1 untuk menjalankan harness ini.')
  }
  if (env?.NODE_ENV === 'production') {
    throw new Error('Mode tes live ditolak: NODE_ENV=production.')
  }
  return true
}

// Parse TEST_CHATS menjadi daftar JID/digit yang diizinkan.
// Menerima objek env ({ TEST_CHATS }) atau string mentahnya langsung.
// Entri kosong dibuang, spasi di sekitar koma dibersihkan.
export function parseTestChats(env = process.env) {
  const raw = typeof env === 'string' ? env : env?.TEST_CHATS ?? ''
  return String(raw)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

// Penjaga target: chat hanya boleh bila cocok persis sebagai JID atau
// cocok digitnya dengan salah satu entri daftar yang diizinkan.
// Daftar kosong menolak semua chat.
export function assertChatAllowed(chat, allowed) {
  const list = Array.isArray(allowed) ? allowed : parseTestChats(allowed)
  if (!chat || typeof chat !== 'string' || !chat.trim()) {
    throw new Error('Chat uji kosong, ditolak.')
  }
  if (!list.length) {
    throw new Error('TEST_CHATS kosong: semua chat ditolak oleh harness tes live.')
  }
  const target = chat.trim()
  const targetDigits = digitsOnly(target)
  const ok = list.some((entry) => {
    if (entry === target) return true
    const entryDigits = digitsOnly(entry)
    return Boolean(targetDigits) && entryDigits === targetDigits
  })
  if (!ok) {
    throw new Error(`Chat tidak ada di TEST_CHATS, ditolak oleh harness tes live: ${target}`)
  }
  return true
}

// Daftar uji bawaan: perintah inti yang aman (semua diawali prefix titik).
// expect adalah pola panduan tampilan di HP, bukan vonis otomatis.
export const BUILTIN_TESTS = [
  { input: '.ping', expect: /pong|KANA/i },
  { input: '.menu', expect: /KANA/ },
  { input: '.help', expect: /.+/ },
  { input: '.lang', expect: /.+/ },
  { input: '.profil', expect: /.+/ },
]

// Kumpulkan definisi test milik plugin dari registry.
// Plugin mengekspor test = { input, expect } (expect string atau RegExp);
// loader menyimpan modul test itu sebagai plugin.test. Plugin tanpa test
// yang valid dilewati diam diam. Registry didukung dalam bentuk hasil
// loadPlugins (punya list()), Map plugins, atau array plugin langsung.
export function collectPluginTests(registry) {
  if (!registry) return []
  let plugins = []
  if (typeof registry.list === 'function') plugins = registry.list()
  else if (registry.plugins instanceof Map) plugins = [...registry.plugins.values()]
  else if (Array.isArray(registry)) plugins = registry
  else if (Array.isArray(registry.plugins)) plugins = registry.plugins

  const tests = []
  for (const plugin of plugins ?? []) {
    const t = plugin?.test
    if (!t || typeof t.input !== 'string' || !t.input.trim()) continue
    if (typeof t.expect !== 'string' && !(t.expect instanceof RegExp)) continue
    tests.push({ input: t.input, expect: t.expect, plugin: plugin?.config?.name ?? null })
  }
  return tests
}

// Kompilasi TEST_FILTER menjadi RegExp. Kosong berarti tanpa filter.
// Regex tidak valid melempar error jelas supaya sesi tes tidak jalan
// dengan irisan yang salah secara diam diam.
export function compileTestFilter(env = process.env) {
  const raw = typeof env?.TEST_FILTER === 'string' ? env.TEST_FILTER.trim() : ''
  if (!raw) return null
  try {
    return new RegExp(raw, 'i')
  } catch {
    throw new Error(`TEST_FILTER bukan regex valid: ${raw}`)
  }
}

// Saring daftar uji dengan TEST_FILTER: entri lolos bila nama plugin
// ATAU input ujinya cocok dengan regex. Tanpa filter, daftar utuh.
export function filterTests(tests, env = process.env) {
  const list = Array.isArray(tests) ? tests : []
  const pattern = compileTestFilter(env)
  if (!pattern) return list
  return list.filter((entry) => {
    const plugin = typeof entry?.plugin === 'string' ? entry.plugin : ''
    const input = typeof entry?.input === 'string' ? entry.input : ''
    return pattern.test(plugin) || pattern.test(input)
  })
}

// Iris daftar uji dengan TEST_OFFSET (default 0) dan TEST_LIMIT
// (default semua). Nilai tidak valid jatuh ke default yang aman.
export function sliceTests(tests, env = process.env) {
  const list = Array.isArray(tests) ? tests : []
  const total = list.length
  const offsetParsed = Number.parseInt(env?.TEST_OFFSET ?? '0', 10)
  const offset = Number.isNaN(offsetParsed) || offsetParsed < 0 ? 0 : offsetParsed
  const limitRaw = env?.TEST_LIMIT
  if (limitRaw == null || limitRaw === '') return list.slice(offset)
  const limitParsed = Number.parseInt(limitRaw, 10)
  const limit = Number.isNaN(limitParsed) || limitParsed < 0 ? total : limitParsed
  return list.slice(offset, offset + limit)
}

// Ringkasan dari penanda yang benar benar bisa diamati harness Mode A:
// status 'sent' (diserahkan ke pipeline) dan 'error' (gagal diserahkan).
// Tidak ada hitungan lulus otomatis, karena balasan tidak dibaca harness.
export function summarizeResults(results) {
  const list = Array.isArray(results) ? results : []
  const sent = list.filter((r) => r.status === 'sent').length
  const error = list.filter((r) => r.status === 'error').length
  return {
    total: list.length,
    sent,
    error,
    menungguKonfirmasiVisual: sent,
    lulusOtomatis: null,
    catatan: 'Mode A tidak menilai balasan. Status sent menunggu penilaian visual user di HP dengan panduan kolom expect.',
  }
}

// Baca sinyal kesehatan akun sesuai README library v1.4.7:
// - fetchAccountReachoutTimelock() mengembalikan { isActive,
//   timeEnforcementEnds (Date atau undefined), enforcementType }.
// - fetchNewChatMessageCap() mengembalikan { status (NONE, FIRST_WARNING,
//   SECOND_WARNING, CAPPED), capped, warned, totalQuota, usedQuota,
//   remaining, cycleStart, cycleEnd, serverTime, ... }.
// Masalah terdeteksi bila isActive true, capped true, atau warned true.
// Fungsi yang tidak ada di sock dilewati. Bila panggilan kesehatan gagal,
// hasilnya dianggap bermasalah secara konservatif (berhenti, bukan lanjut
// buta), karena akun owner taruhannya.
export async function checkAccountHealth(sock) {
  const details = {}
  const problems = []
  try {
    if (typeof sock?.fetchAccountReachoutTimelock === 'function') {
      const lock = await sock.fetchAccountReachoutTimelock()
      details.reachoutTimelock = {
        isActive: lock?.isActive ?? null,
        enforcementType: lock?.enforcementType ?? null,
        timeEnforcementEnds: lock?.timeEnforcementEnds ? String(lock.timeEnforcementEnds) : null,
      }
      if (lock?.isActive === true) problems.push('reachout timelock aktif (isActive)')
    }
    if (typeof sock?.fetchNewChatMessageCap === 'function') {
      const cap = await sock.fetchNewChatMessageCap()
      details.newChatMessageCap = {
        status: cap?.status ?? null,
        capped: cap?.capped ?? null,
        warned: cap?.warned ?? null,
        totalQuota: cap?.totalQuota ?? null,
        usedQuota: cap?.usedQuota ?? null,
        remaining: cap?.remaining ?? null,
      }
      if (cap?.capped === true) problems.push('kuota chat baru capped')
      if (cap?.warned === true) problems.push(`kuota chat baru warned (status ${cap?.status ?? 'tidak diketahui'})`)
    }
  } catch (err) {
    problems.push(`cek kesehatan akun gagal: ${err.message}`)
  }
  return { ok: problems.length === 0, problems, details }
}

const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Runner Mode A. Hanya dipakai saat benar benar live (CLI lolos guard).
// Normalisasi target chat menjadi JID penuh. TEST_CHATS boleh berisi digit
// mentah ("6285...") dan pipeline/library butuh JID valid: remoteJid digit
// mentah membuat jidDecode gagal ("Cannot destructure property 'user'")
// sehingga handler error sebelum sempat jalan (temuan tes live 2026-11-04).
// JID grup (@g.us) dan JID user yang sudah lengkap dibiarkan apa adanya.
export function normalizeChatJid(chat) {
  const value = String(chat ?? '').trim()
  if (value.endsWith('@g.us') || value.endsWith('@s.whatsapp.net')) return value
  return `${value.replace(/\D/g, '')}@s.whatsapp.net`
}

// sleep dan random bisa diinjeksi agar logika jeda bisa dites tanpa kirim.
// Hasil tiap uji: { chat, input, expect (string), sentAt, status }.
// Bila kesehatan akun bermasalah sebelum sebuah chat mulai, runner
// berhenti total dan mengembalikan status 'aborted-health'.
export async function runLiveTest({
  sock,
  pipeline,
  storage, // diterima agar sejajar rakitan bot; pipeline sudah membawanya
  chats,
  tests = BUILTIN_TESTS,
  sleep = realSleep,
  random = Math.random,
} = {}) {
  void storage
  if (!sock) throw new Error('runLiveTest butuh sock')
  if (!pipeline || typeof pipeline.handle !== 'function') throw new Error('runLiveTest butuh pipeline.handle')
  const allowed = Array.isArray(chats) ? chats : parseTestChats(chats)
  if (!allowed.length) return { status: 'no-chats', results: [], summary: summarizeResults([]) }

  const results = []
  const sentWindow = []
  let sentCount = 0
  let counter = 0

  for (const chat of allowed) {
    assertChatAllowed(chat, allowed)

    const health = await checkAccountHealth(sock)
    if (!health.ok) {
      return {
        status: 'aborted-health',
        reason: health.problems.join('; '),
        health,
        results,
        summary: summarizeResults(results),
      }
    }

    for (const entry of tests) {
      const input = entry?.input
      if (typeof input !== 'string' || !input.trim()) continue
      const expect = entry?.expect ?? /.+/

      // Jeda acak 2000 sampai 4000 ms antar pesan keluar.
      if (sentCount > 0) {
        await sleep(2000 + Math.floor(random() * 2000))
      }
      // Batas maks 20 pesan keluar per menit, jendela geser sederhana:
      // buang cap waktu di luar 60 detik terakhir; bila jendela penuh,
      // tunggu sampai cap tertua keluar dari jendela (satu kali tunggu).
      const nowBefore = Date.now()
      while (sentWindow.length && nowBefore - sentWindow[0] >= 60000) sentWindow.shift()
      if (sentWindow.length >= 20) {
        await sleep(sentWindow[0] + 60000 - Date.now())
        const nowAfter = Date.now()
        while (sentWindow.length && nowAfter - sentWindow[0] >= 60000) sentWindow.shift()
      }

      counter += 1
      const jid = normalizeChatJid(chat)
      const isGroup = jid.endsWith('@g.us')
      const raw = {
        key: {
          remoteJid: jid,
          fromMe: false,
          participant: isGroup ? jid : undefined,
          id: `LIVETEST-${Date.now()}-${counter}-${Math.floor(random() * 1e9)}`,
        },
        message: { conversation: input },
        pushName: 'LiveTest',
      }
      const sentAt = new Date().toISOString()
      try {
        await pipeline.handle(sock, raw)
        results.push({ chat: jid, input, expect: String(expect), plugin: entry?.plugin ?? null, sentAt, status: 'sent' })
      } catch (err) {
        results.push({ chat: jid, input, expect: String(expect), plugin: entry?.plugin ?? null, sentAt, status: 'error', error: err.message })
      }
      sentWindow.push(Date.now())
      sentCount += 1
    }
  }

  return { status: 'completed', results, summary: summarizeResults(results) }
}

// Tulis hasil ke JSON (default test/live-results.json di root proyek).
// Menerima array hasil mentah atau objek keluaran runLiveTest.
export async function writeResults(path = DEFAULT_RESULTS_PATH, resultsInput = []) {
  const results = Array.isArray(resultsInput) ? resultsInput : resultsInput?.results ?? []
  const payload = {
    generatedAt: new Date().toISOString(),
    mode: 'A',
    status: Array.isArray(resultsInput) ? 'completed' : resultsInput?.status ?? 'completed',
    catatan:
      'Mode A: pesan sintetis disuntikkan ke pipeline, balasan dikirim sungguhan ke chat uji. Harness tidak membaca balasan masuk, jadi kolom expect hanya panduan pencocokan visual user di HP, bukan vonis otomatis. Status sent berarti pesan sudah diserahkan ke pipeline.',
    summary: summarizeResults(results),
    results,
  }
  const target = path || DEFAULT_RESULTS_PATH
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return payload
}

// CLI: rakit bot seperti src/index.js (storage, registry, pipeline), lalu
// pakai startConnection yang ada dengan sesi yang sudah tersimpan. Harness
// tidak meminta pairing baru untuk dirinya sendiri; ia memang dijalankan
// saat sesi bot tersedia (startConnection hanya pairing bila sesi belum
// registered, sama seperti bot utama). Notif online owner bawaan index.js
// tidak dipakai di sini; onOpen langsung menjalankan uji, satu chat saja
// (chat pertama TEST_CHATS) per pemanggilan, lalu proses keluar.
export async function main(env = process.env) {
  guardMode(env)
  const chats = parseTestChats(env)
  if (!chats.length) {
    throw new Error('TEST_CHATS kosong di .env: harness menolak jalan tanpa chat uji yang diizinkan.')
  }
  for (const chat of chats) assertChatAllowed(chat, chats)
  const chat = chats[0]

  const { createStorage, createAuthState } = await import('../src/storage/index.js')
  const { loadPlugins } = await import('../src/core/plugin-loader.js')
  const { createPipeline } = await import('../src/core/pipeline.js')
  const { startConnection } = await import('../src/core/connection.js')

  const root = join(here, '..')
  const botName = env.BOT_NAME || 'KANA'
  const botNumber = String(env.BOT_NUMBER ?? '').replace(/\D/g, '')
  const ownerNumber = String(env.OWNER_NUMBER ?? '').replace(/\D/g, '')
  const defaultLang = env.DEFAULT_LANG || 'id'
  if (!botNumber) throw new Error('BOT_NUMBER kosong di .env: harness butuh nomor bot untuk memakai sesi tersimpan.')
  if (!ownerNumber) throw new Error('OWNER_NUMBER kosong di .env: harness butuh owner untuk mengenali pengirim uji.')

  const storage = createStorage(env)
  if (storage.init) await storage.init()
  const registry = await loadPlugins(join(root, 'plugins'))
  const pipeline = createPipeline({ registry, storage, owners: [ownerNumber], defaultLang })
  const auth = await createAuthState(storage, env)
  const allTests = [...BUILTIN_TESTS, ...collectPluginTests(registry)]
  const tests = sliceTests(filterTests(allTests, env), env)

  console.log(
    `Tes live Mode A: 1 chat (${chat}), ${tests.length} dari ${allTests.length} uji` +
      (env.TEST_FILTER ? ` (TEST_FILTER=${env.TEST_FILTER})` : '') +
      '. Menunggu koneksi terbuka...'
  )

  let done = false
  const timeout = setTimeout(() => {
    if (done) return
    done = true
    console.error('Koneksi tidak terbuka dalam 90 detik. Hasil tidak ditulis, tidak ada uji yang dijalankan.')
    process.exit(2)
  }, 90000)

  await startConnection({
    auth,
    botNumber,
    ownerNumber,
    botName,
    session: { sock: null },
    autoBio: false,
    onMessage: pipeline.handle,
    onParticipants: pipeline.handleParticipants,
    onOpen: async (sock) => {
      if (done) return
      done = true
      clearTimeout(timeout)
      try {
        const outcome = await runLiveTest({ sock, pipeline, storage, chats: [chat], tests })
        const payload = await writeResults(DEFAULT_RESULTS_PATH, outcome)
        console.log(`Status: ${outcome.status}`)
        if (outcome.status === 'aborted-health') console.log(`Alasan berhenti: ${outcome.reason}`)
        console.log(`Ringkasan: ${JSON.stringify(payload.summary)}`)
        console.log(`Hasil ditulis ke ${DEFAULT_RESULTS_PATH}`)
        console.log('Nilai hasilnya di HP: cocokkan balasan yang muncul dengan kolom expect tiap uji.')
        process.exit(outcome.status === 'aborted-health' ? 2 : 0)
      } catch (err) {
        console.error(`Tes live gagal: ${err.message}`)
        process.exit(2)
      }
    },
  })
}

// Jalan sebagai CLI hanya bila file ini dijalankan langsung. Impor modul
// (misalnya oleh tes unit) tidak menjalankan apa pun dan tidak mengirim
// apa pun. Penolakan mode nonaktif: pesan jelas di stderr, exit code 2.
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirectRun) {
  try {
    await import('../src/load-env.js')
    guardMode(process.env)
  } catch (err) {
    console.error(`Harness tes live menolak jalan: ${err.message}`)
    console.error('Tidak ada pesan yang dikirim. Aktifkan dengan LIVETEST=1 dan NODE_ENV bukan production.')
    process.exit(2)
  }
  main(process.env).catch((err) => {
    console.error(`Harness tes live gagal: ${err.message}`)
    process.exit(2)
  })
}
