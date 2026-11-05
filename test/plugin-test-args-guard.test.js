import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPlugins } from '../src/core/plugin-loader.js'
import { collectPluginTests } from '../scripts/livetest.js'

const here = dirname(fileURLToPath(import.meta.url))
const pluginsDir = join(here, '..', 'plugins')

// Penjaga definisi kasus uji perintah berargumen (audit metodologi tes
// 2026-11-05): plugin yang usage-nya memuat placeholder wajib <...>
// harus diuji livetest dengan argumen asli pada input test-nya. Input
// polos hanya memicu balasan petunjuk pemakaian dari handler, jadi
// kasus seperti itu tidak membuktikan apa pun dan dilarang di sini.
//
// Pengecualian hanya untuk plugin yang memang sah diuji polos, dan
// daftarnya harus cocok PERSIS dengan himpunan pelanggar aturan ini:
// menambah pelanggar baru tanpa mencatatnya di sini membuat tes gagal,
// dan memperbaiki pengecualian tanpa menghapusnya dari daftar juga
// membuat tes gagal.
const OPTIONAL_NAME = 'argumen nama opsional: tanpa nama berarti cek diri sendiri, hasilnya tetap substantif'
const EXCEPTIONS = [
  // Keluarga cek: usage ".cek... <nama> atau kosongkan untuk dirimu".
  { name: 'cekbaik', reason: OPTIONAL_NAME },
  { name: 'cekbucin', reason: OPTIONAL_NAME },
  { name: 'cekcantik', reason: OPTIONAL_NAME },
  { name: 'cekcreative', reason: OPTIONAL_NAME },
  { name: 'cekcupu', reason: OPTIONAL_NAME },
  { name: 'cekgabut', reason: OPTIONAL_NAME },
  { name: 'cekgacha', reason: OPTIONAL_NAME },
  { name: 'cekgamer', reason: OPTIONAL_NAME },
  { name: 'cekganteng', reason: OPTIONAL_NAME },
  { name: 'cekgila', reason: OPTIONAL_NAME },
  { name: 'cekimut', reason: OPTIONAL_NAME },
  { name: 'cekintrovert', reason: OPTIONAL_NAME },
  { name: 'cekjahat', reason: OPTIONAL_NAME },
  { name: 'cekjomblo', reason: OPTIONAL_NAME },
  { name: 'cekkarma', reason: OPTIONAL_NAME },
  { name: 'cekkaya', reason: OPTIONAL_NAME },
  { name: 'cekkece', reason: OPTIONAL_NAME },
  { name: 'cekkepribadian', reason: OPTIONAL_NAME },
  { name: 'cekkpopers', reason: OPTIONAL_NAME },
  { name: 'ceklapar', reason: OPTIONAL_NAME },
  { name: 'cekmalas', reason: OPTIONAL_NAME },
  { name: 'cekngantuk', reason: OPTIONAL_NAME },
  { name: 'cekotaku', reason: OPTIONAL_NAME },
  { name: 'cekoverpower', reason: OPTIONAL_NAME },
  // Bentuk polos adalah jalur utama yang menampilkan keadaan pemanggil.
  { name: 'bank', reason: 'bentuk polos menampilkan saldo dan status bank pemain' },
  { name: 'clan', reason: 'bentuk polos menampilkan status clan pemain' },
  { name: 'job', reason: 'bentuk polos menampilkan daftar dan status pekerjaan pemain' },
  { name: 'pet', reason: 'bentuk polos menampilkan status peliharaan pemain' },
  { name: 'referal', reason: 'bentuk polos menampilkan kode referal pemanggil' },
  { name: 'setgoodbye', reason: 'tanpa teks menampilkan teks goodbye grup yang sedang aktif' },
  { name: 'goodbye', reason: 'tanpa argumen menampilkan status dan teks goodbye grup yang sedang aktif' },
  { name: 'setwelcome', reason: 'tanpa teks menampilkan teks welcome grup yang sedang aktif' },
  // Media kutipan: harness teks Mode A tidak bisa melampirkan media,
  // kasus uji hanya bisa menguji gerbang kutipnya (test/fixtures-links.md).
  { name: 'sticker', reason: 'jalur utama dari gambar atau stiker kutipan; harness teks tidak bisa melampirkan media' },
  // Link pihak ketiga yang belum terverifikasi dari VM.
  { name: 'pixeldrain', reason: 'butuh link berkas Pixeldrain pihak ketiga; unggah anonim API timeout dari VM (2026-11-05), belum ada link terverifikasi' },
  // Perintah owner dengan efek eksternal atau state nyata ke target:
  // memberi target asli pada kasus uji sapuan live tidak aman.
  { name: 'ban', reason: 'memblokir nomor target secara nyata; kasus uji menguji gerbang format saja' },
  { name: 'block', reason: 'memblokir nomor target secara nyata; kasus uji menguji gerbang format saja' },
  { name: 'unban', reason: 'membuka blokir nomor target secara nyata; kasus uji menguji gerbang format saja' },
  { name: 'unblock', reason: 'membuka blokir nomor target secara nyata; kasus uji menguji gerbang format saja' },
  { name: 'delprem', reason: 'menghapus status premium nomor target; efek state nyata saat sapuan live' },
  { name: 'broadcast', reason: 'mengirim siaran ke semua chat; tidak boleh dipicu kasus uji sapuan' },
  { name: 'jadibot', reason: 'membuat sesi bot baru untuk nomor target; efek eksternal saat sapuan live' },
  { name: 'join', reason: 'bot bergabung ke grup dari link undangan; efek eksternal saat sapuan live' },
  { name: 'setnamebot', reason: 'mengubah nama profil bot secara nyata; bukan untuk kasus uji sapuan' },
]

