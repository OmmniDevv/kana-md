import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  BUILTIN_TESTS,
  assertChatAllowed,
  collectPluginTests,
  compileTestFilter,
  filterTests,
  guardMode,
  isLiveTestEnabled,
  normalizeChatJid,
  parseTestChats,
  runLiveTest,
  sliceTests,
} from '../scripts/livetest.js'

test('guardMode menolak tanpa LIVETEST', () => {
  assert.throws(() => guardMode({}), /LIVETEST=1/)
  assert.throws(() => guardMode({ LIVETEST: '' }), /LIVETEST=1/)
  assert.throws(() => guardMode({ LIVETEST: '0' }), /LIVETEST=1/)
  assert.throws(() => guardMode({ LIVETEST: 'true' }), /LIVETEST=1/)
  assert.equal(isLiveTestEnabled({}), false)
})

test('guardMode menolak saat production walau LIVETEST aktif', () => {
  assert.throws(() => guardMode({ LIVETEST: '1', NODE_ENV: 'production' }), /production/)
  assert.equal(isLiveTestEnabled({ LIVETEST: '1', NODE_ENV: 'production' }), false)
})

test('guardMode menerima LIVETEST=1 di luar production', () => {
  assert.equal(guardMode({ LIVETEST: '1' }), true)
  assert.equal(guardMode({ LIVETEST: '1', NODE_ENV: 'development' }), true)
  assert.equal(isLiveTestEnabled({ LIVETEST: '1', NODE_ENV: 'test' }), true)
})

test('assertChatAllowed menerima JID persis dan kecocokan digit', () => {
  const allowed = parseTestChats({ TEST_CHATS: '6281234567890@s.whatsapp.net, 120363000@g.us' })
  assert.equal(assertChatAllowed('6281234567890@s.whatsapp.net', allowed), true)
  assert.equal(assertChatAllowed('120363000@g.us', allowed), true)
  // Daftar berisi digit polos, chat datang sebagai JID.
  assert.equal(assertChatAllowed('6281234567890@s.whatsapp.net', ['6281234567890']), true)
  // Daftar berisi JID, chat datang sebagai digit polos.
  assert.equal(assertChatAllowed('6281234567890', allowed), true)
})

test('assertChatAllowed menolak chat di luar daftar', () => {
  const allowed = parseTestChats({ TEST_CHATS: '6281234567890@s.whatsapp.net' })
  assert.throws(() => assertChatAllowed('6289999999999@s.whatsapp.net', allowed), /TEST_CHATS/)
  assert.throws(() => assertChatAllowed('120363999@g.us', allowed), /TEST_CHATS/)
  assert.throws(() => assertChatAllowed('', allowed), /kosong/)
})

test('assertChatAllowed menolak semua bila daftar kosong', () => {
  assert.throws(() => assertChatAllowed('6281234567890@s.whatsapp.net', []), /kosong/)
  assert.throws(() => assertChatAllowed('6281234567890@s.whatsapp.net', parseTestChats({ TEST_CHATS: '' })), /kosong/)
  assert.throws(() => assertChatAllowed('120363000@g.us', []), /kosong/)
})

test('parseTestChats mem-parse koma dan spasi', () => {
  assert.deepEqual(parseTestChats({ TEST_CHATS: ' 6281@s.whatsapp.net ,120363@g.us,  6282 ' }), [
    '6281@s.whatsapp.net',
    '120363@g.us',
    '6282',
  ])
  assert.deepEqual(parseTestChats({ TEST_CHATS: 'a,,b, ,c' }), ['a', 'b', 'c'])
  assert.deepEqual(parseTestChats({ TEST_CHATS: '' }), [])
  assert.deepEqual(parseTestChats({}), [])
  assert.deepEqual(parseTestChats('x, y'), ['x', 'y'])
})

test('collectPluginTests mengumpulkan test plugin dan melewati yang tanpa test', () => {
  const registry = {
    list: () => [
      { config: { name: 'ping' }, test: { input: '.ping', expect: /pong/i } },
      { config: { name: 'menu' } },
      { config: { name: 'tanpa-expect' }, test: { input: '.x' } },
      { config: { name: 'tanpa-input' }, test: { expect: /x/ } },
      { config: { name: 'teks' }, test: { input: '.teks', expect: 'halo' } },
    ],
  }
  const tests = collectPluginTests(registry)
  assert.equal(tests.length, 2)
  assert.equal(tests[0].input, '.ping')
  assert.equal(tests[0].plugin, 'ping')
  assert.ok(tests[0].expect instanceof RegExp)
  assert.equal(tests[1].input, '.teks')
  assert.equal(tests[1].expect, 'halo')
  assert.equal(tests[1].plugin, 'teks')
})

