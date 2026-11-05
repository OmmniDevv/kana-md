// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka taruhan generik. Sekarang .hint membaca sesi kuis/tebak aktif
// milik chat ini dari mesin kuis yang sama (src/quiz/engine.js) dan
// memberi petunjuk nyata dari data sesinya. Tanpa sesi aktif, dijawab
// jujur tidak ada sesi. Satu petunjuk per sesi.
import { getSession, maskWord, MC_TYPES } from '../../src/quiz/engine.js'

export const config = {
  name: 'hint',
  alias: ['petunjuk'],
  category: 'game',
  description: { id: 'Minta petunjuk untuk sesi kuis atau tebak yang sedang jalan di chat ini', en: 'Ask a hint for the quiz or guessing session running in this chat' },
  usage: '.hint saat ada kuis berjalan',
  example: '.hint',
  cooldown: 5,
}

export const i18n = {
  id: {
    hint: {
      noSession: '╭─❏ 💡 「 *PETUNJUK* 」\n┊ Belum ada sesi kuis atau tebak yang jalan di chat ini, jadi tidak ada yang bisa dikasih petunjuk~\n┊ Mulai dulu yaa, contoh *.kuis*, *.math*, *.tebakkata*\n╰━━━━━━━',
      used: '╭─❏ 💡 「 *PETUNJUK* 」\n┊ Petunjuk buat sesi *{type}* ini sudah pernah dipakai. Satu sesi cuma dapat satu petunjuk yaa~\n╰━━━━━━━',
      mc: '╭─❏ 💡 「 *PETUNJUK {type}* 」\n┊ Salah satu opsi yang PASTI salah: *{wrong}*\n┊ Coret itu dari pilihanmu yaa~\n╰━━━━━━━',
      text: '╭─❏ 💡 「 *PETUNJUK {type}* 」\n┊ Jawabannya berbentuk: *{masked}*\n┊ {letters} huruf, diawali huruf *{first}*\n╰━━━━━━━',
      family: '╭─❏ 💡 「 *PETUNJUK FAMILY 100* 」\n┊ Masih ada *{remaining} jawaban* yang belum ketemu.\n┊ Salah satunya diawali huruf *{first}*\n╰━━━━━━━',
      math: '╭─❏ 💡 「 *PETUNJUK MATH* 」\n┊ Hasilnya bilangan *{parity}*, nilainya di kisaran *{low} sampai {high}*\n╰━━━━━━━',
    },
  },
  en: {
    hint: {
      noSession: '╭─❏ 💡 「 *HINT* 」\n┊ No quiz or guessing session is running in this chat, so there is nothing to hint~\n┊ Start one first, for example *.kuis*, *.math*, *.tebakkata*\n╰━━━━━━━',
      used: '╭─❏ 💡 「 *HINT* 」\n┊ The hint for this *{type}* session was already used. One hint per session~\n╰━━━━━━━',
      mc: '╭─❏ 💡 「 *HINT {type}* 」\n┊ One option that is DEFINITELY wrong: *{wrong}*\n┊ Cross that one out~\n╰━━━━━━━',
      text: '╭─❏ 💡 「 *HINT {type}* 」\n┊ The answer looks like: *{masked}*\n┊ {letters} letters, starting with *{first}*\n╰━━━━━━━',
      family: '╭─❏ 💡 「 *FAMILY 100 HINT* 」\n┊ There are still *{remaining} answers* left.\n┊ One of them starts with the letter *{first}*\n╰━━━━━━━',
      math: '╭─❏ 💡 「 *MATH HINT* 」\n┊ The result is an *{parity}* number, somewhere between *{low} and {high}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.hint', expect: /petunjuk|hint/i }

// Bangun teks petunjuk dari data sesi mesin kuis. Murni, bisa diuji.
export function buildHint(session, t) {
  if (session.type === 'family100') {
    const left = (session.answers ?? []).filter((a) => !a.found)
    if (!left.length) return null
    const first = String(left[0].text?.id ?? left[0].text?.en ?? '?').charAt(0).toUpperCase()
    return t('hint.family', { remaining: left.length, first })
  }
  if (MC_TYPES.includes(session.type)) {
    const wrongIdx = (session.options ?? []).findIndex((_, i) => i !== session.answerIndex)
    if (wrongIdx < 0) return null
    return t('hint.mc', { type: session.type, wrong: session.options[wrongIdx] })
  }
  if (session.type === 'math') {
    const n = Number(session.answerText)
    if (!Number.isFinite(n)) return null
    const low = Math.floor(n / 10) * 10
    return t('hint.math', { parity: n % 2 === 0 ? 'genap' : 'ganjil', low, high: low + 9 })
  }
  const answer = String(session.answerText ?? '')
  if (!answer) return null
  return t('hint.text', {
    type: session.type,
    masked: maskWord(answer.toUpperCase()),
    letters: answer.replace(/\s/g, '').length,
    first: answer.charAt(0).toUpperCase(),
  })
}

export async function handler(ctx) {
  const session = await getSession(ctx.storage, ctx.chat)
  if (!session) return ctx.reply(ctx.t('hint.noSession'))
  if (session.hintUsed) return ctx.reply(ctx.t('hint.used', { type: session.type }))
  const body = buildHint(session, (k, v) => ctx.t(k, v))
  if (!body) return ctx.reply(ctx.t('hint.noSession'))
  session.hintUsed = true
  await ctx.storage.set('kv', `quiz:${ctx.chat}`, session)
  return ctx.reply(body)
}
