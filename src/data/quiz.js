// Dataset kuis KANA: semua soal ditulis sendiri untuk bot ini.
// Bentuk item pilihan ganda: { q: {id, en}, options: [{id, en} x4], answer: indeks, points }.
// Family100 beda: { q: {id, en}, answers: [{ text: {id, en}, points }] } jawaban teks bebas.

const mc = (qid, qen, opts, answer, points = 10) => ({
  q: { id: qid, en: qen },
  options: opts.map(([id, en]) => ({ id, en })),
  answer,
  points,
})

export const QUIZ_SETS = {
  caklontong: [
    mc('Hewan apa yang paling sederhana hidupnya?', 'Which animal lives the simplest life?', [['Ala kadal-nya', 'The ca-dal one'], ['Kucing garong', 'A stray cat'], ['Ayam kampung', 'A free range chicken'], ['Bebek kaleyo', 'A calm duck']], 0),
    mc('Kenapa pohon kelapa di depan rumah harus ditebang?', 'Why must the coconut tree in front of the house be cut down?', [['Tidak bisa dipanjat', 'It cannot be climbed'], ['Karena kalau dicabut berat', 'Because pulling it out is heavy'], ['Daunnya rontok', 'Its leaves keep falling'], ['Buahnya habis', 'It ran out of fruit']], 1),
    mc('Sayur apa yang bisa nyanyi?', 'Which vegetable can sing?', [['Kolplay', 'Coleslaw-play'], ['Bayam', 'Spinach'], ['Wortel', 'Carrot'], ['Kangkung', 'Water spinach']], 0),
    mc('Buah apa yang paling kaya?', 'Which fruit is the richest?', [['Srikaya', 'Sugar apple, the rich one'], ['Mangga', 'Mango'], ['Durian', 'Durian'], ['Nanas', 'Pineapple']], 0),
    mc('Kenapa kucing tidak pernah ikut ujian?', 'Why does a cat never take an exam?', [['Karena takut nilainya meong-ker', 'It fears a meow-serable grade'], ['Karena malas belajar', 'It is too lazy to study'], ['Karena tidak punya pensil', 'It has no pencil'], ['Karena sekolahnya jauh', 'Its school is far']], 0),
    mc('Ikan apa yang bisa terbang?', 'Which fish can fly?', [['Lele-lawar, eh lelawar', 'A bat, sort of a flying fish'], ['Ikan mas', 'Goldfish'], ['Ikan cupang', 'Betta fish'], ['Ikan tongkol', 'Mackerel tuna']], 0),
    mc('Kenapa sepeda tidak bisa berdiri sendiri?', 'Why can a bicycle not stand on its own?', [['Karena dia two-tired, alias lelah beroda dua', 'Because it is two-tired'], ['Karena rodanya kempes', 'Because its tire is flat'], ['Karena tidak punya kaki', 'Because it has no legs'], ['Karena sandarannya hilang', 'Because its kickstand is gone']], 0),
    mc('Hewan apa yang jago berenang tapi selalu basah?', 'Which animal swims well but is always wet?', [['Ikan, ya jelas basah terus', 'A fish, obviously always wet'], ['Bebek', 'A duck'], ['Katak', 'A frog'], ['Penyu', 'A turtle']], 0),
    mc('Kenapa matahari tidak pernah kuliah?', 'Why does the sun never go to college?', [['Karena sudah punya banyak gelar, panas-panasnya', 'It already has millions of degrees'], ['Karena bangunnya siang', 'It wakes up late'], ['Karena tidak lulus seleksi', 'It failed the entrance test'], ['Karena kampusnya jauh', 'The campus is too far']], 0),
    mc('Pintu apa yang didorong sepuluh orang tidak terbuka?', 'Which door will not open even when ten people push it?', [['Pintu yang ada tulisan tarik', 'A door labeled pull'], ['Pintu besi', 'An iron door'], ['Pintu kaca', 'A glass door'], ['Pintu gudang', 'A warehouse door']], 0),
    mc('Kenapa ban motor disebut ban?', 'Why is a motorcycle tire called a tire in this riddle?', [['Karena kalau disebut ben nanti dikira nama orang', 'Because calling it Ben sounds like a person'], ['Karena bundar', 'Because it is round'], ['Karena hitam', 'Because it is black'], ['Karena dari karet', 'Because it is rubber']], 0),
    mc('Buah apa yang sering jadi peringatan?', 'Which fruit often serves as a warning?', [['Buah-aya, eh bahaya', 'A dan-ger fruit'], ['Apel', 'Apple'], ['Semangka', 'Watermelon'], ['Anggur', 'Grapes']], 0),
    mc('Kenapa air laut asin?', 'Why is sea water salty in this riddle?', [['Karena ikannya keringetan habis berenang terus', 'The fish sweat from swimming all day'], ['Karena banyak garamnya dari pabrik', 'A factory adds the salt'], ['Karena hujan membawa garam', 'Rain brings the salt'], ['Karena pasirnya asin', 'The sand is salty']], 0),
    mc('Hewan apa yang kakinya di kepala dan matanya di kaki?', 'Which animal has feet on its head and eyes on its feet?', [['Tidak ada, itu cuma orang lagi jungkir balik mikir', 'None, that is just a person doing a headstand'], ['Laba-laba', 'A spider'], ['Kepiting', 'A crab'], ['Udang', 'A shrimp']], 0),
    mc('Kenapa Superman bajunya ada huruf S?', 'Why does Superman wear an S on his suit?', [['Kalau pakai XL kegedean', 'XL would be too big'], ['Karena nama aslinya Santoso', 'His real name is Santoso'], ['Karena dari kata super', 'It stands for super'], ['Karena sponsor', 'It is a sponsor logo']], 0),
    mc('Sayur apa yang paling dingin?', 'Which vegetable is the coldest?', [['Kembang kol-dingin, eh kembang kol saja', 'Cauli-flower, the chilly one'], ['Selada', 'Lettuce'], ['Timun', 'Cucumber'], ['Labu', 'Pumpkin']], 0),
    mc('Kenapa es teh manis tidak pernah sedih?', 'Why is sweet iced tea never sad?', [['Karena hidupnya sudah manis', 'Its life is already sweet'], ['Karena selalu dingin', 'It is always cold'], ['Karena banyak temannya', 'It has many friends'], ['Karena gelasnya penuh', 'Its glass is full']], 0),
    mc('Binatang apa yang punya banyak jaring tapi bukan laba-laba?', 'Which creature has many nets but is not a spider?', [['Pemain voli, jaringnya di tengah lapangan', 'A volleyball player, net in the middle'], ['Nelayan modern', 'A modern fisher'], ['Kupu-kupu', 'A butterfly'], ['Lebah', 'A bee']], 0),
    mc('Kenapa kopi tidak pernah menang lomba lari?', 'Why does coffee never win a running race?', [['Karena dia selalu di-ground, digiling terus', 'It keeps getting ground'], ['Karena pahit', 'Because it is bitter'], ['Karena ngantuk', 'Because it is sleepy'], ['Karena cangkirnya berat', 'Its cup is heavy']], 0),
    mc('Apa bedanya soto sama sate menurut cak lontong?', 'What is the difference between soto and satay, riddle style?', [['Soto berkuah, sate ditusuk, yang nanya kebanyakan mikir', 'Soto has soup, satay is skewered, simple'], ['Tidak ada bedanya', 'There is no difference'], ['Soto dari ayam, sate dari kambing', 'Soto is chicken, satay is goat'], ['Sate lebih mahal', 'Satay costs more']], 0),
    mc('Kenapa jam dinding selalu tenang?', 'Why is a wall clock always calm?', [['Karena dia punya banyak waktu', 'Because it has plenty of time'], ['Karena digantung', 'Because it hangs'], ['Karena tidak punya kaki', 'Because it has no legs'], ['Karena baterainya baru', 'Its battery is new']], 0),
  ],
  asahotak: [
    mc('Seorang petani punya 17 kambing. Semua kecuali 9 mati. Berapa kambing yang tersisa?', 'A farmer has 17 goats. All but 9 die. How many are left?', [['8', '8'], ['9', '9'], ['17', '17'], ['0', '0']], 1),
    mc('Apa yang naik tapi tidak pernah turun?', 'What goes up but never comes down?', [['Harga cabai', 'Chili prices'], ['Umur', 'Age'], ['Balon gas', 'A gas balloon'], ['Suhu siang hari', 'Daytime temperature']], 1),
    mc('Semakin banyak diambil, semakin besar jadinya. Apa itu?', 'The more you take away, the bigger it gets. What is it?', [['Lubang', 'A hole'], ['Tabungan', 'Savings'], ['Tumpukan sampah', 'A trash pile'], ['Bayangan', 'A shadow']], 0),
    mc('Aku punya kota tapi tidak ada rumah, punya hutan tapi tidak ada pohon, punya sungai tapi tidak ada air. Apa aku?', 'I have cities without houses, forests without trees, and rivers without water. What am I?', [['Mimpi', 'A dream'], ['Peta', 'A map'], ['Globe mainan', 'A toy globe'], ['Lukisan', 'A painting']], 1),
    mc('Apa yang selalu datang tapi tidak pernah tiba?', 'What always comes but never arrives?', [['Paket belanja', 'A shopping package'], ['Besok', 'Tomorrow'], ['Gaji', 'Salary'], ['Hujan', 'Rain']], 1),
    mc('Sebuah kereta listrik melaju ke utara. Ke mana arah asapnya?', 'An electric train heads north. Which way does its smoke blow?', [['Ke selatan', 'South'], ['Ke utara', 'North'], ['Tidak ada asap', 'There is no smoke'], ['Ke atas', 'Up']], 2),
    mc('Berapa banyak tanah di lubang berukuran 2 x 2 x 2 meter?', 'How much soil is in a hole measuring 2 by 2 by 2 meters?', [['8 meter kubik', '8 cubic meters'], ['4 meter kubik', '4 cubic meters'], ['Tidak ada, namanya juga lubang', 'None, it is a hole'], ['2 meter kubik', '2 cubic meters']], 2),
    mc('Jika kamu punya 3 apel dan mengambil 2, berapa apel yang kamu pegang?', 'If you have 3 apples and you take 2, how many apples do you hold?', [['1', '1'], ['2', '2'], ['3', '3'], ['0', '0']], 1),
    mc('Apa yang bisa berlari tapi tidak pernah berjalan, punya mulut tapi tidak bicara, punya tempat tidur tapi tidak tidur?', 'What runs but never walks, has a mouth but never talks, has a bed but never sleeps?', [['Sungai', 'A river'], ['Kipas angin', 'A fan'], ['Jam pasir', 'An hourglass'], ['Bayangan orang', 'A shadow']], 0),
    mc('Di sebuah keluarga ada 7 anak laki-laki. Tiap anak laki-laki punya satu saudara perempuan. Berapa anak semuanya?', 'A family has 7 sons. Each son has one sister. How many children are there in total?', [['14', '14'], ['8', '8'], ['7', '7'], ['9', '9']], 1),
    mc('Apa yang menjadi basah selagi mengeringkan?', 'What gets wet while drying?', [['Spons', 'A sponge'], ['Handuk', 'A towel'], ['Jemuran', 'Laundry'], ['Keset', 'A doormat']], 1),
    mc('Dua ayah dan dua anak pergi memancing. Mereka menangkap 3 ikan dan masing-masing dapat satu. Kok bisa?', 'Two fathers and two sons go fishing. They catch 3 fish and each gets one. How?', [['Ada yang tidak dihitung', 'Someone was not counted'], ['Mereka bertiga: kakek, ayah, dan anak', 'They are three people: grandpa, dad, and son'], ['Ikannya besar lalu dibagi', 'The fish were shared'], ['Satu ikan lepas', 'One fish escaped']], 1),
    mc('Apa yang punya leher tapi tidak punya kepala?', 'What has a neck but no head?', [['Gitar dan botol', 'A guitar and a bottle'], ['Jerapah', 'A giraffe'], ['Kemeja', 'A shirt'], ['Bantal', 'A pillow']], 0),
    mc('Semakin ia bekerja, semakin pendek umurnya. Ia memberi terang pada orang lain. Apa itu?', 'The harder it works, the shorter it lives, yet it gives light to others. What is it?', [['Lampu jalan', 'A street lamp'], ['Lilin', 'A candle'], ['Baterai', 'A battery'], ['Korek api', 'A match']], 1),
    mc('Kamu masuk ruangan gelap dengan satu korek api. Ada lilin, lampu minyak, dan kompor gas. Apa yang kamu nyalakan dulu?', 'You enter a dark room with one match. There is a candle, an oil lamp, and a gas stove. What do you light first?', [['Lilin', 'The candle'], ['Lampu minyak', 'The oil lamp'], ['Kompor gas', 'The gas stove'], ['Korek apinya dulu', 'The match first']], 3),
    mc('Apa yang bisa dipecahkan tanpa disentuh dan tanpa suara?', 'What can be broken without being touched and without a sound?', [['Gelas', 'A glass'], ['Janji', 'A promise'], ['Telur', 'An egg'], ['Keheningan saja', 'Silence only']], 1),
    mc('Seekor kucing di sudut ruangan, tiga ekor lain di tiga sudut lain, dan satu di tengah. Berapa kucing di ruangan itu?', 'One cat in each of four corners and one in the middle facing the others. How many cats are in the room?', [['4', '4'], ['5', '5'], ['8', '8'], ['Tidak bisa ditentukan', 'Cannot be determined']], 1),
    mc('Apa yang selalu di depanmu tapi tidak pernah bisa kamu lihat?', 'What is always in front of you but can never be seen?', [['Hidung sendiri', 'Your own nose'], ['Masa depan', 'The future'], ['Udara', 'The air'], ['Kacamata', 'Glasses']], 1),
    mc('Sebuah buku harganya Rp10.000 ditambah setengah harga buku itu. Berapa harga buku sebenarnya?', 'A book costs 10,000 plus half of its own price. What is the real price?', [['Rp15.000', '15,000'], ['Rp20.000', '20,000'], ['Rp12.500', '12,500'], ['Rp10.000', '10,000']], 1),
    mc('Apa yang punya banyak kunci tapi tidak bisa membuka satu pintu pun?', 'What has many keys but cannot open a single door?', [['Gantungan kunci', 'A keychain'], ['Piano', 'A piano'], ['Tukang kunci', 'A locksmith'], ['Brankas', 'A safe']], 1),
    mc('Jika kemarin adalah hari esok dari hari Jumat, hari apa sekarang?', 'If yesterday was the tomorrow of Friday, what day is today?', [['Sabtu', 'Saturday'], ['Minggu', 'Sunday'], ['Senin', 'Monday'], ['Jumat', 'Friday']], 1),
  ],
  tekateki: [
    mc('Ibukota provinsi Jawa Barat adalah?', 'What is the capital of West Java province?', [['Bogor', 'Bogor'], ['Bandung', 'Bandung'], ['Bekasi', 'Bekasi'], ['Cirebon', 'Cirebon']], 1),
    mc('Planet terdekat dari Matahari adalah?', 'Which planet is closest to the Sun?', [['Venus', 'Venus'], ['Bumi', 'Earth'], ['Merkurius', 'Mercury'], ['Mars', 'Mars']], 2),
    mc('Air mendidih pada suhu berapa di tekanan udara normal?', 'At what temperature does water boil at normal air pressure?', [['90 derajat Celcius', '90 degrees Celsius'], ['100 derajat Celcius', '100 degrees Celsius'], ['80 derajat Celcius', '80 degrees Celsius'], ['120 derajat Celcius', '120 degrees Celsius']], 1),
    mc('Hewan darat terbesar di dunia adalah?', 'What is the largest land animal in the world?', [['Kuda nil', 'Hippopotamus'], ['Jerapah', 'Giraffe'], ['Gajah afrika', 'African elephant'], ['Badak', 'Rhinoceros']], 2),
    mc('Bahasa resmi negara Brasil adalah?', 'What is the official language of Brazil?', [['Spanyol', 'Spanish'], ['Portugis', 'Portuguese'], ['Italia', 'Italian'], ['Prancis', 'French']], 1),
    mc('Berapa sisi yang dimiliki segitiga?', 'How many sides does a triangle have?', [['4', '4'], ['5', '5'], ['3', '3'], ['6', '6']], 2),
    mc('Gunung tertinggi di Indonesia adalah?', 'What is the highest mountain in Indonesia?', [['Semeru', 'Semeru'], ['Rinjani', 'Rinjani'], ['Puncak Jaya', 'Puncak Jaya'], ['Kerinci', 'Kerinci']], 2),
    mc('Alat untuk mengukur suhu disebut?', 'The tool used to measure temperature is called?', [['Barometer', 'Barometer'], ['Termometer', 'Thermometer'], ['Altimeter', 'Altimeter'], ['Higrometer', 'Hygrometer']], 1),
    mc('Samudra terluas di dunia adalah?', 'What is the largest ocean in the world?', [['Atlantik', 'Atlantic'], ['Hindia', 'Indian'], ['Arktik', 'Arctic'], ['Pasifik', 'Pacific']], 3),
    mc('Zat hijau pada daun yang berperan dalam fotosintesis adalah?', 'The green substance in leaves used in photosynthesis is?', [['Klorofil', 'Chlorophyll'], ['Melanin', 'Melanin'], ['Hemoglobin', 'Hemoglobin'], ['Karoten saja', 'Carotene only']], 0),
    mc('Penulis proklamasi kemerdekaan Indonesia dibacakan oleh?', 'The Indonesian proclamation of independence was read by?', [['Mohammad Hatta', 'Mohammad Hatta'], ['Soekarno', 'Soekarno'], ['Sutan Sjahrir', 'Sutan Sjahrir'], ['Ahmad Soebardjo', 'Ahmad Soebardjo']], 1),
    mc('Berapa menit dalam dua setengah jam?', 'How many minutes are in two and a half hours?', [['120 menit', '120 minutes'], ['140 menit', '140 minutes'], ['150 menit', '150 minutes'], ['160 menit', '160 minutes']], 2),
    mc('Ikan bernapas menggunakan?', 'Fish breathe using?', [['Paru-paru', 'Lungs'], ['Insang', 'Gills'], ['Kulit', 'Skin'], ['Sirip', 'Fins']], 1),
    mc('Negara dengan penduduk terbanyak di dunia saat ini adalah?', 'Which country currently has the largest population?', [['Tiongkok', 'China'], ['Amerika Serikat', 'United States'], ['India', 'India'], ['Indonesia', 'Indonesia']], 2),
    mc('Lambang kimia untuk emas adalah?', 'What is the chemical symbol for gold?', [['Gd', 'Gd'], ['Au', 'Au'], ['Ag', 'Ag'], ['Em', 'Em']], 1),
    mc('Komputer menyimpan data terkecil dalam satuan?', 'The smallest unit of data in a computer is?', [['Byte', 'Byte'], ['Bit', 'Bit'], ['Pixel', 'Pixel'], ['Hertz', 'Hertz']], 1),
    mc('Sungai terpanjang di dunia umumnya dianggap adalah?', 'The river generally considered the longest in the world is?', [['Amazon', 'Amazon'], ['Nil', 'Nile'], ['Yangtze', 'Yangtze'], ['Mississippi', 'Mississippi']], 1),
    mc('Organ tubuh manusia yang memompa darah adalah?', 'The human organ that pumps blood is?', [['Hati', 'Liver'], ['Paru-paru', 'Lungs'], ['Jantung', 'Heart'], ['Ginjal', 'Kidney']], 2),
    mc('Berapa jumlah provinsi di Indonesia setelah pemekaran Papua selesai?', 'How many provinces does Indonesia have after the Papua expansion?', [['34', '34'], ['37', '37'], ['38', '38'], ['40', '40']], 2),
    mc('Hasil dari 15 persen dari 200 adalah?', 'What is 15 percent of 200?', [['20', '20'], ['25', '25'], ['30', '30'], ['35', '35']], 2),
    mc('Pulau terbesar di Indonesia adalah?', 'What is the largest island in Indonesia?', [['Sumatra', 'Sumatra'], ['Kalimantan', 'Kalimantan'], ['Papua', 'Papua'], ['Sulawesi', 'Sulawesi']], 2),
  ],
  family100: [
    { q: { id: 'Sebutkan hal yang dilakukan orang setelah bangun tidur', en: 'Name something people do right after waking up' }, answers: [
      { text: { id: 'Cek HP', en: 'Check phone' }, points: 32 }, { text: { id: 'Ke kamar mandi', en: 'Go to the bathroom' }, points: 24 },
      { text: { id: 'Minum air', en: 'Drink water' }, points: 16 }, { text: { id: 'Sholat atau berdoa', en: 'Pray' }, points: 14 },
      { text: { id: 'Merapikan tempat tidur', en: 'Make the bed' }, points: 8 }, { text: { id: 'Olahraga ringan', en: 'Light exercise' }, points: 6 } ] },
    { q: { id: 'Sebutkan benda yang selalu dibawa pelajar ke sekolah', en: 'Name something students always bring to school' }, answers: [
      { text: { id: 'Buku', en: 'Books' }, points: 30 }, { text: { id: 'Tas', en: 'Bag' }, points: 24 },
      { text: { id: 'Alat tulis', en: 'Stationery' }, points: 20 }, { text: { id: 'Botol minum', en: 'Water bottle' }, points: 12 },
      { text: { id: 'Bekal', en: 'Lunch box' }, points: 8 }, { text: { id: 'HP', en: 'Phone' }, points: 6 } ] },
    { q: { id: 'Sebutkan alasan orang terlambat masuk kerja atau sekolah', en: 'Name a reason people are late for work or school' }, answers: [
      { text: { id: 'Bangun kesiangan', en: 'Overslept' }, points: 34 }, { text: { id: 'Macet', en: 'Traffic jam' }, points: 26 },
      { text: { id: 'Kendaraan mogok', en: 'Vehicle broke down' }, points: 14 }, { text: { id: 'Hujan', en: 'Rain' }, points: 12 },
      { text: { id: 'Ketinggalan barang', en: 'Forgot something' }, points: 8 }, { text: { id: 'Antre kamar mandi', en: 'Bathroom queue' }, points: 6 } ] },
    { q: { id: 'Sebutkan makanan yang cocok dimakan saat hujan', en: 'Name food that suits rainy weather' }, answers: [
      { text: { id: 'Mie instan', en: 'Instant noodles' }, points: 30 }, { text: { id: 'Bakso', en: 'Meatball soup' }, points: 24 },
      { text: { id: 'Soto', en: 'Soto soup' }, points: 16 }, { text: { id: 'Gorengan', en: 'Fried snacks' }, points: 14 },
      { text: { id: 'Bubur ayam', en: 'Chicken porridge' }, points: 10 }, { text: { id: 'Wedang jahe', en: 'Ginger drink' }, points: 6 } ] },
    { q: { id: 'Sebutkan tempat yang ramai saat akhir pekan', en: 'Name a place that gets crowded on weekends' }, answers: [
      { text: { id: 'Mal', en: 'Mall' }, points: 32 }, { text: { id: 'Pantai', en: 'Beach' }, points: 22 },
      { text: { id: 'Pasar', en: 'Market' }, points: 16 }, { text: { id: 'Tempat wisata', en: 'Tourist spot' }, points: 14 },
      { text: { id: 'Bioskop', en: 'Cinema' }, points: 10 }, { text: { id: 'Stadion', en: 'Stadium' }, points: 6 } ] },
    { q: { id: 'Sebutkan hal yang dicari orang saat mati lampu', en: 'Name something people look for during a blackout' }, answers: [
      { text: { id: 'Senter', en: 'Flashlight' }, points: 30 }, { text: { id: 'Lilin', en: 'Candle' }, points: 26 },
      { text: { id: 'HP', en: 'Phone' }, points: 18 }, { text: { id: 'Korek api', en: 'Lighter' }, points: 12 },
      { text: { id: 'Power bank', en: 'Power bank' }, points: 8 }, { text: { id: 'Kipas', en: 'Fan' }, points: 6 } ] },
    { q: { id: 'Sebutkan minuman yang sering dipesan di warung kopi', en: 'Name a drink often ordered at a coffee stall' }, answers: [
      { text: { id: 'Kopi hitam', en: 'Black coffee' }, points: 30 }, { text: { id: 'Es teh', en: 'Iced tea' }, points: 24 },
      { text: { id: 'Kopi susu', en: 'Milk coffee' }, points: 20 }, { text: { id: 'Teh hangat', en: 'Hot tea' }, points: 12 },
      { text: { id: 'Susu jahe', en: 'Ginger milk' }, points: 8 }, { text: { id: 'Air mineral', en: 'Mineral water' }, points: 6 } ] },
    { q: { id: 'Sebutkan pekerjaan yang memakai seragam', en: 'Name a job that wears a uniform' }, answers: [
      { text: { id: 'Polisi', en: 'Police officer' }, points: 28 }, { text: { id: 'Tentara', en: 'Soldier' }, points: 22 },
      { text: { id: 'Dokter', en: 'Doctor' }, points: 18 }, { text: { id: 'Satpam', en: 'Security guard' }, points: 14 },
      { text: { id: 'Pramugari', en: 'Flight attendant' }, points: 10 }, { text: { id: 'Koki', en: 'Chef' }, points: 8 } ] },
    { q: { id: 'Sebutkan benda yang ada di dapur', en: 'Name something found in a kitchen' }, answers: [
      { text: { id: 'Kompor', en: 'Stove' }, points: 28 }, { text: { id: 'Panci', en: 'Pot' }, points: 22 },
      { text: { id: 'Pisau', en: 'Knife' }, points: 18 }, { text: { id: 'Kulkas', en: 'Fridge' }, points: 14 },
      { text: { id: 'Wajan', en: 'Wok' }, points: 10 }, { text: { id: 'Sendok', en: 'Spoon' }, points: 8 } ] },
    { q: { id: 'Sebutkan alasan orang membuka HP tengah malam', en: 'Name a reason people open their phone at midnight' }, answers: [
      { text: { id: 'Tidak bisa tidur', en: 'Cannot sleep' }, points: 28 }, { text: { id: 'Cek notifikasi', en: 'Check notifications' }, points: 24 },
      { text: { id: 'Main game', en: 'Play games' }, points: 18 }, { text: { id: 'Balas chat', en: 'Reply to chats' }, points: 14 },
      { text: { id: 'Lihat jam', en: 'Check the time' }, points: 10 }, { text: { id: 'Nonton video', en: 'Watch videos' }, points: 6 } ] },
    { q: { id: 'Sebutkan hewan yang bisa dipelihara di rumah', en: 'Name an animal people keep at home' }, answers: [
      { text: { id: 'Kucing', en: 'Cat' }, points: 34 }, { text: { id: 'Anjing', en: 'Dog' }, points: 24 },
      { text: { id: 'Ikan', en: 'Fish' }, points: 18 }, { text: { id: 'Burung', en: 'Bird' }, points: 12 },
      { text: { id: 'Hamster', en: 'Hamster' }, points: 7 }, { text: { id: 'Kelinci', en: 'Rabbit' }, points: 5 } ] },
    { q: { id: 'Sebutkan hal yang membuat orang tertawa', en: 'Name something that makes people laugh' }, answers: [
      { text: { id: 'Lelucon teman', en: 'A friend joke' }, points: 30 }, { text: { id: 'Video lucu', en: 'Funny videos' }, points: 26 },
      { text: { id: 'Meme', en: 'Memes' }, points: 18 }, { text: { id: 'Orang terpeleset', en: 'Someone slipping' }, points: 12 },
      { text: { id: 'Komedian', en: 'Comedians' }, points: 8 }, { text: { id: 'Digelitik', en: 'Being tickled' }, points: 6 } ] },
    { q: { id: 'Sebutkan isi tas sekolah anak SD', en: 'Name something inside an elementary student bag' }, answers: [
      { text: { id: 'Buku tulis', en: 'Notebook' }, points: 30 }, { text: { id: 'Pensil', en: 'Pencil' }, points: 24 },
      { text: { id: 'Penghapus', en: 'Eraser' }, points: 16 }, { text: { id: 'Penggaris', en: 'Ruler' }, points: 12 },
      { text: { id: 'Tempat pensil', en: 'Pencil case' }, points: 10 }, { text: { id: 'Bekal', en: 'Lunch' }, points: 8 } ] },
    { q: { id: 'Sebutkan olahraga yang dimainkan beregu', en: 'Name a team sport' }, answers: [
      { text: { id: 'Sepak bola', en: 'Soccer' }, points: 34 }, { text: { id: 'Voli', en: 'Volleyball' }, points: 22 },
      { text: { id: 'Basket', en: 'Basketball' }, points: 20 }, { text: { id: 'Futsal', en: 'Futsal' }, points: 12 },
      { text: { id: 'Bulu tangkis ganda', en: 'Badminton doubles' }, points: 7 }, { text: { id: 'Takraw', en: 'Sepak takraw' }, points: 5 } ] },
    { q: { id: 'Sebutkan hal yang dilakukan sebelum tidur', en: 'Name something people do before sleeping' }, answers: [
      { text: { id: 'Gosok gigi', en: 'Brush teeth' }, points: 28 }, { text: { id: 'Main HP', en: 'Use phone' }, points: 26 },
      { text: { id: 'Berdoa', en: 'Pray' }, points: 18 }, { text: { id: 'Matikan lampu', en: 'Turn off lights' }, points: 12 },
      { text: { id: 'Baca buku', en: 'Read a book' }, points: 9 }, { text: { id: 'Setel alarm', en: 'Set an alarm' }, points: 7 } ] },
    { q: { id: 'Sebutkan bumbu dapur yang hampir selalu ada', en: 'Name a kitchen spice that is almost always around' }, answers: [
      { text: { id: 'Garam', en: 'Salt' }, points: 30 }, { text: { id: 'Bawang merah', en: 'Shallots' }, points: 24 },
      { text: { id: 'Bawang putih', en: 'Garlic' }, points: 20 }, { text: { id: 'Cabai', en: 'Chili' }, points: 12 },
      { text: { id: 'Gula', en: 'Sugar' }, points: 8 }, { text: { id: 'Kecap', en: 'Soy sauce' }, points: 6 } ] },
    { q: { id: 'Sebutkan aplikasi yang dibuka orang setiap hari', en: 'Name an app people open every day' }, answers: [
      { text: { id: 'WhatsApp', en: 'WhatsApp' }, points: 34 }, { text: { id: 'Instagram', en: 'Instagram' }, points: 22 },
      { text: { id: 'TikTok', en: 'TikTok' }, points: 18 }, { text: { id: 'YouTube', en: 'YouTube' }, points: 14 },
      { text: { id: 'Browser', en: 'Browser' }, points: 7 }, { text: { id: 'Email', en: 'Email' }, points: 5 } ] },
    { q: { id: 'Sebutkan tanda musim hujan tiba', en: 'Name a sign that the rainy season has arrived' }, answers: [
      { text: { id: 'Sering hujan sore', en: 'Frequent afternoon rain' }, points: 28 }, { text: { id: 'Udara lebih dingin', en: 'Cooler air' }, points: 22 },
      { text: { id: 'Banyak genangan', en: 'Many puddles' }, points: 18 }, { text: { id: 'Petir', en: 'Thunder' }, points: 14 },
      { text: { id: 'Nyamuk bertambah', en: 'More mosquitoes' }, points: 10 }, { text: { id: 'Jemuran susah kering', en: 'Laundry dries slowly' }, points: 8 } ] },
    { q: { id: 'Sebutkan kendaraan yang ada di jalan setiap hari', en: 'Name a vehicle seen on the road every day' }, answers: [
      { text: { id: 'Motor', en: 'Motorcycle' }, points: 34 }, { text: { id: 'Mobil', en: 'Car' }, points: 26 },
      { text: { id: 'Angkot', en: 'Public minivan' }, points: 16 }, { text: { id: 'Bus', en: 'Bus' }, points: 12 },
      { text: { id: 'Sepeda', en: 'Bicycle' }, points: 7 }, { text: { id: 'Truk', en: 'Truck' }, points: 5 } ] },
    { q: { id: 'Sebutkan hal yang dibeli di warung dekat rumah', en: 'Name something bought at a small neighborhood shop' }, answers: [
      { text: { id: 'Mie instan', en: 'Instant noodles' }, points: 26 }, { text: { id: 'Telur', en: 'Eggs' }, points: 24 },
      { text: { id: 'Beras', en: 'Rice' }, points: 18 }, { text: { id: 'Kopi sachet', en: 'Coffee sachets' }, points: 14 },
      { text: { id: 'Sabun', en: 'Soap' }, points: 10 }, { text: { id: 'Gas elpiji', en: 'LPG gas' }, points: 8 } ] },
    { q: { id: 'Sebutkan alasan orang senang hari Jumat', en: 'Name a reason people love Fridays' }, answers: [
      { text: { id: 'Besok libur', en: 'Tomorrow is a day off' }, points: 34 }, { text: { id: 'Jam kerja lebih singkat', en: 'Shorter work hours' }, points: 22 },
      { text: { id: 'Bisa kumpul keluarga', en: 'Family time' }, points: 16 }, { text: { id: 'Waktunya gajian bagi sebagian orang', en: 'Payday for some' }, points: 12 },
      { text: { id: 'Malamnya bisa santai', en: 'A relaxing night' }, points: 9 }, { text: { id: 'Rencana jalan-jalan', en: 'Weekend trip plans' }, points: 7 } ] },
  ],
}

