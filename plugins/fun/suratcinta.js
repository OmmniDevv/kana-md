import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'suratcinta',
  alias: ['surat'],
  category: 'fun',
  description: { id: 'Buatkan surat cinta alay super panjang ala long text untuk nama yang kamu sebut', en: 'Write a super long dramatic love letter for the name you mention' },
  usage: '.suratcinta [nama]',
  example: '.suratcinta Sinta',
  cooldown: 3,
}

// Surat cinta long text ala TikTok: disusun dari enam bagian (salam sayang
// bertumpuk, awal mula, rindu keseharian, janji hiperbolis, doa, penutup
// dramatis) yang tiap bagiannya punya beberapa varian. Hasil akhirnya
// selalu 600 kata ke atas, jauh lebih panjang dari versi lama yang cuma
// tiga kalimat.
const PARTS = {
  id: {
    vocative: 'Sayangku, cintaku, belahan jiwaku, detak jantungku, alasan di balik semua senyumku,',
    bridge: 'surat ini bukan surat biasa, ini adalah dokumen resmi dari hatiku yang sudah terlalu lama menyimpan semuanya sendirian, yang sudah capek berpura-pura biasa aja setiap kamu lewat, yang sudah menyerah buat terlihat tenang padahal isinya badai semua gara-gara kamu, jadi anggap saja surat ini sebagai pengakuan paling jujur yang pernah aku buat seumur hidupku, khusus untuk kamu dan hanya untuk kamu seorang. Dibaca sampai habis ya, tidak boleh setengah-setengah, karena perasaanku ke kamu juga tidak pernah setengah-setengah.',
    intro: [
      'surat ini aku tulis dengan tangan yang gemetar dan hati yang dari tadi tidak bisa diam. Kalau surat ini bisa bicara, dia pasti sudah teriak duluan karena terlalu penuh sama rasa yang selama ini cuma bisa aku simpan sendiri. Jadi tolong dibaca pelan-pelan ya, jangan diskip, karena setiap kata di sini lahir dari malam-malam panjang yang aku habiskan cuma buat mikirin kamu.',
      'surat ini mungkin kelihatan berlebihan, tapi biarin aja, karena rasa yang aku simpan buat kamu memang tidak pernah bisa ditulis dengan cara yang biasa-biasa aja. Aku nulis ini sambil senyum-senyum sendiri kayak orang aneh, dan jujur aku tidak malu, karena penyebabnya adalah kamu, orang paling favorit yang pernah dikasih semesta ke hidup aku.',
      'surat ini adalah bukti resmi bahwa ada satu manusia di dunia ini yang berhasil bikin aku kehilangan kata-kata sekaligus kelebihan kata-kata di waktu yang sama. Aku sudah nulis, hapus, nulis lagi, hapus lagi, sampai akhirnya aku sadar satu hal: surat buat kamu memang tidak akan pernah cukup satu halaman, karena kamunya sendiri sudah memenuhi seluruh bab di hidup aku.',
    ],
    awal: [
      'Aku masih ingat betul awal mula semuanya. Sejak pertama kali aku melihat senyummu, {name}, dunia yang tadinya biasa aja mendadak terasa jauh lebih lembut dan masuk akal. Langit kayak lebih biru, lagu-lagu cinta yang dulu aku anggap lebay tiba-tiba semuanya masuk akal dan terasa kayak ditulis khusus buat aku yang lagi jatuh cinta sama kamu. Teman-temanku sampai heran, katanya mukaku berubah, lebih sering senyum, lebih sering bengong, dan setiap bengong yang mereka lihat itu sembilan puluh sembilan persen isinya adalah kamu. Sejak hari itu aku paham, jatuh cinta ternyata bukan cuma soal deg-degan, tapi soal pulang ke seseorang yang bahkan belum tentu tahu kalau dia sudah jadi rumah.',
      'Kalau aku boleh jujur seribu persen, awalnya aku kira perasaanku ke kamu cuma kagum biasa, yang seminggu juga hilang. Ternyata aku salah besar. Hari berganti minggu, minggu berganti bulan, dan yang hilang justru akal sehatku setiap kali kamu muncul. Nama {name} yang awalnya cuma nama, sekarang berubah jadi doa yang paling sering aku ulang, jadi alasan aku semangat bangun pagi, dan jadi kalimat pertama yang dicari mataku setiap aku buka ponsel. Aku sudah coba bersikap biasa aja di depan kamu, tapi hatiku selalu berkhianat, dia berdetak paling kencang justru di saat aku lagi pura-pura tenang.',
      'Dulu aku sering ketawa kalau dengar orang bilang cinta pandangan pertama itu nyata. Sampai akhirnya aku mengalaminya sendiri gara-gara kamu, {name}. Satu pertemuan sederhana yang harusnya cepat terlupakan, malah menetap jadi adegan favorit yang diputar ulang kepalaku setiap malam sebelum tidur. Caramu bicara, caramu tertawa, bahkan caramu diam, semuanya terekam rapi kayak film yang tidak pernah bosan aku tonton. Sejak itu aku berhenti meremehkan kata takdir, karena kalau bukan takdir, kenapa dari sekian miliar manusia di bumi, hatiku harus nyangkutnya ke kamu.',
    ],
    rindu: [
      'Kamu tahu tidak, bahagiaku itu sekarang ukurannya sederhana banget: selama ada kabar dari kamu, hariku aman. Satu pesan singkat darimu bisa memperbaiki hari yang paling berantakan sekalipun, dan sebaliknya, sehari tanpa kabar darimu rasanya kayak langit lupa nurunin matahari. Aku rindu bahkan di saat kita baru aja selesai ngobrol, aku kangen bahkan sama hal-hal kecil kayak caramu menulis titik tiga, caramu bilang iya, caramu ketawa lewat teks yang hurufnya acak-acakan itu. Kalau rindu ini bisa ditimbang, timbangan di pasar pun bakal menyerah dan minta ampun.',
      'Setiap malam sebelum tidur, ritualku selalu sama: menatap langit-langit kamar sambil mikirin kamu, terus senyum, terus gelisah, terus berdoa. Aku ini kelihatannya aja kuat, padahal aslinya lemah banget sama yang namanya kangen. Lagu yang lewat di radio bisa bikin aku ingat kamu, tempat yang pernah kita datangi bisa bikin aku berhenti cuma buat mengenang, bahkan aroma hujan pun sekarang punya efek samping bernama {name}. Dunia ini isinya pengingat tentang kamu semua, dan anehnya aku tidak pernah merasa keberatan sama sekali.',
      'Jarak itu sebenarnya tidak jauh, tapi rasa kangen selalu berhasil bikin dia terasa kayak beda benua. Aku sering ngomong ke diri sendiri buat sabar, tapi hati ini bandel, dia maunya kamu sekarang juga, di sini, di dekatku. Makanya jangan heran kalau aku suka tiba-tiba nanya kamu lagi apa, sudah makan belum, capek tidak. Itu semua bukan basa-basi, itu adalah cara paling sopan dari kalimat aku kangen kamu yang sebenarnya pengin aku teriakkan setiap jam.',
    ],
    janji: [
      'Dengerin janji alayku baik-baik ya, {name}. Kalau suatu hari dunia lagi jahat sama kamu, aku yang akan berdiri paling depan. Kalau kamu capek, bahuku selalu ledakan persediaan, tidak akan pernah habis khusus buat kamu sandaran. Kalau kamu sedih, aku siap jadi badut paling tidak lucu asal air matamu berhenti. Aku akan selalu ada di versimu yang paling berantakan sekalipun, di hari kamu merasa tidak berharga, aku akan jadi pengingat paling keras kepala bahwa kamu itu sangat, sangat berharga, minimal di mata satu orang yang lagi nulis surat ini sambil menahan rindu yang tidak masuk akal.',
      'Aku tidak bisa janji hidup kita bakal selalu mulus kayak jalan tol baru, tapi aku janji satu hal yang paling penting: kamu tidak akan pernah jalan sendirian. Badai boleh datang, masalah boleh antri, orang boleh berubah, tapi posisiku tetap, di samping kamu. Matahari boleh terbit dari timur setiap hari dengan bosannya, tapi cintaku ke kamu tidak akan pernah masuk fase bosan. Bahkan kalau nanti kita sudah tua dan rambut sudah sama-sama memutih, aku tetap bakal jadi orang yang paling heboh setiap kamu masuk ruangan, persis kayak hari pertama aku jatuh cinta.',
      'Orang-orang boleh bilang aku lebay, aku bucin, aku berlebihan. Biarin. Mereka tidak tahu rasanya punya seseorang yang kehadirannya bisa bikin doa jadi lebih panjang dan mimpi jadi lebih berani. Demi kamu, aku rela jadi orang paling alay sedunia, rela dicengin satu grup, rela dibilang drama, asal ujungnya kamu tahu satu fakta yang tidak akan pernah berubah: di semesta yang luasnya tidak ketahuan ini, pilihanku selalu kamu, lagi, lagi, dan lagi, tanpa perlu mikir dua kali, tanpa perlu jeda, tanpa kadaluarsa.',
    ],
    doa: [
      'Setiap aku berdoa, namamu selalu ikut, tidak pernah absen, tidak pernah aku lupa. Aku minta kamu sehat, aku minta kamu bahagia, aku minta semua urusanmu dimudahkan, dan di bagian paling akhir, dengan suara paling pelan, aku selalu menyelipkan satu harapan kecil: semoga semesta berbaik hati menyatukan langkah kita di jalan yang baik. Aku tahu aku bukan orang yang sempurna, banyak kurangnya, banyak ngambeknya, tapi untuk urusan menyayangi kamu, aku ini murid paling rajin yang tidak pernah bolos satu hari pun.',
      'Aku sadar aku tidak punya kuasa atas masa depan, makanya aku titipkan kamu ke yang Maha Menjaga lewat doa-doa tengah malamku. Kalau suatu hari aku tidak bisa ada di dekatmu secara fisik, biarlah doaku yang jadi selimut paling hangat buat perjalananmu. Dan kalau takdir ternyata berkata lain, aku akan tetap bersyukur pernah dikasih kesempatan mengenal seseorang seistimewa kamu, seseorang yang namanya akan selalu jadi bab favorit yang tidak akan pernah aku skip setiap kali aku membuka kembali buku hidupku.',
      'Kamu itu anugerah yang tidak pernah aku minta secara spesifik, tapi selalu aku syukuri secara berlebihan. Makanya aku jaga perasaanku baik-baik, aku rawat dia kayak tanaman paling langka, disiram pakai sabar, dipupuk pakai setia, dan dijauhkan dari segala hal yang bisa bikin dia layu. Karena buat aku, mencintai kamu bukan fase, bukan tren, bukan iseng-iseng berhadiah. Ini keputusan sadar yang aku ambil setiap hari dengan senyum paling lebar dan hati paling yakin.',
    ],
    depan: [
      'Kalau aku membayangkan masa depan, isinya selalu ada kamu di setiap adegannya. Aku membayangkan kita tertawa karena hal-hal receh di rumah kecil yang hangat, membayangkan aku yang selalu pulang dengan cerita dan kamu yang selalu pulang dengan senyum, membayangkan tahun-tahun yang lewat tanpa berhasil mengurangi rasa ini barang sedikit pun. Dunia boleh berubah secepat apa pun, kota boleh berganti wajah, tren boleh datang dan pergi, tapi di semua versi masa depan yang aku bayangkan, pemeran utamanya tidak pernah ganti: selalu aku, selalu kamu, selalu kita yang saling memilih setiap hari tanpa bosan.',
      'Aku sering berandai-andai tentang hari-hari yang belum datang. Tentang pagi-pagi sederhana di mana hal pertama yang aku lihat adalah wajah kamu, tentang perjalanan jauh yang kita tempuh sambil berdebat kecil soal lagu, tentang mimpi-mimpi besar yang kita kejar bareng-bareng sampai satu per satu jadi nyata. Kedengarannya memang kayak skenario film paling romantis, tapi aku serius, {name}, karena sejak ada kamu, masa depan yang tadinya menakutkan berubah jadi sesuatu yang paling aku tunggu-tunggu dengan hati yang penuh dan senyum yang tidak bisa aku tahan.',
      'Suatu hari nanti, kalau kita sudah melewati banyak musim dan rambut mulai berubah warna, aku ingin kita duduk berdua sambil membuka lagi surat alay ini dan tertawa bareng. Tertawa karena betapa lebaynya aku dulu, dan tertawa karena ternyata semua janji hiperbolis di surat ini benar-benar kejadian. Aku ingin jadi orang yang menua bersamamu dengan anggun, yang ceritanya tidak pernah kehabisan bab seru, yang cintanya tidak pernah turun kelas dari cinta pertama menjadi sekadar kebiasaan.',
    ],
    outro: [
      'Sudah ya, suratnya aku akhiri sebelum aku makin tidak terkendali dan berakhir menulis satu novel penuh. Simpan surat ini baik-baik, anggap saja ini peluk versi tulisan yang bisa kamu buka lagi kapan pun kamu butuh diyakinkan bahwa ada seseorang yang sayangnya ke kamu sebesar ini. Terima kasih sudah lahir ke dunia, terima kasih sudah hadir ke hidupku, dan terima kasih sudah jadi alasan paling manis dari semua hari baikku. Aku sayang kamu, hari ini, besok, dan di semua hari yang belum sempat kita beri nama.',
      'Sebelum surat ini benar-benar selesai, satu kalimat terakhir yang paling penting: jangan pernah ragu sama perasaanku, karena keraguanmu adalah satu-satunya hal di dunia ini yang tidak punya dasar sama sekali. Aku di sini, selalu di sini, dengan versi cinta paling tulus yang aku punya. Kalau suatu hari kamu membaca ulang surat ini sambil tersenyum, berarti misiku berhasil, dan kalau kamu sampai menangis, itu pasti karena kamu akhirnya percaya betapa dalamnya rasa ini.',
      'Akhir kata, kalau surat ini adalah lagu, kamu adalah seluruh lirik dan melodinya. Kalau surat ini adalah rumah, kamu adalah lampunya yang bikin semuanya terasa hangat. Dan kalau surat ini adalah perjalanan, kamu adalah tujuannya, bukan sekadar tempat singgah. Jadi tolong, tetaplah jadi kamu yang aku kenal, karena versi kamu yang itu adalah versi favoritku dari seluruh manusia yang pernah aku temui di muka bumi ini.',
    ],
    sign: [
      'Dari seseorang yang diam-diam selalu memperhatikanmu dan terang-terangan selalu menyayangimu.',
      'Dari pengagum tidak rahasiamu, yang doanya selalu menyebut namamu paling pertama.',
      'Dari orang yang paling beruntung sedunia karena pernah dipertemukan sama kamu.',
    ],
    anon: 'seseorang',
  },
  en: {
    vocative: 'My love, my darling, my other half, my heartbeat, the reason behind all of my smiles,',
    bridge: 'this is not an ordinary letter, this is an official document from my heart that has kept everything to itself for far too long, that is tired of pretending to be normal every time you pass by, that has given up on looking calm while inside it is all storms because of you, so please treat this letter as the most honest confession I have ever made in my entire life, made specially for you and only for you. Read it to the very end, no stopping halfway, because my feelings for you have never been halfway either.',
    intro: [
      'I am writing this letter with trembling hands and a heart that refuses to calm down. If this letter could speak, it would scream first, because it is stuffed with feelings I have been keeping to myself for far too long. So please read it slowly, do not skip a single line, because every word here was born from long nights I spent thinking only about you.',
      'this letter might look over the top, but let it be, because what I feel for you has never been something that could be written in an ordinary way. I wrote this while smiling like a fool, and honestly I am not ashamed, because the reason is you, the most favorite person the universe has ever handed to my life.',
      'this letter is official proof that one human in this world managed to make me run out of words and overflow with words at the very same time. I wrote, deleted, wrote again, deleted again, until I finally realized one thing: a letter for you could never fit on one page, because you alone already fill every chapter of my life.',
    ],
    awal: [
      'I still remember exactly how everything began. Since the first time I saw your smile, {name}, the world that used to feel ordinary suddenly became so much softer and made so much more sense. The sky looked bluer, every love song I used to call cheesy suddenly made sense and felt like it was written for me falling in love with you. My friends kept asking why my face changed, why I smile more, why I daydream more, and ninety nine percent of those daydreams are filled with you. Since that day I understood, falling in love is not just about butterflies, it is about coming home to someone who may not even know they have become a home.',
      'If I may be one thousand percent honest, at first I thought what I felt for you was ordinary admiration that would vanish in a week. I was completely wrong. Days turned into weeks, weeks turned into months, and the only thing that vanished was my common sense every time you showed up. Your name, {name}, which used to be just a name, has turned into the prayer I repeat the most, the reason I wake up excited, and the first thing my eyes look for every time I open my phone. I have tried to act normal in front of you, but my heart always betrays me, it beats the loudest exactly when I pretend to be calm.',
      'I used to laugh when people said love at first sight is real. Until I experienced it myself because of you, {name}. One simple meeting that should have been forgotten quickly settled in as my favorite scene, replayed by my head every night before I sleep. The way you talk, the way you laugh, even the way you go quiet, everything is recorded neatly like a movie I never get tired of watching. Since then I stopped doubting destiny, because if not destiny, why out of billions of people on earth did my heart have to land on you.',
    ],
    rindu: [
      'Do you know that my happiness is measured very simply now: as long as there is news from you, my day is safe. One short message from you can fix the messiest day, and the opposite, a day without hearing from you feels like the sky forgot to raise the sun. I miss you even right after we finish talking, I miss even the little things like the way you type three dots, the way you say yes, the way you laugh through messy letters in text. If this longing could be weighed, every scale in the market would give up and beg for mercy.',
      'Every night before I sleep, my ritual is always the same: staring at the ceiling while thinking about you, then smiling, then restless, then praying. I may look strong, but I am honestly very weak against missing you. A song on the radio can remind me of you, a place we once visited can stop me just to remember, even the smell of rain now has a side effect named {name}. This world is full of reminders of you, and strangely I never mind it at all.',
      'The distance is actually not far, but missing you always manages to make it feel like different continents. I keep telling myself to be patient, but this heart is stubborn, it wants you right now, right here, close to me. So do not be surprised if I suddenly ask what you are doing, whether you have eaten, whether you are tired. None of that is small talk, it is the most polite version of I miss you that I actually want to shout every hour.',
    ],
    janji: [
      'Listen to my dramatic promises carefully, {name}. If one day the world is cruel to you, I will be standing at the very front. If you are tired, my shoulder has an endless supply and it will never run out just for you to lean on. If you are sad, I am ready to be the least funny clown as long as your tears stop. I will be there even in your messiest version, on the day you feel worthless, I will be the most stubborn reminder that you are very, very precious, at least in the eyes of the one person writing this letter while holding back an unreasonable amount of longing.',
      'I cannot promise our life will always be smooth like a brand new highway, but I promise the most important thing: you will never walk alone. Storms may come, problems may queue up, people may change, but my position stays, right beside you. The sun may rise from the east every day out of boredom, but my love for you will never enter a boring phase. Even when we are old and our hair has both turned white, I will still be the most excited person every time you walk into a room, exactly like the first day I fell in love.',
      'People may call me dramatic, whipped, over the top. Let them. They do not know how it feels to have someone whose presence makes prayers longer and dreams braver. For you, I am willing to be the most dramatic person in the world, willing to be teased by the whole group chat, willing to be called extra, as long as in the end you know one fact that will never change: in this impossibly wide universe, my choice is always you, again, again, and again, without thinking twice, without pause, without expiry date.',
    ],
    doa: [
      'Every time I pray, your name is always there, never absent, never forgotten. I ask for your health, I ask for your happiness, I ask for all your matters to be eased, and at the very end, in the quietest voice, I always slip in one small hope: may the universe be kind enough to unite our steps on a good path. I know I am not perfect, I have many flaws, but when it comes to loving you, I am the most diligent student who never skips a single day.',
      'I realize I have no power over the future, so I entrust you to the Greatest Guardian through my midnight prayers. If one day I cannot be physically near you, let my prayers be the warmest blanket for your journey. And if destiny turns out differently, I will still be grateful to have known someone as special as you, someone whose name will always be the favorite chapter I never skip whenever I reopen the book of my life.',
      'You are a gift I never specifically asked for, but always thank excessively. That is why I guard this feeling carefully, I tend it like the rarest plant, watered with patience, fertilized with loyalty, and kept away from anything that could make it wither. Because for me, loving you is not a phase, not a trend, not a casual game. It is a conscious decision I make every day with the widest smile and the most certain heart.',
    ],
    depan: [
      'When I imagine the future, you are in every single scene of it. I imagine us laughing at silly little things in a small warm home, imagine me always coming home with stories and you always coming home with a smile, imagine years passing without ever reducing this feeling even a little. The world may change as fast as it wants, cities may change their faces, trends may come and go, but in every version of the future I picture, the lead roles never change: always me, always you, always us choosing each other every day without ever getting bored.',
      'I often daydream about the days that have not come yet. About simple mornings where the first thing I see is your face, about long trips we take while playfully arguing about songs, about big dreams we chase together until one by one they come true. It may sound like the script of the most romantic movie, but I am serious, {name}, because since you arrived, the future that used to scare me turned into the thing I look forward to the most, with a full heart and a smile I cannot hold back.',
      'One day, after we have passed many seasons and our hair starts changing color, I want us to sit together, open this dramatic letter again, and laugh together. Laugh at how over the top I used to be, and laugh because every hyperbolic promise in this letter actually came true. I want to be the person who grows old with you gracefully, whose story never runs out of exciting chapters, whose love never downgrades from first love into mere habit.',
    ],
    outro: [
      'Alright, I will end this letter before I lose control and end up writing an entire novel. Keep this letter safe, think of it as a hug in written form that you can reopen whenever you need to be convinced that someone loves you this much. Thank you for being born into this world, thank you for arriving in my life, and thank you for being the sweetest reason behind all of my good days. I love you, today, tomorrow, and on all the days we have not named yet.',
      'Before this letter truly ends, one last most important sentence: never doubt my feelings, because your doubt is the only thing in this world with absolutely no basis at all. I am here, always here, with the most sincere version of love I have. If one day you reread this letter while smiling, my mission succeeded, and if you end up crying, it must be because you finally believe how deep this feeling is.',
      'Finally, if this letter were a song, you would be all of its lyrics and melody. If this letter were a house, you would be its lamp that makes everything feel warm. And if this letter were a journey, you would be the destination, not just a stop along the way. So please, stay the you that I know, because that version of you is my favorite version of every human I have ever met on this earth.',
    ],
    sign: [
      'From someone who quietly always watches over you and openly always loves you.',
      'From your not so secret admirer, whose prayers always mention your name first.',
      'From the luckiest person in the world for having been allowed to meet you.',
    ],
    anon: 'someone',
  },
}

