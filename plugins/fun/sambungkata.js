import { addXp } from '../../src/services/user-service.js'
import { bindReply, clearReply, getReplyBinding, registerReplyKind, saveReplyData } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'sambungkata',
  alias: ['sambung'],
  category: 'fun',
  description: { id: 'Sambung kata: balas dengan kata yang berawalan huruf terakhir kata sebelumnya', en: 'Word chain: reply with a word starting with the last letter of the previous word' },
  usage: '.sambungkata lalu balas papan permainan dengan kata sambunganmu',
  example: '.sambungkata',
  cooldown: 3,
}

// Kamus rantai: kata Indonesia umum untuk validasi dan stok kata bot.
export const CHAIN_WORDS = [
  'apel', 'ayam', 'air', 'anak', 'angin', 'awan', 'anjing', 'emas', 'elang', 'ember',
  'buku', 'bola', 'bunga', 'bulan', 'bintang', 'batu', 'beras', 'besok', 'bisnis', 'burung',
  'cinta', 'cuaca', 'cermin', 'cerita', 'cabai', 'cicak', 'cokelat', 'cangkir',
  'danau', 'daun', 'dinding', 'durian', 'dasi', 'dahulu', 'dokter', 'dompet',
  'foto', 'film', 'favorit', 'fajar',
  'guru', 'gunung', 'gula', 'gajah', 'gitar', 'gelas', 'garam', 'gambar',
  'hari', 'hujan', 'hidup', 'harimau', 'hati', 'hobi', 'hotel', 'hutan',
  'ikan', 'indah', 'ibu', 'ilmu', 'internet', 'istana', 'itik',
  'jalan', 'jendela', 'jam', 'jari', 'jembatan', 'jeruk', 'jaket', 'jaring',
  'kucing', 'kuda', 'kertas', 'kopi', 'kamar', 'kursi', 'kunci', 'kabar', 'kalender', 'kampus',
  'laut', 'langit', 'lampu', 'lari', 'lemari', 'libur', 'lukisan', 'lilin',
  'meja', 'mata', 'makan', 'minum', 'mobil', 'motor', 'malam', 'musik', 'mangga', 'melati',
  'nasi', 'nenek', 'nanas', 'nama', 'novel', 'nilai', 'nuri',
  'obat', 'otak', 'olahraga', 'ombak', 'oranye', 'ojek',
  'pagi', 'pasar', 'pintu', 'pohon', 'pantai', 'pulang', 'pensil', 'pergi', 'pisang', 'pelangi',
  'radio', 'rumah', 'roti', 'raja', 'rambut', 'rendang', 'raket', 'rel',
  'sapi', 'susu', 'sepeda', 'sekolah', 'sungai', 'senja', 'surat', 'sabun', 'sendok', 'sikat',
  'taman', 'tari', 'telepon', 'toko', 'tangan', 'tidur', 'tikus', 'tas', 'teh', 'tomat',
  'udara', 'ular', 'uang', 'ujian', 'umur', 'usaha', 'utama',
  'vitamin', 'vokal', 'voli',
  'warna', 'waktu', 'warteg', 'wisata', 'wortel',
  'yakin', 'yoga', 'yatim',
  'zebra', 'zaitun', 'zaman',
  'kangkung', 'semangka', 'terong', 'gorengan', 'rendang', 'sambal', 'kerang', 'melon',
  'anggur', 'rambutan', 'salak', 'kedondong', 'gedung', 'gudang', 'guling', 'gunting',
]

const WORD_SET = new Set(CHAIN_WORDS)

