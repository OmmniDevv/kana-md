import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { updateProfile, getProfile } from '../src/services/user-service.js'
import { evaluateExpression, formatValue } from '../src/services/calculator.js'
import {
  handValue,
  startGame,
  applyHit,
  applyStand,
  payoutFor,
  isBlackjack,
} from '../src/services/blackjack.js'
import { decideSuit } from '../plugins/fun/suit.js'
import { wetonOf } from '../plugins/fun/weton.js'
import { convert } from '../plugins/user/konversi.js'
import { spin, evaluateSpin, handler as slotHandler, i18n as slotI18n } from '../plugins/game/slot.js'
import { resolveDice } from '../plugins/game/daduvs.js'
import { handler as todoHandler, i18n as todoI18n } from '../plugins/user/todo.js'
import { handler as transferHandler, i18n as transferI18n } from '../plugins/user/transfer.js'
import { handler as ingatkanHandler, i18n as ingatkanI18n } from '../plugins/user/ingatkan.js'
import { handler as catatanHandler, i18n as catatanI18n } from '../plugins/user/catatan.js'
import { pickWeighted, FALLBACK_POOL } from '../plugins/rpg/gacha.js'

for (const mod of [slotI18n, todoI18n, transferI18n, ingatkanI18n, catatanI18n]) {
  addMessages('id', mod.id)
  addMessages('en', mod.en)
}

function memoryStorage() {
  const map = new Map()
  const ns = (n) => {
    if (!map.has(n)) map.set(n, new Map())
    return map.get(n)
  }
  return {
    driver: 'memory',
    async get(n, k) {
      return ns(n).get(k)
    },
    async set(n, k, v) {
      ns(n).set(k, v)
    },
    async delete(n, k) {
      ns(n).delete(k)
    },
    async keys(n) {
      return [...ns(n).keys()]
    },
  }
}

function fakeCtx(storage, { digits = '628111111111', args = [], pushName = 'Tester' } = {}) {
  const replies = []
  const sent = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content) => {
      sent.push({ jid, content })
      return {}
    },
  }
  const ctx = {
    sock,
    chat: `${digits}@s.whatsapp.net`,
    sender: `${digits}@s.whatsapp.net`,
    senderDigits: digits,
    pushName,
    isGroup: false,
    isOwner: false,
    args,
    text: args.join(' '),
    command: '',
    lang: 'id',
    t: (k, vars) => translate('id', k, vars),
    say: () => 'moe~',
    reply: async (txt) => {
      replies.push(txt)
    },
    storage,
    registry: null,
    raw: {},
    quoted: null,
    mentionedJids: [],
  }
  const texts = () => [...replies, ...sent.map((s) => s.content.text ?? s.content.caption ?? '')]
  return { ctx, replies, sent, texts }
}

// ---------- Kalkulator ----------
test('kalkulator: urutan operasi dan kurung', () => {
  assert.equal(evaluateExpression('2+3*4').value, 14)
  assert.equal(evaluateExpression('(2+3)*4').value, 20)
  assert.equal(evaluateExpression('2^3').value, 8)
  assert.equal(evaluateExpression('10%3').value, 1)
  assert.equal(evaluateExpression('10/4').value, 2.5)
  assert.equal(evaluateExpression('-5+3').value, -2)
  assert.equal(evaluateExpression('1.5*2').value, 3)
  assert.equal(formatValue(evaluateExpression('1/3').value), '0.3333333333')
})

test('kalkulator: bagi nol ditolak', () => {
  const a = evaluateExpression('1/0')
  assert.equal(a.ok, false)
  assert.equal(a.reason, 'div-zero')
  assert.equal(evaluateExpression('5%(3-3)').ok, false)
})

test('kalkulator: input jahat dan ngawur ditolak tanpa eval', () => {
  assert.equal(evaluateExpression('process.exit(1)').ok, false)
  assert.equal(evaluateExpression('2; rm -rf /').ok, false)
  assert.equal(evaluateExpression('2**3').ok, false)
  assert.equal(evaluateExpression('alert(1)').ok, false)
  assert.equal(evaluateExpression('').ok, false)
  assert.equal(evaluateExpression('((2)').ok, false)
  assert.equal(evaluateExpression('1..2').ok, false)
  assert.equal(evaluateExpression('2+').ok, false)
})

