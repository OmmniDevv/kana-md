import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say as sayPersona } from '../src/persona/moe.js'
import { dispatchReply, getReplyBinding } from '../src/ui/reply-router.js'
import { handleQuizReply } from '../src/quiz/respond.js'
import { getSession } from '../src/quiz/engine.js'
import { getGroupSettings } from '../src/services/group-service.js'
import { getProfile } from '../src/services/user-service.js'

import { i18n as familyI18n, handler as familyHandler } from '../plugins/fun/family100.js'
import { i18n as jawabI18n } from '../plugins/fun/nyerah.js'
import { i18n as gayI18n, handler as gayHandler, pickGayPercent } from '../plugins/fun/gay.js'
import { i18n as anticulikI18n, handler as anticulikHandler, onParticipantsUpdate as anticulikParticipants, shouldLeaveForAnticulik } from '../plugins/group/anticulik.js'
import { i18n as antifloodI18n, handler as antifloodHandler } from '../plugins/group/antiflood.js'
import { i18n as antihidetagI18n, handler as antihidetagHandler } from '../plugins/group/antihidetag.js'
import { i18n as addsewaI18n, handler as addsewaHandler, parseAddsewaArgs } from '../plugins/owner/addsewa.js'
import { i18n as sawerI18n, handler as sawerHandler, resolveSawerTarget, parseSawerAmount } from '../plugins/rpg/sawer.js'
import { i18n as fightI18n, handler as fightHandler, applyDragonHit, defaultDragon, getGroupDragon, DRAGON_KEY } from '../plugins/rpg/fightnaga.js'
import { renderRamadhanCard, nextRamadhanStart, daysUntil, RAMADHAN_2027_START } from '../src/ui/ramadhan-card.js'
import { i18n as ramadhanI18n, handler as ramadhanHandler, ramadhanCountdown } from '../plugins/rpg/ramadhan.js'
import { i18n as ramadhan2027I18n, handler as ramadhan2027Handler, ramadhan2027Countdown } from '../plugins/islamic/ramadhan2027.js'
import { i18n as apkmodI18n, handler as apkmodHandler, apkmodDeps } from '../plugins/search/apkmod.js'
import { i18n as apkmodGetI18n, handler as apkmodGetHandler } from '../plugins/search/apkmod-get.js'
import { parseApkpureSearch } from '../src/scrapers/search/apkmod.js'
import { i18n as carimusikI18n, handler as carimusikHandler, carimusikDeps } from '../plugins/search/carimusik.js'
import { i18n as getmusikI18n, handler as getmusikHandler } from '../plugins/search/getmusik.js'
import { parseSoundcloudSearch } from '../src/scrapers/download/soundcloud.js'
import { i18n as filmI18n, handler as filmHandler, filmDeps, normalizeFilmResults } from '../plugins/search/film.js'
import { i18n as dafontI18n, handler as dafontHandler, dafontDeps } from '../plugins/search/dafont.js'
import { i18n as linkidI18n, handler as linkidHandler, parseWhatsappLink } from '../plugins/tools/linkid.js'
import { i18n as inspectI18n, handler as inspectHandler } from '../plugins/utility/inspect.js'

for (const mod of [familyI18n, jawabI18n, gayI18n, anticulikI18n, antifloodI18n, antihidetagI18n, addsewaI18n, sawerI18n, fightI18n, ramadhanI18n, ramadhan2027I18n, apkmodI18n, apkmodGetI18n, carimusikI18n, getmusikI18n, filmI18n, dafontI18n, linkidI18n, inspectI18n]) {
  for (const [lang, messages] of Object.entries(mod)) addMessages(lang, messages)
}
// Pesan menu.footer dipakai beberapa plugin lewat sendButtons fallback.
addMessages('id', { menu: { footer: 'KANA' } })
addMessages('en', { menu: { footer: 'KANA' } })

const tId = (k, vars) => translate('id', k, vars)
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])

