import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { getProfile } from '../src/services/user-service.js'
import * as clancreate from '../plugins/clan/clancreate.js'
import * as clanjoin from '../plugins/clan/clanjoin.js'
import * as clanleave from '../plugins/clan/clanleave.js'
import * as clankick from '../plugins/clan/clankick.js'
import * as clanpromote from '../plugins/clan/clanpromote.js'
import * as clandemote from '../plugins/clan/clandemote.js'
import * as clanrename from '../plugins/clan/clanrename.js'
import * as clandesc from '../plugins/clan/clandesc.js'
import * as clanupgrade from '../plugins/clan/clanupgrade.js'
import * as clanwaraccept from '../plugins/clan/clanwaraccept.js'
import * as clanwarhistory from '../plugins/clan/clanwarhistory.js'
import * as clanwarscore from '../plugins/clan/clanwarscore.js'
import * as clanraidjoin from '../plugins/clan/clanraidjoin.js'
import * as clanlogo from '../plugins/clan/clanlogo.js'
import * as clanrank from '../plugins/clan/clanrank.js'
import * as clanreport from '../plugins/clan/clanreport.js'
import * as clanbank from '../plugins/clan/clanbank.js'
import * as clanlevel from '../plugins/clan/clanlevel.js'
import * as clanxp from '../plugins/clan/clanxp.js'
import * as upsw from '../plugins/group/upsw.js'

const ALL = [clancreate, clanjoin, clanleave, clankick, clanpromote, clandemote, clanrename, clandesc, clanupgrade, clanwaraccept, clanwarhistory, clanwarscore, clanraidjoin, clanlogo, clanrank, clanreport, clanbank, clanlevel, clanxp, upsw]
for (const plugin of ALL) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

const CHAT = '120363000@g.us'
const A = '628111111111'
const B = '628222222222'
const C = '628333333333'

function fakeSock() {
  const sent = []
  return {
    sent,
    async sendMessage(jid, content, opts) {
      sent.push({ jid, content, opts })
      return { key: { id: 'fake' } }
    },
  }
}

function makeCtx({ storage, sock = fakeSock(), sender = A, text = '', quoted = null, media = null }) {
  const replies = []
  return {
    replies,
    sock,
    chat: CHAT,
    sender: sender + '@s.whatsapp.net',
    senderDigits: sender,
    pushName: 'Tes',
    isGroup: true,
    isOwner: false,
    isAdmin: true,
    isBotAdmin: true,
    args: text.split(/\s+/).filter(Boolean),
    text,
    lang: 'id',
    t,
    storage,
    raw: { key: { remoteJid: CHAT, id: 'msg1', participant: sender + '@s.whatsapp.net' }, message: {} },
    quoted,
    mentionedJids: [],
    botJid: '6285187605007@s.whatsapp.net',
    reply: async (replyText, extra) => {
      replies.push({ text: replyText, extra })
      return { key: { id: 'reply' } }
    },
    downloadQuoted: async () => {
      if (!media) throw new Error('tidak ada media stub')
      return media
    },
    getGroupMetadata: async () => ({ id: CHAT, subject: 'Grup Tes', participants: [] }),
    groupMetadata: { id: CHAT, subject: 'Grup Tes', participants: [] },
  }
}

async function run(plugin, opts) {
  const ctx = makeCtx(opts)
  await plugin.handler(ctx)
  return ctx
}
const lastText = (ctx) => ctx.replies.at(-1)?.text ?? ''
const getClan = (storage, id) => storage.get('kv', 'clan:' + id)