export const WORD_LIST = [
  'kucing', 'buku', 'meja', 'kursi', 'pintu', 'jendela', 'sepeda', 'motor', 'mobil', 'rumah',
  'sekolah', 'pasar', 'sungai', 'gunung', 'laut', 'pantai', 'hujan', 'matahari', 'bulan', 'bintang',
  'pohon', 'bunga', 'nasi', 'roti', 'kopi', 'susu', 'gula', 'garam', 'apel', 'jeruk',
  'pisang', 'mangga', 'semut', 'gajah', 'ikan', 'burung', 'anjing', 'ayam',
]

export const FLAGS = [
  { emoji: '🇮🇩', country: { id: 'Indonesia', en: 'Indonesia' } },
  { emoji: '🇯🇵', country: { id: 'Jepang', en: 'Japan' } },
  { emoji: '🇰🇷', country: { id: 'Korea Selatan', en: 'South Korea' } },
  { emoji: '🇫🇷', country: { id: 'Prancis', en: 'France' } },
  { emoji: '🇩🇪', country: { id: 'Jerman', en: 'Germany' } },
  { emoji: '🇬🇧', country: { id: 'Inggris', en: 'United Kingdom' } },
  { emoji: '🇺🇸', country: { id: 'Amerika Serikat', en: 'United States' } },
  { emoji: '🇮🇹', country: { id: 'Italia', en: 'Italy' } },
  { emoji: '🇪🇸', country: { id: 'Spanyol', en: 'Spain' } },
  { emoji: '🇳🇱', country: { id: 'Belanda', en: 'Netherlands' } },
  { emoji: '🇧🇷', country: { id: 'Brasil', en: 'Brazil' } },
  { emoji: '🇦🇺', country: { id: 'Australia', en: 'Australia' } },
  { emoji: '🇨🇳', country: { id: 'Tiongkok', en: 'China' } },
  { emoji: '🇮🇳', country: { id: 'India', en: 'India' } },
  { emoji: '🇸🇬', country: { id: 'Singapura', en: 'Singapore' } },
  { emoji: '🇲🇾', country: { id: 'Malaysia', en: 'Malaysia' } },
  { emoji: '🇹🇭', country: { id: 'Thailand', en: 'Thailand' } },
  { emoji: '🇻🇳', country: { id: 'Vietnam', en: 'Vietnam' } },
  { emoji: '🇵🇭', country: { id: 'Filipina', en: 'Philippines' } },
  { emoji: '🇹🇷', country: { id: 'Turki', en: 'Turkey' } },
  { emoji: '🇸🇦', country: { id: 'Arab Saudi', en: 'Saudi Arabia' } },
  { emoji: '🇪🇬', country: { id: 'Mesir', en: 'Egypt' } },
  { emoji: '🇿🇦', country: { id: 'Afrika Selatan', en: 'South Africa' } },
  { emoji: '🇲🇽', country: { id: 'Meksiko', en: 'Mexico' } },
  { emoji: '🇨🇦', country: { id: 'Kanada', en: 'Canada' } },
  { emoji: '🇦🇷', country: { id: 'Argentina', en: 'Argentina' } },
]