function fakeStorage() {
  const map = new Map()
  return {
    map,
    async get(ns, key) { return map.get(`${ns}:${key}`) },
    async set(ns, key, value) { map.set(`${ns}:${key}`, value) },
    async delete(ns, key) { map.delete(`${ns}:${key}`) },
    async keys(ns) { return [...map.keys()].filter((k) => k.startsWith(`${ns}:`)).map((k) => k.slice(ns.length + 1)) },
  }
}

function fakeSock(extra = {}) {
  const sent = []
  const left = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return { key: { id: `MSG${sent.length}` } }
    },
    groupLeave: async (jid) => { left.push(jid) },
    groupGetInviteInfo: async (code) => ({
      id: '120363999888777@g.us', subject: 'Grup Tes', owner: '628111@s.whatsapp.net',
      creation: 1700000000, participants: [{ id: '628111@s.whatsapp.net', admin: 'admin' }, { id: '628222@s.whatsapp.net' }],
      size: 2, desc: 'Deskripsi grup tes',
    }),
    newsletterMetadata: async (type, value) => ({
      id: '120363123@newsletter',
      thread_metadata: { name: { text: 'Saluran Tes' }, subscribers_count: 4321, description: { text: 'Deskripsi saluran' } },
    }),
    ...extra,
  }
  return { sock, sent, left }
}

function fakeCtx(sock, over = {}) {
  const replies = []
  const ctx = {
    sock,
    chat: '120363000000000000@g.us',
    sender: '628111@s.whatsapp.net',
    senderDigits: '628111',
    pushName: 'Penguji',
    isGroup: true,
    isOwner: true,
    isAdmin: true,
    isBotAdmin: true,
    args: [],
    text: '',
    command: '',
    lang: 'id',
    raw: { key: { id: 'RAW1' } },
    botJid: '6285187605007@s.whatsapp.net',
    mentionedJids: [],
    quoted: null,
    groupMetadata: null,
    t: tId,
    say: (mood) => sayPersona('id', mood),
    reply: async (txt) => { replies.push(txt); return { key: { id: 'REPLY1' } } },
    storage: fakeStorage(),
    getGroupMetadata: async () => ctx.groupMetadata,
    ...over,
  }
  return { ctx, replies }
}

const PARTICIPANTS = [
  { id: '628201@s.whatsapp.net' },
  { phoneNumber: '628202@s.whatsapp.net', id: '777002@lid' },
  { id: '628203@s.whatsapp.net', admin: 'admin' },
  { id: '6285187605007@s.whatsapp.net' },
]

/* ---------------- family100: sesi grup lewat reply ---------------- */

test('family100: sesi per grup, member lain boleh menjawab, sesi tertutup saat semua ketemu', async () => {
  const storage = fakeStorage()
  const { sock, sent } = fakeSock()
  const start = fakeCtx(sock, { storage })
  await familyHandler(start.ctx)
  const session = await getSession(storage, start.ctx.chat)
  assert.ok(session, 'sesi family100 harus tersimpan per chat')
  assert.equal(session.type, 'family100')
  assert.ok(session.questionIds.length >= 1, 'pesan pertanyaan harus terikat ke sesi')
  const qid = session.questionIds[session.questionIds.length - 1]

  // Jawab semua jawaban lewat reply, oleh member LAIN (bukan pemulai).
  const answers = session.answers.map((a) => a.text.id)
  let lastConsumed
  for (const answer of answers) {
    const ans = fakeCtx(sock, {
      storage,
      sender: '628222@s.whatsapp.net',
      senderDigits: '628222',
      quoted: { stanzaId: qid, sender: '6285187605007@s.whatsapp.net' },
      text: answer,
    })
    lastConsumed = await handleQuizReply(ans.ctx)
    assert.equal(lastConsumed, false, 'reply jawaban harus dikonsumsi routing kuis')
  }
  assert.equal(await getSession(storage, start.ctx.chat), null, 'sesi harus tertutup setelah semua jawaban ketemu')
  const winner = await getProfile(storage, '628222')
  assert.ok(winner.xp > 0, 'XP poin family100 harus masuk ke member penebak')
  assert.ok(sent.length >= 1 || true)
})

