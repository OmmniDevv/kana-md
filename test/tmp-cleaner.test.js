import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readdir, utimes } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanKanaTmp } from '../src/services/tmp-cleaner.js'

async function fixture() {
  const base = await mkdtemp(join(tmpdir(), 'kana-test-base-'))
  const oldDir = join(base, 'kana-old-aaa')
  const freshDir = join(base, 'kana-fresh-bbb')
  const otherDir = join(base, 'bukan-kana')
  await mkdir(oldDir)
  await mkdir(freshDir)
  await mkdir(otherDir)
  await writeFile(join(oldDir, 'sisa.png'), Buffer.alloc(2048))
  await writeFile(join(freshDir, 'lagi-dipakai.png'), Buffer.alloc(1024))
  const longAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
  await utimes(oldDir, longAgo, longAgo)
  return { base, oldDir, freshDir, otherDir }
}

test('cleanKanaTmp hanya membuang entri kana- yang lebih tua dari ambang', async () => {
  const { base } = await fixture()
  const { count, bytes } = await cleanKanaTmp({ base, maxAgeMs: 60 * 60 * 1000 })
  assert.equal(count, 1)
  assert.ok(bytes >= 2048)
  const names = await readdir(base)
  assert.ok(!names.some((n) => n.startsWith('kana-old')))
  assert.ok(names.some((n) => n.startsWith('kana-fresh')))
  assert.ok(names.includes('bukan-kana'))
})

test('cleanKanaTmp dengan maxAgeMs 0 membuang semua entri kana-', async () => {
  const { base } = await fixture()
  const { count } = await cleanKanaTmp({ base, maxAgeMs: 0 })
  assert.equal(count, 2)
  const names = await readdir(base)
  assert.deepEqual(names, ['bukan-kana'])
})
