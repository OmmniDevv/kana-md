// Dataset religi kecil: ayat dan hadits pendek yang masyhur, terjemahan
// ditulis ringkas. Dipakai perintah religi dan pengingat harian scheduler.
// Teks Al-Quran dan hadits adalah domain publik; terjemahan di sini parafrasa
// ringkas, bukan salinan terjemahan resmi.
export const ayat = [
  { text: 'Sesungguhnya sesudah kesulitan itu ada kemudahan.', source: 'QS. Asy-Syarh: 6' },
  { text: 'Allah tidak membebani seseorang melainkan sesuai kesanggupannya.', source: 'QS. Al-Baqarah: 286' },
  { text: 'Karena itu ingatlah kamu kepada-Ku, niscaya Aku ingat pula kepadamu.', source: 'QS. Al-Baqarah: 152' },
  { text: 'Hanya dengan mengingat Allah hati menjadi tenteram.', source: 'QS. Ar-Rad: 28' },
  { text: 'Jadikanlah sabar dan sholat sebagai penolongmu.', source: 'QS. Al-Baqarah: 45' },
  { text: 'Barang siapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya.', source: 'QS. Ath-Thalaq: 2' },
  { text: 'Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah nikmat kepadamu.', source: 'QS. Ibrahim: 7' },
  { text: 'Janganlah kamu bersikap lemah, dan janganlah bersedih hati, padahal kamulah orang-orang yang paling tinggi derajatnya jika kamu beriman.', source: 'QS. Ali Imran: 139' },
  { text: 'Berdoalah kepada-Ku, niscaya akan Aku kabulkan bagimu.', source: 'QS. Ghafir: 60' },
  { text: 'Dan apabila hamba-Ku bertanya tentang Aku, maka sesungguhnya Aku dekat.', source: 'QS. Al-Baqarah: 186' },
]

