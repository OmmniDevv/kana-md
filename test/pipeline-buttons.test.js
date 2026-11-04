import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPipeline } from '../src/core/pipeline.js'

// Balasan tombol native flow (quick_reply MB.Button) tiba dengan paramsJson
// berbentuk string JSON. Pipeline harus menangkap id-nya sebagai perintah.
function setup() {
  const captured = []
  const plugin = {
    config: { name: 'menu', cooldown: 0 },
    handler: async (ctx) => {
      captured.push({ command: ctx.command, text: ctx.text, args: ctx.args })
    },
  }
  const registry = { resolve: (c) => (c === 'menu' ? plugin : undefined), list: () => [plugin], quarantined: [] }
  const storage = { get: async () => undefined, set: async () => {}, delete: async () => {} }
  const pipeline = createPipeline({ registry, storage, owners: [], defaultLang: 'id' })
  const sock = { sendMessage: async () => ({}) }
  return { pipeline, sock, captured }
}

const baseRaw = {
  key: { remoteJid: '628123@s.whatsapp.net', fromMe: false, id: 'abc' },
  pushName: 'Senpai',
}

test('pipeline: paramsJson string dari native flow tertangkap sebagai perintah', async () => {
  const { pipeline, sock, captured } = setup()
  await pipeline.handle(sock, {
    ...baseRaw,
    message: {
      interactiveResponseMessage: {
        nativeFlowResponseMessage: { name: 'quick_reply', paramsJson: '{"id":".menu download"}' },
      },
    },
  })
  assert.deepEqual(captured, [{ command: 'menu', text: 'download', args: ['download'] }])
})

test('pipeline: paramsJson objek (kompatibilitas) tetap tertangkap', async () => {
  const { pipeline, sock, captured } = setup()
  await pipeline.handle(sock, {
    ...baseRaw,
    message: {
      interactiveResponseMessage: {
        nativeFlowResponseMessage: { name: 'quick_reply', paramsJson: { id: '.menu' } },
      },
    },
  })
  assert.deepEqual(captured, [{ command: 'menu', text: '', args: [] }])
})

test('pipeline: buttonsResponseMessage tetap tertangkap', async () => {
  const { pipeline, sock, captured } = setup()
  await pipeline.handle(sock, {
    ...baseRaw,
    message: { buttonsResponseMessage: { selectedButtonId: '.menu all' } },
  })
  assert.deepEqual(captured, [{ command: 'menu', text: 'all', args: ['all'] }])
})
