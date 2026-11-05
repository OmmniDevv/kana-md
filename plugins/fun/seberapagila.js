import { sendButtons } from '../../src/ui/buttons.js'

// Seberapagila: persen kegilaan acak murni Math.random 0-100 (bukan
// hash nama), dengan komentar yang mengikuti tingkat persennya,
// berjenjang enam tingkat.
export const config = {
  name: 'seberapagila',
  alias: [],
  category: 'fun',
  description: { id: 'Tes tingkat kegilaan acak hari ini', en: 'A random craziness level test for today' },
  usage: '.seberapagila <nama>',
  example: '.seberapagila Budi',
  cooldown: 5,
}

export const i18n = {
  id: {
    seberapagila: {
      title: 'Tes Kegilaan',
      result: '╭─❏ 🧠 「 *TES KEGILAAN HARI INI* 」\n┊ 👤 ɴᴀᴍᴀ: *{name}*\n┊ 📊 ᴛɪɴɢᴋᴀᴛ ɢɪʟᴀ: *{percent}%*\n┊ 🗯️ ᴋᴏᴍᴇɴᴛᴀʀ: *{comment}*\n╰━━━━━━━',
      btnAgain: 'Tes Lagi',
      comments: [
        'Normal banget, waras seperti batu bata.',
        'Sedikit nyeleneh, tapi masih aman diajak diskusi.',
        'Agak nyeleneh, kadang ketawa sendiri tanpa sebab jelas.',
        'Sudah mulai ngaco, tolong dijaga baik baik.',
        'Wah ini sih gila beneran, cocok masuk rumah tertawa.',
        'Level dewa, gila tapi keren, bot saja sampai pusing bacanya.',
      ],
    },
  },
  en: {
    seberapagila: {
      title: 'Craziness Test',
      result: '╭─❏ 🧠 「 *CRAZINESS TEST TODAY* 」\n┊ 👤 ɴᴀᴍᴇ: *{name}*\n┊ 📊 ᴄʀᴀᴢɪɴᴇꜱꜱ ʟᴇᴠᴇʟ: *{percent}%*\n┊ 🗯️ ᴄᴏᴍᴍᴇɴᴛ: *{comment}*\n╰━━━━━━━',
      btnAgain: 'Test Again',
      comments: [
        'Totally normal, sane as a brick.',
        'A little quirky, but still safe to talk with.',
        'Somewhat quirky, sometimes laughs alone for no clear reason.',
        'Starting to go off the rails, please keep an eye on them.',
        'Properly crazy, fits right into a house of laughter.',
        'God tier, crazy but cool, even the bot gets dizzy reading it.',
      ],
    },
  },
}

export const test = { input: '.seberapagila Budi', expect: /tes kegilaan|craziness test/i }

// Jenjang komentar: 0-15, 16-35, 36-55, 56-75, 76-90, 91-100.
export function tierFor(percent) {
  if (percent <= 15) return 0
  if (percent <= 35) return 1
  if (percent <= 55) return 2
  if (percent <= 75) return 3
  if (percent <= 90) return 4
  return 5
}

export function drawCrazy(rng = Math.random) {
  const percent = Math.min(100, Math.floor(rng() * 101))
  return { percent, tier: tierFor(percent) }
}

export async function handler(ctx) {
  const pack = i18n[ctx.lang]?.seberapagila ?? i18n.id.seberapagila
  const name = (ctx.text || '').trim().slice(0, 60) || ctx.pushName || ctx.senderDigits
  const draw = drawCrazy()
  const body = ctx.t('seberapagila.result', {
    name,
    percent: draw.percent,
    comment: pack.comments[draw.tier],
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('seberapagila.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('seberapagila.btnAgain'), id: '.seberapagila' }],
    textFallback: body,
  })
}