export const i18n = {
  id: {
    suratcinta: {
      title: 'Surat Cinta',
      body: '╭─❏ 💌 「 *SURAT CINTA UNTUK {name}* 」\n┊ {letter}\n┊ Dibuatkan khusus sama Kana~\n╰━━━━━━━ {mood}',
      btnAgain: '💌 Buat Lagi',
      dear: 'Untuk {name} tersayang,',
    },
  },
  en: {
    suratcinta: {
      title: 'Love Letter',
      body: '╭─❏ 💌 「 *A LOVE LETTER FOR {name}* 」\n┊ {letter}\n┊ Written specially by Kana~\n╰━━━━━━━ {mood}',
      btnAgain: '💌 Write Again',
      dear: 'For my dearest {name},',
    },
  },
}

export const test = { input: '.suratcinta Sinta', expect: /belahan jiwaku/i }

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const fill = (text, name) => text.replaceAll('{name}', name)
const wordCount = (text) => String(text).split(/\s+/).filter(Boolean).length

// Susun surat lengkap; diekspor supaya bisa diuji panjang dan gayanya.
export function buildLetter(lang, name, dearText) {
  const parts = PARTS[lang] ?? PARTS.id
  const sections = [parts.intro, parts.awal, parts.rindu, parts.janji, parts.doa, parts.depan ?? parts.outro, parts.outro]
  const body = sections.map((pool) => fill(pick(pool), name)).join('\n\n')
  const letter = `${dearText}\n\n${parts.vocative} ${parts.bridge}\n\n${body}\n\n${fill(pick(parts.sign), name)}`
  return letter
}

export async function handler(ctx) {
  const parts = PARTS[ctx.lang] ?? PARTS.id
  const name = (ctx.text || '').trim().slice(0, 40) || parts.anon
  const letter = buildLetter(ctx.lang, name, ctx.t('suratcinta.dear', { name }))
  const body = ctx.t('suratcinta.body', { name, letter, mood: ctx.say('malu') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('suratcinta.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('suratcinta.btnAgain'), id: `.suratcinta ${name}` },
    ],
    textFallback: body,
  })
}

export { wordCount }
