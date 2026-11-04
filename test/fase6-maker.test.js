import { test } from 'node:test'
import assert from 'node:assert/strict'
import { textImage } from '../src/services/text-image.js'
import { toStickerWebp, injectStickerExif, parseExif } from '../src/services/sticker.js'
import { handler as stickerHandler, i18n as stickerI18n } from '../plugins/maker/sticker.js'
import { toFancy } from '../plugins/maker/textstyle.js'
import { emojiCode, emojiKitchenUrl } from '../plugins/maker/emojimix.js'

async function smallPng() {
  return textImage({ width: 96, height: 96, lines: [{ text: 'KANA', size: 20, bold: true }] })
}

test('EXIF stiker: injeksi lalu terbaca kembali oleh parseExif', async () => {
  const webp = await toStickerWebp(await smallPng(), { animated: false })
  assert.equal(webp.toString('ascii', 0, 4), 'RIFF')
  assert.equal(webp.toString('ascii', 8, 12), 'WEBP')
  const injected = injectStickerExif(webp, {
    packId: 'tes-1',
    packName: 'Pack Tes',
    publisher: 'Penguji',
    emojis: ['🌸'],
  })
  assert.equal(injected.toString('ascii', 0, 4), 'RIFF')
  assert.equal(injected.readUInt32LE(4), injected.length - 8)
  const parsed = parseExif(injected)
  assert.equal(parsed['sticker-pack-id'], 'tes-1')
  assert.equal(parsed['sticker-pack-name'], 'Pack Tes')
  assert.equal(parsed['sticker-pack-publisher'], 'Penguji')
  assert.deepEqual(parsed.emojis, ['🌸'])
  assert.equal(parseExif(webp), null)
})

test('injectStickerExif menolak buffer bukan WebP', () => {
  assert.throws(() => injectStickerExif(Buffer.from('bukan webp sama sekali')), /tidak dikenal/)
})

test('textstyle: pemetaan karakter fancy', () => {
  assert.equal(toFancy('Kana', 'bold'), '𝐊𝐚𝐧𝐚')
  assert.equal(toFancy('Kana123', 'monospace'), '𝙺𝚊𝚗𝚊𝟷𝟸𝟹')
  assert.equal(toFancy('kana', 'smallcaps'), 'ᴋᴀɴᴀ')
  assert.equal(toFancy('h', 'italic'), 'ℎ')
  assert.equal(toFancy('B', 'script'), 'ℬ')
  assert.equal(toFancy('halo!', 'tidak-ada'), 'halo!')
})

test('emojimix: codepoint tanpa FE0F dan pola URL Emoji Kitchen', () => {
  assert.equal(emojiCode('❤️'), '2764')
  assert.equal(emojiCode('😀'), '1f600')
  assert.equal(
    emojiKitchenUrl('😀', '🔥'),
    'https://www.gstatic.com/android/keyboard/emojikitchen/20201001/u1f600/u1f600_u1f525.png'
  )
})

test('handler sticker: media dikutip PNG menghasilkan kiriman { sticker }', async () => {
  const png = await smallPng()
  const sent = []
  const replies = []
  const t = (key, vars = {}) => {
    const name = key.split('.')[1]
    let str = stickerI18n.id.sticker[name] ?? key
    for (const [k, v] of Object.entries(vars)) str = str.replace(`{${k}}`, String(v))
    return str
  }
  const ctx = {
    sock: {
      sendMessage: async (jid, content, opts) => {
        sent.push({ jid, content, opts })
        return {}
      },
    },
    chat: '123@s.whatsapp.net',
    sender: '123@s.whatsapp.net',
    senderDigits: '123',
    pushName: 'Tes',
    isGroup: false,
    isOwner: false,
    args: [],
    text: '',
    command: 'sticker',
    lang: 'id',
    t,
    say: () => '',
    reply: async (txt) => replies.push(txt),
    storage: null,
    registry: null,
    raw: { key: { remoteJid: '123@s.whatsapp.net' }, message: { conversation: '.sticker' } },
    quoted: { message: { imageMessage: { mimetype: 'image/png' } }, sender: '123@s.whatsapp.net', stanzaId: 'ABC' },
    mentionedJids: [],
    downloadMedia: async () => {
      throw new Error('tidak dipakai')
    },
    downloadQuoted: async () => png,
    getGroupMetadata: async () => null,
  }
  await stickerHandler(ctx)
  const stickerSend = sent.find((s) => s.content && 'sticker' in s.content)
  assert.ok(stickerSend, 'harus ada kiriman sticker')
  assert.ok(Buffer.isBuffer(stickerSend.content.sticker))
  assert.equal(stickerSend.content.sticker.toString('ascii', 8, 12), 'WEBP')
  const parsed = parseExif(stickerSend.content.sticker)
  assert.equal(parsed['sticker-pack-name'], 'KANA')
  assert.equal(parsed['sticker-pack-publisher'], 'KANA by OmniDevv')
})
