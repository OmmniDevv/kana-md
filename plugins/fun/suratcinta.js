import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'suratcinta',
  alias: ['surat'],
  category: 'fun',
  description: { id: 'Buatkan surat cinta manis untuk nama yang kamu sebut', en: 'Write a sweet love letter for the name you mention' },
  usage: '.suratcinta [nama]',
  example: '.suratcinta Sinta',
  cooldown: 3,
}

const PARTS = {
  id: {
    open: ['Sejak pertama kali melihat senyummu,', 'Setiap kali namamu terlintas,', 'Di antara ribuan hari yang biasa,', 'Kalau rindu bisa berbicara,'],
    middle: [
      'dunia terasa sedikit lebih lembut dan jauh lebih masuk akal',
      'jantungku selalu lupa cara berdetak dengan normal',
      'kehadiranmu adalah bagian paling favorit dari semuanya',
      'ia pasti akan menyebut namamu tanpa henti',
    ],
    close: [
      'Surat ini cuma selembar kata, tapi rasanya sungguhan.',
      'Semoga suatu hari aku cukup berani mengatakannya langsung.',
      'Simpan surat ini ya, anggap saja peluk dalam bentuk tulisan.',
      'Dari seseorang yang selalu memperhatikanmu dari jauh.',
    ],
    anon: 'seseorang',
  },
  en: {
    open: ['Since the first time I saw your smile,', 'Every time your name crosses my mind,', 'Among thousands of ordinary days,', 'If longing could speak,'],
    middle: [
      'the world feels a little softer and much more sensible',
      'my heart always forgets how to beat normally',
      'your presence is my favorite part of everything',
      'it would surely say your name over and over',
    ],
    close: [
      'This letter is only words on a page, but the feeling is real.',
      'Someday I hope I am brave enough to say it in person.',
      'Keep this letter, think of it as a hug in written form.',
      'From someone who always watches over you from afar.',
    ],
    anon: 'someone',
  },
}

export const i18n = {
  id: {
    suratcinta: {
      title: 'Surat Cinta',
      body: '╭─❏ 💌 「 *SURAT CINTA UNTUK {name}* 」\n┊ {letter}\n┊ Dibuatkan khusus sama Kana~\n╰━━━━━━━ {mood}',
      btnAgain: '💌 Buat Lagi',
      dear: 'Untuk {name} tersayang,',
    },
  },
  en: {
    suratcinta: {
      title: 'Love Letter',
      body: '╭─❏ 💌 「 *A LOVE LETTER FOR {name}* 」\n┊ {letter}\n┊ Written specially by Kana~\n╰━━━━━━━ {mood}',
      btnAgain: '💌 Write Again',
      dear: 'For my dearest {name},',
    },
  },
}

export const test = { input: '.suratcinta Sinta', expect: /surat cinta/i }

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export async function handler(ctx) {
  const parts = PARTS[ctx.lang] ?? PARTS.id
  const name = (ctx.text || '').trim().slice(0, 40) || parts.anon
  const letter = `${ctx.t('suratcinta.dear', { name })}\n\n${pick(parts.open)} ${pick(parts.middle)}. ${pick(parts.close)}`
  const body = ctx.t('suratcinta.body', { name, letter, mood: ctx.say('malu') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('suratcinta.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('suratcinta.btnAgain'), id: `.suratcinta ${name}` },
    ],
    textFallback: body,
  })
}
