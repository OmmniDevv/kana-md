import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'puisi',
  alias: [],
  category: 'fun',
  description: { id: 'Kirim satu puisi pendek asli untuk menemani harimu', en: 'Send one short original poem to accompany your day' },
  usage: '.puisi',
  example: '.puisi',
  cooldown: 3,
}

// Puisi pendek orisinal yang ditulis untuk KANA.
export const PUISI = {
  id: [
    'Di beranda pagi yang masih basah,\nembun menulis surat di daun jendela.\nKopi mengepul, hati pun merekah,\nhari baru selalu punya cara menyapa.',
    'Hujan mengetuk genting dengan sabar,\nseperti rindu yang tidak mau terburu-buru.\nDi balik jendela kita belajar,\nmenunggu pun bisa terasa semanis madu.',
    'Perahu kecil menyeberangi senja,\nmembawa pulang lelah seharian.\nLangit oranye jadi saksi bisu saja,\nesok kita berlayar lagi, dengan harapan.',
    'Kucing tidur di atas tumpukan buku,\nmimpinya mungkin soal ikan dan susu.\nKita yang terjaga mengejar waktu,\nbelajar santai dari yang paling lucu.',
    'Bintang tidak pernah berisik,\ntapi seluruh malam mendengarkannya.\nJadilah terang tanpa perlu riuh,\nkebaikan pun sama cara kerjanya.',
    'Di pasar pagi suara bersahutan,\nsayur segar dan tawa berserakan.\nHidup kadang cuma soal tawar-menawar,\nantara lelah dan alasan untuk bertahan.',
    'Kereta melintas membawa cerita,\norang-orang asing dengan tujuan berbeda.\nKita semua penumpang sementara,\nsaling tersenyum sebelum turun di stasiun masing-masing.',
    'Layang-layang putus bukan akhir cerita,\nia hanya pindah langit untuk terbang lagi.\nBegitu juga mimpi yang lepas dari genggaman kita,\nsuatu hari kembali dalam bentuk yang lebih baik.',
  ],
  en: [
    'On a porch still wet with morning,\ndew writes letters on window leaves.\nCoffee steams, the heart starts blooming,\na new day always finds its way to greet.',
    'Rain taps the roof tiles with patience,\nlike longing that refuses to rush.\nBehind the window we learn,\nwaiting can taste as sweet as honey.',
    'A small boat crosses the evening,\ncarrying home a day of tiredness.\nThe orange sky is a silent witness,\ntomorrow we sail again, with hope.',
    'A cat sleeps on a pile of books,\ndreaming perhaps of fish and milk.\nWe who stay awake chasing time,\nlearn to relax from the funniest teacher.',
    'Stars never make any noise,\nyet the whole night listens to them.\nBe a light without the fuss,\nkindness works the same way.',
    'At the morning market voices collide,\nfresh greens and laughter scattered around.\nLife is sometimes just bargaining,\nbetween tiredness and reasons to hold on.',
    'A train passes carrying stories,\nstrangers with different destinations.\nWe are all temporary passengers,\nsmiling at each other before our own stations.',
    'A broken-string kite is not the end,\nit just moves to another sky to fly again.\nSo do dreams that slip from our hands,\none day returning in a better form.',
  ],
}

export const i18n = {
  id: {
    puisi: {
      title: 'Puisi Pendek',
      body: '📜 PUISI UNTUKMU\n\n{item}\n\nSemoga baris-baris ini menemani harimu yaa~ {mood}',
      btnAgain: 'Puisi Lain',
      btnMenu: 'Menu Fun',
    },
  },
  en: {
    puisi: {
      title: 'Short Poem',
      body: '📜 A POEM FOR YOU\n\n{item}\n\nMay these lines accompany your day~ {mood}',
      btnAgain: 'Another Poem',
      btnMenu: 'Fun Menu',
    },
  },
}

export const test = { input: '.puisi', expect: /puisi/i }

export async function handler(ctx) {
  const pool = PUISI[ctx.lang] ?? PUISI.id
  const item = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('puisi.body', { item, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('puisi.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('puisi.btnAgain'), id: '.puisi' },
    ],
    textFallback: body,
  })
}