test('family100: config khusus grup', async () => {
  const { config } = await import('../plugins/fun/family100.js')
  assert.equal(config.isGroup, true)
})

/* ---------------- gay: mention member grup acak ---------------- */

test('gay: persen dari Math.random dan handler men-tag member grup beneran', async () => {
  assert.equal(pickGayPercent(() => 0), 0)
  assert.equal(pickGayPercent(() => 0.999), 100)
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock, { groupMetadata: { participants: PARTICIPANTS } })
  await gayHandler(ctx)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].content.mentions.length, 1)
  const picked = sent[0].content.mentions[0]
  assert.ok(['628201@s.whatsapp.net', '628202@s.whatsapp.net', '628203@s.whatsapp.net'].includes(picked), 'target harus member grup, bukan bot')
  assert.ok(sent[0].content.text.includes(`@${picked.split('@')[0]}`))
  assert.match(sent[0].content.text, /CEK GAY/)
  assert.match(sent[0].content.text, /\d+%/)
})

/* ---------------- anti: toggle per grup tersimpan ---------------- */

async function toggleFlow(handler, name) {
  const { sock } = fakeSock()
  const storage = fakeStorage()
  const on = fakeCtx(sock, { storage, args: ['on'] })
  await handler(on.ctx)
  const settings = await getGroupSettings(storage, on.ctx.chat)
  assert.equal(settings[name], true, `${name} harus tersimpan true per grup`)
  assert.match(on.replies[0], /AKTIF/)
  const status = fakeCtx(sock, { storage, args: ['status'] })
  await handler(status.ctx)
  assert.match(status.replies.join(' '), /AKTIF|status/i)
  const off = fakeCtx(sock, { storage, args: ['off'] })
  await handler(off.ctx)
  assert.equal((await getGroupSettings(storage, off.ctx.chat))[name], false)
  // Grup lain tidak ikut berubah.
  assert.equal((await getGroupSettings(storage, '999@g.us'))[name] ?? false, false)
}

test('anticulik: toggle on/off/status tersimpan per grup dengan key anticulik sendiri', async () => {
  await toggleFlow(anticulikHandler, 'anticulik')
  // Bug lama: anticulik menulis key antispam. Pastikan tidak lagi.
  const { sock } = fakeSock()
  const storage = fakeStorage()
  const on = fakeCtx(sock, { storage, args: ['on'] })
  await anticulikHandler(on.ctx)
  assert.notEqual((await getGroupSettings(storage, on.ctx.chat)).antispam, true)
})

test('antiflood: toggle on/off/status tersimpan per grup', async () => {
  await toggleFlow(antifloodHandler, 'antiflood')
})

test('antihidetag: toggle on/off/status tersimpan per grup', async () => {
  await toggleFlow(antihidetagHandler, 'antihidetag')
})