test('clan: alur penuh create join promote demote rename desc mengubah state nyata', async () => {
  const storage = memoryStorage()
  // create: clan benar benar tersimpan dan profil leader terikat
  let ctx = await run(clancreate, { storage, sender: A, text: 'Naga Sakti' })
  assert.match(lastText(ctx), /berhasil dibuat/)
  let clan = await getClan(storage, 'naga-sakti')
  assert.ok(clan, 'clan naga-sakti harus tersimpan di kv')
  assert.equal(clan.leader, A)
  assert.equal(clan.members[A], 'leader')
  assert.deepEqual(clan.bankLog, [])
  assert.equal((await getProfile(storage, A)).clanId, 'naga-sakti')
  // create lagi oleh orang yang sama ditolak
  ctx = await run(clancreate, { storage, sender: A, text: 'Clan Lain' })
  assert.match(lastText(ctx), /sudah punya clan/)
  // join: member masuk dan profilnya terikat
  ctx = await run(clanjoin, { storage, sender: B, text: 'naga-sakti' })
  assert.match(lastText(ctx), /Selamat datang di clan/)
  clan = await getClan(storage, 'naga-sakti')
  assert.equal(clan.members[B], 'member')
  assert.equal((await getProfile(storage, B)).clanId, 'naga-sakti')
  // promote lalu demote mengubah jabatan tersimpan
  ctx = await run(clanpromote, { storage, sender: A, text: B })
  assert.match(lastText(ctx), /sekarang \*co-leader\*/)
  assert.equal((await getClan(storage, 'naga-sakti')).members[B], 'co-leader')
  ctx = await run(clandemote, { storage, sender: A, text: B })
  assert.match(lastText(ctx), /sekarang \*member\*/)
  assert.equal((await getClan(storage, 'naga-sakti')).members[B], 'member')
  // rename dan desc mengubah field clan
  ctx = await run(clanrename, { storage, sender: A, text: 'Naga Emas' })
  assert.match(lastText(ctx), /diperbarui jadi/)
  assert.equal((await getClan(storage, 'naga-sakti')).name, 'Naga Emas')
  ctx = await run(clandesc, { storage, sender: A, text: 'Clan paling solid' })
  assert.match(lastText(ctx), /diperbarui jadi/)
  assert.equal((await getClan(storage, 'naga-sakti')).desc, 'Clan paling solid')
  // kick mengeluarkan member dan membersihkan profilnya
  ctx = await run(clankick, { storage, sender: A, text: B })
  assert.match(lastText(ctx), /dikeluarkan dari clan/)
  clan = await getClan(storage, 'naga-sakti')
  assert.equal(clan.members[B], undefined)
  assert.equal((await getProfile(storage, B)).clanId, '')
  // join lagi lalu leave atas kemauan sendiri
  await run(clanjoin, { storage, sender: B, text: 'naga-sakti' })
  ctx = await run(clanleave, { storage, sender: B, text: '' })
  assert.match(lastText(ctx), /keluar dari clan/)
  assert.equal((await getClan(storage, 'naga-sakti')).members[B], undefined)
  assert.equal((await getProfile(storage, B)).clanId, '')
})

test('clan: raid menaikkan kas dan XP serta tercatat di bankLog, upgrade memotong kas', async () => {
  const storage = memoryStorage()
  await run(clancreate, { storage, sender: A, text: 'Naga Sakti' })
  const snap = await getClan(storage, 'naga-sakti')
  const xpBefore = snap.xp
  const bankBefore = snap.bank
  const ctx = await run(clanraidjoin, { storage, sender: A, text: '' })
  assert.match(lastText(ctx), /Serangan clan berhasil/)
  const afterRaid = await getClan(storage, 'naga-sakti')
  assert.ok(afterRaid.xp > xpBefore, 'XP clan naik setelah raid')
  assert.ok(afterRaid.bank > bankBefore, 'kas clan naik setelah raid')
  assert.equal(afterRaid.bankLog.length, 1)
  assert.equal(afterRaid.bankLog[0].reason, 'raid')
  assert.equal(afterRaid.bankLog[0].delta, afterRaid.bank - bankBefore)
  const xpAfterRaid = afterRaid.xp
  // clanbank menampilkan saldo dan riwayat raid itu
  const bankCtx = await run(clanbank, { storage, sender: A, text: '' })
  assert.match(lastText(bankCtx), /Riwayat kas terakhir/)
  assert.match(lastText(bankCtx), /raid/)
  assert.match(lastText(bankCtx), new RegExp('Kas clan \\*Naga Sakti\\*: \\*' + afterRaid.bank + ' koin\\*'))
  // upgrade: kas dipotong biaya level dan XP bertambah
  const seeded = await getClan(storage, 'naga-sakti')
  seeded.bank = 1000
  await storage.set('kv', 'clan:naga-sakti', seeded)
  const upCtx = await run(clanupgrade, { storage, sender: A, text: '' })
  assert.match(lastText(upCtx), /di-upgrade/)
  const afterUp = await getClan(storage, 'naga-sakti')
  assert.equal(afterUp.bank, 500)
  assert.ok(afterUp.xp >= xpAfterRaid + 100)
  assert.equal(afterUp.bankLog.at(-1).reason, 'upgrade')
  assert.equal(afterUp.bankLog.at(-1).delta, -500)
  // riwayat bank sesudah upgrade memuat dua mutasi
  const bankCtx2 = await run(clanbank, { storage, sender: A, text: '' })
  assert.match(lastText(bankCtx2), /upgrade/)
  assert.match(lastText(bankCtx2), /raid/)
})

