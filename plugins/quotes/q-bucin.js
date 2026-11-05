
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "q-bucin",
  alias: ["quotesbucin"],
  category: "quotes",
  description: { id: "Fitur q-bucin versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD q-bucin feature, rewritten in KANA style" },
  usage: ".q-bucin",
  example: ".q-bucin",
  cooldown: 5,
}

export const i18n = {
  id: {
    "q-bucin": {
      body: "╭─❏ ✨ 「 *Q-BUCIN* 」\n┊ {text}\n╰━━━━━━━",
      btnAgain: "Lagi",
    },
  },
  en: {
    "q-bucin": {
      body: "╭─❏ ✨ 「 *Q-BUCIN* 」\n┊ {text}\n╰━━━━━━━",
      btnAgain: "Again",
    },
  },
}

const ITEMS_ID = ["Hidup itu seperti naik sepeda, untuk menjaga keseimbangan kamu harus terus bergerak.", "Kesuksesan bukan kunci kebahagiaan, kebahagiaan adalah kunci kesuksesan.", "Jangan menunggu waktu yang sempurna, ambil waktunya dan buat jadi sempurna.", "Mimpi besar dimulai dari langkah kecil yang berani.", "Kegagalan adalah guru terbaik, selama kamu mau belajar darinya."]
const ITEMS_EN = ["Life is like riding a bicycle, to keep your balance you must keep moving.", "Success is not the key to happiness, happiness is the key to success.", "Do not wait for the perfect moment, take the moment and make it perfect.", "Big dreams start with small brave steps.", "Failure is the best teacher, as long as you are willing to learn."]
export const test = { input: '.q-bucin', expect: /q-bucin/i }
export async function handler(ctx) {
  const items = ctx.lang === 'en' ? ITEMS_EN : ITEMS_ID
  const text = items[Math.floor(Math.random() * items.length)]
  const body = ctx.t('q-bucin.body', { text })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('q-bucin.btnAgain'), id: '.q-bucin' }], textFallback: body })
}
