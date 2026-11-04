import { test } from 'node:test'
import assert from 'node:assert/strict'
import { memoryStorage } from './user-service.test.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import { say } from '../src/persona/moe.js'
import {
  DEFAULT_GOODBYE,
  DEFAULT_WELCOME,
  TEMPLATE_KEYS,
  footerLine,
  neutralWatermark,
  renderTemplate,
  smallCaps,
  withFooter,
} from '../src/config/templates.js'
import { getGroupText, resetGroupText, setGroupText } from '../src/services/group-settings.js'
import { sendButtons } from '../src/ui/buttons.js'
import * as setwelcome from '../plugins/group/setwelcome.js'
import * as setgoodbye from '../plugins/group/setgoodbye.js'
import * as welcome from '../plugins/group/welcome.js'

for (const plugin of [setwelcome, setgoodbye, welcome]) {
  for (const [lang, msgs] of Object.entries(plugin.i18n)) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

const CHAT = '120363111@g.us'
const MEMBER = '628111111111@s.whatsapp.net'
const ADMIN = '628222222222@s.whatsapp.net'

// --- templates: smallCaps ---

test('smallCaps: huruf jadi small caps unicode, karakter lain tetap', () => {
  assert.equal(smallCaps('Kana'), 'ᴋᴀɴᴀ')
  assert.equal(smallCaps('MENU GRUP'), 'ᴍᴇɴᴜ ɢʀᴜᴘ')
  assert.equal(smallCaps('Halo, Dunia! 123'), 'ʜᴀʟᴏ, ᴅᴜɴɪᴀ! 123')
  assert.equal(smallCaps(''), '')
  assert.equal(smallCaps(null), '')
  assert.equal(smallCaps(undefined), '')
})

// --- templates: renderTemplate ---

test('renderTemplate: placeholder lengkap terganti semua', () => {
  const out = renderTemplate('Halo {user} di {group}, total {count} member', {
    user: '@628111',
    group: 'Grup Tes',
    count: 3,
  })
  assert.equal(out, 'Halo @628111 di Grup Tes, total 3 member')
})

test('renderTemplate: vars sebagian, placeholder lain dibiarkan', () => {
  const out = renderTemplate('Halo {user} di {group}', { user: 'Rian' })
  assert.equal(out, 'Halo Rian di {group}')
})

test('renderTemplate: vars kosong atau tidak ada tetap aman', () => {
  assert.equal(renderTemplate('Halo {user}'), 'Halo {user}')
  assert.equal(renderTemplate('Halo {user}', {}), 'Halo {user}')
  assert.equal(renderTemplate('Halo {user}', null), 'Halo {user}')
  assert.equal(renderTemplate(''), '')
  assert.equal(renderTemplate(null), '')
  assert.equal(renderTemplate(undefined, { user: 'x' }), '')
})

// --- templates: kunci i18n dan footer ---

test('templates: semua kunci TEMPLATE_KEYS ada di locale inti dua bahasa', () => {
  for (const key of Object.values(TEMPLATE_KEYS)) {
    assert.notEqual(translate('id', key), key, `kunci id hilang: ${key}`)
    assert.notEqual(translate('en', key), key, `kunci en hilang: ${key}`)
  }
})

test('templates: footerLine memakai t bila ada, watermark netral bila tidak', () => {
  assert.equal(footerLine(t), translate('id', TEMPLATE_KEYS.footer))
  assert.equal(footerLine(), neutralWatermark())
  assert.equal(footerLine(() => TEMPLATE_KEYS.footer), neutralWatermark())
  assert.ok(neutralWatermark().length > 0)
})

test('templates: withFooter mengakhiri body dengan footer miring kecil', () => {
  const out = withFooter(t, 'Isi pesan')
  assert.ok(out.startsWith('Isi pesan'))
  assert.ok(out.endsWith(`_${translate('id', TEMPLATE_KEYS.footer)}_`))
  const neutral = withFooter(null, 'Isi pesan')
  assert.match(neutral, /\n\n_[^_]+_$/)
  assert.equal(withFooter(t, ''), `_${translate('id', TEMPLATE_KEYS.footer)}_`)
})

test('templates: default welcome dan goodbye memuat semua placeholder', () => {
  for (const tpl of [DEFAULT_WELCOME, DEFAULT_GOODBYE]) {
    assert.ok(tpl.includes('{user}'))
    assert.ok(tpl.includes('{group}'))
    assert.ok(tpl.includes('{count}'))
  }
})

// --- group-settings ---

test('group-settings: grup baru mendapat default dari template pusat', async () => {
  const storage = memoryStorage()
  assert.equal(await getGroupText(storage, CHAT, 'welcome'), DEFAULT_WELCOME)
  assert.equal(await getGroupText(storage, CHAT, 'goodbye'), DEFAULT_GOODBYE)
})

test('group-settings: set lalu get mengembalikan custom, kind lain tidak ikut', async () => {
  const storage = memoryStorage()
  await setGroupText(storage, CHAT, 'welcome', 'Halo {user}!')
  assert.equal(await getGroupText(storage, CHAT, 'welcome'), 'Halo {user}!')
  assert.equal(await getGroupText(storage, CHAT, 'goodbye'), DEFAULT_GOODBYE)
  const raw = await storage.get('group_settings', CHAT)
  assert.equal(raw.welcome, 'Halo {user}!')
})

test('group-settings: reset mengembalikan default', async () => {
  const storage = memoryStorage()
  await setGroupText(storage, CHAT, 'goodbye', 'Dadah {user}!')
  assert.equal(await resetGroupText(storage, CHAT, 'goodbye'), DEFAULT_GOODBYE)
  assert.equal(await getGroupText(storage, CHAT, 'goodbye'), DEFAULT_GOODBYE)
})

test('group-settings: storage error atau kosong jatuh ke default', async () => {
  const broken = {
    async get() { throw new Error('db mati') },
    async set() { throw new Error('db mati') },
  }
  assert.equal(await getGroupText(broken, CHAT, 'welcome'), DEFAULT_WELCOME)
  assert.equal(await resetGroupText(broken, CHAT, 'welcome'), DEFAULT_WELCOME)
  assert.equal(await getGroupText(null, CHAT, 'welcome'), DEFAULT_WELCOME)
  assert.equal(await getGroupText(memoryStorage(), '', 'goodbye'), DEFAULT_GOODBYE)
  const emptyString = memoryStorage()
  await emptyString.set('group_settings', CHAT, { welcome: '   ' })
  assert.equal(await getGroupText(emptyString, CHAT, 'welcome'), DEFAULT_WELCOME)
})

// --- handler setwelcome dan setgoodbye dengan ctx palsu ---

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

function groupCtx({ sock, storage, text = '', args = [] }) {
  const replies = []
  return {
    replies,
    ctx: {
      sock,
      chat: CHAT,
      sender: ADMIN,
      senderDigits: '628222222222',
      pushName: 'Admin',
      isGroup: true,
      isOwner: false,
      isAdmin: true,
      args,
      text,
      command: '',
      lang: 'id',
      raw: { key: { remoteJid: CHAT, id: 'm1' } },
      t,
      say: (mood) => say('id', mood),
      reply: async (txt) => { replies.push(txt) },
      sendText: async (txt, mentions) => sock.sendMessage(CHAT, { text: txt, mentions }),
      storage,
      registry: { list: () => [], resolve: () => undefined, quarantined: [] },
    },
  }
}

function sentTexts(sock) {
  return sock.sent.map((m) => String(m.content.text ?? m.content.caption ?? '')).join('\n')
}

test('setwelcome: config gate grup dan admin mengikuti pola plugin grup lain', () => {
  for (const plugin of [setwelcome, setgoodbye]) {
    assert.equal(plugin.config.category, 'group')
    assert.equal(plugin.config.isGroup, true)
    assert.equal(plugin.config.isAdmin, true)
    assert.equal(typeof plugin.test.input, 'string')
    assert.ok(plugin.test.expect instanceof RegExp)
  }
  assert.equal(setwelcome.test.input, '.setwelcome')
  assert.equal(setgoodbye.test.input, '.setgoodbye')
})

test('setwelcome tanpa argumen: tampilkan teks saat ini dan cara mengubah', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const { ctx } = groupCtx({ sock, storage })
  await setwelcome.handler(ctx)
  const texts = sentTexts(sock)
  assert.ok(texts.includes('Selamat datang'), 'default welcome tampil')
  assert.ok(texts.includes('.setwelcome'), 'cara mengubah tampil')
  assert.ok(texts.includes('{user}'), 'info placeholder tampil')
})

