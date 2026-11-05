import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseGithubRepoUrl, isZipBuffer } from '../src/scrapers/download/gitclone.js'
import { parseUguuResponse } from '../src/scrapers/tools/upload.js'
import { emojiCodepoints, notoEmojiUrl, twemojiUrl, firstEmoji, isPngBuffer } from '../src/services/emoji-image.js'
import { buildPinContent, buildPinPayload } from '../src/services/pin-message.js'
import { parseFaaYtmp3, isMp3Buffer } from '../src/scrapers/youtube/youtube.js'
import { parseWallpaperflareResults } from '../src/scrapers/search/wallpaper.js'
import { addMessages, t as translate } from '../src/i18n/index.js'
import * as pinpesan from '../plugins/group/pinpesan.js'
import * as unpinpesan from '../plugins/group/unpinpesan.js'

// Tes port RYO-YAMADA-MD (2026-11-05). Fixture meniru struktur asli yang
// terverifikasi live dari VM pada tanggal yang sama: zipball GitHub
// membalas ZIP asli (magic PK), uguu.se membalas JSON sukses berisi URL
// d.uguu.se, gstatic Noto Emoji membalas PNG asli untuk emoji 1f600,
// API faa ytmp3 membalas judul asli + URL mp3 ber-magic ID3.

test('gitclone: urai URL repo GitHub, tolak yang bukan repo', () => {
  assert.deepEqual(parseGithubRepoUrl('https://github.com/octocat/Hello-World'), { owner: 'octocat', repo: 'Hello-World' })
  assert.deepEqual(parseGithubRepoUrl('https://github.com/octocat/Hello-World.git'), { owner: 'octocat', repo: 'Hello-World' })
  assert.deepEqual(parseGithubRepoUrl('https://github.com/octocat/Hello-World/tree/main'), { owner: 'octocat', repo: 'Hello-World' })
  assert.equal(parseGithubRepoUrl('https://github.com/octocat'), null)
  assert.equal(parseGithubRepoUrl('https://gitlab.com/octocat/Hello-World'), null)
  assert.equal(parseGithubRepoUrl('bukan url'), null)
  assert.equal(parseGithubRepoUrl(''), null)
})

test('gitclone: magic ZIP dikenali', () => {
  assert.equal(isZipBuffer(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00])), true)
  assert.equal(isZipBuffer(Buffer.from('{"message":"Not Found"}')), false)
  assert.equal(isZipBuffer(Buffer.alloc(0)), false)
})

const UGUU_OK = {
  success: true,
  files: [
    {
      hash: 'b3df2ea17210364f',
      filename: 'NFwHmYOe.png',
      url: 'https://d.uguu.se/NFwHmYOe.png',
      size: 75,
      dupe: false,
    },
  ],
}

test('upload: parse balasan uguu.se, tolak bentuk lain', () => {
  assert.deepEqual(parseUguuResponse(UGUU_OK), {
    url: 'https://d.uguu.se/NFwHmYOe.png',
    fileName: 'NFwHmYOe.png',
    size: 75,
    hash: 'b3df2ea17210364f',
  })
  assert.equal(parseUguuResponse({ success: false, errorcode: 400 }), null)
  assert.equal(parseUguuResponse({ success: true, files: [{ url: 'https://evil.example/x.png' }] }), null)
  assert.equal(parseUguuResponse(null), null)
})

test('emojistick: codepoint dan URL sumber emoji', () => {
  assert.deepEqual(emojiCodepoints('😀'), ['1f600'])
  assert.equal(notoEmojiUrl('😀'), 'https://fonts.gstatic.com/s/e/notoemoji/15.1/1f600/512.png')
  assert.equal(twemojiUrl('😀'), 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f600.png')
  assert.equal(firstEmoji('halo 😀 semua'), '😀')
  assert.equal(firstEmoji('tidak ada emoji'), null)
  assert.equal(isPngBuffer(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])), true)
  assert.equal(isPngBuffer(Buffer.from('Not Found')), false)
})

const GROUP_CHAT = '120363409948890046@g.us'
const SENDER = '6283157555852@s.whatsapp.net'
const BOT_JID = '6285187605007:14@s.whatsapp.net'

test('pinpesan: susun kunci pin grup dengan participant', () => {
  const key = buildPinContent({ stanzaId: 'MSGID1', sender: SENDER }, GROUP_CHAT, { isGroup: true, botJid: BOT_JID })
  assert.deepEqual(key, { remoteJid: GROUP_CHAT, fromMe: false, id: 'MSGID1', participant: SENDER })
  const own = buildPinContent({ stanzaId: 'MSGID2', sender: '6285187605007@s.whatsapp.net' }, GROUP_CHAT, { isGroup: true, botJid: BOT_JID })
  assert.equal(own.fromMe, true)
  assert.equal(buildPinContent(null, GROUP_CHAT, {}), null)
  assert.equal(buildPinContent({ sender: SENDER }, GROUP_CHAT, {}), null)
})

test('pinpesan: payload pin type 1, unpin type 2', () => {
  const quoted = { stanzaId: 'MSGID1', sender: SENDER }
  assert.deepEqual(buildPinPayload(quoted, GROUP_CHAT, { isGroup: true, botJid: BOT_JID }), {
    pin: { remoteJid: GROUP_CHAT, fromMe: false, id: 'MSGID1', participant: SENDER },
    type: 1,
  })
  assert.equal(buildPinPayload(quoted, GROUP_CHAT, { isGroup: true, botJid: BOT_JID, unpin: true }).type, 2)
})