export const ELEMENTS = [
  { symbol: 'H', name: { id: 'Hidrogen', en: 'Hydrogen' } },
  { symbol: 'He', name: { id: 'Helium', en: 'Helium' } },
  { symbol: 'Li', name: { id: 'Litium', en: 'Lithium' } },
  { symbol: 'C', name: { id: 'Karbon', en: 'Carbon' } },
  { symbol: 'N', name: { id: 'Nitrogen', en: 'Nitrogen' } },
  { symbol: 'O', name: { id: 'Oksigen', en: 'Oxygen' } },
  { symbol: 'Na', name: { id: 'Natrium', en: 'Sodium' } },
  { symbol: 'Mg', name: { id: 'Magnesium', en: 'Magnesium' } },
  { symbol: 'Al', name: { id: 'Aluminium', en: 'Aluminum' } },
  { symbol: 'Si', name: { id: 'Silikon', en: 'Silicon' } },
  { symbol: 'P', name: { id: 'Fosfor', en: 'Phosphorus' } },
  { symbol: 'S', name: { id: 'Belerang', en: 'Sulfur' } },
  { symbol: 'K', name: { id: 'Kalium', en: 'Potassium' } },
  { symbol: 'Ca', name: { id: 'Kalsium', en: 'Calcium' } },
  { symbol: 'Fe', name: { id: 'Besi', en: 'Iron' } },
  { symbol: 'Cu', name: { id: 'Tembaga', en: 'Copper' } },
  { symbol: 'Zn', name: { id: 'Seng', en: 'Zinc' } },
  { symbol: 'Ag', name: { id: 'Perak', en: 'Silver' } },
  { symbol: 'Au', name: { id: 'Emas', en: 'Gold' } },
  { symbol: 'Pb', name: { id: 'Timbal', en: 'Lead' } },
]