function inputArgs(input) {
  const m = String(input || '').trim().match(/^\.(\S+)\s*(.*)$/)
  return m ? m[2].trim() : null
}

async function collect() {
  const registry = await loadPlugins(pluginsDir)
  const byName = new Map(registry.list().map((p) => [p.config.name, p]))
  const tests = new Map(collectPluginTests(registry).map((e) => [e.plugin, e]))
  return { byName, tests }
}

test('perintah berargumen wajib kasus uji berargumen, kecuali yang tercatat', async () => {
  const { byName, tests } = await collect()
  const offenders = []
  for (const [name, plugin] of byName) {
    const usage = String(plugin.config.usage || '')
    if (!/<[^>]+>/.test(usage)) continue
    const entry = tests.get(name)
    if (!entry) continue // tanpa kasus uji ditangani penjaga cakupan
    if (inputArgs(entry.input) === '') offenders.push(name)
  }
  offenders.sort()
  const exceptionNames = EXCEPTIONS.map((e) => e.name).sort()
  assert.deepEqual(
    offenders,
    exceptionNames,
    'himpunan perintah berargumen berkasus uji polos harus sama persis dengan daftar pengecualian terdokumentasi'
  )
  for (const entry of EXCEPTIONS) {
    assert.equal(typeof entry.reason, 'string')
    assert.ok(entry.reason.trim().length > 0, `alasan pengecualian ${entry.name} wajib diisi`)
  }
})

test('kasus uji plugin wajib-argumen di luar pengecualian memakai argumen asli', async () => {
  const { byName, tests } = await collect()
  const allowed = new Set(EXCEPTIONS.map((e) => e.name))
  for (const [name, entry] of tests) {
    const plugin = byName.get(name)
    if (!plugin) continue
    if (!/<[^>]+>/.test(String(plugin.config.usage || ''))) continue
    if (allowed.has(name)) continue
    const args = inputArgs(entry.input)
    assert.ok(args && args.length >= 1, `kasus uji ${name} harus membawa argumen asli, bukan perintah polos: ${entry.input}`)
    assert.ok(!/[<>]/.test(args), `argumen kasus uji ${name} tidak boleh masih berupa placeholder: ${entry.input}`)
  }
})