// ---------- Konversi ----------
test('konversi: panjang, berat, suhu, data, waktu', () => {
  assert.equal(convert(1, 'km', 'm'), 1000)
  assert.equal(convert(1500, 'm', 'km'), 1.5)
  assert.equal(convert(1000, 'g', 'kg'), 1)
  assert.equal(convert(2, 'kg', 'g'), 2000)
  assert.equal(convert(0, 'c', 'f'), 32)
  assert.equal(convert(100, 'c', 'f'), 212)
  assert.equal(convert(32, 'f', 'c'), 0)
  assert.equal(convert(1, 'gb', 'mb'), 1024)
  assert.equal(convert(2048, 'mb', 'gb'), 2)
  assert.equal(convert(2, 'jam', 'menit'), 120)
  assert.equal(convert(1, 'm', 'kg'), null)
  assert.equal(convert(1, 'xyz', 'm'), null)
  assert.equal(convert('abc', 'm', 'km'), null)
})

// ---------- Suit ----------
test('suit: batu kalahkan gunting, gunting kertas, kertas batu', () => {
  assert.equal(decideSuit('batu', 'gunting'), 'win')
  assert.equal(decideSuit('gunting', 'kertas'), 'win')
  assert.equal(decideSuit('kertas', 'batu'), 'win')
  assert.equal(decideSuit('gunting', 'batu'), 'lose')
  assert.equal(decideSuit('kertas', 'gunting'), 'lose')
  assert.equal(decideSuit('batu', 'kertas'), 'lose')
  assert.equal(decideSuit('batu', 'batu'), 'draw')
})

// ---------- Weton ----------
test('weton: jangkar 17-08-1945 adalah Jumat Legi', () => {
  const w = wetonOf('17-08-1945')
  assert.equal(w.pasaran, 'Legi')
  assert.equal(w.dayIndex, 5)
  const next = wetonOf('18-08-1945')
  assert.equal(next.dayIndex, 6)
  assert.equal(next.pasaran, 'Pahing')
  assert.equal(wetonOf('31-02-2020'), null)
  assert.equal(wetonOf('1945-08-17'), null)
  assert.equal(wetonOf('ngawur'), null)
})

// ---------- Slot ----------
test('slot: spin dengan rng tetap dan pembayaran triple vs kalah', () => {
  const triple = spin(() => 0)
  assert.deepEqual(triple, ['🍒', '🍒', '🍒'])
  const win = evaluateSpin(triple, 100)
  assert.equal(win.kind, 'triple')
  assert.ok(win.net > 0)
  const star = evaluateSpin(['⭐', '⭐', '⭐'], 100)
  assert.equal(star.multiplier, 25)
  const pair = evaluateSpin(['🍋', '🍋', '🍇'], 100)
  assert.equal(pair.kind, 'pair')
  assert.equal(pair.net, 100)
  const lose = evaluateSpin(['🍒', '🍋', '🍇'], 100)
  assert.equal(lose.kind, 'lose')
  assert.equal(lose.net, -100)
})

test('slot handler: triple membayar saldo, kalah mengurangi saldo', async () => {
  const storage = memoryStorage()
  const digits = '628111111111'
  await updateProfile(storage, digits, { balance: 1000 })
  const originalRandom = Math.random
  try {
    Math.random = () => 0
    const winCtx = fakeCtx(storage, { digits, args: ['100'] })
    await slotHandler(winCtx.ctx)
    assert.equal((await getProfile(storage, digits)).balance, 1900)
    const seq = [0, 0.2, 0.4]
    let i = 0
    Math.random = () => seq[i++ % seq.length]
    const loseCtx = fakeCtx(storage, { digits, args: ['100'] })
    await slotHandler(loseCtx.ctx)
    assert.equal((await getProfile(storage, digits)).balance, 1800)
  } finally {
    Math.random = originalRandom
  }
})

