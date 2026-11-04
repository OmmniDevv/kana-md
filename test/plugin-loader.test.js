import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadPlugins } from '../src/core/plugin-loader.js'

test('plugin rusak dikarantina, plugin sehat tetap jalan', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kana-plugins-'))
  await writeFile(
    join(dir, 'good.js'),
    `export const config = { name: 'good', alias: ['g'], category: 'main' }
     export async function handler() {}`
  )
  await writeFile(join(dir, 'broken.js'), `throw new Error('boom')`)
  await writeFile(
    join(dir, 'invalid.js'),
    `export const config = { name: 42 }
     export async function handler() {}`
  )
  const registry = await loadPlugins(dir)
  assert.equal(registry.list().length, 1)
  assert.equal(registry.resolve('good')?.config.name, 'good')
  assert.equal(registry.resolve('g')?.config.name, 'good')
  assert.equal(registry.quarantined.length, 2)
})