test('collectPluginTests mendukung registry berbentuk Map dan array', () => {
  const plugin = { config: { name: 'satu' }, test: { input: '.satu', expect: /.+/ } }
  assert.equal(collectPluginTests({ plugins: new Map([['satu', plugin]]) }).length, 1)
  assert.equal(collectPluginTests([plugin]).length, 1)
  assert.deepEqual(collectPluginTests(null), [])
  assert.deepEqual(collectPluginTests({ list: () => [] }), [])
})

test('normalizeChatJid: digit mentah jadi JID penuh, JID dan grup dibiarkan', () => {
  assert.equal(normalizeChatJid('6285869074622'), '6285869074622@s.whatsapp.net')
  assert.equal(normalizeChatJid(' 6285869074622 '), '6285869074622@s.whatsapp.net')
  assert.equal(normalizeChatJid('6285869074622@s.whatsapp.net'), '6285869074622@s.whatsapp.net')
  assert.equal(normalizeChatJid('120363000@g.us'), '120363000@g.us')
})

test('runLiveTest: pesan sintetis dari digit mentah membawa remoteJid JID penuh', async () => {
  const captured = []
  const pipeline = {
    handle: async (sock, raw) => {
      captured.push(raw)
    },
  }
  const outcome = await runLiveTest({
    sock: {},
    pipeline,
    chats: ['6281234567890'],
    tests: [{ input: '.ping', expect: /pong/i }],
    sleep: async () => {},
    random: () => 0,
  })
  assert.equal(outcome.status, 'completed')
  assert.equal(captured.length, 1)
  assert.equal(captured[0].key.remoteJid, '6281234567890@s.whatsapp.net')
  assert.equal(outcome.results[0].chat, '6281234567890@s.whatsapp.net')
  assert.equal(outcome.results[0].status, 'sent')
})

test('compileTestFilter: kosong berarti null, regex valid terkompilasi, invalid melempar', () => {
  assert.equal(compileTestFilter({}), null)
  assert.equal(compileTestFilter({ TEST_FILTER: '  ' }), null)
  const re = compileTestFilter({ TEST_FILTER: '^profil$' })
  assert.ok(re instanceof RegExp)
  assert.ok(re.test('profil'))
  assert.ok(re.test('PROFIL'))
  assert.throws(() => compileTestFilter({ TEST_FILTER: '([' }), /bukan regex valid/)
})

test('filterTests menyaring berdasar nama plugin atau input', () => {
  const tests = [
    { input: '.ping', expect: /pong/, plugin: 'ping' },
    { input: '.profil', expect: /.+/, plugin: 'profil' },
    { input: '.profile', expect: /.+/, plugin: 'profil' },
    { input: '.menu', expect: /.+/ },
  ]
  assert.equal(filterTests(tests, {}).length, 4)
  assert.deepEqual(
    filterTests(tests, { TEST_FILTER: '^profil$' }).map((t) => t.input),
    ['.profil', '.profile']
  )
  assert.deepEqual(
    filterTests(tests, { TEST_FILTER: 'menu' }).map((t) => t.input),
    ['.menu']
  )
  assert.deepEqual(filterTests(tests, { TEST_FILTER: 'tidakada' }), [])
})

test('sliceTests menghormati TEST_OFFSET dan TEST_LIMIT dengan fallback aman', () => {
  const tests = [{ input: '.a' }, { input: '.b' }, { input: '.c' }, { input: '.d' }]
  assert.equal(sliceTests(tests, {}).length, 4)
  assert.deepEqual(sliceTests(tests, { TEST_OFFSET: '1', TEST_LIMIT: '2' }).map((t) => t.input), ['.b', '.c'])
  assert.deepEqual(sliceTests(tests, { TEST_OFFSET: '3' }).map((t) => t.input), ['.d'])
  assert.deepEqual(sliceTests(tests, { TEST_OFFSET: '-2', TEST_LIMIT: 'abc' }).length, 4)
  assert.deepEqual(sliceTests(tests, { TEST_LIMIT: '0' }), [])
})

test('BUILTIN_TESTS berisi perintah inti yang aman, semua diawali titik', () => {
  assert.deepEqual(
    BUILTIN_TESTS.map((t) => t.input),
    ['.ping', '.menu', '.help', '.lang', '.profil']
  )
  for (const entry of BUILTIN_TESTS) {
    assert.ok(entry.input.startsWith('.'), `input harus diawali titik: ${entry.input}`)
    assert.ok(entry.expect instanceof RegExp, `expect harus RegExp: ${entry.input}`)
  }
  assert.ok(BUILTIN_TESTS[0].expect.test('pong'))
  assert.ok(BUILTIN_TESTS[0].expect.test('KANA'))
  assert.ok(BUILTIN_TESTS[1].expect.test('KANA'))
})
