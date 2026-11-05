
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "q-islam",
  alias: [],
  category: "random",
  description: { id: "Fitur q-islam versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD q-islam feature, rewritten in KANA style" },
  usage: ".q-islam",
  example: ".q-islam",
  cooldown: 5,
}

export const i18n = {
  id: {
    "q-islam": {
      body: "╭─❏ ✨ 「 *Q-ISLAM* 」\n┊ {text}\n╰━━━━━━━",
      btnAgain: "Lagi",
    },
  },
  en: {
    "q-islam": {
      body: "╭─❏ ✨ 「 *Q-ISLAM* 」\n┊ {text}\n╰━━━━━━━",
      btnAgain: "Again",
    },
  },
}

const ITEMS_ID = ["Madu adalah satu satunya makanan yang tidak pernah basi, madu berusia 3000 tahun pernah ditemukan masih layak makan.", "Gurita punya tiga jantung dan darah berwarna biru.", "Pisang secara botani termasuk buah beri, sedangkan stroberi justru bukan.", "Menara Eiffel bisa tumbuh sekitar 15 cm lebih tinggi saat musim panas karena pemuaian besi.", "Otak manusia menghasilkan listrik yang cukup untuk menyalakan lampu kecil."]
const ITEMS_EN = ["Honey is the only food that never spoils, 3000 year old honey was found still edible.", "Octopuses have three hearts and blue blood.", "Bananas are botanically berries, while strawberries are not.", "The Eiffel Tower grows about 15 cm taller in summer due to iron expansion."]
export const test = { input: '.q-islam', expect: /q-islam/i }
export async function handler(ctx) {
  const items = ctx.lang === 'en' ? ITEMS_EN : ITEMS_ID
  const text = items[Math.floor(Math.random() * items.length)]
  const body = ctx.t('q-islam.body', { text })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('q-islam.btnAgain'), id: '.q-islam' }], textFallback: body })
}