test('setwelcome teks baru: tersimpan dan terkonfirmasi', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const custom = 'Halo {user}, selamat datang di {group}! Member ke {count} nih.'
  const { ctx } = groupCtx({ sock, storage, text: custom, args: custom.split(' ') })
  await setwelcome.handler(ctx)
  assert.equal(await getGroupText(storage, CHAT, 'welcome'), custom)
  assert.ok(sentTexts(sock).includes('disimpan'))
})

test('setwelcome reset: kembali ke default dan terkonfirmasi', async () => {
  const storage = memoryStorage()
  await setGroupText(storage, CHAT, 'welcome', 'teks custom')
  const sock = fakeSock()
  const { ctx } = groupCtx({ sock, storage, text: 'reset', args: ['reset'] })
  await setwelcome.handler(ctx)
  assert.equal(await getGroupText(storage, CHAT, 'welcome'), DEFAULT_WELCOME)
  assert.ok(sentTexts(sock).includes('Selamat datang'), 'teks default tampil di konfirmasi')
})

test('setwelcome teks kepanjangan: ditolak dan tidak tersimpan', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const long = 'a'.repeat(501)
  const { ctx, replies } = groupCtx({ sock, storage, text: long, args: [long] })
  await setwelcome.handler(ctx)
  assert.equal(replies.length, 1)
  assert.ok(replies[0].includes('500'))
  assert.equal(await getGroupText(storage, CHAT, 'welcome'), DEFAULT_WELCOME)
})