for (const plugin of [pinpesan, unpinpesan]) {
  for (const [lang, msgs] of Object.entries(plugin.i18n ?? {})) addMessages(lang, msgs)
}
const t = (k, vars) => translate('id', k, vars)

function fakePinCtx(quoted) {
  const sent = []
  const replies = []
  return {
    sent,
    replies,
    ctx: {
      quoted,
      chat: GROUP_CHAT,
      isGroup: true,
      botJid: BOT_JID,
      t,
      async reply(text) {
        replies.push(text)
        return text
      },
      sock: {
        async sendMessage(jid, content) {
          sent.push({ jid, content })
        },
      },
    },
  }
}

test('pinpesan handler: kirim payload pin persis ke sock', async () => {
  const { ctx, sent, replies } = fakePinCtx({ stanzaId: 'MSGID9', sender: SENDER, message: { conversation: 'halo' } })
  await pinpesan.handler(ctx)
  assert.equal(sent.length, 1)
  assert.deepEqual(sent[0], {
    jid: GROUP_CHAT,
    content: { pin: { remoteJid: GROUP_CHAT, fromMe: false, id: 'MSGID9', participant: SENDER }, type: 1 },
  })
  assert.match(replies.join(' '), /DISEMATKAN/)
})

test('unpinpesan handler: kirim payload type 2', async () => {
  const { ctx, sent, replies } = fakePinCtx({ stanzaId: 'MSGID9', sender: SENDER, message: { conversation: 'halo' } })
  await unpinpesan.handler(ctx)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].content.type, 2)
  assert.match(replies.join(' '), /SEMATAN DILEPAS/)
})

test('pinpesan handler: tanpa kutipan hanya balas petunjuk, tanpa kirim pin', async () => {
  const { ctx, sent, replies } = fakePinCtx(null)
  await pinpesan.handler(ctx)
  assert.equal(sent.length, 0)
  assert.match(replies.join(' '), /KUTIP PESANNYA/)
})

const FAA_OK = {
  status: true,
  creator: 'Faa',
  result: {
    title: 'Halsey - Without Me',
    thumbnail: 'https://i.ytimg.com/vi/ZAfAud_M_mg/hqdefault.jpg',
    duration: '3:56',
    mp3: 'https://cdn.aceimg.com/xHVvybzsG.mp3',
  },
}

// Fixture wallpaperflare meniru struktur asli yang terverifikasi live
// dari VM pada 2026-11-05: #gallery > li > figure > a > img dengan
// data-src di c4.wallpaperflare.com, berkasnya JPEG asli (magic ffd8).
const WALLPAPER_HTML = `<html><body><ul id="gallery">
<li><figure><a href="/anime-wallpaper-1"><img data-src="https://c4.wallpaperflare.com/wallpaper/142/751/831/landscape-anime-digital-art-fantasy-art-wallpaper-preview.jpg" alt="Landscape Anime"></a></figure></li>
<li><figure><a href="/anime-wallpaper-2"><img data-src="https://c4.wallpaperflare.com/wallpaper/1020/1/213/world-of-warcraft-wallpaper-preview.jpg" alt="WoW"></a></figure></li>
<li><figure><a href="/anime-wallpaper-1b"><img data-src="https://c4.wallpaperflare.com/wallpaper/142/751/831/landscape-anime-digital-art-fantasy-art-wallpaper-preview.jpg" alt="Duplikat"></a></figure></li>
<li><figure><a href="/lain"><img src="https://www.wallpaperflare.com/fpublic/css/logo.svg" alt="Logo"></a></figure></li>
</ul></body></html>`

test('wallpaper: parse galeri wallpaperflare, dedupe, buang non-gambar hasil', () => {
  const results = parseWallpaperflareResults(WALLPAPER_HTML)
  assert.equal(results.length, 2)
  assert.match(results[0].url, /^https:\/\/c4\.wallpaperflare\.com\//)
  assert.equal(results[0].title, 'Landscape Anime')
  assert.deepEqual(parseWallpaperflareResults('<html><body>kosong</body></html>'), [])
  assert.deepEqual(parseWallpaperflareResults(''), [])
})

test('youtube fallback faa: parse balasan ytmp3 menjadi bentuk unduh audio', () => {
  assert.deepEqual(parseFaaYtmp3(FAA_OK), {
    title: 'Halsey - Without Me',
    duration: 236,
    durationText: '3:56',
    thumbnail: 'https://i.ytimg.com/vi/ZAfAud_M_mg/hqdefault.jpg',
    mp3Url: 'https://cdn.aceimg.com/xHVvybzsG.mp3',
  })
  assert.equal(parseFaaYtmp3({ status: false }), null)
  assert.equal(parseFaaYtmp3({ status: true, result: { title: 'x' } }), null)
  assert.equal(isMp3Buffer(Buffer.from([0x49, 0x44, 0x33, 0x04])), true)
  assert.equal(isMp3Buffer(Buffer.from([0xff, 0xfb, 0x90, 0x00])), true)
  assert.equal(isMp3Buffer(Buffer.from('<html>404</html>')), false)
})
