// Tes perilaku perbaikan klaster RPG gelombang 2 (2026-11-06): membuktikan
// efek state nyata (stat tersimpan, konversi DM dua arah, jual semua
// menaikkan saldo, upgrade guild dari kas, klaim level, merchant, petshop,
// battle memakai power/pet, judipvp memindahkan bet, konverter kurs).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import { getProfile, updateProfile } from '../src/services/user-service.js'
import { powerOf } from '../src/rpg/engine.js'
import { parseRates } from '../src/services/fx-rates.js'
import * as buyattack from '../plugins/rpg/buyattack.js'
import * as buydm from '../plugins/rpg/buydm.js'
import * as buykoin from '../plugins/rpg/buykoin.js'
import * as sellall from '../plugins/rpg/sellall.js'
import * as guildupgrade from '../plugins/rpg/guildupgrade.js'
import * as leveluprpg from '../plugins/rpg/leveluprpg.js'
import * as merchant from '../plugins/rpg/merchant.js'
import * as petshop from '../plugins/rpg/petshop.js'
import * as battlepet from '../plugins/rpg/battlepet.js'
import * as judipvp from '../plugins/rpg/judipvp.js'
import * as fight from '../plugins/rpg/fight.js'
import * as guildwar from '../plugins/rpg/guildwar.js'
import * as expoint from '../plugins/rpg/expoint.js'
import * as stamina from '../plugins/rpg/stamina.js'
import * as kandang from '../plugins/rpg/kandang.js'
import * as inv from '../plugins/rpg/inv.js'

const ALL = [buyattack, buydm, buykoin, sellall, guildupgrade, leveluprpg, merchant, petshop, battlepet, judipvp, fight, guildwar, expoint, stamina, kandang, inv]
for (const plugin of ALL) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)
const ME = '628111111111'

function makeCtx({ storage, args = [], sender = ME + '@s.whatsapp.net' } = {}) {
  const replies = []
  return {
    replies,
    sock: { async sendMessage() { return { key: { id: 'x' } } } },
    chat: ME + '@s.whatsapp.net',
    sender,
    senderDigits: sender.replace(/\D/g, ''),
    pushName: 'Tes',
    isGroup: false,
    isOwner: false,
    args,
    text: args.join(' '),
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    storage,
    quoted: null,
    mentionedJids: [],
    reply: async (replyText) => { replies.push({ text: replyText }); return { key: { id: 'r' } } },
  }
}

test('buyattack: stat tersimpan di profil dan menaikkan powerOf', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { balance: 1000 })
  const before = powerOf(await getProfile(storage, ME))
  const ctx = makeCtx({ storage, args: ['2'] })
  await buyattack.handler(ctx)
  const profile = await getProfile(storage, ME)
  assert.equal(profile.stats.attack, 2)
  assert.equal(profile.balance, 1000 - (150 + 225))
  assert.equal(powerOf(profile), before + 4)
  assert.match(ctx.replies[0].text, /Attack naik jadi \*2\*/)
})

test('buyattack: saldo kurang tidak mengubah stat', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { balance: 10 })
  const ctx = makeCtx({ storage, args: ['1'] })
  await buyattack.handler(ctx)
  const profile = await getProfile(storage, ME)
  assert.equal(profile.stats?.attack ?? 0, 0)
  assert.equal(profile.balance, 10)
})

test('buydm lalu buykoin: konversi dua arah dengan kurs yang dinyatakan', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { balance: 5000 })
  await buydm.handler(makeCtx({ storage, args: ['2'] }))
  let profile = await getProfile(storage, ME)
  assert.equal(profile.dm, 2)
  assert.equal(profile.balance, 3000)
  await buykoin.handler(makeCtx({ storage, args: ['1'] }))
  profile = await getProfile(storage, ME)
  assert.equal(profile.dm, 1)
  assert.equal(profile.balance, 3900)
})

test('sellall: saldo bertambah dan inventaris kosong', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { balance: 100, inventory: { besi: 2, batu: 3 } })
  const ctx = makeCtx({ storage })
  await sellall.handler(ctx)
  const profile = await getProfile(storage, ME)
  assert.equal(profile.balance, 100 + 2 * 60 + 3 * 10)
  assert.deepEqual(profile.inventory, {})
  assert.match(ctx.replies[0].text, /Terjual|terjual/)
})

test('guildupgrade: level guild naik dari kas, hanya pemilik', async () => {
  const storage = memoryStorage()
  await storage.set('clans', 'naga', { id: 'naga', name: 'Naga', owner: ME, members: [ME], bank: 2000, xp: 0, power: 0, lastWar: '' })
  await updateProfile(storage, ME, { clanId: 'naga' })
  const ctx = makeCtx({ storage })
  await guildupgrade.handler(ctx)
  const clan = await storage.get('clans', 'naga')
  assert.equal(clan.bank, 1500)
  assert.equal(guildupgrade.guildLevel(clan), 2)
  assert.match(ctx.replies[0].text, /level 2/)
})

