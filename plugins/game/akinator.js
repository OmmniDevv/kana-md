// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka generik. API Akinator asli tidak terbukti bisa dijalankan dari VM
// (en.akinator.com hanya balas redirect, alur sesinya tidak terbuka), jadi
// ini tebak karakter LOKAL: dataset karakter nyata dengan sifat ya/tidak,
// KANA menyaring kandidat dari jawabanmu lewat reply sampai bisa menebak.
// Jujur di deskripsi: bukan terhubung ke Akinator.
import { addXp } from '../../src/services/user-service.js'
import { bindReply, clearReply, getReplyBinding, registerReplyKind, saveReplyData } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'akinator',
  alias: ['tebakkarakter'],
  category: 'game',
  description: { id: 'Tebak karakter ala Akinator dari dataset lokal KANA: pikirkan satu karakter, jawab ya/tidak lewat reply, KANA menebak di akhir', en: 'Akinator style character guessing from KANA local dataset: think of a character, answer yes/no by reply, KANA guesses at the end' },
  usage: '.akinator lalu balas tiap pertanyaan dengan ya, tidak, atau tidak tahu',
  example: '.akinator',
  cooldown: 5,
}

export const TRAITS = [
  { key: 'manusia', q: { id: 'Apakah karaktermu manusia?', en: 'Is your character human?' } },
  { key: 'anime', q: { id: 'Apakah karaktermu berasal dari anime atau manga Jepang?', en: 'Is your character from a Japanese anime or manga?' } },
  { key: 'terbang', q: { id: 'Apakah karaktermu bisa terbang?', en: 'Can your character fly?' } },
  { key: 'topi', q: { id: 'Apakah karaktermu memakai topi atau penutup kepala khas?', en: 'Does your character wear a signature hat or headgear?' } },
  { key: 'hewan', q: { id: 'Apakah karaktermu hewan atau makhluk non manusia?', en: 'Is your character an animal or a non human creature?' } },
  { key: 'super', q: { id: 'Apakah karaktermu punya kekuatan super, jurus khusus, atau sihir?', en: 'Does your character have super powers, special moves, or magic?' } },
  { key: 'perempuan', q: { id: 'Apakah karaktermu perempuan?', en: 'Is your character female?' } },
  { key: 'utama', q: { id: 'Apakah karaktermu tokoh utama di serinya?', en: 'Is your character the main character of the series?' } },
  { key: 'laut', q: { id: 'Apakah karaktermu tinggal di laut atau di air?', en: 'Does your character live in the sea or water?' } },
  { key: 'kuning', q: { id: 'Apakah warna khas karaktermu kuning?', en: 'Is your character signature color yellow?' } },
  { key: 'kacamata', q: { id: 'Apakah karaktermu memakai kacamata?', en: 'Does your character wear glasses?' } },
  { key: 'anak', q: { id: 'Apakah karaktermu digambarkan sebagai anak-anak?', en: 'Is your character depicted as a child?' } },
  { key: 'berubah', q: { id: 'Apakah karaktermu bisa berubah wujud atau bertransformasi?', en: 'Can your character transform?' } },
  { key: 'game', q: { id: 'Apakah karaktermu berasal dari video game?', en: 'Does your character come from a video game?' } },
  { key: 'ekor', q: { id: 'Apakah karaktermu punya ekor?', en: 'Does your character have a tail?' } },
  { key: 'detektif', q: { id: 'Apakah karaktermu detektif atau suka memecahkan kasus?', en: 'Is your character a detective or case solver?' } },
]