test('clan: level menampilkan progress, xp menampilkan kontribusi member nyata', async () => {
  const storage = memoryStorage()
  await run(clancreate, { storage, sender: A, text: 'Naga Sakti' })
  await run(clanjoin, { storage, sender: B, text: 'naga-sakti' })
  await run(clanraidjoin, { storage, sender: A, text: '' })
  const lvlCtx = await run(clanlevel, { storage, sender: A, text: '' })
  assert.match(lastText(lvlCtx), /Progress: /)
  assert.match(lastText(lvlCtx), /Level clan \*Naga Sakti\*: \*1\*/)
  const xpCtx = await run(clanxp, { storage, sender: A, text: '' })
  assert.match(lastText(xpCtx), /Kontribusi member/)
  assert.match(lastText(xpCtx), new RegExp(A))
  assert.match(lastText(xpCtx), new RegExp(B))
  // XP pribadi A lebih besar dari B karena A pelaku raid (+15 XP dari addXp raid)
  const pa = await getProfile(storage, A)
  const pb = await getProfile(storage, B)
  assert.ok(pa.xp > pb.xp)
})

test('clan: rank menghitung posisi di antara semua clan, bukan blok info', async () => {
  const storage = memoryStorage()
  await run(clancreate, { storage, sender: A, text: 'Naga Sakti' })
  await run(clancreate, { storage, sender: C, text: 'Elang' })
  const elang = await getClan(storage, 'elang')
  elang.xp = 900
  await storage.set('kv', 'clan:elang', elang)
  const ctx = await run(clanrank, { storage, sender: A, text: '' })
  assert.match(lastText(ctx), /Peringkat clan \*Naga Sakti\*: \*#2\* dari \*2\* clan/)
  assert.match(lastText(ctx), /Elang/)
  const ctxC = await run(clanrank, { storage, sender: C, text: '' })
  assert.match(lastText(ctxC), /Peringkat clan \*Elang\*: \*#1\*/)
})

test('clan: report merangkum aktivitas nyata termasuk check-in hari ini dan war', async () => {
  const storage = memoryStorage()
  await run(clancreate, { storage, sender: A, text: 'Naga Sakti' })
  await run(clanjoin, { storage, sender: B, text: 'naga-sakti' })
  const today = new Date().toISOString().slice(0, 10)
  await storage.set('kv', 'clancheckin:' + B + ':' + today, { at: Date.now() })
  const clan = await getClan(storage, 'naga-sakti')
  clan.warWins = 2
  clan.warHistory = [{ vs: 'elang', win: true, at: Date.now() }]
  await storage.set('kv', 'clan:naga-sakti', clan)
  const ctx = await run(clanreport, { storage, sender: A, text: '' })
  const out = lastText(ctx)
  assert.match(out, /Laporan aktivitas clan \*Naga Sakti\*/)
  assert.match(out, /Check-in hari ini: \*1\* member/)
  assert.match(out, /Member terdaftar: \*2\* orang/)
  assert.match(out, /vs \*elang\*: menang/)
})

test('clan: waraccept menyelesaikan war tertunda dan mencatat riwayat kedua clan', async () => {
  const storage = memoryStorage()
  await run(clancreate, { storage, sender: A, text: 'Naga Sakti' })
  await run(clancreate, { storage, sender: C, text: 'Elang' })
  await storage.set('kv', 'clanwar:elang', { from: 'naga-sakti', at: Date.now() })
  const ctx = await run(clanwaraccept, { storage, sender: C, text: '' })
  assert.match(lastText(ctx), /Clan war selesai/)
  assert.equal(await storage.get('kv', 'clanwar:elang'), undefined)
  const elang = await getClan(storage, 'elang')
  assert.equal(elang.warHistory.length, 1)
  assert.equal(elang.warHistory[0].vs, 'naga-sakti')
  assert.equal(elang.warWins + elang.warLosses, 1)
  const naga = await getClan(storage, 'naga-sakti')
  assert.equal(naga.warWins + naga.warLosses, 1)
  const histCtx = await run(clanwarhistory, { storage, sender: C, text: '' })
  assert.match(lastText(histCtx), /Rekor war: menang \*\d+\* \/ kalah \*\d+\*/)
  assert.match(lastText(histCtx), /vs \*naga-sakti\*/)
  const scoreCtx = await run(clanwarscore, { storage, sender: C, text: '' })
  assert.match(lastText(scoreCtx), /Rekor war/)
  // accept kedua tanpa tantangan ditolak dengan jelas
  const ctx2 = await run(clanwaraccept, { storage, sender: C, text: '' })
  assert.match(lastText(ctx2), /Tidak ada tantangan war/)
})

test('clan: logo terpasang dari gambar kutipan dan bisa ditampilkan lagi', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  await run(clancreate, { storage, sender: A, text: 'Naga Sakti' })
  const media = Buffer.alloc(2048, 7)
  const quoted = { message: { imageMessage: { mimetype: 'image/jpeg' } }, sender: A + '@s.whatsapp.net', stanzaId: 'st1' }
  const ctx = await run(clanlogo, { storage, sender: A, text: '', quoted, media, sock })
  assert.match(lastText(ctx), /berhasil dipasang/)
  const clan = await getClan(storage, 'naga-sakti')
  assert.equal(clan.logo, media.toString('base64'))
  // tanpa kutipan: logo yang tersimpan dikirim balik sebagai gambar
  const ctx2 = await run(clanlogo, { storage, sender: A, text: '', sock })
  assert.match(lastText(ctx2), /saat ini/)
  const imgSend = sock.sent.find((m) => m.content.image)
  assert.ok(imgSend, 'logo terkirim sebagai pesan gambar')
  assert.ok(Buffer.from(media).equals(imgSend.content.image))
  // member biasa tidak boleh mengganti logo
  await run(clanjoin, { storage, sender: B, text: 'naga-sakti' })
  const ctx3 = await run(clanlogo, { storage, sender: B, text: '', quoted, media, sock })
  assert.match(lastText(ctx3), /Cuma leader\/co-leader/)
})

test('upsw: teks menjadi story grup groupStatus dengan latar hijau', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const ctx = await run(upsw, { storage, sender: A, text: 'Halo semua apa kabar', sock })
  assert.match(lastText(ctx), /Story grup terkirim dengan latar hijau/)
  assert.equal(sock.sent.length, 1)
  assert.equal(sock.sent[0].jid, CHAT)
  assert.equal(sock.sent[0].content.text, 'Halo semua apa kabar')
  assert.equal(sock.sent[0].content.groupStatus, true)
  assert.equal(sock.sent[0].opts.backgroundColor, '#25D366')
})

test('upsw: gambar kutipan menjadi story grup media, tanpa isi ditolak dengan petunjuk', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const media = Buffer.alloc(1024, 3)
  const quoted = { message: { imageMessage: { mimetype: 'image/jpeg' } }, sender: A + '@s.whatsapp.net', stanzaId: 'st2' }
  const ctx = await run(upsw, { storage, sender: A, text: 'Pengumuman', quoted, media, sock })
  assert.match(lastText(ctx), /Story grup terkirim dari media/)
  assert.equal(sock.sent.length, 1)
  assert.equal(sock.sent[0].content.groupStatus, true)
  assert.ok(media.equals(sock.sent[0].content.image))
  assert.equal(sock.sent[0].content.caption, 'Pengumuman')
  const empty = await run(upsw, { storage, sender: A, text: '', sock })
  assert.match(lastText(empty), /Tulis teks story-nya/)
  assert.equal(sock.sent.length, 1, 'tidak ada story tambahan untuk input kosong')
})
