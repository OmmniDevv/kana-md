import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'pantun',
  alias: [],
  category: 'fun',
  description: { id: 'Dapat pantun original acak dari KANA', en: 'Get a random original pantun from KANA' },
  usage: '.pantun',
  example: '.pantun',
  cooldown: 3,
}

export const i18n = {
  id: {
    pantun: {
      title: 'Pantun dari KANA 🎋',
      body: '{pantun}\n\n{mood}',
      btnAgain: 'Pantun Lagi',
      btnMotivasi: 'Motivasi',
      btnMenu: 'Menu Fun',
      poems: [
        'Pergi ke pasar beli rambutan\nPulangnya mampir membeli duku\nKalau hari ini terasa beban\nBesok pasti lebih ringan untukmu',
        'Burung merpati terbang ke awan\nHinggap sebentar di pohon randu\nJangan berhenti mengejar impian\nSelangkah lagi dekat padamu',
        'Air mengalir ke muara\nIkan berenang beriringan\nHati senang badan sejahtera\nItulah nikmat yang dirindukan',
        'Pagi hari minum segelas jamu\nDuduk santai di bawah pohon jambu\nRajin belajar menambah ilmu\nMasa depan cerah menunggumu',
        'Bunga melati harum baunya\nTumbuh subur di tepi taman\nSenyum manis di wajahnya\nBikin hati terasa aman',
        'Ke kebun memetik pepaya\nDibawa pulang pakai keranjang\nJangan mudah putus asa\nUsaha keras pasti berbuah terang',
        'Layangan putus terbang melayang\nJatuh jauh di atas genteng\nSenyum kamu manis menawan\nBikin KANA jadi salting',
        'Jalan-jalan ke kota Bandung\nMembeli baju warna biru\nKalau sedih jangan termangu\nAda KANA yang menemanimu',
        'Buah mangga buah kedondong\nDimakan bareng di sore hari\nKalau bisa jangan sombong\nRendah hati disenangi',
        'Anak ayam turun sepuluh\nMati satu tinggal sembilan\nBelajar tekun jangan mengeluh\nHasilnya manis di kemudian',
        'Pohon pinang tinggi menjulang\nBuahnya jatuh ke tanah rata\nKalau rindu jangan ditahan\nSapa saja orangnya nyata',
        'Pergi berlayar ke pulau seberang\nOmbak besar jangan ditantang\nKerja cerdas bukan sekadar sibuk\nHasil nyata yang jadi pegangan',
      ],
    },
  },
  en: {
    pantun: {
      title: 'Pantun from KANA 🎋',
      body: '{pantun}\n\n{mood}',
      btnAgain: 'More Pantun',
      btnMotivasi: 'Motivation',
      btnMenu: 'Fun Menu',
      poems: [
        'Morning dew on garden green\nSparrows sing a cheerful tune\nKeep your heart forever keen\nGood things will be coming soon',
        'Rivers flow to meet the sea\nClouds drift softly in the blue\nDream as wide as dreams can be\nThen work hard to make them true',
        'Baking bread at break of day\nCoffee warm inside the cup\nSimple joys along the way\nAre the ones that lift us up',
        'Paper boats on rainy streams\nSail beyond the garden gate\nHold on gently to your dreams\nGood things come to those who wait',
        'Stars appear when nights are deep\nFireflies glow near the pine\nRest your mind and get some sleep\nTomorrow you will surely shine',
        'Plant a seed in early spring\nWater it with patient care\nEvery small and growing thing\nNeeds some time before it is fair',
        'Kites are dancing in the sky\nChildren laughing down the lane\nSpread your wings and learn to fly\nSunshine always follows rain',
        'Books are stacked beside the light\nPages waiting to be read\nKnowledge makes the future bright\nFeed it well inside your head',
        'Waves keep rolling to the shore\nTides return without a sound\nWhat you practice more and more\nTurns to skill that stands its ground',
        'Honey sweet from busy bees\nBread still warm upon the tray\nKindness travels on the breeze\nAnd returns to you someday',
        'Lanterns glow at festival night\nMusic floats across the square\nShare your little bit of light\nThere is always light to spare',
        'Trains roll on through fields of gold\nWindows framing evening red\nStories brave are waiting told\nBy the ones who step ahead',
      ],
    },
  },
}

export const test = { input: '.pantun', expect: /pantun/i }

export async function handler(ctx) {
  const pool = i18n[ctx.lang]?.pantun?.poems ?? i18n.id.pantun.poems
  const pantun = pool[Math.floor(Math.random() * pool.length)]
  const body = ctx.t('pantun.body', { pantun, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('pantun.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('pantun.btnAgain'), id: '.pantun' },
      { text: ctx.t('pantun.btnMotivasi'), id: '.motivasi' },
    ],
    textFallback: body,
  })
}
