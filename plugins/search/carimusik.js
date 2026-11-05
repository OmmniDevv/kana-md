
import { bindReply, clearReply, getReplyBinding, registerReplyKind } from '../../src/ui/reply-router.js'
import { sendAudio } from '../../src/ui/media.js'
import { soundcloudSearch, soundcloudAudio } from '../../src/scrapers/download/soundcloud.js'

// Carimusik: cari lagu (SoundCloud, scraper tanpa kunci di
// src/scrapers/download/soundcloud.js), tampilkan daftar bernomor, lalu
// simpan daftar itu sebagai binding reply-router (kind carimusik).
// User membalas nomor ke pesan daftar, atau memakai .getmusik <nomor>,
// untuk menerima audio pilihan. Satu binding aktif per chat, pemiliknya
// pencari, kedaluwarsa 5 menit. getmusik.js memakai sesi yang sama.
export const config = {
  name: "carimusik",
  alias: ["searchmusik", "musiksearch"],
  category: "search",
  description: { id: "Cari lagu dan siapkan hasil untuk diunduh lewat reply nomor", en: "Search songs and prepare results to download via a numbered reply" },
  usage: ".carimusik <judul lagu>",
  example: ".carimusik night dancer",
  cooldown: 5,
}

export const i18n = {
  id: {
    "carimusik": {
      hint: "╭─❏ 🎵 「 *CARIMUSIK* 」\n┊ Tulis judul lagunya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.carimusik night dancer*\n╰━━━━━━━",
      list: "╭─❏ 🎵 「 *HASIL MUSIK: {q}* 」\n┊ {rows}\n┊\n┊ Balas (reply) pesan ini dengan nomornya, atau pakai *.getmusik <nomor>* yaa~\n╰━━━━━━━",
      row: "┊ {n}. *{title}*{artist}",
      notfound: "╭─❏ 🔍 「 *TIDAK KETEMU* 」\n┊ Mouu, lagu untuk *{q}* tidak ketemu~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *PENCARIAN GAGAL* 」\n┊ Mouu, pencariannya gagal: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━",
      badNumber: "╭─❏ 🎵 「 *NOMOR TIDAK VALID* 」\n┊ Pilih nomor 1 sampai {count} yaa~\n╰━━━━━━━",
      sending: "╭─❏ 🎵 「 *MENGIRIM AUDIO* 」\n┊ *{title}*\n┊ Sebentar yaa, audionya lagi disiapkan~\n╰━━━━━━━",
      audioFail: "╭─❏ 💦 「 *AUDIO GAGAL* 」\n┊ Mouu, audio *{title}* gagal diambil: *{message}*\n╰━━━━━━━",
    },
  },
  en: {
    "carimusik": {
      hint: "╭─❏ 🎵 「 *MUSIC SEARCH* 」\n┊ Write the song title first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.carimusik night dancer*\n╰━━━━━━━",
      list: "╭─❏ 🎵 「 *MUSIC RESULTS: {q}* 」\n┊ {rows}\n┊\n┊ Reply to this message with the number, or use *.getmusik <number>*~\n╰━━━━━━━",
      row: "┊ {n}. *{title}*{artist}",
      notfound: "╭─❏ 🔍 「 *NOT FOUND* 」\n┊ Mouu, no song for *{q}*~\n┊ Try another keyword~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *SEARCH FAILED* 」\n┊ Mouu, the search failed: *{message}*\n┊ Try again later~\n╰━━━━━━━",
      badNumber: "╭─❏ 🎵 「 *INVALID NUMBER* 」\n┊ Pick a number from 1 to {count}~\n╰━━━━━━━",
      sending: "╭─❏ 🎵 「 *SENDING AUDIO* 」\n┊ *{title}*\n┊ One moment, the audio is being prepared~\n╰━━━━━━━",
      audioFail: "╭─❏ 💦 「 *AUDIO FAILED* 」\n┊ Mouu, audio *{title}* failed to load: *{message}*\n╰━━━━━━━",
    },
  },
}

// Jahitan tes: fungsi jaringan bisa diganti stub di unit test.
export const carimusikDeps = { search: soundcloudSearch, audio: soundcloudAudio }

export const MUSIC_KIND = 'carimusik'

export function formatMusicList(t, q, songs) {
  const rows = songs.map((s, i) => t('carimusik.row', { n: i + 1, title: s.title, artist: s.artist ? `, ${s.artist}` : '' })).join('\n')
  return t('carimusik.list', { q, rows })
}

// Kirim audio untuk pilihan nomor (1-based) dari binding sesi musik.
// Dipakai penangan reply DAN perintah .getmusik. Return true bila pesan
// ter konsumsi (nomor valid maupun tidak, selama ada sesi).
export async function deliverMusicPick(ctx, binding, index) {
  const songs = binding?.data?.songs ?? []
  if (!songs.length) return false
  if (!Number.isInteger(index) || index < 1 || index > songs.length) {
    await ctx.reply(ctx.t('carimusik.badNumber', { count: songs.length }))
    return true
  }
  const song = songs[index - 1]
  await clearReply(ctx.storage, ctx.chat)
  await ctx.reply(ctx.t('carimusik.sending', { title: song.title }))
  try {
    const audio = await carimusikDeps.audio(song.url)
    await sendAudio(ctx, audio.buffer, { title: audio.title || song.title, performer: audio.author || song.artist || '' })
  } catch (err) {
    await ctx.reply(ctx.t('carimusik.audioFail', { title: song.title, message: err.message }))
  }
  return true
}

export async function getMusicBinding(ctx) {
  const binding = await getReplyBinding(ctx.storage, ctx.chat)
  return binding?.kind === MUSIC_KIND ? binding : null
}

export const test = { input: '.carimusik night dancer', expect: /carimusik|musik|music/i }
export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('carimusik.hint'))
  let songs
  try {
    songs = await carimusikDeps.search(q)
  } catch (err) {
    return ctx.reply(ctx.t('carimusik.fail', { message: err.message }))
  }
  if (!songs?.length) return ctx.reply(ctx.t('carimusik.notfound', { q }))
  const body = formatMusicList(ctx.t, q, songs)
  const sent = await ctx.sock.sendMessage(ctx.chat, { text: body }, { quoted: ctx.raw })
  const messageId = sent?.key?.id
  if (messageId) {
    await bindReply(ctx.storage, ctx.chat, {
      kind: MUSIC_KIND,
      messageId,
      ownerDigits: ctx.senderDigits,
      data: { query: q, songs },
    })
  }
  return sent
}

registerReplyKind(MUSIC_KIND, async (ctx, binding) => {
  const index = parseInt((ctx.text || '').trim(), 10)
  if (!Number.isInteger(index)) return false
  return deliverMusicPick(ctx, binding, index)
})
