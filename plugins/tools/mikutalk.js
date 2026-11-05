// Ngobrol santai dengan persona Miku: balasan lokal berbasis kata
// kunci dan pilihan deterministik dari isi pesan. Ini obrolan ringan
// terprogram, bukan model AI, dan dijelaskan apa adanya di deskripsi.
export const config = {
  name: 'mikutalk',
  alias: ['miku', 'ngobrolmiku'],
  category: 'tools',
  description: { id: 'Ngobrol santai bareng Miku (balasan lokal playful, bukan AI)', en: 'Chat casually with Miku (playful local replies, not AI)' },
  usage: '.mikutalk <pesan>',
  example: '.mikutalk halo miku',
  cooldown: 3,
}

export const i18n = {
  id: {
    mikutalk: {
      needText: '╭─❏ 🎤 「 *AYO NGOBROL* 」\n┊ ᴄᴏɴᴛᴏʜ: *.mikutalk halo miku*\n┊ ᴄᴏʙᴀ ᴛᴀɴʏᴀ ʟᴀɢᴜ, ᴋᴇɢɪᴀᴛᴀɴ, ᴀᴛᴀᴜ ꜱᴀᴘᴀ ᴀᴊᴀ~\n╰━━━━━━━',
      greet: 'Halo halo~ Aku Miku, senang bisa ngobrol sama kamu hari ini. Mau cerita apa?',
      sing: 'La la la~ Kalau soal lagu, andalanku tetap World is Mine sama Senbonzakura. Kamu mau aku nyanyiin yang mana di panggung berikutnya?',
      who: 'Aku Hatsune Miku, penyanyi virtual nomor satu. Usiaku selamanya 16 tahun dan rambut twintail ini ciri khasku.',
      food: 'Daun bawang itu terbaik. Serius, cobain sekali saja pasti paham kenapa aku suka banget.',
      tired: 'Capek ya? Istirahat dulu, minum air, tarik napas. Panggungnya bisa nunggu, kesehatanmu nomor satu.',
      thanks: 'Ehehe, sama-sama. Senang bisa bantu. Kapan-kapan ngobrol lagi ya~',
      love: 'E-eh?! M-makasih... jadi malu. Aku juga senang punya penggemar sepertimu.',
      bye: 'Dadah~ Sampai ketemu di konser berikutnya. Jaga diri baik-baik ya.',
      ask: 'Hmm, pertanyaan bagus. Kalau menurutku sih yang penting kita nikmati prosesnya. Kamu sendiri gimana?',
      fallback1: 'Hee, menarik juga ceritamu. Terus terus, aku dengerin~',
      fallback2: 'Ohh gitu ya. Ngomong-ngomong, hari ini kamu lagi pengin ngapain bareng aku?',
      fallback3: 'Uwah, aku baru kepikiran hal itu. Ceritain lebih banyak dong~',
      fallback4: 'Iya iya, aku paham maksudmu. Kita santai aja ngobrolnya.',
    },
  },
  en: {
    mikutalk: {
      needText: '╭─❏ 🎤 「 *LETS CHAT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.mikutalk hello miku*\n┊ ᴀꜱᴋ ᴀʙᴏᴜᴛ ꜱᴏɴɢꜱ, ᴀᴄᴛɪᴠɪᴛɪᴇꜱ, ᴏʀ ᴊᴜꜱᴛ ꜱᴀʏ ʜɪ~\n╰━━━━━━━',
      greet: 'Hello hello~ I am Miku, happy to chat with you today. What shall we talk about?',
      sing: 'La la la~ My signature songs are World is Mine and Senbonzakura. Which one should I sing on the next stage?',
      who: 'I am Hatsune Miku, the number one virtual singer. Forever 16, and these twintails are my trademark.',
      food: 'Leeks are the best. Seriously, try one and you will understand why I love them.',
      tired: 'Tired? Take a break, drink some water, breathe. The stage can wait, your health comes first.',
      thanks: 'Ehehe, you are welcome. Glad to help. Let us chat again sometime~',
      love: 'E-eh?! T-thanks... now I am embarrassed. I am happy to have a fan like you too.',
      bye: 'Bye bye~ See you at the next concert. Take good care of yourself.',
      ask: 'Hmm, good question. I think what matters is enjoying the process. What do you think?',
      fallback1: 'Hee, that is interesting. Go on, I am listening~',
      fallback2: 'Ohh I see. By the way, what do you feel like doing with me today?',
      fallback3: 'Uwah, I never thought of that. Tell me more~',
      fallback4: 'Yes yes, I get what you mean. Let us keep it chill.',
    },
  },
}

export const test = { input: '.mikutalk halo miku', expect: /Miku/ }

const RULES = [
  [/(halo|hai|hei|hello|hi)\b/i, 'greet'],
  [/lagu|nyanyi|sing|song|konser|concert/i, 'sing'],
  [/siapa|who are|kamu siapa/i, 'who'],
  [/makan|daun bawang|leek|food/i, 'food'],
  [/capek|lelah|tired|ngantuk/i, 'tired'],
  [/makasih|terima kasih|thanks|thank/i, 'thanks'],
  [/sayang|cinta|love|suka kamu/i, 'love'],
  [/dadah|bye|sampai jumpa/i, 'bye'],
  [/\?\s*$/, 'ask'],
]

// Pilih kunci balasan secara deterministik dari isi pesan.
export function pickReplyKey(text) {
  const src = String(text || '')
  for (const [re, key] of RULES) if (re.test(src)) return key
  let hash = 0
  for (const ch of src) hash = (hash * 31 + ch.codePointAt(0)) >>> 0
  return 'fallback' + (hash % 4 + 1)
}

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('mikutalk.needText'))
  return ctx.reply(ctx.t('mikutalk.' + pickReplyKey(text)))
}