test('setgoodbye tanpa argumen, simpan, dan reset berjalan simetris', async () => {
  const storage = memoryStorage()
  const sock = fakeSock()
  const first = groupCtx({ sock, storage })
  await setgoodbye.handler(first.ctx)
  assert.ok(sentTexts(sock).includes('pernah gabung'), 'default goodbye tampil')

  const custom = 'Dadah {user} dari {group}!'
  const second = groupCtx({ sock, storage, text: custom, args: custom.split(' ') })
  await setgoodbye.handler(second.ctx)
  assert.equal(await getGroupText(storage, CHAT, 'goodbye'), custom)
  assert.equal(await getGroupText(storage, CHAT, 'welcome'), DEFAULT_WELCOME)

  const third = groupCtx({ sock, storage, text: 'reset', args: ['reset'] })
  await setgoodbye.handler(third.ctx)
  assert.equal(await getGroupText(storage, CHAT, 'goodbye'), DEFAULT_GOODBYE)
})

// --- welcome retrofit: teks dari group-settings ---

test('welcome: onParticipantsUpdate memakai teks custom dari group-settings', async () => {
  const storage = memoryStorage()
  await storage.set('groups', CHAT, { welcome: true, goodbye: false })
  await setGroupText(storage, CHAT, 'welcome', 'Halo {user} di {group}, member nomor {count}!')
  const sock = fakeSock()
  await welcome.onParticipantsUpdate({
    sock,
    chat: CHAT,
    participants: [MEMBER],
    action: 'add',
    author: ADMIN,
    storage,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    sendText: (txt, mentions) => sock.sendMessage(CHAT, { text: txt, mentions }),
    getGroupMetadata: async () => ({
      subject: 'Grup Tes',
      participants: [{ id: MEMBER }, { id: ADMIN }, { id: '628333333333@s.whatsapp.net' }],
    }),
  })
  assert.equal(sock.sent.length, 1)
  const caption = String(sock.sent[0].content.caption)
  assert.ok(caption.includes('@628111111111'), 'placeholder user jadi mention')
  assert.ok(caption.includes('Grup Tes'), 'placeholder group terganti')
  assert.ok(caption.includes('nomor 3'), 'placeholder count terganti jumlah member')
  assert.deepEqual(sock.sent[0].content.mentions, [MEMBER])
})

test('welcome: tanpa custom, caption memakai default template pusat', async () => {
  const storage = memoryStorage()
  await storage.set('groups', CHAT, { welcome: true, goodbye: false })
  const sock = fakeSock()
  await welcome.onParticipantsUpdate({
    sock,
    chat: CHAT,
    participants: [MEMBER],
    action: 'add',
    author: ADMIN,
    storage,
    lang: 'id',
    t,
    say: (mood) => say('id', mood),
    sendText: (txt, mentions) => sock.sendMessage(CHAT, { text: txt, mentions }),
    getGroupMetadata: async () => ({ subject: 'Grup Tes', participants: [{ id: MEMBER }] }),
  })
  assert.equal(sock.sent.length, 1)
  assert.ok(String(sock.sent[0].content.caption).includes('Grup Tes'))
})

// --- buttons: footer bawaan ---

test('buttons: tanpa footer, footer bawaan dari template pusat dipakai', async () => {
  const sock = fakeSock()
  await sendButtons(sock, '628123@s.whatsapp.net', { title: 'KANA', body: 'Halo', replies: [] })
  assert.equal(sock.sent.length, 1)
  assert.ok(sock.sent[0].content.text.includes(neutralWatermark()))
})

test('buttons: tanpa footer tapi dengan t, footer locale inti dipakai', async () => {
  const sock = fakeSock()
  await sendButtons(sock, '628123@s.whatsapp.net', { title: 'KANA', body: 'Halo', replies: [], t })
  assert.equal(sock.sent.length, 1)
  assert.ok(sock.sent[0].content.text.includes(translate('id', TEMPLATE_KEYS.footer)))
})

test('buttons: footer eksplisit pemanggil lama tidak ditimpa', async () => {
  const sock = fakeSock()
  await sendButtons(sock, '628123@s.whatsapp.net', {
    title: 'KANA', body: 'Halo', footer: 'Footer Lama', replies: [], t,
  })
  assert.equal(sock.sent.length, 1)
  assert.ok(sock.sent[0].content.text.includes('Footer Lama'))
  assert.ok(!sock.sent[0].content.text.includes(translate('id', TEMPLATE_KEYS.footer)))
})
