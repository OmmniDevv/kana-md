// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama klon
// persen hashPercent. Sekarang umur mental dihitung dari kuis mini
// NYATA: 5 pertanyaan kebiasaan dengan skor per jawaban yang dijawab
// lewat reply ke pesan soal (routing reply bersama repo), lalu skor
// total dipetakan menjadi taksiran umur mental. Hasilnya hiburan dari
// jawabanmu sendiri, bukan persen acak dari nama.
import { addXp } from '../../src/services/user-service.js'
import { bindReply, clearReply, getReplyBinding, registerReplyKind, saveReplyData } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekumur',
  alias: ['umurmental'],
  category: 'cek',
  description: { id: 'Cek umur mental lewat kuis mini 5 pertanyaan, jawab dengan membalas pesan soal', en: 'Check your mental age with a 5 question mini quiz, answer by replying to the question message' },
  usage: '.cekumur lalu balas tiap soal dengan huruf a, b, c, atau d',
  example: '.cekumur',
  cooldown: 5,
}

// Skor 1 sampai 4 per opsi: makin tinggi skor, makin dewasa polanya.
export const QUESTIONS = [
  {
    q: { id: 'Cara favoritmu menghabiskan Minggu pagi?', en: 'Your favorite way to spend a Sunday morning?' },
    options: [
      { id: 'Tidur sampai siang', en: 'Sleep until noon', score: 1 },
      { id: 'Main HP sambil rebahan', en: 'Play on the phone in bed', score: 2 },
      { id: 'Olahraga atau jalan pagi', en: 'Exercise or a morning walk', score: 3 },
      { id: 'Bersih-bersih dan bereskan rumah', en: 'Clean and tidy the house', score: 4 },
    ],
  },
  {
    q: { id: 'Kalau tiba-tiba dapat uang 100 ribu, kamu apakan?', en: 'If you suddenly got 100k, what would you do?' },
    options: [
      { id: 'Langsung jajan dan top up game', en: 'Snacks and game top up right away', score: 1 },
      { id: 'Traktir teman nongkrong', en: 'Treat friends to hang out', score: 2 },
      { id: 'Sebagian ditabung, sebagian dipakai', en: 'Save part of it, spend the rest', score: 3 },
      { id: 'Semua ditabung atau diinvestasikan', en: 'Save or invest all of it', score: 4 },
    ],
  },
  {
    q: { id: 'Ada drama seru di grup chat. Reaksimu?', en: 'There is juicy drama in the group chat. Your reaction?' },
    options: [
      { id: 'Ikut nimbrung paling depan', en: 'Jump right into it', score: 1 },
      { id: 'Baca semua sambil ngakak', en: 'Read it all while laughing', score: 2 },
      { id: 'Baca sekilas saja', en: 'Just skim it', score: 3 },
      { id: 'Mute grupnya sekalian', en: 'Mute the whole group', score: 4 },
    ],
  },
  {
    q: { id: 'Musik yang paling sering kamu dengar?', en: 'Music you listen to the most?' },
    options: [
      { id: 'Lagu yang lagi viral', en: 'Whatever is viral right now', score: 1 },
      { id: 'Pop rilisan terbaru', en: 'Latest pop releases', score: 2 },
      { id: 'Lagu era 2000-an', en: 'Songs from the 2000s', score: 3 },
      { id: 'Lagu lawas dan klasik', en: 'Oldies and classics', score: 4 },
    ],
  },
  {
    q: { id: 'Rencana masa depanmu sekarang?', en: 'Your future plans right now?' },
    options: [
      { id: 'Belum kepikiran, jalanin aja dulu', en: 'Not thinking about it yet', score: 1 },
      { id: 'Ada gambaran kasar', en: 'A rough picture', score: 2 },
      { id: 'Sudah ada target yang jelas', en: 'Clear targets already', score: 3 },
      { id: 'Sudah berjalan sesuai rencana bertahun-tahun', en: 'On a multi year plan already', score: 4 },
    ],
  },
]

// Skor total 5..20 dipetakan linear ke umur mental 8..50 tahun.
export function mentalAge(total) {
  return Math.round(8 + (total - 5) * (42 / 15))
}

export function ageBand(age) {
  if (age <= 15) return 'kid'
  if (age <= 22) return 'teen'
  if (age <= 32) return 'adult'
  return 'wise'
}

