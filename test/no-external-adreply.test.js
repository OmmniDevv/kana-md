import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// externalAdReply sudah tidak didukung WhatsApp dan dilarang total di
// repo ini (perintah owner). Tes ini menggerbang seluruh src/ dan
// plugins/ supaya tidak ada batch sapuan atau port dari SC referensi
// yang menyelipkannya lagi.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const NEEDLE = 'external' + 'AdReply'

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (entry.name.endsWith('.js')) yield full
  }
}

test('tidak ada externalAdReply di src/ dan plugins/', () => {
  const offenders = []
  for (const dir of ['src', 'plugins']) {
    for (const file of walk(join(root, dir))) {
      if (readFileSync(file, 'utf8').includes(NEEDLE)) offenders.push(file)
    }
  }
  assert.deepEqual(offenders, [])
})