test('leveluprpg: klaim hadiah level sekali, kedua kali tidak ada lagi', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { xp: 200, balance: 0 })
  const ctx = makeCtx({ storage })
  await leveluprpg.handler(ctx)
  let profile = await getProfile(storage, ME)
  assert.equal(profile.levelClaimed, 3)
  assert.equal(profile.balance, 200 + 300)
  const ctx2 = makeCtx({ storage })
  await leveluprpg.handler(ctx2)
  profile = await getProfile(storage, ME)
  assert.equal(profile.balance, 500)
  assert.match(ctx2.replies[0].text, /Belum ada level baru/)
})

test('merchant: menjual 10 persen di atas harga biasa', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { balance: 0, inventory: { besi: 1 } })
  const ctx = makeCtx({ storage, args: ['besi', '1'] })
  await merchant.handler(ctx)
  const profile = await getProfile(storage, ME)
  assert.equal(profile.balance, Math.floor(60 * 1.1))
  assert.deepEqual(profile.inventory, {})
})

test('petshop: adopsi menyimpan pet, beli makanan menambah stok', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { balance: 1000 })
  await petshop.handler(makeCtx({ storage, args: ['adopsi', 'kucing'] }))
  let profile = await getProfile(storage, ME)
  assert.equal(profile.pet.kind, 'kucing')
  await petshop.handler(makeCtx({ storage, args: ['beli', '2'] }))
  profile = await getProfile(storage, ME)
  assert.equal(profile.inventory.makananpet, 2)
})

test('battlepet: XP pet bertambah sesudah bertarung', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { pet: { kind: 'kucing', name: 'Kucing', level: 1, xp: 0, fedAt: null } })
  const ctx = makeCtx({ storage })
  await battlepet.handler(ctx)
  const profile = await getProfile(storage, ME)
  assert.ok(profile.pet.xp > 0)
  assert.match(ctx.replies[0].text, /XP pet|XP/)
})

test('battlepet: tanpa pet ditolak', async () => {
  const storage = memoryStorage()
  const ctx = makeCtx({ storage })
  await battlepet.handler(ctx)
  assert.match(ctx.replies[0].text, /belum punya pet/)
})

test('judipvp: bet berpindah dari yang kalah ke pemenang', async () => {
  const storage = memoryStorage()
  const OPP = '628222222222'
  await updateProfile(storage, ME, { balance: 500, xp: 2000 })
  await updateProfile(storage, OPP, { balance: 500, xp: 0 })
  const totalBefore = 1000
  const ctx = makeCtx({ storage, args: [OPP, '100'] })
  await judipvp.handler(ctx)
  const me = await getProfile(storage, ME)
  const opp = await getProfile(storage, OPP)
  assert.equal(me.balance + opp.balance, totalBefore)
  assert.ok(me.balance === 600 || me.balance === 400)
  assert.equal(opp.balance, 1000 - me.balance)
})

test('fight: energi terpotong dan hasil menyebut monster data.js', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { energy: 100, balance: 0 })
  const ctx = makeCtx({ storage })
  await fight.handler(ctx)
  const profile = await getProfile(storage, ME)
  assert.equal(profile.energy, 90)
  assert.match(ctx.replies[0].text, /MENANG|kalah kali ini/)
})

test('guildwar: tanpa guild ditolak dengan jujur', async () => {
  const storage = memoryStorage()
  const ctx = makeCtx({ storage })
  await guildwar.handler(ctx)
  assert.match(ctx.replies[0].text, /belum punya guild/)
})

test('expoint dan stamina membaca data profil nyata', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, { xp: 200, energy: 42 })
  const ctx = makeCtx({ storage })
  await expoint.handler(ctx)
  assert.match(ctx.replies[0].text, /200 XP/)
  const ctx2 = makeCtx({ storage })
  await stamina.handler(ctx2)
  assert.match(ctx2.replies[0].text, /42\/100/)
})

test('kandang dan inv membaca pet serta inventaris nyata', async () => {
  const storage = memoryStorage()
  await updateProfile(storage, ME, {
    inventory: { besi: 2 },
    pet: { kind: 'anjing', name: 'Anjing', level: 3, xp: 210, fedAt: null },
  })
  const ctx = makeCtx({ storage })
  await kandang.handler(ctx)
  assert.match(ctx.replies[0].text, /Level pet: \*3\*/)
  const ctx2 = makeCtx({ storage })
  await inv.handler(ctx2)
  assert.match(ctx2.replies[0].text, /INV RPG/)
  assert.match(ctx2.replies[0].text, /120 koin/)
})

test('fx-rates: parseRates menghitung kurs per unit dan tanggal', () => {
  const parsed = parseRates({ rates: { SAR: 0.00025, JPY: 0.01 }, time_last_update_utc: 'Thu, 05 Nov 2026 00:02:31 +0000' })
  assert.equal(parsed.SAR, 4000)
  assert.equal(parsed.JPY, 100)
  assert.match(parsed.date, /05 Nov 2026/)
  assert.equal(parseRates({ rates: {} }), null)
})
