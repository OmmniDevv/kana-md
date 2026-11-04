import { hashPercent } from './cekmood.js'
import { sendButtons } from '../../src/ui/buttons.js'

// Ramalan potensi penyakit dari nama: hiburan semata, BUKAN diagnosis
// medis. Selalu disertai penafian di hasilnya.
const RISKS = {
  id: [
    'Kurang tidur: sering begadang, coba atur jam istirahatmu.',
    'Masuk angin: gampang capek kalau kehujanan dan kurang makan.',
    'Sakit kepala karena kebanyakan layar: istirahatkan matamu berkala.',
    'Maag ringan kalau telat makan pas lagi sibuk-sibuknya.',
    'Pegal punggung karena kelamaan duduk: banyak bergerak dan stretching.',
    'Kurang minum air: kulit dan badan gampang dehidrasi.',
    'Stres menumpuk: butuh me time dan udara segar lebih sering.',
    'Sariawan saat imun turun: perbanyak vitamin C dan buah.',
  ],
  en: [
    'Lack of sleep: often up late, try fixing your rest schedule.',
    'Catching colds: you tire easily when rained on and skipping meals.',
    'Screen headaches: rest your eyes regularly.',
    'Mild stomach issues when eating late during busy times.',
    'Back aches from sitting too long: move and stretch more.',
    'Not drinking enough water: easy dehydration.',
    'Piling stress: you need me time and fresh air more often.',
    'Canker sores when immunity drops: more vitamin C and fruit.',
  ],
}

export const config = {
  name: 'potensipenyakit',
  alias: ['cekpenyakit'],
  category: 'fun',
  description: { id: 'Ramalan potensi penyakit dari nama (hiburan, bukan diagnosis)', en: 'Fortune of illness potential from a name (entertainment, not a diagnosis)' },
  usage: '.potensipenyakit <nama>',
  example: '.potensipenyakit Malik',
  cooldown: 3,
}

export const i18n = {
  id: {
    potensipenyakit: {
      title: 'Potensi Penyakit',
      hint: '╭─❏ 🩺 「 *POTENSI PENYAKIT* 」\n┊ Tulis namanya yaa~\n┊ Contoh: *.potensipenyakit Malik*\n╰━━━━━━━',
      body: '╭─❏ 🩺 「 *POTENSI PENYAKIT* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ {risk}\n┊\n┊ ᴄᴀᴛᴀᴛᴀɴ: ini cuma ramalan hiburan, bukan diagnosis medis. Kalau beneran sakit, ke dokter yaa~\n╰━━━━━━━',
      retryBtn: '🩺 Cek Lagi (.potensipenyakit {name})',
    },
  },
  en: {
    potensipenyakit: {
      title: 'Illness Potential',
      hint: '╭─❏ 🩺 「 *ILLNESS POTENTIAL* 」\n┊ Write the name please~\n┊ Example: *.potensipenyakit Malik*\n╰━━━━━━━',
      body: '╭─❏ 🩺 「 *ILLNESS POTENTIAL* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ {risk}\n┊\n┊ ɴᴏᴛᴇ: this is just an entertainment fortune, not a medical diagnosis. If you are really sick, see a doctor~\n╰━━━━━━━',
      retryBtn: '🩺 Check Again (.potensipenyakit {name})',
    },
  },
}

export const test = { input: '.potensipenyakit', expect: /nama|name/i }

export async function handler(ctx) {
  const name = (ctx.text || '').trim()
  if (!name) return ctx.reply(ctx.t('potensipenyakit.hint'))
  const risk = RISKS[ctx.lang]?.[hashPercent(`penyakit:${name.toLowerCase()}`) % RISKS.id.length] ?? RISKS.id[0]
  const body = ctx.t('potensipenyakit.body', { name, risk })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('potensipenyakit.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('potensipenyakit.retryBtn', { name }), id: `.potensipenyakit ${name}` }],
    textFallback: body,
  })
}