// Sifat yang TIDAK disebut berarti false.
export const CHARACTERS = [
  { name: 'Naruto Uzumaki', traits: ['manusia', 'anime', 'super', 'utama', 'berubah'] },
  { name: 'Monkey D. Luffy', traits: ['manusia', 'anime', 'super', 'utama', 'berubah', 'topi'] },
  { name: 'Son Goku', traits: ['anime', 'terbang', 'super', 'utama', 'berubah', 'ekor'] },
  { name: 'Pikachu', traits: ['anime', 'hewan', 'super', 'utama', 'kuning', 'game', 'ekor'] },
  { name: 'Doraemon', traits: ['anime', 'hewan', 'super', 'utama'] },
  { name: 'SpongeBob SquarePants', traits: ['hewan', 'utama', 'laut', 'kuning'] },
  { name: 'Mario', traits: ['manusia', 'utama', 'topi', 'game'] },
  { name: 'Sonic the Hedgehog', traits: ['hewan', 'super', 'utama', 'game', 'ekor'] },
  { name: 'Elsa', traits: ['manusia', 'super', 'perempuan', 'utama'] },
  { name: 'Tony Stark (Iron Man)', traits: ['manusia', 'terbang', 'super', 'utama'] },
  { name: 'Bruce Wayne (Batman)', traits: ['manusia', 'utama', 'topi'] },
  { name: 'Hello Kitty', traits: ['anime', 'hewan', 'perempuan', 'utama'] },
  { name: 'Conan Edogawa', traits: ['manusia', 'anime', 'utama', 'kacamata', 'anak', 'detektif'] },
  { name: 'Nobita Nobi', traits: ['manusia', 'anime', 'utama', 'kacamata', 'anak'] },
  { name: 'Totoro', traits: ['anime', 'hewan', 'super', 'utama', 'ekor'] },
  { name: 'Upin', traits: ['manusia', 'utama', 'anak'] },
  { name: 'Shinchan', traits: ['manusia', 'anime', 'utama', 'anak'] },
  { name: 'Patrick Star', traits: ['hewan', 'laut'] },
  { name: 'Usagi Tsukino (Sailor Moon)', traits: ['manusia', 'anime', 'super', 'perempuan', 'utama', 'berubah'] },
  { name: 'Ash Ketchum', traits: ['manusia', 'anime', 'utama', 'topi', 'anak'] },
]

const TRAIT_SET = new Map(CHARACTERS.map((c) => [c.name, new Set(c.traits)]))

export function filterCandidates(names, answers) {
  return names.filter((name) => {
    const set = TRAIT_SET.get(name)
    if (!set) return false
    for (const [key, val] of Object.entries(answers)) {
      if (val === null || val === undefined) continue
      if (set.has(key) !== val) return false
    }
    return true
  })
}

// Pilih sifat belum ditanya yang paling membelah kandidat (skor = sisi
// terkecil). Null bila tidak ada sifat yang informatif lagi.
export function pickQuestion(names, askedKeys) {
  let best = null
  let bestScore = 0
  for (const trait of TRAITS) {
    if (askedKeys.includes(trait.key)) continue
    const yes = names.filter((n) => TRAIT_SET.get(n)?.has(trait.key)).length
    const score = Math.min(yes, names.length - yes)
    if (score > bestScore) { bestScore = score; best = trait.key }
  }
  return best
}