// ---------- Dadu ----------
test('daduvs: resolveDice menang seri kalah', () => {
  assert.deepEqual(resolveDice(6, 3, 100), { outcome: 'win', delta: 100 })
  assert.deepEqual(resolveDice(4, 4, 100), { outcome: 'draw', delta: 0 })
  assert.deepEqual(resolveDice(2, 5, 100), { outcome: 'lose', delta: -100 })
})

// ---------- Blackjack engine ----------
const card = (rank, suit = '♠') => ({ rank, suit })

test('blackjack: handValue menghitung ace 1 atau 11', () => {
  assert.equal(handValue([card('A'), card('K')]), 21)
  assert.equal(handValue([card('A'), card('6')]), 17)
  assert.equal(handValue([card('A'), card('A'), card('9')]), 21)
  assert.equal(handValue([card('10'), card('6'), card('A')]), 17)
  assert.equal(handValue([card('K'), card('Q')]), 20)
  assert.ok(isBlackjack([card('A'), card('K')]))
  assert.ok(!isBlackjack([card('7'), card('7'), card('7')]))
})

test('blackjack: startGame membagi 2 dan 2 kartu', () => {
  const state = startGame(100, () => 0.42)
  assert.equal(state.player.length, 2)
  assert.equal(state.dealer.length, 2)
  assert.equal(state.deck.length, 48)
  assert.equal(state.bet, 100)
})

test('blackjack: hit menambah kartu, bust langsung kalah', () => {
  const state = {
    player: [card('5'), card('6', '♥')],
    dealer: [card('10', '♦'), card('7', '♣')],
    deck: [card('2')],
    bet: 100,
    phase: 'player',
    result: null,
  }
  applyHit(state)
  assert.equal(state.player.length, 3)
  assert.equal(handValue(state.player), 13)
  assert.equal(state.phase, 'player')
  const bustState = {
    player: [card('10'), card('9', '♥')],
    dealer: [card('10', '♦'), card('7', '♣')],
    deck: [card('K')],
    bet: 100,
    phase: 'player',
    result: null,
  }
  applyHit(bustState)
  assert.equal(bustState.phase, 'done')
  assert.equal(bustState.result, 'bust')
  assert.equal(payoutFor(bustState), 0)
})

test('blackjack: stand mengakhiri, dealer menarik sampai 17, pembayaran benar', () => {
  const state = {
    player: [card('10'), card('8', '♥')],
    dealer: [card('10', '♦'), card('6', '♣')],
    deck: [card('5')],
    bet: 100,
    phase: 'player',
    result: null,
  }
  applyStand(state)
  assert.equal(state.phase, 'done')
  assert.equal(handValue(state.dealer), 21)
  assert.equal(state.result, 'lose')
  const winState = {
    player: [card('10'), card('9', '♥')],
    dealer: [card('10', '♦'), card('7', '♣')],
    deck: [card('5')],
    bet: 100,
    phase: 'player',
    result: null,
  }
  applyStand(winState)
  assert.equal(winState.result, 'win')
  assert.equal(payoutFor(winState), 200)
  assert.equal(payoutFor({ bet: 100, result: 'blackjack' }), 250)
  assert.equal(payoutFor({ bet: 100, result: 'push' }), 100)
  assert.equal(payoutFor({ bet: 100, result: 'lose' }), 0)
})