export const i18n = {
  id: {
    sambungkata: {
      title: 'Sambung Kata',
      board: '╭─❏ 🔤 「 *SAMBUNG KATA* 」\n┊ ᴋᴀᴛᴀ ᴛᴇʀᴀᴋʜɪʀ: *{last}*\n┊ ʜᴜʀᴜꜰ ᴀᴡᴀʟ ʙᴇʀɪᴋᴜᴛɴʏᴀ: *{letter}*\n┊ ꜱᴋᴏʀ ᴋᴀᴍᴜ: *{score}*\n┊ Balas (reply) papan ini dengan kata berawalan huruf *{letter}* yaa~\n╰━━━━━━━',
      startFail: '╭─❏ 🔤 「 *SAMBUNG KATA* 」\n┊ Ada permainan lain yang lagi jalan di chat ini. Selesaikan dulu yaa~\n╰━━━━━━━ {mood}',
      noGame: '╭─❏ 🔤 「 *SAMBUNG KATA* 」\n┊ Belum ada sambung kata yang jalan. Mulai dengan .sambungkata yaa~\n╰━━━━━━━ {mood}',
      stopped: '╭─❏ 🔤 「 *SAMBUNG KATA* 」\n┊ Permainan dihentikan. Skor akhir kamu {score}. Kata terakhir tadi: {last}.\n╰━━━━━━━',
      botWord: 'KANA menyambung: *{word}*',
      wrongStart: '╭─❏ 🔤 「 *SAMBUNG KATA* 」\n┊ Kata "{word}" tidak berawalan huruf {letter}. Permainan selesai, skor akhir {score} dan kamu dapat {xp} XP~\n╰━━━━━━━',
      unknown: '╭─❏ 🔤 「 *SAMBUNG KATA* 」\n┊ Kata "{word}" belum ada di kamus KANA. Permainan selesai, skor akhir {score} dan kamu dapat {xp} XP~\n╰━━━━━━━',
      repeated: '╭─❏ 🔤 「 *SAMBUNG KATA* 」\n┊ Kata "{word}" sudah dipakai. Permainan selesai, skor akhir {score} dan kamu dapat {xp} XP~\n╰━━━━━━━',
      winBot: '╭─❏ 🏆 「 *SAMBUNG KATA* 」\n┊ KANA kehabisan kata berawalan {letter}! Kamu menang rantai ini, skor {score} dan bonus XP {xp}~\n╰━━━━━━━ {mood}',
      stopBtn: '🏳️ Berhenti (.sambungkata stop)',
    },
  },
  en: {
    sambungkata: {
      title: 'Word Chain',
      board: '╭─❏ 🔤 「 *WORD CHAIN* 」\n┊ ʟᴀꜱᴛ ᴡᴏʀᴅ: *{last}*\n┊ ɴᴇxᴛ ꜱᴛᴀʀᴛɪɴɢ ʟᴇᴛᴛᴇʀ: *{letter}*\n┊ ʏᴏᴜʀ ꜱᴄᴏʀᴇ: *{score}*\n┊ Reply to this board with a word starting with *{letter}*~\n╰━━━━━━━',
      startFail: '╭─❏ 🔤 「 *WORD CHAIN* 」\n┊ Another game is running in this chat. Finish it first~\n╰━━━━━━━ {mood}',
      noGame: '╭─❏ 🔤 「 *WORD CHAIN* 」\n┊ No word chain is running. Start with .sambungkata~\n╰━━━━━━━ {mood}',
      stopped: '╭─❏ 🔤 「 *WORD CHAIN* 」\n┊ Game stopped. Your final score {score}. Last word was: {last}.\n╰━━━━━━━',
      botWord: 'KANA chains: *{word}*',
      wrongStart: '╭─❏ 🔤 「 *WORD CHAIN* 」\n┊ The word "{word}" does not start with letter {letter}. Game over, final score {score} and you earned {xp} XP~\n╰━━━━━━━',
      unknown: '╭─❏ 🔤 「 *WORD CHAIN* 」\n┊ The word "{word}" is not in KANA dictionary yet. Game over, final score {score} and you earned {xp} XP~\n╰━━━━━━━',
      repeated: '╭─❏ 🔤 「 *WORD CHAIN* 」\n┊ The word "{word}" was already used. Game over, final score {score} and you earned {xp} XP~\n╰━━━━━━━',
      winBot: '╭─❏ 🏆 「 *WORD CHAIN* 」\n┊ KANA ran out of words starting with {letter}! You win this chain, score {score} and bonus XP {xp}~\n╰━━━━━━━ {mood}',
      stopBtn: '🏳️ Stop (.sambungkata stop)',
    },
  },
}

