import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'quotesanime',
  alias: ['animequote', 'quotenanime', 'kataanimesad', 'katanime'],
  category: 'fun',
  description: { id: 'Kirim satu kutipan penyemangat ala anime', en: 'Send one anime style motivational quote' },
  usage: '.quotesanime',
  example: '.quotesanime',
  cooldown: 3,
}

export const i18n = {
  id: {
    quotesanime: {
      title: 'Quotes Anime',
      body: '╭─❏ ⚔️ 「 *SEMANGAT ALA ANIME UNTUKMU* 」\n┊ "{item}"\n┊ Tegakkan kepalamu, tokoh utama~\n╰━━━━━━━ {mood}',
      pool: [
  "Meski jatuh tujuh kali, ceritanya berlanjut saat kamu berdiri untuk kedelapan kalinya.",
  "Bekas lukamu bukan aib, itu bukti kamu selamat dari episode itu.",
  "Pahlawan hanyalah orang yang menolak menutup bukunya.",
  "Berlatihlah dalam diam, biar hasilmu yang berteriak.",
  "Kekuatan yang kamu cari selama ini tertidur di dalam usahamu sendiri.",
  "Teman adalah anggota party yang menyembuhkanmu tanpa perlu ramuan.",
  "Jangan takut pada bos terakhir, takutlah menyerah sebelum bertarung.",
  "Setiap legenda berawal dari pemula yang tidak berhenti.",
  "Air mata setelah kalah berarti kamu bertarung dengan sungguh-sungguh.",
  "Rivalmu hari ini adalah cerminmu untuk besok.",
  "Lindungi mimpimu seperti nyawa terakhirmu.",
  "Janji pada diri sendiri adalah kontrak paling kuat.",
  "Bahkan tokoh sampingan bisa mencuri perhatian kalau hatinya cukup besar.",
  "Lagu pembuka hidupmu sebentar lagi diputar, bersiaplah."
],
      btnAgain: 'Lagi Dong',
    },
  },
  en: {
    quotesanime: {
      title: 'Anime Quotes',
      body: '╭─❏ ⚔️ 「 *ANIME SPIRIT FOR YOU* 」\n┊ "{item}"\n┊ Keep your head high, main character~\n╰━━━━━━━ {mood}',
      pool: [
  "Even if you fall seven times, the story continues when you stand the eighth time.",
  "Your scars are not shame, they are proof you survived the episode.",
  "A hero is just someone who refused to close the book.",
  "Train in silence, let the results do the shouting.",
  "The power you are looking for was sleeping inside your effort all along.",
  "Friends are the party members who heal you without potions.",
  "Do not fear the final boss, fear giving up before the battle.",
  "Every legend started as a beginner who kept going.",
  "Tears after a loss mean you fought seriously.",
  "Your rival today is your mirror for tomorrow.",
  "Protect your dream like it is your last life point.",
  "A promise to yourself is the strongest contract.",
  "Even side characters can steal the scene with enough heart.",
  "The opening song of your life is about to play, get ready."
],
      btnAgain: 'Another One',
    },
  },
}

export const test = { input: '.quotesanime', expect: /anime/i }

export async function handler(ctx) {
  const pool = i18n[ctx.lang]?.quotesanime?.pool ?? i18n.id.quotesanime.pool
  const item = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('quotesanime.body', { item, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('quotesanime.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('quotesanime.btnAgain'), id: '.quotesanime' },
    ],
    textFallback: body,
  })
}
