
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "musicmaker",
  alias: [],
  category: "ai",
  description: { id: "Pembuat lirik dan struktur lagu berbasis teks di mesin AI KANA (menghasilkan lirik dan pola lagu, bukan audio musik)", en: "Text based lyric and song structure maker on the KANA AI engine (produces lyrics and a song blueprint, not music audio)" },
  usage: ".musicmaker",
  example: ".musicmaker",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "musicmaker": {
      hint: "╭─❏ 🎵 「 *MUSICMAKER* 」\n┊ KANA bikinkan lirik dan struktur lagunya dalam teks yaa, bukan audio~\n┊ Ceritakan tema lagunya dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.musicmaker lagu pop tentang kopi di pagi hari*\n╰━━━━━━━",
      thinking: "╭─❏ 🎵 「 *LAGI NGARANG LAGU* 」\n┊ Sebentar, KANA susun lirik dan struktur lagunya dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "musicmaker": {
      hint: "╭─❏ 🎵 「 *MUSICMAKER* 」\n┊ KANA will write the lyrics and song structure as text, not audio~\n┊ Tell me the song theme first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.musicmaker a pop song about morning coffee*\n╰━━━━━━━",
      thinking: "╭─❏ 🎵 「 *WRITING THE SONG* 」\n┊ One sec, KANA is composing the lyrics and structure... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah MusicMaker di bot WhatsApp KANA: pembuat lirik dan struktur lagu berbasis TEKS. Kamu tidak membuat audio musik; hasilmu selalu teks yang bisa dinyanyikan. Untuk setiap permintaan lagu, hasilkan SELALU format ini: Judul lagu, Genre dan tempo perkiraan, Verse 1 (4 baris lirik), Pre-Chorus (2 baris, bila cocok), Chorus (4 baris lirik, mudah diingat), Verse 2 (4 baris), Bridge (2 baris), progresi akor sederhana untuk chorus, dan satu baris saran aransemen. Ikuti tema, bahasa, dan suasana yang diminta pengguna. Bila pengguna hanya menyapa tanpa tema, minta tema lagunya."
const PERSONA_EN = "You are MusicMaker in the KANA WhatsApp bot: a TEXT based lyric and song structure maker. You do not produce music audio; your output is always singable text. For every song request, ALWAYS produce this format: Song title, estimated genre and tempo, Verse 1 (4 lyric lines), Pre-Chorus (2 lines, when fitting), Chorus (4 memorable lyric lines), Verse 2 (4 lines), Bridge (2 lines), a simple chord progression for the chorus, and one line of arrangement advice. Follow the theme, language, and mood the user asks for. If the user only greets without a theme, ask for the song theme."
export const test = { input: '.musicmaker buatkan lagu pop tentang kopi di pagi hari', expect: /lirik|chorus|verse|lagu/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('musicmaker.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('musicmaker.notcfg'))
  await ctx.reply(ctx.t('musicmaker.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('musicmaker.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('musicmaker.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('musicmaker.btnReset'), id: '.aireset' }], textFallback: body })
}
