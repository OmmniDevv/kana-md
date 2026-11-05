import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const aiDir = join(here, '..', 'plugins', 'ai')
const disabledDir = join(here, '..', 'disabled-plugins')

const readAi = (name) => readFileSync(join(aiDir, `${name}.js`), 'utf8')

// Klaster AI gelombang 2 (audit templat 2026-11-05/06): file edit
// gambar dan vision yang jalurnya tidak terbukti dari VM wajib
// nonaktif, bukan tetap aktif sebagai chat teks berkedok fitur.
const DISABLED = [
  'nanobanana', 'rimurubanana', 'to3d', 'toanime', 'toblack',
  'tocartoon', 'tochibi', 'toemotebatu', 'tofigure', 'toghibli',
  'tohijab', 'toisland', 'tojapanese', 'tomanga', 'tomekah',
  'editimg2', 'age-detection', 'kimi-vision', 'imgprompt',
]

test('file edit gambar dan vision tanpa jalur terbukti nonaktif dengan catatan', () => {
  for (const name of DISABLED) {
    assert.equal(existsSync(join(aiDir, `${name}.js`)), false, `${name} tidak boleh aktif`)
    const disabledPath = join(disabledDir, `${name}.js`)
    assert.equal(existsSync(disabledPath), true, `${name} wajib ada di disabled-plugins`)
    const src = readFileSync(disabledPath, 'utf8')
    assert.match(src, /DINONAKTIFKAN 2026-11-06/, `${name} wajib punya catatan penonaktifan`)
  }
})

const PERSONAS = [
  'claudehaiku', 'copilot', 'deepseek', 'dpsteai', 'glm4', 'gpt4o',
  'gpt5', 'kimi', 'lobbyff', 'mistral', 'openai', 'perplexity',
  'qwen3', 'webpilot', 'zetavoice',
]

test('persona label model jujur: deskripsi dan persona mengaku persona, bukan model asli', () => {
  for (const name of PERSONAS) {
    const src = readAi(name)
    const mod = src.match(/description: \{ id: "(.*?)", en:/)
    assert.ok(mod, `${name} harus punya deskripsi`)
    assert.match(mod[1], /persona/i, `${name}: deskripsi wajib menyebut persona`)
    assert.match(mod[1], /bukan|tidak/i, `${name}: deskripsi wajib menyangkal klaim asli`)
    assert.match(src, /Kamu BUKAN/, `${name}: persona wajib memuat klausa kejujuran`)
    assert.doesNotMatch(src, /Chat dengan GLM|AI Chat using Mistral|mendukung session per-user/, `${name}: klaim lama tidak boleh tersisa`)
  }
})

test('kasus uji persona memakai pertanyaan asli, bukan sapaan polos', () => {
  for (const name of PERSONAS) {
    const src = readAi(name)
    const m = src.match(/export const test = \{ input: '([^']+)'/)
    assert.ok(m, `${name} harus mengekspor test`)
    const args = m[1].replace(/^\.\S+\s*/, '')
    assert.ok(args.length >= 10, `${name}: input uji wajib pertanyaan asli, dapat: ${m[1]}`)
  }
})

test('musicmaker jujur sebagai pembuat lirik teks dengan format lagu lengkap', () => {
  const src = readAi('musicmaker')
  assert.match(src, /description: \{ id: "[^"]*bukan audio musik/)
  assert.match(src, /PERSONA_ID = "[^"]*Chorus/)
  assert.match(src, /export const test = \{ input: '\.musicmaker buatkan lagu/)
})

test('sologo memakai mesin gambar nyata dengan gaya logo', () => {
  const src = readAi('sologo')
  assert.match(src, /image\.pollinations\.ai/)
  assert.match(src, /minimalist logo design/)
  assert.match(src, /description: \{ id: "[^"]*logo/)
  assert.match(src, /export const test = \{ input: '\.sologo kedai kopi gunung'/)
})
