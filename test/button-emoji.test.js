import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BUTTON_EMOJI, COMMAND_EMOJI, buttonEmojiForId, withButtonEmoji } from '../src/config/templates.js'
import { sendButtons } from '../src/ui/buttons.js'

// Kunci aksi wajib dari aturan user 2026-11-04: satu emoji per label tombol,
// dipilih konsisten per jenis aksi dari peta baku template pusat.
const REQUIRED_KEYS = [
  'menu', 'back', 'download', 'search', 'profile', 'level', 'limit', 'leaderboard',
  'game', 'group', 'ai', 'random', 'copy', 'open', 'music', 'video', 'image',
  'sticker', 'rpg', 'fun', 'owner', 'help', 'list', 'close', 'next', 'retry',
  'play', 'info', 'settings', 'link', 'text', 'quiz', 'wallet', 'shop', 'craft',
  'bank', 'calendar', 'clock', 'book', 'gift', 'trophy', 'heart', 'star', 'fire',
  'check', 'cross', 'warning', 'globe', 'chat', 'mic', 'camera',
]

const graphemeCount = (s) => [...new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(s)].length

test('BUTTON_EMOJI: semua kunci wajib ada dan nilainya tepat satu emoji', () => {
  for (const key of REQUIRED_KEYS) {
    assert.ok(key in BUTTON_EMOJI, `kunci ${key} ada di BUTTON_EMOJI`)
    const emoji = BUTTON_EMOJI[key]
    assert.equal(typeof emoji, 'string')
    assert.ok(emoji.length > 0, `emoji ${key} tidak kosong`)
    assert.equal(graphemeCount(emoji), 1, `emoji ${key} tepat satu karakter emoji`)
    assert.ok(!/[a-zA-Z0-9 ]/.test(emoji), `emoji ${key} bukan teks biasa`)
  }
})

test('COMMAND_EMOJI: semua nilai menunjuk kunci BUTTON_EMOJI yang ada', () => {
  for (const [command, action] of Object.entries(COMMAND_EMOJI)) {
    assert.ok(action in BUTTON_EMOJI, `${command} menunjuk aksi ${action} yang ada`)
  }
})

test('buttonEmojiForId: contoh id nyata dari plugin', () => {
  assert.equal(buttonEmojiForId('.level'), BUTTON_EMOJI.level)
  assert.equal(buttonEmojiForId('.menu user'), BUTTON_EMOJI.menu)
  assert.equal(buttonEmojiForId('.menu'), BUTTON_EMOJI.menu)
  assert.equal(buttonEmojiForId('.play https://www.youtube.com/watch?v=aaa111'), BUTTON_EMOJI.play)
  assert.equal(buttonEmojiForId('.leaderboard'), BUTTON_EMOJI.leaderboard)
  assert.equal(buttonEmojiForId('.profil'), BUTTON_EMOJI.profile)
  assert.equal(buttonEmojiForId('.ytmp4 https://youtu.be/abc'), BUTTON_EMOJI.video)
  assert.equal(buttonEmojiForId('copy'), BUTTON_EMOJI.copy)
})

test('buttonEmojiForId: id tak dikenal menghasilkan string kosong', () => {
  assert.equal(buttonEmojiForId('.perintahngawur'), '')
  assert.equal(buttonEmojiForId(''), '')
  assert.equal(buttonEmojiForId(undefined), '')
  assert.equal(buttonEmojiForId('.'), '')
})

test('withButtonEmoji: menambahkan emoji dari id, id tidak ikut berubah', () => {
  assert.equal(withButtonEmoji('Level Aku', '.level'), `${BUTTON_EMOJI.level} Level Aku`)
  assert.equal(withButtonEmoji('Menu User', '.menu user'), `${BUTTON_EMOJI.menu} Menu User`)
})

test('withButtonEmoji: idempoten dan tidak menggandakan emoji yang sudah ada', () => {
  const once = withButtonEmoji('Level Aku', '.level')
  assert.equal(withButtonEmoji(once, '.level'), once)
  assert.equal(withButtonEmoji('🏆 Leaderboard', '.leaderboard'), '🏆 Leaderboard')
  assert.equal(withButtonEmoji('Label Polos', '.perintahngawur'), 'Label Polos')
  assert.equal(withButtonEmoji('', '.level'), '')
})

function fakeSock({ withRelay = true } = {}) {
  const sent = []
  const relayed = []
  const sock = {
    user: { id: '6285187605007@s.whatsapp.net' },
    sendMessage: async (jid, content, opts) => {
      sent.push({ jid, content, opts })
      return {}
    },
  }
  if (withRelay) {
    sock.relayMessage = async (jid, message, opts) => {
      relayed.push({ jid, message, opts })
      return {}
    }
  }
  return { sock, sent, relayed }
}

// Kumpulkan { id, displayText } tombol quick_reply dari payload relay.
function collectButtons(node, out = []) {
  if (!node || typeof node !== 'object') return out
  for (const [key, value] of Object.entries(node)) {
    if (key === 'buttonParamsJson' && typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.id) out.push({ id: parsed.id, displayText: parsed.display_text ?? parsed.displayText ?? '' })
      } catch {
        // bukan JSON tombol, abaikan
      }
    } else {
      collectButtons(value, out)
    }
  }
  return out
}

test('sendButtons: label payload beremoji, id tombol tetap perintah aslinya', async () => {
  const { sock, relayed } = fakeSock()
  await sendButtons(sock, '628123@s.whatsapp.net', {
    title: 'KANA',
    body: 'Kartu profil',
    footer: 'KANA',
    replies: [
      { text: 'Level Aku', id: '.level' },
      { text: 'Menu User', id: '.menu user' },
      { text: 'Apa Saja', id: '.perintahngawur' },
    ],
  })
  assert.equal(relayed.length, 1, 'satu pesan tombol ter-relay')
  const buttons = collectButtons(relayed[0].message)
  assert.deepEqual(
    buttons.map((b) => b.id),
    ['.level', '.menu user', '.perintahngawur'],
    'id tombol persis perintah asli, tanpa emoji'
  )
  assert.equal(buttons[0].displayText, `${BUTTON_EMOJI.level} Level Aku`)
  assert.equal(buttons[1].displayText, `${BUTTON_EMOJI.menu} Menu User`)
  assert.equal(buttons[2].displayText, 'Apa Saja', 'id tak dikenal: label dibiarkan polos')
})

test('sendButtons: fallback teks tanpa relay memuat label beremoji dan id perintah', async () => {
  const { sock, sent } = fakeSock({ withRelay: false })
  await sendButtons(sock, '628123@s.whatsapp.net', {
    title: 'KANA',
    body: 'Isi pesan',
    replies: [{ text: 'Level Aku', id: '.level' }],
  })
  const texts = sent.map((s) => s.content.text ?? '').join('\n')
  assert.ok(texts.includes('Isi pesan'), 'body fallback tetap ada')
  assert.ok(texts.includes(`${BUTTON_EMOJI.level} Level Aku (.level)`), 'baris fallback memuat label beremoji plus id')
})
