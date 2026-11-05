import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handler as outHandler } from '../plugins/owner/out.js'
import { handler as remoteleaveHandler } from '../plugins/owner/remoteleave.js'

// Regresi sapuan live P9 (2026-11-05): .out dan .remoteleave di chat
// pribadi tidak membalas apa pun karena cabang leave memanggil
// groupLeave ke JID pribadi. Penjaga konteks grup (pola leave.js)
// membuat keduanya membalas petunjuk bila tidak ada JID grup valid,
// dan tetap menjalankan leave yang benar bila konteksnya grup.

function fakeCtx(chat, text = '') {
  const replies = []
  const left = []
  return {
    replies,
    left,
    chat,
    text,
    senderDigits: '6285869074622',
    storage: { keys: async () => [], get: async () => null },
    sock: { groupLeave: async (jid) => { left.push(jid) } },
    t: (key, vars = {}) => `${key}:${vars.text ?? vars.error ?? ''}`,
    reply: async (txt) => { replies.push(txt) },
  }
}

for (const [label, handler] of [['out', outHandler], ['remoteleave', remoteleaveHandler]]) {
  test(`${label}: chat pribadi tanpa JID grup -> balasan petunjuk, groupLeave tidak dipanggil`, async () => {
    const ctx = fakeCtx('6285869074622@s.whatsapp.net')
    await handler(ctx)
    assert.equal(ctx.left.length, 0)
    assert.equal(ctx.replies.length, 1)
    assert.match(ctx.replies[0], /mengeluarkan bot dari grup/)
  })

  test(`${label}: di dalam grup -> groupLeave ke JID grup itu`, async () => {
    const ctx = fakeCtx('120363409948890046@g.us')
    await handler(ctx)
    assert.deepEqual(ctx.left, ['120363409948890046@g.us'])
  })

  test(`${label}: argumen JID grup dari chat pribadi -> groupLeave ke JID itu`, async () => {
    const ctx = fakeCtx('6285869074622@s.whatsapp.net', '120363404950719826@g.us')
    await handler(ctx)
    assert.deepEqual(ctx.left, ['120363404950719826@g.us'])
  })
}