export const test = { input: '.sambungkata', expect: /sambung kata|word chain/i }

async function sendBoard(ctx, data, note = '') {
  const letter = data.last.slice(-1).toUpperCase()
  const body = `${note ? `${note}\n\n` : ''}${ctx.t('sambungkata.board', { last: data.last, letter, score: data.score })}`
  const sent = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('sambungkata.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('sambungkata.stopBtn'), id: '.sambungkata stop' }],
    textFallback: body,
  })
  return sent?.key?.id
}

async function endWithScore(ctx, key, vars) {
  const xp = Math.max(0, vars.score * 2)
  await clearReply(ctx.storage, ctx.chat)
  if (xp > 0) await addXp(ctx.storage, ctx.senderDigits, xp)
  return ctx.reply(ctx.t(key, { ...vars, xp, mood: ctx.say('senang') }))
}

registerReplyKind('sambungkata', async (ctx, binding) => {
  const data = binding.data
  const word = (ctx.text || '').trim().toLowerCase()
  const need = data.last.slice(-1)
  if (!word.startsWith(need)) {
    await endWithScore(ctx, 'sambungkata.wrongStart', { word, letter: need.toUpperCase(), score: data.score })
    return true
  }
  if (data.used.includes(word)) {
    await endWithScore(ctx, 'sambungkata.repeated', { word, score: data.score })
    return true
  }
  if (!WORD_SET.has(word)) {
    await endWithScore(ctx, 'sambungkata.unknown', { word, score: data.score })
    return true
  }
  data.used.push(word)
  data.score += 1
  data.last = word
  const botNeed = word.slice(-1)
  const candidates = CHAIN_WORDS.filter((w) => w.startsWith(botNeed) && !data.used.includes(w))
  if (!candidates.length) {
    await endWithScore(ctx, 'sambungkata.winBot', { letter: botNeed.toUpperCase(), score: data.score })
    return true
  }
  const botWord = candidates[Math.floor(Math.random() * candidates.length)]
  data.used.push(botWord)
  data.last = botWord
  const note = ctx.t('sambungkata.botWord', { word: botWord })
  const id = await sendBoard(ctx, data, note)
  await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId: id ?? binding.messageId, data, expiresAt: Date.now() + 600000 })
  return true
})

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const existing = await getReplyBinding(ctx.storage, ctx.chat)
  if (arg === 'stop') {
    if (existing?.kind === 'sambungkata') {
      await clearReply(ctx.storage, ctx.chat)
      return ctx.reply(ctx.t('sambungkata.stopped', { score: existing.data.score, last: existing.data.last }))
    }
    return ctx.reply(ctx.t('sambungkata.noGame', { mood: ctx.say('malu') }))
  }
  if (existing?.kind === 'sambungkata' && existing.ownerDigits === ctx.senderDigits) {
    const id = await sendBoard(ctx, existing.data)
    if (id) await saveReplyData(ctx.storage, ctx.chat, { ...existing, messageId: id, expiresAt: Date.now() + 600000 })
    return
  }
  if (existing) return ctx.reply(ctx.t('sambungkata.startFail', { mood: ctx.say('malu') }))
  const start = CHAIN_WORDS[Math.floor(Math.random() * CHAIN_WORDS.length)]
  const data = { last: start, used: [start], score: 0 }
  const id = await sendBoard(ctx, data)
  await bindReply(ctx.storage, ctx.chat, { kind: 'sambungkata', messageId: id, ownerDigits: ctx.senderDigits, ttlMs: 600000, data })
}