// ---------- Todo ----------
test('todo: tambah, list, selesai, hapus, terisolasi per user', async () => {
  const storage = memoryStorage()
  const a = '628111111111'
  const b = '628222222222'
  let run = fakeCtx(storage, { digits: a, args: ['add', 'beli', 'kopi'] })
  await todoHandler(run.ctx)
  run = fakeCtx(storage, { digits: a, args: ['add', 'belajar'] })
  await todoHandler(run.ctx)
  run = fakeCtx(storage, { digits: b, args: ['add', 'tugas', 'orang', 'lain'] })
  await todoHandler(run.ctx)

  const todosA = await storage.get('kv', `todo:${a}`)
  assert.equal(todosA.length, 2)
  const todosB = await storage.get('kv', `todo:${b}`)
  assert.equal(todosB.length, 1)
  assert.equal(todosB[0].text, 'tugas orang lain')

  run = fakeCtx(storage, { digits: a, args: ['done', '1'] })
  await todoHandler(run.ctx)
  assert.equal((await storage.get('kv', `todo:${a}`))[0].done, true)

  run = fakeCtx(storage, { digits: a, args: ['list'] })
  await todoHandler(run.ctx)
  const listText = run.texts().join('\n')
  assert.match(listText, /beli kopi/)
  assert.match(listText, /belajar/)

  run = fakeCtx(storage, { digits: a, args: ['del', '2'] })
  await todoHandler(run.ctx)
  const after = await storage.get('kv', `todo:${a}`)
  assert.equal(after.length, 1)
  assert.equal(after[0].text, 'beli kopi')
  assert.equal((await storage.get('kv', `todo:${b}`)).length, 1)
})

// ---------- Transfer ----------
test('transfer: saldo cukup berhasil memindahkan koin', async () => {
  const storage = memoryStorage()
  const sender = '628111111111'
  const receiver = '628222222222'
  await updateProfile(storage, sender, { balance: 1000 })
  const run = fakeCtx(storage, { digits: sender, args: [receiver, '500'] })
  await transferHandler(run.ctx)
  assert.equal((await getProfile(storage, sender)).balance, 500)
  assert.equal((await getProfile(storage, receiver)).balance, 500)
})

test('transfer: saldo kurang ditolak dan ke diri sendiri ditolak', async () => {
  const storage = memoryStorage()
  const sender = '628111111111'
  const receiver = '628222222222'
  await updateProfile(storage, sender, { balance: 200 })
  let run = fakeCtx(storage, { digits: sender, args: [receiver, '500'] })
  await transferHandler(run.ctx)
  assert.equal((await getProfile(storage, sender)).balance, 200)
  assert.equal((await getProfile(storage, receiver)).balance, 0)
  assert.match(run.replies.join('\n'), /kurang/)
  run = fakeCtx(storage, { digits: sender, args: [sender, '100'] })
  await transferHandler(run.ctx)
  assert.match(run.replies.join('\n'), /diri sendiri/)
  assert.equal((await getProfile(storage, sender)).balance, 200)
})

// ---------- Ingatkan ----------
test('ingatkan: tersimpan di namespace reminders dengan chat tujuan', async () => {
  const storage = memoryStorage()
  const digits = '628111111111'
  const before = Date.now()
  const run = fakeCtx(storage, { digits, args: ['30', 'minum', 'air'] })
  await ingatkanHandler(run.ctx)
  const items = await storage.get('reminders', digits)
  assert.equal(items.length, 1)
  assert.equal(items[0].text, 'minum air')
  assert.equal(items[0].chat, `${digits}@s.whatsapp.net`)
  assert.ok(items[0].at >= before + 30 * 60000 - 1000)
})

// ---------- Catatan ----------
test('catatan: simpan, lihat, hapus per judul', async () => {
  const storage = memoryStorage()
  const digits = '628111111111'
  let run = fakeCtx(storage, { digits, args: ['simpan', 'wifi', '=', 'sandi123'] })
  run.ctx.text = 'simpan wifi = sandi123'
  await catatanHandler(run.ctx)
  const notes = await storage.get('kv', `notes:${digits}`)
  assert.equal(notes.wifi.text, 'sandi123')
  run = fakeCtx(storage, { digits, args: ['hapus', 'wifi'] })
  await catatanHandler(run.ctx)
  assert.equal((await storage.get('kv', `notes:${digits}`)).wifi, undefined)
})

// ---------- Gacha ----------
test('gacha: pickWeighted memilih dari pool dan pool bawaan punya 10 item', () => {
  assert.equal(FALLBACK_POOL.length, 10)
  const picked = pickWeighted(FALLBACK_POOL, () => 0)
  assert.ok(picked)
  assert.ok(FALLBACK_POOL.includes(picked))
})