export const hadits = [
  { text: 'Sesungguhnya setiap amal tergantung pada niatnya.', source: 'HR. Bukhari dan Muslim' },
  { text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain.', source: 'HR. Thabrani' },
  { text: 'Senyummu di hadapan saudaramu adalah sedekah.', source: 'HR. Tirmidzi' },
  { text: 'Jangan marah, jangan marah, jangan marah.', source: 'HR. Bukhari' },
  { text: 'Kebersihan itu sebagian dari iman.', source: 'HR. Muslim' },
  { text: 'Menuntut ilmu itu wajib atas setiap muslim.', source: 'HR. Ibnu Majah' },
  { text: 'Sampaikanlah dariku walau hanya satu ayat.', source: 'HR. Bukhari' },
  { text: 'Orang yang kuat bukanlah yang pandai bergulat, melainkan yang mampu menahan dirinya saat marah.', source: 'HR. Bukhari dan Muslim' },
]

// Asmaul Husna: 99 nama Allah dengan ejaan latin dan arti ringkas Bahasa
// Indonesia. Urutan mengikuti daftar masyhur yang umum diajarkan.
export const ASMAUL_HUSNA = [
  ['Ar-Rahman', 'Maha Pengasih'], ['Ar-Rahim', 'Maha Penyayang'], ['Al-Malik', 'Maha Raja'],
  ['Al-Quddus', 'Maha Suci'], ['As-Salam', 'Maha Pemberi Keselamatan'], ['Al-Mukmin', 'Maha Pemberi Keamanan'],
  ['Al-Muhaimin', 'Maha Pemelihara'], ['Al-Aziz', 'Maha Perkasa'], ['Al-Jabbar', 'Maha Kuasa Memaksa'],
  ['Al-Mutakabbir', 'Maha Pemilik Keagungan'], ['Al-Khaliq', 'Maha Pencipta'], ['Al-Bari', 'Maha Pembuat'],
  ['Al-Mushawwir', 'Maha Pembentuk Rupa'], ['Al-Ghaffar', 'Maha Pengampun'], ['Al-Qahhar', 'Maha Penakluk'],
  ['Al-Wahhab', 'Maha Pemberi Karunia'], ['Ar-Razzaq', 'Maha Pemberi Rezeki'], ['Al-Fattah', 'Maha Pembuka'],
  ['Al-Alim', 'Maha Mengetahui'], ['Al-Qabidh', 'Maha Menyempitkan'], ['Al-Basith', 'Maha Melapangkan'],
  ['Al-Khafidh', 'Maha Merendahkan'], ['Ar-Rafi', 'Maha Meninggikan'], ['Al-Muizz', 'Maha Memuliakan'],
  ['Al-Mudzill', 'Maha Menghinakan'], ['As-Sami', 'Maha Mendengar'], ['Al-Bashir', 'Maha Melihat'],
  ['Al-Hakam', 'Maha Hakim'], ['Al-Adl', 'Maha Adil'], ['Al-Lathif', 'Maha Lembut'],
  ['Al-Khabir', 'Maha Waspada'], ['Al-Halim', 'Maha Penyantun'], ['Al-Azhim', 'Maha Agung'],
  ['Al-Ghafur', 'Maha Pengampun'], ['Asy-Syakur', 'Maha Pembalas Budi'], ['Al-Aliyy', 'Maha Tinggi'],
  ['Al-Kabir', 'Maha Besar'], ['Al-Hafizh', 'Maha Penjaga'], ['Al-Muqit', 'Maha Pemberi Kecukupan'],
  ['Al-Hasib', 'Maha Pembuat Perhitungan'], ['Al-Jalil', 'Maha Luhur'], ['Al-Karim', 'Maha Mulia'],
  ['Ar-Raqib', 'Maha Mengawasi'], ['Al-Mujib', 'Maha Mengabulkan'], ['Al-Wasi', 'Maha Luas'],
  ['Al-Hakim', 'Maha Bijaksana'], ['Al-Wadud', 'Maha Pengasih Sayang'], ['Al-Majid', 'Maha Mulia'],
  ['Al-Baits', 'Maha Membangkitkan'], ['Asy-Syahid', 'Maha Menyaksikan'], ['Al-Haqq', 'Maha Benar'],
  ['Al-Wakil', 'Maha Pemelihara Urusan'], ['Al-Qawiyy', 'Maha Kuat'], ['Al-Matin', 'Maha Kukuh'],
  ['Al-Waliyy', 'Maha Pelindung'], ['Al-Hamid', 'Maha Terpuji'], ['Al-Muhshi', 'Maha Menghitung'],
  ['Al-Mubdi', 'Maha Memulai'], ['Al-Muid', 'Maha Mengembalikan'], ['Al-Muhyi', 'Maha Menghidupkan'],
  ['Al-Mumit', 'Maha Mematikan'], ['Al-Hayy', 'Maha Hidup'], ['Al-Qayyum', 'Maha Berdiri Sendiri'],
  ['Al-Wajid', 'Maha Penemu'], ['Al-Maajid', 'Maha Pemilik Kemuliaan'], ['Al-Wahid', 'Maha Tunggal'],
  ['Al-Ahad', 'Maha Esa'], ['Ash-Shamad', 'Maha Tempat Bergantung'], ['Al-Qadir', 'Maha Kuasa'],
  ['Al-Muqtadir', 'Maha Berkuasa Penuh'], ['Al-Muqaddim', 'Maha Mendahulukan'],
  ['Al-Muakhkhir', 'Maha Mengakhirkan'], ['Al-Awwal', 'Maha Awal'], ['Al-Akhir', 'Maha Akhir'],
  ['Azh-Zhahir', 'Maha Nyata'], ['Al-Bathin', 'Maha Tersembunyi'], ['Al-Wali', 'Maha Pemimpin'],
  ['Al-Mutaali', 'Maha Tinggi'], ['Al-Barr', 'Maha Penderma'], ['At-Tawwab', 'Maha Penerima Taubat'],
  ['Al-Muntaqim', 'Maha Pembalas'], ['Al-Afuww', 'Maha Pemaaf'], ['Ar-Rauf', 'Maha Pengiba'],
  ['Malikul Mulk', 'Maha Penguasa Kerajaan'], ['Dzul Jalali wal Ikram', 'Maha Pemilik Keagungan dan Kemuliaan'],
  ['Al-Muqsith', 'Maha Pemberi Keadilan'], ['Al-Jami', 'Maha Pengumpul'], ['Al-Ghaniyy', 'Maha Kaya'],
  ['Al-Mughni', 'Maha Pemberi Kekayaan'], ['Al-Mani', 'Maha Pencegah'], ['Adh-Dharr', 'Maha Pemberi Mudarat'],
  ['An-Nafi', 'Maha Pemberi Manfaat'], ['An-Nur', 'Maha Bercahaya'], ['Al-Hadi', 'Maha Pemberi Petunjuk'],
  ['Al-Badi', 'Maha Pencipta Unik'], ['Al-Baqi', 'Maha Kekal'], ['Al-Warits', 'Maha Pewaris'],
  ['Ar-Rasyid', 'Maha Pandai'], ['Ash-Shabur', 'Maha Penyabar'],
].map(([latin, arti], i) => ({ no: i + 1, latin, arti }))

// Kisah ringkas 25 nabi: nama dan ringkasan kisah 2 sampai 3 kalimat,
// ditulis sendiri untuk KANA.
export const KISAH_NABI = [
  ['Adam', 'Nabi Adam adalah manusia pertama yang diciptakan Allah dari tanah. Ia tinggal di surga bersama Hawa, lalu diturunkan ke bumi setelah tergoda bujukan iblis. Dari beliau dan Hawa lahirlah keturunan manusia.'],
  ['Idris', 'Nabi Idris dikenal tekun beribadah dan mempelajari ilmu, termasuk menulis dan menjahit. Allah mengangkatnya ke tempat yang tinggi karena kesalehan dan kesabarannya.'],
  ['Nuh', 'Nabi Nuh berdakwah selama 950 tahun kepada kaum yang ingkar. Atas perintah Allah ia membuat kapal besar, dan banjir besar menenggelamkan orang-orang yang menolak, sedangkan orang beriman selamat di dalam kapal.'],
  ['Hud', 'Nabi Hud diutus kepada kaum Ad yang sombong dengan kekuatannya. Mereka menolak dakwahnya, lalu Allah menimpakan angin kencang yang membinasakan mereka.'],
  ['Shaleh', 'Nabi Shaleh diutus kepada kaum Tsamud dan diberi mukjizat unta betina yang keluar dari batu. Kaumnya justru membunuh unta itu, sehingga mereka dibinasakan dengan suara keras yang mengguntur.'],
  ['Ibrahim', 'Nabi Ibrahim mencari Tuhan yang sebenarnya dan menghancurkan berhala kaumnya. Ia hampir mengorbankan putranya Ismail karena perintah Allah, lalu diganti dengan hewan sembelihan. Bersama Ismail ia meninggikan fondasi Kakbah.'],
  ['Luth', 'Nabi Luth diutus kepada penduduk Sodom yang berperilaku sangat rusak. Mereka menolak peringatannya, lalu negeri mereka dijungkirbalikkan dan dihujani batu.'],
  ['Ismail', 'Nabi Ismail adalah putra Ibrahim yang sabar saat akan disembelih, peristiwa yang dikenang dalam Idul Adha. Ia membantu ayahnya membangun Kakbah dan menurunkan keturunan di Makkah.'],
  ['Ishaq', 'Nabi Ishaq adalah putra Ibrahim dari Sarah, lahir saat keduanya sudah tua sebagai kabar gembira dari Allah. Darinya lahir keturunan para nabi Bani Israil.'],
  ['Yakub', 'Nabi Yakub adalah putra Ishaq dan ayah dari 12 anak yang menjadi suku-suku Bani Israil. Ia sangat sabar saat kehilangan putra kesayangannya, Yusuf, selama bertahun-tahun.'],
  ['Yusuf', 'Nabi Yusuf bermimpi matahari, bulan, dan 11 bintang bersujud kepadanya. Ia dibuang saudara-saudaranya ke sumur, dijual, dipenjara, lalu menjadi pejabat tinggi Mesir yang menafsirkan mimpi raja dan akhirnya memaafkan saudara-saudaranya.'],
  ['Ayyub', 'Nabi Ayyub terkenal dengan kesabarannya menghadapi ujian penyakit dan kehilangan harta serta keluarga selama bertahun-tahun. Ia tidak pernah berhenti berdoa, lalu Allah menyembuhkannya dan mengganti nikmatnya.'],
  ['Syuaib', 'Nabi Syuaib diutus kepada penduduk Madyan yang curang dalam menakar dan menimbang. Ia mengajak mereka berlaku jujur dalam perdagangan dan menyembah Allah.'],
  ['Musa', 'Nabi Musa menerima wahyu di Bukit Thursina dan membawa Taurat. Dengan mukjizat tongkatnya, ia membelah Laut Merah untuk menyelamatkan Bani Israil dari kejaran Firaun.'],
  ['Harun', 'Nabi Harun adalah kakak Musa yang fasih berbicara dan menjadi pendamping dakwahnya menghadapi Firaun. Ia membantu Musa memimpin Bani Israil.'],
  ['Dzulkifli', 'Nabi Dzulkifli dikenal sangat sabar dan adil. Ia sanggup berpuasa di siang hari, beribadah di malam hari, dan memutuskan perkara tanpa pernah marah.'],
  ['Daud', 'Nabi Daud menerima kitab Zabur dan terkenal suaranya yang merdu saat bertasbih. Ia mengalahkan Jalut saat masih muda dan menjadi raja yang adil serta pandai membuat baju besi.'],
  ['Sulaiman', 'Nabi Sulaiman putra Daud diberi kerajaan besar, bisa memahami bahasa hewan dan memerintah angin serta jin. Ia terkenal sangat bijaksana, termasuk dalam kisahnya dengan Ratu Balqis.'],
  ['Ilyas', 'Nabi Ilyas diutus kepada kaum yang menyembah berhala Baal. Ia mengajak mereka kembali menyembah Allah Yang Esa dan meninggalkan penyembahan berhala.'],
  ['Ilyasa', 'Nabi Ilyasa meneruskan dakwah Ilyas kepada Bani Israil. Ia dikenal saleh dan sabar membimbing kaumnya.'],
  ['Yunus', 'Nabi Yunus meninggalkan kaumnya sebelum diperintah Allah, lalu ditelan ikan besar di laut. Di dalam perut ikan ia berdoa dengan penuh penyesalan, lalu Allah menyelamatkannya dan kaumnya beriman.'],
  ['Zakaria', 'Nabi Zakaria adalah pengasuh Maryam dan berdoa dengan sungguh-sungguh di usia tua. Allah mengabulkan doanya dengan kelahiran putranya, Yahya.'],
  ['Yahya', 'Nabi Yahya putra Zakaria dikenal sangat takwa sejak kecil dan diberi hikmah oleh Allah. Ia berdakwah mengajak kaumnya bertaubat dan hidup bersih.'],
  ['Isa', 'Nabi Isa lahir dari Maryam tanpa ayah sebagai mukjizat Allah dan menerima kitab Injil. Ia bisa berbicara saat bayi dan menyembuhkan orang sakit atas izin Allah.'],
  ['Muhammad', 'Nabi Muhammad adalah nabi terakhir, menerima wahyu pertama Al-Quran di Gua Hira pada usia 40 tahun. Beliau berdakwah di Makkah lalu hijrah ke Madinah, dan menjadi rahmat bagi seluruh alam.'],
].map(([nama, kisah]) => ({ nama, kisah }))

export default { ayat, hadits, ASMAUL_HUSNA, KISAH_NABI }
