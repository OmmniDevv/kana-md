
import { sendButtons } from '../../src/ui/buttons.js'
export const config = {
  name: "randomname",
  alias: [],
  category: "random",
  description: { id: "Fitur randomname versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD randomname feature, rewritten in KANA style" },
  usage: ".randomname",
  example: ".randomname",
  cooldown: 5,
}

export const i18n = {
  id: {
    "randomname": {
      body: "╭─❏ ✨ 「 *RANDOMNAME* 」\n┊ {text}\n╰━━━━━━━",
      btnAgain: "Lagi",
    },
  },
  en: {
    "randomname": {
      body: "╭─❏ ✨ 「 *RANDOMNAME* 」\n┊ {text}\n╰━━━━━━━",
      btnAgain: "Again",
    },
  },
}

const ITEMS_ID = ["Madu adalah satu satunya makanan yang tidak pernah basi, madu berusia 3000 tahun pernah ditemukan masih layak makan.", "Gurita punya tiga jantung dan darah berwarna biru.", "Pisang secara botani termasuk buah beri, sedangkan stroberi justru bukan.", "Menara Eiffel bisa tumbuh sekitar 15 cm lebih tinggi saat musim panas karena pemuaian besi.", "Otak manusia menghasilkan listrik yang cukup untuk menyalakan lampu kecil."]
const ITEMS_EN = ["Honey is the only food that never spoils, 3000 year old honey was found still edible.", "Octopuses have three hearts and blue blood.", "Bananas are botanically berries, while strawberries are not.", "The Eiffel Tower grows about 15 cm taller in summer due to iron expansion."]
export const test = { input: '.randomname', expect: /randomname/i }
export async function handler(ctx) {
  const items = ctx.lang === 'en' ? ITEMS_EN : ITEMS_ID
  const text = items[Math.floor(Math.random() * items.length)]
  const body = ctx.t('randomname.body', { text })
  return sendButtons(ctx.sock, ctx.chat, { title: 'KANA', body, footer: ctx.t('menu.footer'), replies: [{ text: ctx.t('randomname.btnAgain'), id: '.randomname' }], textFallback: body })
}
