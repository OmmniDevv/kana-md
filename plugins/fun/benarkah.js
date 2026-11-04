import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'benarkah',
  alias: [],
  category: 'fun',
  description: { id: 'Tanya benarkah suatu hal, KANA jawab iseng dari bola kristal', en: 'Ask if something is true, KANA answers playfully from the crystal ball' },
  usage: '.benarkah <pertanyaan>',
  example: '.benarkah contoh pertanyaan',
  cooldown: 3,
}

export const i18n = {
  id: {
    benarkah: {
      title: 'Bola Kristal: Benarkah?',
      ask: '╭─❏ 🔍 「 *BENARKAH?* 」\n┊ ❓ *{question}*\n┊ ᴊᴀᴡᴀʙᴀɴ ʙᴏʟᴀ ᴋʀɪꜱᴛᴀʟ ᴋᴀɴᴀ: *{answer}* {mood}\n╰━━━━━━━',
      usage: '╭─❏ 🔍 「 *BENARKAH?* 」\n┊ Tanya dulu dong~\n┊ ᴄᴏɴᴛᴏʜ: *.benarkah <pertanyaan kamu>*\n╰━━━━━━━',
      answers: [
  "Benar, itu fakta versi bola kristalku~",
  "Benar banget, tidak usah ragu lagi",
  "Hmm, separuh benar separuh kabar angin",
  "Kayaknya tidak benar deh, cek lagi sumbernya yaa",
  "Tidak benar, itu cuma mitos yang keburu viral",
  "Benar, tapi tidak sesederhana kedengarannya~",
  "Bola kristalku bilang: benar, dengan catatan kecil",
  "Tidak benar sama sekali, jangan gampang percaya~"
],
      btnAgain: 'Tanya Lagi',
    },
  },
  en: {
    benarkah: {
      title: 'Crystal Ball: Is It True?',
      ask: '╭─❏ 🔍 「 *IS IT TRUE?* 」\n┊ ❓ *{question}*\n┊ ᴋᴀɴᴀ ᴄʀʏꜱᴛᴀʟ ʙᴀʟʟ ᴀɴꜱᴡᴇʀ: *{answer}* {mood}\n╰━━━━━━━',
      usage: '╭─❏ 🔍 「 *IS IT TRUE?* 」\n┊ Ask something first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.benarkah <your question>*\n╰━━━━━━━',
      answers: [
  "True, that is a fact per my crystal ball~",
  "Very true, no need to doubt anymore",
  "Hmm, half true half rumor",
  "Seems untrue, check the source again",
  "Not true, just a myth that went viral",
  "True, but not as simple as it sounds~",
  "My crystal ball says: true, with a small note",
  "Not true at all, do not believe so easily~"
],
      btnAgain: 'Ask Again',
    },
  },
}

export const test = { input: '.benarkah besok cerah', expect: /BENARKAH|IS IT TRUE/i }

export async function handler(ctx) {
  const question = (ctx.text || '').trim()
  const pool = i18n[ctx.lang]?.benarkah?.answers ?? i18n.id.benarkah.answers
  if (!question) {
    const body = ctx.t('benarkah.usage')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('benarkah.title'),
      body,
      footer: ctx.t('menu.footer'),
      textFallback: body,
    })
  }
  const list = Array.isArray(pool) ? pool : []
  const answer = list[Math.floor(Math.random() * list.length)] ?? ''
  const body = ctx.t('benarkah.ask', {
    question,
    answer,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('benarkah.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('benarkah.btnAgain'), id: '.benarkah' },
    ],
    textFallback: body,
  })
}
