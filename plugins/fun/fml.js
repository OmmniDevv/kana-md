const STORIES = [
  'Hari ini aku bangun kesiangan, lari ke halte, dan busnya lewat tepat di depan mata. Ternyata hari libur.',
  'Aku sudah antre kopi 20 menit, pas giliranku mesinnya rusak. Baristanya minta maaf sambil nyengir.',
  'Payung kubawa seminggu penuh tidak hujan. Sekali saja kutinggal, hujan badai satu kota.',
  'Aku wave ke orang yang kupikir temanku. Bukan. Kami berdua sama-sama malu sekarang.',
  'HP jatuh layar menghadap bawah. Aku angkat pelan-pelan seperti membuka hasil ujian.',
  'Kirim stiker lucu ke gebetan, terkirimnya ke grup keluarga. Grupnya malah ketawa.',
  'Masak mie instan telur dua, pas mau makan listrik padam. Makan mie gelap-gelapan romantis sendiri.',
  'Sudah dandan rapi buat foto KTP, hasilnya tetap seperti orang baru bangun tidur.',
  'Niat hemat bulan ini, tapi flash sale tidak pernah peduli pada niat orang.',
  'Aku lupa password akun yang baru kubuat lima menit lalu. Otakku memang edisi terbatas.',
]

export const config = {
  name: 'fml',
  alias: ['fuckmylife'],
  category: 'fun',
  description: { id: 'Cerita apes singkat acak ala FML buat bahan ketawa', en: 'A random short FML style unlucky story to laugh at' },
  usage: '.fml',
  example: '.fml',
  cooldown: 3,
}

export const i18n = {
  id: { fml: { body: '╭─❏ 😅 「 *FML HARI INI* 」\n┊ {story}\n┊\n┊ FML.\n╰━━━━━━━ {mood}' } },
  en: { fml: { body: '╭─❏ 😅 「 *FML TODAY* 」\n┊ {story}\n┊\n┊ FML.\n╰━━━━━━━ {mood}' } },
}

export const test = { input: '.fml', expect: /fml/i }

export async function handler(ctx) {
  const story = STORIES[Math.floor(Math.random() * STORIES.length)]
  return ctx.reply(ctx.t('fml.body', { story, mood: ctx.say('malu') }))
}
