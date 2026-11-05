import { answerQuiz, getSession } from './engine.js'
import { sendButtons } from '../ui/buttons.js'

// Pelaporan hasil jawaban kuis + routing reply bersama.
// Standar reply-first (perintah user 2026-11-04): jawaban kuis diberikan
// dengan MEREPLY pesan pertanyaan kuis, bukan perintah .jawab. Perintah
// .jawab sudah dihapus; modul ini satu-satunya jalur jawaban kuis.

const PREFIXES = ['.', '!', '/', '#']

export async function reportResult(ctx, result) {
  if (result.noSession) {
    const body = ctx.t('jawab.noSession', { mood: ctx.say('malu') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('jawab.footer'),
      replies: [
        { text: ctx.t('jawab.startBtn'), id: '.tekateki' },
      ],
      textFallback: body,
    })
  }
  if (!result.correct) {
    const body = ctx.t('jawab.wrong', { mood: ctx.say('gagal') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('jawab.footer'),
      replies: [{ text: ctx.t('jawab.giveUpBtn'), id: '.nyerah' }],
      textFallback: body,
    })
  }
  if (!result.finished) {
    return ctx.reply(
      ctx.t('jawab.correctPartial', {
        answer: result.answer,
        points: result.points,
        earned: result.earned,
        remaining: result.remaining,
      })
    )
  }
  const body =
    result.type === 'family100'
      ? ctx.t('jawab.allFound', { earned: result.earned, mood: ctx.say('senang') })
      : ctx.t('jawab.correct', { answer: result.answer, points: result.points, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('jawab.footer'),
    replies: [
      { text: ctx.t('jawab.againBtn'), id: `.${result.type}` },
    ],
    textFallback: body,
  })
}

// Routing reply kuis: pesan yang mengutip (reply) salah satu pesan
// pertanyaan sesi aktif, dikirim oleh pemain yang memulai kuis, dan bukan
// perintah berprefix, diperlakukan sebagai jawaban. Semua kasus lain
// (reply ke pesan lain, tidak ada sesi, sesi kedaluwarsa, pemain lain)
// diabaikan diam-diam supaya tidak mengganggu obrolan biasa.
// Return false berarti pesan dikonsumsi dan pipeline berhenti memproses.
export async function handleQuizReply(ctx) {
  const stanzaId = ctx.quoted?.stanzaId
  if (!stanzaId) return undefined
  const text = (ctx.text || '').trim()
  if (!text || PREFIXES.some((p) => text.startsWith(p))) return undefined
  const session = await getSession(ctx.storage, ctx.chat)
  if (!session) return undefined
  if (!(session.questionIds ?? []).includes(stanzaId)) return undefined
  // Family 100 adalah kuis grup bersama (pola Elaina): member grup mana pun
  // boleh menebak, XP masuk ke penebak. Kuis lain tetap khusus pemulai.
  if (session.type !== 'family100' && session.startedBy && ctx.senderDigits !== session.startedBy) return undefined
  const result = await answerQuiz(ctx.storage, ctx.chat, ctx.senderDigits, text)
  if (result.noSession) return undefined
  await reportResult(ctx, result)
  return false
}