export const i18n = {
  id: {
    akinator: {
      title: 'Tebak Karakter KANA',
      intro: '╭─❏ 🔮 「 *TEBAK KARAKTER* 」\n┊ Pikirkan SATU karakter dari daftar tokoh populer (anime, kartun, game, film), jangan sebut namanya yaa~\n┊ KANA tanya sampai {max} pertanyaan, kamu jawab dengan membalas pesan pertanyaannya: *ya*, *tidak*, atau *tidak tahu*\n╰━━━━━━━',
      question: '╭─❏ 🔮 「 *PERTANYAAN {n}* 」\n┊ {question}\n┊ ᴋᴀɴᴅɪᴅᴀᴛ ᴛᴇʀꜱɪꜱᴀ: *{left}*\n┊ Balas pesan ini dengan *ya*, *tidak*, atau *tidak tahu*\n╰━━━━━━━',
      guess: '╭─❏ 🔮 「 *TEBAKAN KANA* 」\n┊ Karakter yang kamu pikirkan adalah...\n┊ ✨ *{name}* ✨\n┊ Balas pesan ini dengan *benar* kalau tebakan KANA tepat, atau *salah* kalau meleset yaa~\n╰━━━━━━━',
      win: '╭─❏ 🎉 「 *KETEMU* 」\n┊ Yatta, memang *{name}* kan! Kamu dapat *{xp} XP*~\n┊ Main lagi? Ketik *.akinator* yaa\n╰━━━━━━━ {mood}',
      lose: '╭─❏ 🔮 「 *KANA MENYERAH* 」\n┊ Mouu, karaktermu di luar dataset lokal KANA yang isinya {total} tokoh nih~\n┊ Coba lagi dengan tokoh lain yaa, daftar tokohnya tokoh populer anime, kartun, game, dan film\n╰━━━━━━━',
      busy: '╭─❏ 🔮 「 *TEBAK KARAKTER* 」\n┊ Masih ada permainan lain yang jalan di chat ini. Selesaikan dulu yaa~\n╰━━━━━━━',
      stopped: '╭─❏ 🔮 「 *TEBAK KARAKTER BERHENTI* 」\n┊ Permainan dihentikan. Main lagi kapan aja pakai *.akinator* yaa~\n╰━━━━━━━',
      btnYes: '✅ Ya',
      btnNo: '❌ Tidak',
      btnUnknown: '🤷 Tidak Tahu',
      btnRight: '✨ Benar',
      btnWrong: '🙈 Salah',
    },
  },
  en: {
    akinator: {
      title: 'KANA Character Guess',
      intro: '╭─❏ 🔮 「 *CHARACTER GUESS* 」\n┊ Think of ONE character from popular titles (anime, cartoons, games, movies), do not say the name~\n┊ KANA asks up to {max} questions, answer by replying to the question message: *yes*, *no*, or *do not know*\n╰━━━━━━━',
      question: '╭─❏ 🔮 「 *QUESTION {n}* 」\n┊ {question}\n┊ ᴄᴀɴᴅɪᴅᴀᴛᴇꜱ ʟᴇꜰᴛ: *{left}*\n┊ Reply to this message with *yes*, *no*, or *do not know*\n╰━━━━━━━',
      guess: '╭─❏ 🔮 「 *KANA GUESSES* 」\n┊ The character you are thinking of is...\n┊ ✨ *{name}* ✨\n┊ Reply to this message with *benar* if the guess is right, or *salah* if it missed~\n╰━━━━━━━',
      win: '╭─❏ 🎉 「 *FOUND IT* 」\n┊ Yatta, it is *{name}*! You earned *{xp} XP*~\n┊ Play again with *.akinator*\n╰━━━━━━━ {mood}',
      lose: '╭─❏ 🔮 「 *KANA GIVES UP* 」\n┊ Mouu, your character is outside KANA local dataset of {total} characters~\n┊ Try again with another popular anime, cartoon, game, or movie character\n╰━━━━━━━',
      busy: '╭─❏ 🔮 「 *CHARACTER GUESS* 」\n┊ Another game is still running in this chat. Finish it first~\n╰━━━━━━━',
      stopped: '╭─❏ 🔮 「 *CHARACTER GUESS STOPPED* 」\n┊ The game was stopped. Play again anytime with *.akinator*~\n╰━━━━━━━',
      btnYes: '✅ Yes',
      btnNo: '❌ No',
      btnUnknown: '🤷 Do Not Know',
      btnRight: '✨ Correct',
      btnWrong: '🙈 Wrong',
    },
  },
}

export const test = { input: '.akinator', expect: /pertanyaan 1|question 1/i }

const MAX_QUESTIONS = 20
const XP_WIN = 25

function parseAnswer(text) {
  const s = String(text ?? '').trim().toLowerCase()
  if (['tidak tahu', 'gatau', 'gak tahu', 'nggak tahu', 'do not know', 'dont know', "don't know"].includes(s)) return 'unknown'
  if (['ya', 'iya', 'yes', 'y', 'betul'].includes(s)) return 'yes'
  if (['tidak', 'nggak', 'enggak', 'gak', 'no', 'n'].includes(s)) return 'no'
  return null
}

function parseGuessVerdict(text) {
  const s = String(text ?? '').trim().toLowerCase()
  if (['benar', 'betul', 'tepat', 'correct', 'right'].includes(s)) return 'right'
  if (['salah', 'meleset', 'wrong'].includes(s)) return 'wrong'
  return null
}

async function sendStep(ctx, binding, data) {
  const lang = ctx.lang ?? 'id'
  let body
  let replies
  if (data.phase === 'guess') {
    body = ctx.t('akinator.guess', { name: data.guess })
    replies = [
      { text: ctx.t('akinator.btnRight'), id: '.akinator benar' },
      { text: ctx.t('akinator.btnWrong'), id: '.akinator salah' },
    ]
  } else {
    const trait = TRAITS.find((t) => t.key === data.current)
    body = ctx.t('akinator.question', {
      n: data.askedCount + 1,
      question: trait ? (trait.q[lang] ?? trait.q.id) : '-',
      left: data.candidates.length,
    })
    replies = [
      { text: ctx.t('akinator.btnYes'), id: '.akinator ya' },
      { text: ctx.t('akinator.btnNo'), id: '.akinator tidak' },
      { text: ctx.t('akinator.btnUnknown'), id: '.akinator tidak tahu' },
    ]
  }
  const sent = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('akinator.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
  const messageId = sent?.key?.id ?? binding?.messageId
  if (binding) {
    await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId, data, expiresAt: Date.now() + 600000 })
  } else {
    await bindReply(ctx.storage, ctx.chat, { kind: 'akinator', messageId, ownerDigits: ctx.senderDigits, ttlMs: 600000, data })
  }
  return sent
}

