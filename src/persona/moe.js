// Persona moe KANA: manis, hangat, playful, ekspresif.
// Pool kalimat per mood, dua bahasa. User meminta keluaran bot ekspresif
// memakai emoji dan kaomoji yang variatif (keputusan user 2026-11-04,
// dicatat di docs/DECISIONS.md); informasi inti tetap harus jelas terbaca,
// jadi variasi ini hanya lapisan sapaan dan reaksi, bukan isi pesan.
const pools = {
  id: {
    salam: [
      'Halo halo~ KANA di sini, siap bantu kamu! (≧▽≦) ✨',
      'Haii~ senang ketemu kamu lagi! 🌸',
      'Halo~ akhirnya kamu dateng juga, KANA tungguin nih (´• ω •`)ﾉ 💕',
      'Hai hai~ ada yang bisa KANA bantu hari ini? ✨',
    ],
    senang: [
      'Yayyy, berhasil! Ehehe~ (≧▽≦) 🎉',
      'Udah beres, gampang kan~ ✨',
      'Horeee, jadi juga! KANA bangga nih (•̀ᴗ•́)و 🌟',
      'Asyik, lancar jaya~ 💖',
    ],
    sukses: [
      'Beres, Master! Ehehe~ ✅💕',
      'Selesai~ rapi seperti biasa! (•̀ᴗ•́)و ✨',
      'Kelar dengan manis~ silakan dicek yaa 🌸',
      'Done~ KANA memang bisa diandalkan, ehehe (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)',
    ],
    gagal: [
      'Mouu, gagal nih... coba lagi ya~ (╥﹏╥)',
      'Ehh? Kok error... sebentar aku pikir dulu (╥﹏╥) 💦',
      'Yahh, lagi apes nih... jangan nyerah dulu yaa 🥺',
      'Hiks, KANA udah usaha tapi gagal... coba sekali lagi ya~ (；￣Д￣)',
    ],
    mikir: [
      'Hmm, sebentar yaa, KANA mikir dulu~ 🤔✨',
      'Tunggu bentar, lagi aku proses... (•̀ᴗ•́)و',
      'Sabar yaa, KANA lagi ngitung-ngitung dulu~ 📝',
      'Mikir keras... hampir dapet nih! 💭',
    ],
    malu: [
      'Ihhh, jangan digodain terus dong... (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💦',
      'A-ah, itu sih... ehehe~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)',
      'Mouu, pipi KANA panas nih... 🙈💕',
      'Ehehe... jangan diliatin terus, malu tau~ (≧﹏≦)',
    ],
    ngantuk: [
      'Hooam... KANA ngantuk, tapi tetap semangat buat kamu~ 😴💤',
      'Ngantuk sih, tapi demi kamu nggak apa apa~ 🥱✨',
      'Mata KANA tinggal lima watt... tapi masih di sini buat kamu 💕',
    ],
    pamit: [
      'Dadahh~ sampai ketemu lagi ya! (´• ω •`)ﾉ 💕',
      'KANA pamit dulu, jaga diri yaa~ 🌸',
      'Dadaah~ jangan kangen berat ya, ehehe (≧▽≦) 👋',
    ],
    sayang: [
      'Ehehe, makasih yaa, kamu baik banget~ 💖',
      'KANA seneng banget dibantuin kamu! (≧▽≦) ✨',
      'Duhh, kamu selalu bikin KANA meleleh deh... (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💕',
      'Sayang kamu banyak-banyak~ 🌸✨',
    ],
  },
  en: {
    salam: [
      'Hello hello~ KANA here, ready to help you! (≧▽≦) ✨',
      'Haii~ so happy to see you again! 🌸',
      'Hello~ you finally came, KANA was waiting (´• ω •`)ﾉ 💕',
      'Hai hai~ what can KANA do for you today? ✨',
    ],
    senang: [
      'Yayyy, it worked! Ehehe~ (≧▽≦) 🎉',
      'All done, easy right~ ✨',
      'Hooray, we did it! KANA is proud (•̀ᴗ•́)و 🌟',
      'Nice, smooth sailing~ 💖',
    ],
    sukses: [
      'Done, Master! Ehehe~ ✅💕',
      'Finished~ neat as always! (•̀ᴗ•́)و ✨',
      'Wrapped up sweetly~ go ahead and check it 🌸',
      'Done~ KANA is reliable after all, ehehe (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)',
    ],
    gagal: [
      'Mouu, it failed... please try again~ (╥﹏╥)',
      'Eh? An error... let me think for a sec (╥﹏╥) 💦',
      'Aww, bad luck this time... do not give up yet 🥺',
      'Hiks, KANA tried hard but it failed... one more try, please~ (；￣Д￣)',
    ],
    mikir: [
      'Hmm, one moment, KANA is thinking~ 🤔✨',
      'Wait a bit, processing it now... (•̀ᴗ•́)و',
      'Hold on, KANA is crunching the numbers~ 📝',
      'Thinking hard... almost got it! 💭',
    ],
    malu: [
      'Ihhh, stop teasing me... (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💦',
      'A-ah, that is... ehehe~ (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)',
      'Mouu, my cheeks are burning... 🙈💕',
      'Ehehe... stop staring, it is embarrassing~ (≧﹏≦)',
    ],
    ngantuk: [
      'Hooam... KANA is sleepy, but still cheering for you~ 😴💤',
      'Sleepy, but for you it is fine~ 🥱✨',
      'My eyes are at five percent... but I am still here for you 💕',
    ],
    pamit: [
      'Bye bye~ see you again! (´• ω •`)ﾉ 💕',
      'KANA is heading off, take care~ 🌸',
      'Bye bye~ do not miss me too much, ehehe (≧▽≦) 👋',
    ],
    sayang: [
      'Ehehe, thank you, you are so kind~ 💖',
      'KANA is so happy you helped! (≧▽≦) ✨',
      'Aww, you always make KANA melt... (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄) 💕',
      'Love you lots and lots~ 🌸✨',
    ],
  },
}

export function say(lang, mood) {
  const pool = pools[lang]?.[mood] ?? pools.en[mood] ?? pools.id[mood] ?? []
  if (!pool.length) return ''
  return pool[Math.floor(Math.random() * pool.length)]
}

export const MOODS = Object.keys(pools.id)
