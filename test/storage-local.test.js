import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createLocalStorage } from '../src/storage/local.js'

test('kontrak storage local: set, get, delete, TTL', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kana-data-'))
  const storage = createLocalStorage(dir)
  assert.equal(storage.driver, 'local')
  assert.equal(await storage.get('users', 'a'), undefined)
  await storage.set('users', 'a', { lang: 'id' })
  assert.deepEqual(await storage.get('users', 'a'), { lang: 'id' })
  await storage.set('kv', 'ttl', 'x', 0.05)
  assert.equal(await storage.get('kv', 'ttl'), 'x')
  await new Promise((r) => setTimeout(r, 80))
  assert.equal(await storage.get('kv', 'ttl'), undefined)
  await storage.delete('users', 'a')
  assert.equal(await storage.get('users', 'a'), undefined)
  await storage.close()
})