// Kata untuk tebakgambar: kata asli disembunyikan sebagian di gambar.
export const IMAGE_WORDS = [
  { word: { id: 'KUCING', en: 'CAT' }, emoji: '🐱', category: { id: 'Hewan', en: 'Animal' } },
  { word: { id: 'SEPEDA', en: 'BICYCLE' }, emoji: '🚲', category: { id: 'Kendaraan', en: 'Vehicle' } },
  { word: { id: 'MATAHARI', en: 'SUN' }, emoji: '☀️', category: { id: 'Langit', en: 'Sky' } },
  { word: { id: 'PISANG', en: 'BANANA' }, emoji: '🍌', category: { id: 'Buah', en: 'Fruit' } },
  { word: { id: 'GAJAH', en: 'ELEPHANT' }, emoji: '🐘', category: { id: 'Hewan', en: 'Animal' } },
  { word: { id: 'HUJAN', en: 'RAIN' }, emoji: '🌧️', category: { id: 'Cuaca', en: 'Weather' } },
  { word: { id: 'BUKU', en: 'BOOK' }, emoji: '📖', category: { id: 'Benda', en: 'Object' } },
  { word: { id: 'KAPAL', en: 'SHIP' }, emoji: '🚢', category: { id: 'Kendaraan', en: 'Vehicle' } },
  { word: { id: 'BUNGA', en: 'FLOWER' }, emoji: '🌸', category: { id: 'Tanaman', en: 'Plant' } },
  { word: { id: 'AYAM', en: 'CHICKEN' }, emoji: '🐔', category: { id: 'Hewan', en: 'Animal' } },
  { word: { id: 'ROTI', en: 'BREAD' }, emoji: '🍞', category: { id: 'Makanan', en: 'Food' } },
  { word: { id: 'BULAN', en: 'MOON' }, emoji: '🌙', category: { id: 'Langit', en: 'Sky' } },
]

export default { QUIZ_SETS, WORD_LIST, FLAGS, ELEMENTS, IMAGE_WORDS }