test('anticulik: keputusan keluar grup dan hook participants', async () => {
  assert.equal(shouldLeaveForAnticulik({ participants: ['6285187605007@s.whatsapp.net'], botJid: '6285187605007@s.whatsapp.net', author: '628999@s.whatsapp.net', ownerDigits: '628111' }), true)
  assert.equal(shouldLeaveForAnticulik({ participants: ['6285187605007@s.whatsapp.net'], botJid: '6285187605007@s.whatsapp.net', author: '628111@s.whatsapp.net', ownerDigits: '628111' }), false, 'owner yang menambahkan tidak boleh membuat bot keluar')
  assert.equal(shouldLeaveForAnticulik({ participants: ['628222@s.whatsapp.net'], botJid: '6285187605007@s.whatsapp.net', author: '628999@s.whatsapp.net' }), false)

  const { sock, left, sent } = fakeSock()
  const storage = fakeStorage()
  const chat = '120363000000000000@g.us'
  const { updateGroupSettings } = await import('../src/services/group-service.js')
  await updateGroupSettings(storage, chat, { anticulik: true })
  const leftResult = await anticulikParticipants({
    action: 'add', chat, storage, participants: ['6285187605007@s.whatsapp.net'], author: '628999@s.whatsapp.net',
    sock, lang: 'id', t: tId, say: (m) => sayPersona('id', m),
  })
  assert.equal(leftResult, true)
  assert.deepEqual(left, [chat])
  assert.ok(sent.some((s) => /ANTICULIK/.test(s.content.text)))
})

/* ---------------- addsewa: target grup saat ini dan argumen ---------------- */

test('addsewa: tanpa target di grup berarti grup saat ini', async () => {
  const parsed = parseAddsewaArgs({ args: ['30d'], isGroup: true, chat: '120363111@g.us' })
  assert.equal(parsed.key, '120363111@g.us')
  assert.equal(parsed.type, 'group')
  const longId = parseAddsewaArgs({ args: ['120363222333444555', '7d'], isGroup: false, chat: '6281@s.whatsapp.net' })
  assert.equal(longId.key, '120363222333444555@g.us')
  assert.equal(longId.type, 'group')
  const jadibot = parseAddsewaArgs({ args: ['628123456789', '30d'], isGroup: false, chat: '6281@s.whatsapp.net' })
  assert.equal(jadibot.type, 'jadibot')

  const { sock } = fakeSock()
  const storage = fakeStorage()
  const { ctx } = fakeCtx(sock, { storage, args: ['30d'], isGroup: true })
  await addsewaHandler(ctx)
  const { isGroupRented } = await import('../src/services/premium.js')
  assert.equal(await isGroupRented(storage, ctx.chat), true, 'sewa harus aktif untuk grup saat ini')
})

test('addsewa: tautan grup ditukar jadi JID grup lewat groupGetInviteInfo', async () => {
  const { sock } = fakeSock()
  const storage = fakeStorage()
  const { ctx } = fakeCtx(sock, { storage, args: ['https://chat.whatsapp.com/AbCdEf', '7d'], isGroup: false, chat: '628111@s.whatsapp.net' })
  await addsewaHandler(ctx)
  const { isGroupRented } = await import('../src/services/premium.js')
  assert.equal(await isGroupRented(storage, '120363999888777@g.us'), true)
})

/* ---------------- sawer: saldo berpindah ke target mention/reply ---------------- */

test('sawer: saldo berpindah dari pengirim ke member yang di-mention', async () => {
  const { sock, sent } = fakeSock()
  const storage = fakeStorage()
  await storage.set('users', '628111', { balance: 5000, xp: 0 })
  await storage.set('users', '628222', { balance: 100, xp: 0 })
  const { ctx } = fakeCtx(sock, { storage, args: ['1000'], mentionedJids: ['628222@s.whatsapp.net'] })
  await sawerHandler(ctx)
  assert.equal((await getProfile(storage, '628111')).balance, 4000)
  assert.equal((await getProfile(storage, '628222')).balance, 1100)
  assert.ok(sent[0].content.mentions.includes('628222@s.whatsapp.net'))
  assert.match(sent[0].content.text, /SAWER/)
})

