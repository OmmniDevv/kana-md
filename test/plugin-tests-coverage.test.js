import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPlugins } from '../src/core/plugin-loader.js'
import { collectPluginTests } from '../scripts/livetest.js'

const here = dirname(fileURLToPath(import.meta.url))
const pluginsDir = join(here, '..', 'plugins')

// Penjaga regresi cakupan kasus uji livetest Mode A: setiap plugin
// perintah wajib mengekspor test = { input, expect } supaya harness
// scripts/livetest.js bisa menyapu tes live per plugin.
//
// Pengecualian yang diizinkan TANPA export test hanya plugin event atau
// non-perintah (mis. config tanpa name perintah, atau modul yang hanya
// mengekspor hook onParticipantsUpdate tanpa handler perintah). Setiap
// pengecualian wajib dicatat di sini dengan alasannya, dan daftar ini
// harus cocok PERSIS dengan plugin termuat yang tidak punya kasus uji.
// Keadaan saat tes ini ditulis: semua plugin di registry adalah plugin
// perintah (punya config.name dan handler), termasuk welcome.js yang
// merangkap hook onParticipantsUpdate tetapi tetap plugin perintah,
// jadi daftar pengecualian kosong.
const EXCEPTIONS = [
  // { name: 'nama-plugin', reason: 'alasan terdokumentasi' },
]

async function loadRegistry() {
  return loadPlugins(pluginsDir)
}

test('setiap plugin perintah punya kasus uji livetest terkumpul', async () => {
  const registry = await loadRegistry()
  const plugins = registry.list()
  assert.ok(plugins.length > 0, 'registry tidak boleh kosong')
  const collected = collectPluginTests(registry)
  const covered = new Set(collected.map((entry) => entry.plugin))
  const missing = plugins
    .map((plugin) => plugin.config.name)
    .filter((name) => !covered.has(name))
  const allowed = new Set(EXCEPTIONS.map((entry) => entry.name))
  assert.deepEqual(
    missing.filter((name) => !allowed.has(name)),
    [],
    'ada plugin perintah tanpa export test dan tanpa pengecualian terdokumentasi'
  )
  assert.equal(
    collected.length + missing.length,
    plugins.length,
    'jumlah kasus uji + plugin tanpa uji harus sama dengan total plugin'
  )
})

test('daftar pengecualian cocok persis dengan plugin tanpa kasus uji', async () => {
  const registry = await loadRegistry()
  const plugins = registry.list()
  const collected = collectPluginTests(registry)
  const covered = new Set(collected.map((entry) => entry.plugin))
  const missing = plugins
    .map((plugin) => plugin.config.name)
    .filter((name) => !covered.has(name))
    .sort()
  const exceptionNames = EXCEPTIONS.map((entry) => entry.name).sort()
  assert.deepEqual(missing, exceptionNames)
  for (const entry of EXCEPTIONS) {
    assert.equal(typeof entry.reason, 'string')
    assert.ok(entry.reason.trim().length > 0, 'alasan pengecualian wajib diisi')
  }
})

test('semua kasus uji plugin valid: input diawali titik, expect terisi', async () => {
  const registry = await loadRegistry()
  const collected = collectPluginTests(registry)
  assert.ok(collected.length > 0, 'harus ada kasus uji plugin terkumpul')
  for (const entry of collected) {
    assert.equal(typeof entry.input, 'string', `input uji ${entry.plugin} harus string`)
    assert.ok(entry.input.startsWith('.'), `input uji ${entry.plugin} harus diawali titik: ${entry.input}`)
    const expectOk =
      entry.expect instanceof RegExp ||
      (typeof entry.expect === 'string' && entry.expect.trim().length > 0)
    assert.ok(expectOk, `expect uji ${entry.plugin} harus RegExp atau string non-kosong`)
    if (entry.expect instanceof RegExp) {
      assert.ok(entry.expect.source.length > 0, `pola expect ${entry.plugin} tidak boleh kosong`)
    }
  }
  // Satu kasus uji per plugin perintah: tidak boleh ada plugin ganda.
  const names = collected.map((entry) => entry.plugin)
  assert.equal(new Set(names).size, names.length, 'kasus uji tidak boleh ganda per plugin')
})
