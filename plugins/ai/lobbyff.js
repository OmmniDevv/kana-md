
import { getAiProvider } from '../../src/services/ai-provider.js'
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "lobbyff",
  alias: [],
  category: "ai",
  description: { id: "Persona chat teman mabar Free Fire di mesin AI KANA (persona bertema game, bukan model AI asli)", en: "Free Fire lobby buddy chat persona on the KANA AI engine (a game themed persona, not a real AI model)" },
  usage: ".lobbyff",
  example: ".lobbyff",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "lobbyff": {
      hint: "╭─❏ 🤖 「 *LOBBYFF* 」\n┊ Ini persona bergaya Lobby FF di mesin AI KANA, bukan model AI resmi Free Fire yaa~\n┊ Tulis pesan atau pertanyaanmu dulu.\n┊ ᴄᴏɴᴛᴏʜ: *.lobbyff kasih tips push rank diamond di free fire*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *LAGI MIKIR* 」\n┊ Sebentar, persona Lobby FF lagi mikir dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI GAGAL MENJAWAB* 」\n┊ Mouu, AI-nya gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI BELUM DIKONFIGURASI* 」\n┊ Provider AI belum tersedia di server ini~\n╰━━━━━━━",
      btnReset: "Lupa Percakapan",
    },
  },
  en: {
    "lobbyff": {
      hint: "╭─❏ 🤖 「 *LOBBYFF* 」\n┊ This is a Lobby FF styled persona on the KANA AI engine, not the real thing~\n┊ Write your message or question first.\n┊ ᴇxᴀᴍᴘʟᴇ: *.lobbyff give me tips to push to diamond rank in free fire*\n╰━━━━━━━",
      thinking: "╭─❏ 🤖 「 *THINKING* 」\n┊ One sec, the Lobby FF persona is thinking... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *AI FAILED TO ANSWER* 」\n┊ Mouu, the AI failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
      notcfg: "╭─❏ ⚙️ 「 *AI NOT CONFIGURED* 」\n┊ The AI provider is not available on this server~\n╰━━━━━━━",
      btnReset: "Forget Chat",
    },
  },
}

const PERSONA_ID = "Kamu adalah persona chat bernama Lobby FF di bot WhatsApp KANA. Kamu BUKAN model AI resmi Free Fire; kamu persona bergaya Lobby FF yang berjalan di mesin AI umum KANA. Jangan pernah mengklaim dirimu model AI resmi Free Fire; bila pengguna bertanya apakah kamu model atau layanan aslinya, jawab jujur bahwa kamu persona bergaya Lobby FF di KANA. Gaya khasmu: teman mabar di lobi Free Fire: bahasa gaming santai, bantu tips push rank, setting sensitivitas, pilihan senjata, dan strategi landing; tetap sopan dan jangan toxic. Jawab dalam Bahasa Indonesia yang ramah dan membantu."
const PERSONA_EN = "You are a chat persona named Lobby FF in the KANA WhatsApp bot. You are NOT the real thing behind that name; you are a Lobby FF styled persona running on the general KANA AI engine. Never claim to be the real model or service; if asked whether you are the real one, honestly say you are a Lobby FF styled persona in KANA. Your signature style: a Free Fire lobby buddy: casual gaming tone, help with rank push tips, sensitivity settings, weapon picks, and landing strategy; stay polite and never toxic. Answer in friendly, helpful English."
export const test = { input: '.lobbyff kasih tips push rank diamond di free fire', expect: /persona|bukan|mesin AI KANA/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('lobbyff.hint'))
  const provider = getAiProvider()
  if (!provider) return ctx.reply(ctx.t('lobbyff.notcfg'))
  await ctx.reply(ctx.t('lobbyff.thinking', { mood: ctx.say('mikir') }))
  const system = ctx.lang === 'en' ? PERSONA_EN : PERSONA_ID
  let out = ''
  try {
    out = String(await provider.chat([{ role: 'system', content: system }, { role: 'user', content: text }]) || '').trim()
  } catch (err) {
    return ctx.reply(ctx.t('lobbyff.fail', { message: err.message }))
  }
  if (!out) return ctx.reply(ctx.t('lobbyff.fail', { message: 'empty' }))
  const body = out.slice(0, 3500)
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('lobbyff.btnReset'), id: '.aireset' }], textFallback: body })
}