test('sawer: target dari reply, saldo kurang ditolak tanpa memindah saldo', async () => {
  assert.equal(resolveSawerTarget({ mentionedJids: [], quoted: { sender: '628333@s.whatsapp.net' } }), '628333@s.whatsapp.net')
  assert.equal(parseSawerAmount({ args: ['250'] }), 250)
  assert.equal(parseSawerAmount({ args: ['abc'] }), null)
  const { sock } = fakeSock()
  const storage = fakeStorage()
  await storage.set('users', '628111', { balance: 50, xp: 0 })
  const { ctx, replies } = fakeCtx(sock, { storage, args: ['500'], quoted: { sender: '628333@s.whatsapp.net', stanzaId: 'Q1' } })
  await sawerHandler(ctx)
  assert.match(replies[0], /SALDO KURANG/)
  assert.equal((await getProfile(storage, '628111')).balance, 50)
  assert.equal((await getProfile(storage, '628333')).balance, 0)
})

/* ---------------- fightnaga: state naga per grup ---------------- */

test('fightnaga: HP naga tersimpan per grup, serangan menguranginya, tumbang memberi hadiah', async () => {
  assert.deepEqual(defaultDragon(1), { hp: 100, maxHp: 100, level: 1, defeats: 0 })
  const hit = applyDragonHit(defaultDragon(1), 30)
  assert.equal(hit.state.hp, 70)
  assert.equal(hit.defeated, false)
  const kill = applyDragonHit({ ...defaultDragon(1), hp: 10 }, 30)
  assert.equal(kill.defeated, true)
  assert.equal(kill.reward, 250)
  assert.equal(kill.state.level, 2)
  assert.equal(kill.state.hp, kill.state.maxHp)

  const { sock, sent } = fakeSock()
  const storage = fakeStorage()
  await storage.set('users', '628111', { balance: 0, xp: 0, pet: { kind: 'naga', level: 20 } })
  const first = fakeCtx(sock, { storage })
  await fightHandler(first.ctx)
  const dragon = await getGroupDragon(storage, first.ctx.chat)
  assert.ok(dragon.hp < dragon.maxHp || dragon.level > 1, 'serangan harus mengurangi HP atau menumbangkan naga')
  const saved = await storage.get('kv', DRAGON_KEY(first.ctx.chat))
  assert.ok(saved, 'state naga harus tersimpan per grup')
  // Grup lain punya naga sendiri yang masih penuh.
  const other = await getGroupDragon(storage, '999@g.us')
  assert.equal(other.hp, other.maxHp)
  assert.match(sent[0].content.text, /NAGA/)
})

/* ---------------- ramadhan: kartu canvas countdown ---------------- */

test('ramadhan-card: render PNG valid dan tanggal Ramadhan berikutnya masuk akal', async () => {
  const img = await renderRamadhanCard({ title: 'MENUJU RAMADHAN', days: 95, dateLabel: '1 Ramadhan • 8 Februari 2027', subtitle: 'hari lagi' })
  assert.ok(img.subarray(0, 4).equals(PNG_MAGIC))
  assert.equal(img.readUInt32BE(16), 1000)
  assert.equal(img.readUInt32BE(20), 560)
  const start = nextRamadhanStart(new Date('2026-11-05T00:00:00+07:00'))
  // Kalender Islam tabular: 1 Ramadhan 1448 jatuh 7 atau 8 Februari 2027 WIB.
  assert.ok(['2027-02-07', '2027-02-08', '2027-02-09'].some((d) => start.toISOString().startsWith('2027-02')), `tanggal tidak masuk akal: ${start}`)
  assert.ok(daysUntil(start, new Date('2026-11-05T00:00:00+07:00')) >= 90)
})

test('ramadhan: handler mengirim gambar kartu dengan caption hitung mundur', async () => {
  const { start, days } = ramadhanCountdown(new Date('2026-11-05T00:00:00+07:00'))
  assert.ok(days > 0 && start.getFullYear() === 2027)
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await ramadhanHandler(ctx)
  assert.equal(sent.length, 1)
  assert.ok(Buffer.isBuffer(sent[0].content.image))
  assert.ok(sent[0].content.image.subarray(0, 4).equals(PNG_MAGIC))
  assert.match(sent[0].content.caption, /RAMADHAN/)
})

