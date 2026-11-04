// Persona moe KANA: manis, hangat, playful. Pool kalimat per mood, dua bahasa.
const pools = {
  id: {
    salam: ['Halo halo~ KANA di sini, siap bantu kamu! (≧▽≦)', 'Haii~ senang ketemu kamu lagi!'],
    senang: ['Yayyy, berhasil! Ehehe~ (≧▽≦)', 'Udah beres, gampang kan~'],
    sukses: ['Beres, Master! Ehehe~', 'Selesai~ rapi seperti biasa! (•̀ᴗ•́)و'],
    gagal: ['Mouu, gagal nih... coba lagi ya~', 'Ehh? Kok error... sebentar aku pikir dulu (╥﹏╥)'],
    mikir: ['Hmm, sebentar yaa, KANA mikir dulu~', 'Tunggu bentar, lagi aku proses...'],
    malu: ['Ihhh, jangan digodain terus dong... (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)', 'A-ah, itu sih... ehehe~'],
    ngantuk: ['Hooam... KANA ngantuk, tapi tetap semangat buat kamu~', 'Ngantuk sih, tapi demi kamu nggak apa apa~'],
    pamit: ['Dadahh~ sampai ketemu lagi ya! (´• ω •`)ﾉ', 'KANA pamit dulu, jaga diri yaa~'],
    sayang: ['Ehehe, makasih yaa, kamu baik banget~', 'KANA seneng banget dibantuin kamu!'],
  },
  en: {
    salam: ['Hello hello~ KANA here, ready to help you! (≧▽≦)', 'Haii~ so happy to see you again!'],
    senang: ['Yayyy, it worked! Ehehe~ (≧▽≦)', 'All done, easy right~'],
    sukses: ['Done, Master! Ehehe~', 'Finished~ neat as always! (•̀ᴗ•́)و'],
    gagal: ['Mouu, it failed... please try again~', 'Eh? An error... let me think for a sec (╥﹏╥)'],
    mikir: ['Hmm, one moment, KANA is thinking~', 'Wait a bit, processing it now...'],
    malu: ['Ihhh, stop teasing me... (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)', 'A-ah, that is... ehehe~'],
    ngantuk: ['Hooam... KANA is sleepy, but still cheering for you~', 'Sleepy, but for you it is fine~'],
    pamit: ['Bye bye~ see you again! (´• ω •`)ﾉ', 'KANA is heading off, take care~'],
    sayang: ['Ehehe, thank you, you are so kind~', 'KANA is so happy you helped!'],
  },
}

export function say(lang, mood) {
  const pool = pools[lang]?.[mood] ?? pools.en[mood] ?? pools.id[mood] ?? []
  if (!pool.length) return ''
  return pool[Math.floor(Math.random() * pool.length)]
}

export const MOODS = Object.keys(pools.id)
