import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'doaharian',
  alias: ['doa'],
  category: 'fun',
  description: { id: 'Doa sehari-hari: arab, latin, dan artinya untuk aktivitas harian', en: 'Daily duas: arabic, latin, and meaning for everyday activities' },
  usage: '.doaharian [kata kunci, contoh: makan, tidur, rumah, masjid]',
  example: '.doaharian tidur',
  cooldown: 3,
}

// Doa harian masyhur (domain publik), transliterasi dan arti ringkas.
export const DOA = [
  { key: 'sebelum makan', aliases: ['makan', 'sebelum makan'], arab: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ', latin: "Bismillaahi wa 'alaa barakatillaah", arti: 'Dengan nama Allah dan atas keberkahan Allah' },
  { key: 'sesudah makan', aliases: ['setelah makan', 'sesudah makan', 'kenyang'], arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ', latin: "Alhamdu lillaahil ladzii ath'amanaa wa saqaanaa wa ja'alanaa muslimiin", arti: 'Segala puji bagi Allah yang memberi kami makan dan minum serta menjadikan kami muslim' },
  { key: 'sebelum tidur', aliases: ['tidur', 'sebelum tidur', 'mau tidur'], arab: 'بِسْمِكَ اللَّهُمَّ أَحْيَا وَبِسْمِكَ أَمُوتُ', latin: 'Bismika allaahumma ahyaa wa bismika amuut', arti: 'Dengan nama-Mu ya Allah aku hidup dan dengan nama-Mu aku mati' },
  { key: 'bangun tidur', aliases: ['bangun', 'bangun tidur', 'pagi'], arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', latin: "Alhamdu lillaahil ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin nusyuur", arti: 'Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan' },
  { key: 'masuk rumah', aliases: ['masuk rumah', 'pulang'], arab: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا', latin: "Bismillaahi walajnaa wa bismillaahi kharajnaa wa 'alaa rabbinaa tawakkalnaa", arti: 'Dengan nama Allah kami masuk dan dengan nama Allah kami keluar, dan kepada Tuhan kami, kami bertawakal' },
  { key: 'keluar rumah', aliases: ['keluar rumah', 'pergi'], arab: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', latin: "Bismillaahi tawakkaltu 'alallaahi laa haula wa laa quwwata illaa billaah", arti: 'Dengan nama Allah, aku bertawakal kepada Allah, tiada daya dan kekuatan kecuali dengan pertolongan Allah' },
  { key: 'masuk masjid', aliases: ['masuk masjid', 'masjid'], arab: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', latin: 'Allaahummaftah lii abwaaba rahmatik', arti: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu' },
  { key: 'keluar masjid', aliases: ['keluar masjid'], arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', latin: 'Allaahumma innii as-aluka min fadlik', arti: 'Ya Allah, sesungguhnya aku memohon kepada-Mu sebagian dari karunia-Mu' },
  { key: 'naik kendaraan', aliases: ['kendaraan', 'naik kendaraan', 'perjalanan'], arab: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', latin: 'Subhaanal ladzii sakhkhara lanaa haadzaa wa maa kunnaa lahuu muqriniin', arti: 'Mahasuci Allah yang menundukkan kendaraan ini untuk kami, padahal kami sebelumnya tidak mampu menguasainya' },
  { key: 'bercermin', aliases: ['cermin', 'bercermin', 'ngaca'], arab: 'اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي', latin: 'Allaahumma kamaa hassanta khalqii fahassin khuluqii', arti: 'Ya Allah, sebagaimana Engkau membaguskan rupaku, baguskanlah pula akhlakku' },
  { key: 'memakai pakaian', aliases: ['pakaian', 'baju', 'memakai pakaian'], arab: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', latin: "Alhamdu lillaahil ladzii kasaanii haadzaa wa razaqaniihi min ghairi haulin minnii wa laa quwwah", arti: 'Segala puji bagi Allah yang memakaikan pakaian ini kepadaku dan memberiku rezeki tanpaku daya dan kekuatan dariku' },
  { key: 'untuk orang tua', aliases: ['orang tua', 'ortu', 'ibu bapak', 'kedua orang tua'], arab: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', latin: 'Rabbir hamhumaa kamaa rabbayaanii shaghiiraa', arti: 'Ya Tuhanku, sayangilah keduanya sebagaimana mereka berdua mendidikku di waktu kecil' },
  { key: 'masuk kamar mandi', aliases: ['masuk wc', 'masuk kamar mandi', 'toilet'], arab: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', latin: "Allaahumma innii a'uudzu bika minal khubutsi wal khabaa-its", arti: 'Ya Allah, aku berlindung kepada-Mu dari godaan setan laki-laki dan perempuan' },
  { key: 'keluar kamar mandi', aliases: ['keluar wc', 'keluar kamar mandi'], arab: 'غُفْرَانَكَ', latin: 'Ghufraanak', arti: 'Aku memohon ampunan-Mu' },
]

export const i18n = {
  id: {
    doaharian: {
      title: 'Doa Harian',
      body: '🤲 DOA {judul}\n\n{arab}\n\nLatin: {latin}\n\nArtinya: {arti}',
      listTitle: '🤲 DAFTAR DOA HARIAN\n',
      listHint: '\n\nPakai .doaharian <kata kunci>, contoh .doaharian tidur yaa~',
      notFound: 'KANA tidak menemukan doa dengan kata kunci "{q}". Coba .doaharian untuk lihat daftarnya yaa~',
      niatBtn: '🕌 Niat Sholat',
      asmaBtn: '📜 Asmaul Husna',
    },
  },
  en: {
    doaharian: {
      title: 'Daily Duas',
      body: '🤲 DUA FOR {judul}\n\n{arab}\n\nLatin: {latin}\n\nMeaning (Indonesian): {arti}',
      listTitle: '🤲 LIST OF DAILY DUAS\n',
      listHint: '\n\nUse .doaharian <keyword>, for example .doaharian tidur~',
      notFound: 'KANA could not find a dua with keyword "{q}". Try .doaharian to see the list~',
      niatBtn: '🕌 Prayer Intentions',
      asmaBtn: '📜 Asmaul Husna',
    },
  },
}

export const test = { input: '.doaharian tidur', expect: /tidur/i }

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const replies = [
    { text: ctx.t('doaharian.niatBtn'), id: '.niatsholat' },
    { text: ctx.t('doaharian.asmaBtn'), id: '.asmaulhusna' },
  ]
  if (!arg) {
    const lines = DOA.map((d) => `• ${d.key}`)
    const body = ctx.t('doaharian.listTitle') + lines.join('\n') + ctx.t('doaharian.listHint')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('doaharian.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }
  const item = DOA.find((d) => d.aliases.some((a) => arg.includes(a) || a.includes(arg)))
  if (!item) {
    const body = ctx.t('doaharian.notFound', { q: arg })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('doaharian.title'),
      body,
      footer: ctx.t('menu.footer'),
      replies,
      textFallback: body,
    })
  }
  const body = ctx.t('doaharian.body', {
    judul: item.key.toUpperCase(),
    arab: item.arab,
    latin: item.latin,
    arti: item.arti,
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('doaharian.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}
