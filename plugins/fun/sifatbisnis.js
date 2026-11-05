import { hashPercent } from './cekmood.js'
import { sendButtons } from '../../src/ui/buttons.js'

// Ramalan sifat bisnis dari nama: deterministik, buat seru-seruan.
const TRAITS = {
  id: [
    'Berani ambil risiko dan cepat membaca peluang pasar.',
    'Teliti soal uang, cocok buat bisnis yang butuh kerapian kas.',
    'Jago negosiasi, pelanggan gampang luluh sama omonganmu.',
    'Kreatif dan suka beda dari yang lain, brand-mu gampang diingat.',
    'Sabar dan konsisten, bisnismu tipe yang tumbuh pelan tapi pasti.',
    'Jiwa pemimpin kuat, cocok memimpin tim besar.',
    'Fleksibel dan cepat adaptasi, cocok di pasar yang berubah cepat.',
    'Perfeksionis, produkmu selalu rapi dan berkualitas.',
  ],
  en: [
    'Bold risk taker who spots market chances fast.',
    'Careful with money, great for businesses needing tidy books.',
    'A smooth negotiator, customers melt at your words.',
    'Creative and different, your brand is easy to remember.',
    'Patient and consistent, your business grows slowly but surely.',
    'Strong leader soul, great at leading big teams.',
    'Flexible and quick to adapt, perfect for fast-changing markets.',
    'A perfectionist, your products are always neat and high quality.',
  ],
}

export const config = {
  name: 'sifatbisnis',
  alias: ['bisnissifat'],
  category: 'fun',
  description: { id: 'Ramalan sifat bisnis seseorang dari namanya', en: 'Fortune of someone\'s business traits from their name' },
  usage: '.sifatbisnis <nama>',
  example: '.sifatbisnis Malik',
  cooldown: 3,
}

export const i18n = {
  id: {
    sifatbisnis: {
      title: 'Sifat Bisnis',
      hint: '╭─❏ 💼 「 *SIFAT BISNIS* 」\n┊ Tulis namanya yaa~ Contoh: .sifatbisnis Malik\n╰━━━━━━━',
      body: '╭─❏ 💼 「 *SIFAT BISNIS {name}* 」\n┊ {trait}\n┊ ꜱᴋᴏʀ ʀᴇᴢᴇᴋɪ ʙɪꜱɴɪꜱ: *{pct}%*\n╰━━━━━━━',
      retryBtn: '💼 Cek Lagi (.sifatbisnis {name})',
    },
  },
  en: {
    sifatbisnis: {
      title: 'Business Traits',
      hint: '╭─❏ 💼 「 *BUSINESS TRAITS* 」\n┊ Write the name please~ Example: .sifatbisnis Malik\n╰━━━━━━━',
      body: '╭─❏ 💼 「 *BUSINESS TRAITS OF {name}* 」\n┊ {trait}\n┊ ʙᴜꜱɪɴᴇꜱꜱ ʟᴜᴄᴋ ꜱᴄᴏʀᴇ: *{pct}%*\n╰━━━━━━━',
      retryBtn: '💼 Check Again (.sifatbisnis {name})',
    },
  },
}

export const test = { input: '.sifatbisnis Malik', expect: /SIFAT BISNIS Malik|BUSINESS TRAITS OF Malik/ }

export async function handler(ctx) {
  const name = (ctx.text || '').trim()
  if (!name) return ctx.reply(ctx.t('sifatbisnis.hint'))
  const trait = TRAITS[ctx.lang]?.[hashPercent(`bisnis:${name.toLowerCase()}`) % TRAITS.id.length] ?? TRAITS.id[0]
  const body = ctx.t('sifatbisnis.body', { name, trait, pct: hashPercent(`rejeki:${name.toLowerCase()}`) })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('sifatbisnis.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('sifatbisnis.retryBtn', { name }), id: `.sifatbisnis ${name}` }],
    textFallback: body,
  })
}