export const i18n = {
  id: {
    cekumur: {
      title: 'Cek Umur Mental',
      intro: '╭─❏ 🧠 「 *CEK UMUR MENTAL* 」\n┊ KANA tanya *5 pertanyaan* singkat soal kebiasaanmu.\n┊ Balas (reply) tiap pesan soal dengan huruf *a*, *b*, *c*, atau *d* yaa~\n╰━━━━━━━',
      question: '╭─❏ 🧠 「 *PERTANYAAN {n} DARI {total}* 」\n┊ {question}\n┊ \n┊ {options}\n┊ Balas pesan ini dengan huruf jawabannya yaa~\n╰━━━━━━━',
      result: '╭─❏ 🧠 「 *HASIL UMUR MENTAL* 」\n┊ ꜱᴋᴏʀ ᴋᴜɪꜱᴍᴜ: *{total}* dari 20\n┊ ᴜᴍᴜʀ ᴍᴇɴᴛᴀʟᴍᴜ: *{age} tahun*\n┊ {comment}\n┊ \n┊ Ini taksiran hiburan dari jawaban kuismu sendiri, bukan tes psikologi beneran yaa~\n╰━━━━━━━ {mood}',
      kid: 'Jiwamu masih anak-anak banget: spontan, penasaran, dan maunya main terus~',
      teen: 'Energi remaja: berani coba hal baru, kadang masih meledak-ledak~',
      adult: 'Pola pikir dewasa muda: sudah bisa menimbang, tetap fleksibel~',
      wise: 'Jiwamu tua dan bijak: tenang, terencana, mikirnya jauh ke depan~',
      busy: '╭─❏ 🧠 「 *CEK UMUR MENTAL* 」\n┊ Masih ada permainan atau kuis lain yang jalan di chat ini. Selesaikan dulu yaa~\n╰━━━━━━━',
      stopped: '╭─❏ 🧠 「 *CEK UMUR BERHENTI* 」\n┊ Kuisnya dihentikan. Mulai lagi kapan aja pakai *.cekumur* yaa~\n╰━━━━━━━',
    },
  },
  en: {
    cekumur: {
      title: 'Mental Age Check',
      intro: '╭─❏ 🧠 「 *MENTAL AGE CHECK* 」\n┊ KANA will ask *5 short questions* about your habits.\n┊ Reply to each question message with the letter *a*, *b*, *c*, or *d*~\n╰━━━━━━━',
      question: '╭─❏ 🧠 「 *QUESTION {n} OF {total}* 」\n┊ {question}\n┊ \n┊ {options}\n┊ Reply to this message with the answer letter~\n╰━━━━━━━',
      result: '╭─❏ 🧠 「 *MENTAL AGE RESULT* 」\n┊ ʏᴏᴜʀ ꜱᴄᴏʀᴇ: *{total}* of 20\n┊ ʏᴏᴜʀ ᴍᴇɴᴛᴀʟ ᴀɢᴇ: *{age} years old*\n┊ {comment}\n┊ \n┊ This is a playful estimate from your own quiz answers, not a real psychological test~\n╰━━━━━━━ {mood}',
      kid: 'Your soul is still a kid: spontaneous, curious, always up for play~',
      teen: 'Teen energy: brave to try new things, still a bit explosive~',
      adult: 'Young adult mindset: you weigh things well and stay flexible~',
      wise: 'An old wise soul: calm, planned, thinking far ahead~',
      busy: '╭─❏ 🧠 「 *MENTAL AGE CHECK* 」\n┊ Another game or quiz is still running in this chat. Finish it first~\n╰━━━━━━━',
      stopped: '╭─❏ 🧠 「 *MENTAL AGE STOPPED* 」\n┊ The quiz was stopped. Start again anytime with *.cekumur*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.cekumur', expect: /pertanyaan 1|question 1/i }

const LETTERS = ['a', 'b', 'c', 'd']

async function sendQuestion(ctx, binding, data) {
  const lang = ctx.lang ?? 'id'
  const item = QUESTIONS[data.step]
  const optionsText = item.options.map((o, i) => `${LETTERS[i]}. ${o[lang] ?? o.id}`).join('\n┊ ')
  const body = ctx.t('cekumur.question', {
    n: data.step + 1, total: QUESTIONS.length,
    question: item.q[lang] ?? item.q.id, options: optionsText,
  })
  const sent = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekumur.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: item.options.map((o, i) => ({ text: `${LETTERS[i].toUpperCase()}. ${(o[lang] ?? o.id).slice(0, 24)}`, id: `.cekumur ${LETTERS[i]}` })),
    textFallback: body,
  })
  const messageId = sent?.key?.id ?? binding?.messageId
  if (binding) {
    await saveReplyData(ctx.storage, ctx.chat, { ...binding, messageId, data, expiresAt: Date.now() + 300000 })
  } else {
    await bindReply(ctx.storage, ctx.chat, { kind: 'cekumur', messageId, ownerDigits: ctx.senderDigits, ttlMs: 300000, data })
  }
  return sent
}

async function processAnswer(ctx, binding, rawText) {
  const letter = String(rawText ?? '').trim().toLowerCase()
  const idx = LETTERS.indexOf(letter)
  if (idx < 0) return true
  const data = binding.data
  data.total += QUESTIONS[data.step].options[idx].score
  data.step += 1
  if (data.step >= QUESTIONS.length) {
    await clearReply(ctx.storage, ctx.chat)
    const age = mentalAge(data.total)
    await addXp(ctx.storage, ctx.senderDigits, 5).catch(() => {})
    await ctx.reply(ctx.t('cekumur.result', {
      total: data.total, age, comment: ctx.t('cekumur.' + ageBand(age)), mood: ctx.say('senang'),
    }))
    return true
  }
  await sendQuestion(ctx, binding, data)
  return true
}

registerReplyKind('cekumur', async (ctx, binding) => processAnswer(ctx, binding, ctx.text))

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const binding = await getReplyBinding(ctx.storage, ctx.chat)
  if (binding?.kind === 'cekumur') {
    if (binding.ownerDigits && binding.ownerDigits !== ctx.senderDigits) return ctx.reply(ctx.t('cekumur.busy'))
    if (arg === 'stop') {
      await clearReply(ctx.storage, ctx.chat)
      return ctx.reply(ctx.t('cekumur.stopped'))
    }
    if (LETTERS.includes(arg)) {
      await processAnswer(ctx, binding, arg)
      return undefined
    }
    return ctx.reply(ctx.t('cekumur.busy'))
  }
  if (binding) return ctx.reply(ctx.t('cekumur.busy'))
  await ctx.reply(ctx.t('cekumur.intro'))
  return sendQuestion(ctx, null, { step: 0, total: 0 })
}