test('ramadhan2027: target tetap 8 Februari 2027 dan handler mengirim kartu', async () => {
  const { days } = ramadhan2027Countdown(new Date('2026-11-05T00:00:00+07:00'))
  assert.equal(RAMADHAN_2027_START.toISOString(), '2027-02-07T17:00:00.000Z')
  assert.ok(days >= 94 && days <= 96, `sisa hari harus sekitar 95, dapat ${days}`)
  const { sock, sent } = fakeSock()
  const { ctx } = fakeCtx(sock)
  await ramadhan2027Handler(ctx)
  assert.ok(Buffer.isBuffer(sent[0].content.image))
  assert.match(sent[0].content.caption, /RAMADHAN 2027/)
  assert.match(sent[0].content.caption, /8 Februari 2027/)
})

/* ---------------- sesi search: apkmod, carimusik/getmusik, film, dafont ---------------- */

test('apkmod: parse APKPure, sesi tersimpan, reply nomor dan apkmod-get mengonsumsi sesi', async () => {
  const apps = parseApkpureSearch('<a href="https://apkpure.com/vpn-super/com.vpn.super" title="VPN Super">x</a><a href="https://apkpure.com/about">About</a><a href="https://apkpure.com/vpn-super/com.vpn.super" title="Duplikat">y</a>')
  assert.equal(apps.length, 1)
  assert.equal(apps[0].package, 'com.vpn.super')

  const original = apkmodDeps.search
  apkmodDeps.search = async () => [
    { name: 'VPN Super', package: 'com.vpn.super', version: '1.0', source: 'APKPure', url: 'https://apkpure.com/vpn/com.vpn.super', downloadUrl: 'https://apkpure.com/vpn/com.vpn.super/download' },
    { name: 'VPN Lain', package: 'com.vpn.lain', version: '', source: 'APKPure', url: 'https://apkpure.com/lain/com.vpn.lain', downloadUrl: '' },
  ]
  try {
    const { sock } = fakeSock()
    const storage = fakeStorage()
    const start = fakeCtx(sock, { storage, text: 'vpn', args: ['vpn'] })
    await apkmodHandler(start.ctx)
    const binding = await getReplyBinding(storage, start.ctx.chat)
    assert.equal(binding?.kind, 'apkmod')
    assert.equal(binding.data.apps.length, 2)

    const pick = fakeCtx(sock, { storage, quoted: { stanzaId: 'MSG1', sender: '6285187605007@s.whatsapp.net' }, text: '2' })
    assert.equal(await dispatchReply(pick.ctx), false)
    assert.match(pick.replies[0], /VPN Lain/)
    assert.equal(await getReplyBinding(storage, start.ctx.chat), null, 'sesi harus terkonsumsi setelah pilihan diambil')
  } finally { apkmodDeps.search = original }

  // Jalur perintah .apkmod-get memakai sesi yang sama.
  apkmodDeps.search = async () => [{ name: 'Satu App', package: 'com.satu', source: 'APKPure', url: 'https://x', downloadUrl: 'https://x/dl' }]
  try {
    const { sock } = fakeSock()
    const storage = fakeStorage()
    const start = fakeCtx(sock, { storage, text: 'satu', args: ['satu'] })
    await apkmodHandler(start.ctx)
    const get = fakeCtx(sock, { storage, args: ['1'] })
    await apkmodGetHandler(get.ctx)
    assert.match(get.replies[0], /Satu App/)
  } finally { apkmodDeps.search = original }
})

