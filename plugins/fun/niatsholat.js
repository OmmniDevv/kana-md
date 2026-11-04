import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'niatsholat',
  alias: ['niat'],
  category: 'fun',
  description: { id: 'Bacaan niat sholat wajib dan sunnah: arab, latin, dan artinya', en: 'Intention recitations for obligatory and sunnah prayers: arabic, latin, and meaning' },
  usage: '.niatsholat [subuh|dzuhur|ashar|maghrib|isya|tarawih|witir]',
  example: '.niatsholat subuh',
  cooldown: 3,
}

// Bacaan niat masyhur versi yang umum diajarkan di Indonesia (sebagai
// imam/makmum bisa ditambah kata imaman/ma'muman; versi dasar di sini
// untuk sholat sendiri/munfarid).
export const NIAT = {
  subuh: {
    label: 'Subuh (2 rakaat)',
    arab: 'أُصَلِّى فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushallii fardhash shubhi rak'ataini mustaqbilal qiblati adaa-an lillaahi ta'aalaa",
    arti: 'Aku niat sholat fardu Subuh dua rakaat menghadap kiblat karena Allah Ta\'ala',
  },
  dzuhur: {
    label: 'Dzuhur (4 rakaat)',
    arab: 'أُصَلِّى فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushallii fardhazh zhuhri arba'a raka'aatin mustaqbilal qiblati adaa-an lillaahi ta'aalaa",
    arti: 'Aku niat sholat fardu Dzuhur empat rakaat menghadap kiblat karena Allah Ta\'ala',
  },
  ashar: {
    label: 'Ashar (4 rakaat)',
    arab: 'أُصَلِّى فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushallii fardhal 'ashri arba'a raka'aatin mustaqbilal qiblati adaa-an lillaahi ta'aalaa",
    arti: 'Aku niat sholat fardu Ashar empat rakaat menghadap kiblat karena Allah Ta\'ala',
  },
  maghrib: {
    label: 'Maghrib (3 rakaat)',
    arab: 'أُصَلِّى فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushallii fardhal maghribi tsalaatsa raka'aatin mustaqbilal qiblati adaa-an lillaahi ta'aalaa",
    arti: 'Aku niat sholat fardu Maghrib tiga rakaat menghadap kiblat karena Allah Ta\'ala',
  },
  isya: {
    label: 'Isya (4 rakaat)',
    arab: 'أُصَلِّى فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushallii fardhal 'isyaa-i arba'a raka'aatin mustaqbilal qiblati adaa-an lillaahi ta'aalaa",
    arti: 'Aku niat sholat fardu Isya empat rakaat menghadap kiblat karena Allah Ta\'ala',
  },
  tarawih: {
    label: 'Tarawih (2 rakaat)',
    arab: 'أُصَلِّى سُنَّةَ التَّرَاوِيْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushallii sunnatat taraawiihi rak'ataini mustaqbilal qiblati adaa-an lillaahi ta'aalaa",
    arti: 'Aku niat sholat sunnah Tarawih dua rakaat menghadap kiblat karena Allah Ta\'ala',
  },
  witir: {
    label: 'Witir (1 rakaat)',
    arab: 'أُصَلِّى سُنَّةَ الْوِتْرِ رَكْعَةً مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushallii sunnatal witri rak'atan mustaqbilal qiblati adaa-an lillaahi ta'aalaa",
    arti: 'Aku niat sholat sunnah Witir satu rakaat menghadap kiblat karena Allah Ta\'ala',
  },
}

export const i18n = {
  id: {
    niatsholat: {
      title: 'Niat Sholat',
      body: '╭─❏ 🕌 「 *NIAT SHOLAT {label}* 」\n┊ {arab}\n┊\n┊ ʟᴀᴛɪɴ: {latin}\n┊\n┊ ᴀʀᴛɪɴʏᴀ: {arti}\n╰━━━━━━━',
      list: '╭─❏ 🕌 「 *PILIH NIAT SHOLAT* 」\n┊ • .niatsholat subuh\n┊ • .niatsholat dzuhur\n┊ • .niatsholat ashar\n┊ • .niatsholat maghrib\n┊ • .niatsholat isya\n┊ • .niatsholat tarawih\n┊ • .niatsholat witir\n╰━━━━━━━\nAtau pencet tombol di bawah yaa~',
      notFound: '╭─❏ 🕌 「 *NIAT TIDAK KETEMU* 」\n┊ Pilihan niatnya: subuh, dzuhur, ashar, maghrib, isya, tarawih, witir.\n┊ Contoh *.niatsholat subuh* yaa~\n╰━━━━━━━',
    },
  },
  en: {
    niatsholat: {
      title: 'Prayer Intentions',
      body: '╭─❏ 🕌 「 *PRAYER INTENTION {label}* 」\n┊ {arab}\n┊\n┊ ʟᴀᴛɪɴ: {latin}\n┊\n┊ ᴍᴇᴀɴɪɴɢ (Indonesian): {arti}\n╰━━━━━━━',
      list: '╭─❏ 🕌 「 *CHOOSE A PRAYER INTENTION* 」\n┊ • .niatsholat subuh\n┊ • .niatsholat dzuhur\n┊ • .niatsholat ashar\n┊ • .niatsholat maghrib\n┊ • .niatsholat isya\n┊ • .niatsholat tarawih\n┊ • .niatsholat witir\n╰━━━━━━━\nOr tap a button below~',
      notFound: '╭─❏ 🕌 「 *INTENTION NOT FOUND* 」\n┊ Intention choices: subuh, dzuhur, ashar, maghrib, isya, tarawih, witir.\n┊ Example *.niatsholat subuh*~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.niatsholat subuh', expect: /subuh/i }

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const keys = Object.keys(NIAT)
  const replies = keys.slice(0, 7).map((k) => ({ text: NIAT[k].label.split(' (')[0], id: `.niatsholat ${k}` }))
  if (!arg) {
    const body = ctx.t('niatsholat.list')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('niatsholat.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }
  const item = NIAT[arg]
  if (!item) {
    const body = ctx.t('niatsholat.notFound')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('niatsholat.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }
  const body = ctx.t('niatsholat.body', {
    label: item.label.toUpperCase(),
    arab: item.arab,
    latin: item.latin,
    arti: item.arti,
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('niatsholat.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: replies.filter((r) => r.id !== `.niatsholat ${arg}`),
    textFallback: body,
  })
}