function advance(ctx, binding, data) {
  // Putuskan langkah berikut dari state: tebak bila kandidat tunggal atau
  // pertanyaan habis, selain itu tanya sifat paling membelah.
  if (data.candidates.length === 1) {
    data.phase = 'guess'
    data.guess = data.candidates[0]
    return sendStep(ctx, binding, data)
  }
  const askedKeys = Object.keys(data.answers)
  const next = data.candidates.length > 1 && data.askedCount < MAX_QUESTIONS ? pickQuestion(data.candidates, askedKeys) : null
  if (!next || !data.candidates.length) {
    if (data.candidates.length > 0) {
      data.phase = 'guess'
      data.guess = data.candidates[0]
      return sendStep(ctx, binding, data)
    }
    return null // tidak ada kandidat: ditangani pemanggil sebagai kalah
  }
  data.phase = 'ask'
  data.current = next
  return sendStep(ctx, binding, data)
}

async function processAnswer(ctx, binding, rawText) {
  const data = binding.data
  if (data.phase === 'guess') {
    const verdict = parseGuessVerdict(rawText)
    if (!verdict) return true
    if (verdict === 'right') {
      await clearReply(ctx.storage, ctx.chat)
      await addXp(ctx.storage, ctx.senderDigits, XP_WIN).catch(() => {})
      await ctx.reply(ctx.t('akinator.win', { name: data.guess, xp: XP_WIN, mood: ctx.say('senang') }))
      return true
    }
    data.candidates = data.candidates.filter((n) => n !== data.guess)
    data.wrong = [...(data.wrong ?? []), data.guess]
    if (!data.candidates.length) {
      await clearReply(ctx.storage, ctx.chat)
      await ctx.reply(ctx.t('akinator.lose', { total: CHARACTERS.length }))
      return true
    }
    const stepped = await advance(ctx, binding, data)
    if (!stepped) {
      await clearReply(ctx.storage, ctx.chat)
      await ctx.reply(ctx.t('akinator.lose', { total: CHARACTERS.length }))
    }
    return true
  }
  const answer = parseAnswer(rawText)
  if (!answer) return true
  data.answers[data.current] = answer === 'unknown' ? null : answer === 'yes'
  data.askedCount += 1
  data.candidates = filterCandidates(data.candidates, data.answers)
  if (!data.candidates.length) {
    await clearReply(ctx.storage, ctx.chat)
    await ctx.reply(ctx.t('akinator.lose', { total: CHARACTERS.length }))
    return true
  }
  const stepped = await advance(ctx, binding, data)
  if (!stepped) {
    await clearReply(ctx.storage, ctx.chat)
    await ctx.reply(ctx.t('akinator.lose', { total: CHARACTERS.length }))
  }
  return true
}

registerReplyKind('akinator', async (ctx, binding) => processAnswer(ctx, binding, ctx.text))

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const binding = await getReplyBinding(ctx.storage, ctx.chat)
  if (binding?.kind === 'akinator') {
    if (binding.ownerDigits && binding.ownerDigits !== ctx.senderDigits) {
      return ctx.reply(ctx.t('akinator.busy'))
    }
    if (arg === 'stop') {
      await clearReply(ctx.storage, ctx.chat)
      return ctx.reply(ctx.t('akinator.stopped'))
    }
    if (parseAnswer(arg) || parseGuessVerdict(arg)) {
      await processAnswer(ctx, binding, arg)
      return undefined
    }
    return ctx.reply(ctx.t('akinator.busy'))
  }
  if (binding) return ctx.reply(ctx.t('akinator.busy'))
  const all = CHARACTERS.map((c) => c.name)
  const data = { candidates: all, answers: {}, askedCount: 0, phase: 'ask', current: pickQuestion(all, []), guess: null, wrong: [] }
  await ctx.reply(ctx.t('akinator.intro', { max: MAX_QUESTIONS }))
  return sendStep(ctx, null, data)
}