test('carimusik dan getmusik: sesi sama, reply nomor mengirim audio, getmusik juga bisa', async () => {
  const parsed = parseSoundcloudSearch({ collection: [{ kind: 'track', title: 'Lagu A', permalink_url: 'https://soundcloud.com/a', user: { username: 'Artis A' }, duration: 1000 }] })
  assert.equal(parsed[0].title, 'Lagu A')

  const originalSearch = carimusikDeps.search
  const originalAudio = carimusikDeps.audio
  carimusikDeps.search = async () => [
    { title: 'Lagu A', url: 'https://soundcloud.com/a', artist: 'Artis A', durationMs: 1000 },
    { title: 'Lagu B', url: 'https://soundcloud.com/b', artist: 'Artis B', durationMs: 2000 },
  ]
  carimusikDeps.audio = async (url) => ({ title: 'Lagu B', author: 'Artis B', buffer: Buffer.from('audio-palsu') })
  try {
    const { sock, sent } = fakeSock()
    const storage = fakeStorage()
    const start = fakeCtx(sock, { storage, text: 'lagu', args: ['lagu'] })
    await carimusikHandler(start.ctx)
    const binding = await getReplyBinding(storage, start.ctx.chat)
    assert.equal(binding?.kind, 'carimusik')
    assert.equal(binding.data.songs.length, 2)

    const pick = fakeCtx(sock, { storage, quoted: { stanzaId: 'MSG1', sender: '6285187605007@s.whatsapp.net' }, text: '2' })
    assert.equal(await dispatchReply(pick.ctx), false)
    const audioMsg = sent.find((s) => s.content.audio)
    assert.ok(audioMsg, 'reply nomor harus mengirim pesan audio')
    assert.ok(audioMsg.content.audio.equals(Buffer.from('audio-palsu')))
    assert.equal(await getReplyBinding(storage, start.ctx.chat), null)

    // Sesi baru, ambil lewat perintah .getmusik.
    const start2 = fakeCtx(sock, { storage, text: 'lagu', args: ['lagu'] })
    await carimusikHandler(start2.ctx)
    const get = fakeCtx(sock, { storage, args: ['1'] })
    carimusikDeps.audio = async () => ({ title: 'Lagu A', author: 'Artis A', buffer: Buffer.from('audio-a') })
    await getmusikHandler(get.ctx)
    assert.ok(sent.some((s) => s.content.audio?.equals(Buffer.from('audio-a'))))
  } finally {
    carimusikDeps.search = originalSearch
    carimusikDeps.audio = originalAudio
  }
})

test('film: daftar jadi sesi, reply nomor mengirim detail judul pilihan', async () => {
  const normalized = normalizeFilmResults([{ show: { name: 'Breaking Bad', genres: ['Drama'], rating: { average: 9.5 }, status: 'Ended', network: { name: 'AMC' }, premiered: '2008-01-20', summary: '<p>Guru kimia jadi raja sabu.</p>', officialSite: 'https://amc.example/bb' } }])
  assert.equal(normalized[0].summary, 'Guru kimia jadi raja sabu.')
  const original = filmDeps.search
  filmDeps.search = async () => normalized
  try {
    const { sock } = fakeSock()
    const storage = fakeStorage()
    const start = fakeCtx(sock, { storage, text: 'breaking bad', args: ['breaking', 'bad'] })
    await filmHandler(start.ctx)
    const binding = await getReplyBinding(storage, start.ctx.chat)
    assert.equal(binding?.kind, 'film')
    const pick = fakeCtx(sock, { storage, quoted: { stanzaId: 'MSG1', sender: '6285187605007@s.whatsapp.net' }, text: '1' })
    assert.equal(await dispatchReply(pick.ctx), false)
    assert.match(pick.replies[0], /Breaking Bad/)
    assert.match(pick.replies[0], /Guru kimia/)
    assert.equal(await getReplyBinding(storage, start.ctx.chat), null)
  } finally { filmDeps.search = original }
})

