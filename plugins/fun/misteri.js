// Cerita misteri pendek acak (dataset lokal kurasi KANA).
const STORIES = {
  id: [
    'Di sebuah sekolah tua, ada tangga menuju lantai 4 padahal gedungnya hanya 3 lantai. Siswa yang naik ke sana mengaku mendengar bel berbunyi dari kelas yang tidak pernah ada.',
    'Sebuah rumah kosong di ujung gang selalu menyala lampunya tiap pukul 02.00 selama tepat 7 menit, lalu gelap lagi. Tidak ada yang pernah melihat siapa yang menyalakannya.',
    'Penjaga malam sebuah kantor merekam suara ketukan dari dalam lift yang berhenti di lantai 13. Gedung itu tidak punya lantai 13, nomornya dilompati dari 12 ke 14.',
    'Di desa dekat hutan, warga melarang menyebut nama tertentu setelah magrib. Konon, siapa pun yang menyebutnya akan mendengar namanya dipanggil balik dari arah pepohonan.',
    'Sebuah foto keluarga tahun 1980-an menyimpan keanehan: di cermin belakang, terlihat satu sosok anak lagi yang tidak ada satu pun anggota keluarga mengenalnya.',
    'Radio tua di rumah nenek selalu menyala sendiri tiap malam Jumat, menyiarkan berita tentang kejadian yang baru terjadi keesokan harinya.',
    'Seorang sopir ojek mengaku mengantar penumpang ke alamat rumah kosong yang sudah terbakar 10 tahun lalu. Penumpangnya membayar dengan uang yang berubah jadi daun kering.',
    'Sumur tua di belakang pesantren tidak pernah kering, tapi santri dilarang menimba air setelah azan magrib karena pernah terdengar suara orang bernyanyi dari dalamnya.',
    'Kereta terakhir di stasiun kecil itu selalu berhenti 1 menit di peron yang sudah ditutup, membuka pintu, lalu berangkat lagi tanpa satu penumpang pun naik atau turun.',
    'Di perpustakaan kota, ada satu buku tamu yang namanya tidak pernah bisa dihapus. Setiap halaman terakhir selalu bertambah satu nama baru setiap bulan purnama.',
  ],
  en: [
    'In an old school there is a staircase to a 4th floor although the building only has 3 floors. Students who climbed it claim to hear a bell from a classroom that never existed.',
    'An empty house at the end of an alley lights up every night at exactly 02:00 for precisely 7 minutes, then goes dark again. Nobody has ever seen who turns it on.',
    'A night guard recorded knocking sounds from inside an elevator stopped at floor 13. The building has no floor 13, the numbers skip from 12 to 14.',
    'In a village near the forest, people are forbidden from saying a certain name after dusk. Whoever says it will hear their own name called back from the trees.',
    'A family photo from the 1980s hides something odd: in the mirror behind them stands one extra child that no family member recognizes.',
    'An old radio at grandma\'s house turns itself on every Friday night, broadcasting news about events that only happen the next day.',
    'A motorcycle taxi driver swears he dropped a passenger at an empty house that burned down 10 years ago. The fare turned into dry leaves in his pocket.',
    'An old well behind a boarding school never runs dry, but students may not draw water after the evening call to prayer, ever since singing was heard from inside it.',
    'The last train at a small station always stops for 1 minute at a closed platform, opens its doors, then leaves with nobody boarding or getting off.',
    'In the city library there is a guest book with a name that can never be erased. Every full moon, one new name appears on its last page.',
  ],
}

export const config = {
  name: 'misteri',
  alias: ['ceritamisteri', 'horor'],
  category: 'fun',
  description: { id: 'Cerita misteri pendek acak buat merinding santai', en: 'A random short mystery story for light chills' },
  usage: '.misteri',
  example: '.misteri',
  cooldown: 5,
}

export const i18n = {
  id: { misteri: { head: '╭─❏ 🌙 「 *CERITA MISTERI* 」\n┊ ', foot: '\n╰━━━━━━━' } },
  en: { misteri: { head: '╭─❏ 🌙 「 *MYSTERY STORY* 」\n┊ ', foot: '\n╰━━━━━━━' } },
}

export const test = { input: '.misteri', expect: /misteri|mystery/i }

export async function handler(ctx) {
  const pool = STORIES[ctx.lang] ?? STORIES.id
  const story = pool[Math.floor(Math.random() * pool.length)]
  return ctx.reply(`${ctx.t('misteri.head')}${story}${ctx.t('misteri.foot')}`)
}