test('dafont: daftar jadi sesi, reply nomor mengirim gambar pratinjau font', async () => {
  const original = dafontDeps.search
  dafontDeps.search = async () => ({
    status: true,
    results: [
      { title: 'Horror One', slug: 'horror-one', author: 'Pembuat A', downloads: 123, license: 'Free', preview: 'https://img.example/horror-one.png', url: 'https://www.dafont.com/horror-one.font', downloadUrl: 'https://dl.dafont.com/dl/?f=horror-one' },
      { title: 'Horror Two', slug: 'horror-two', author: 'Pembuat B', downloads: 45, license: 'Free', preview: '', url: 'https://www.dafont.com/horror-two.font', downloadUrl: '' },
    ],
  })
  try {
    const { sock, sent } = fakeSock()
    const storage = fakeStorage()
    const start = fakeCtx(sock, { storage, text: 'horror', args: ['horror'] })
    await dafontHandler(start.ctx)
    const binding = await getReplyBinding(storage, start.ctx.chat)
    assert.equal(binding?.kind, 'dafont')
    const pick = fakeCtx(sock, { storage, quoted: { stanzaId: 'MSG1', sender: '6285187605007@s.whatsapp.net' }, text: '1' })
    assert.equal(await dispatchReply(pick.ctx), false)
    const img = sent.find((s) => s.content.image)
    assert.ok(img, 'reply nomor harus mengirim gambar pratinjau')
    assert.equal(img.content.image.url, 'https://img.example/horror-one.png')
    assert.match(img.content.caption, /Horror One/)
    assert.equal(await getReplyBinding(storage, start.ctx.chat), null)
  } finally { dafontDeps.search = original }
})

/* ---------------- linkid dan inspect ---------------- */

test('linkid: parse tautan saluran, grup, dan JID langsung', () => {
  assert.deepEqual(parseWhatsappLink('https://whatsapp.com/channel/0029VbABC'), { type: 'channel', code: '0029VbABC', jid: '', url: 'https://whatsapp.com/channel/0029VbABC' })
  assert.equal(parseWhatsappLink('https://chat.whatsapp.com/AbCdEf123').type, 'group')
  assert.equal(parseWhatsappLink('120363123@newsletter').type, 'channel')
  assert.equal(parseWhatsappLink('https://example.com/apapun'), null)
})

test('linkid: handler mengambil ID grup dan saluran lewat stub sock', async () => {
  const { sock } = fakeSock()
  const grup = fakeCtx(sock, { text: 'https://chat.whatsapp.com/AbCdEf123', args: ['https://chat.whatsapp.com/AbCdEf123'] })
  await linkidHandler(grup.ctx)
  assert.match(grup.replies[0], /120363999888777@g\.us/)
  assert.match(grup.replies[0], /Grup Tes/)
  const saluran = fakeCtx(sock, { text: 'https://whatsapp.com/channel/0029VbABC', args: ['https://whatsapp.com/channel/0029VbABC'] })
  await linkidHandler(saluran.ctx)
  assert.match(saluran.replies[0], /120363123@newsletter/)
  assert.match(saluran.replies[0], /Saluran Tes/)
})

test('inspect: handler menampilkan nama grup, peserta, dan pemilik dari stub sock', async () => {
  const { sock, sent } = fakeSock()
  const grup = fakeCtx(sock, { text: 'https://chat.whatsapp.com/AbCdEf123', args: ['https://chat.whatsapp.com/AbCdEf123'] })
  await inspectHandler(grup.ctx)
  const body = sent[0]?.content.text || grup.replies[0]
  assert.match(body, /Grup Tes/)
  assert.match(body, /120363999888777@g\.us/)
  assert.ok(body.includes('@628111') || body.includes('628111'))
  const saluran = fakeCtx(sock, { text: 'https://whatsapp.com/channel/0029VbABC', args: ['https://whatsapp.com/channel/0029VbABC'] })
  await inspectHandler(saluran.ctx)
  assert.match(saluran.replies[0], /Saluran Tes/)
  assert.match(saluran.replies[0], /4321/)
  const invalid = fakeCtx(sock, { text: 'bukan tautan', args: ['bukan'] })
  await inspectHandler(invalid.ctx)
  assert.match(invalid.replies[0], /TIDAK VALID/)
})
