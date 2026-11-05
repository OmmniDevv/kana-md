// Dataset lokal kata senja KANA: kalimat puitis bertema senja dalam
// Bahasa Indonesia (dengan padanan Inggris), ditulis orisinal untuk
// KANA dan frasa umum bertema senja. Pengganti API neoxr Elaina yang
// butuh API key terdaftar. Handler memilih acak dengan Math.random,
// bukan hash nama, jadi keluarannya benar-benar bervariasi.
export const SENJA = [
  { id: 'Senja mengajarkan bahwa yang indah tidak harus selamanya untuk bisa berarti.', en: 'Dusk teaches that beautiful things do not need to last forever to matter.' },
  { id: 'Langit merona dulu sebelum pamit pada matahari.', en: 'The sky blushes before it says goodbye to the sun.' },
  { id: 'Senja adalah bisikan semesta: istirahatlah, besok lanjut lagi.', en: 'Dusk is the universe whispering: rest now, continue tomorrow.' },
  { id: 'Cahaya oranye membuat jalan biasa pun terasa seperti kenangan.', en: 'Orange light makes even ordinary streets feel like memories.' },
  { id: 'Hari melambai perlahan, seperti teman lama di stasiun.', en: 'The day waves slowly, like an old friend at a station.' },
  { id: 'Di antara siang dan malam ada jeda bernama syukur.', en: 'Between day and night there is a pause called gratitude.' },
  { id: 'Senja adalah bukti bahwa akhir pun bisa indah.', en: 'Dusk is proof that endings can be beautiful too.' },
  { id: 'Matahari tidak pernah terburu-buru tenggelam, tapi juga tidak pernah terlambat.', en: 'The sun never hurries to set, yet it is never late.' },
  { id: 'Bayangan memanjang seiring cerita kita yang makin dalam.', en: 'Shadows grow longer as our stories grow deeper.' },
  { id: 'Setiap senja adalah latihan kecil untuk melepas dengan anggun.', en: 'Every dusk is a small rehearsal for letting go gracefully.' },
  { id: 'Cakrawala menyimpan rahasia yang tidak sanggup ditampung siang.', en: 'The horizon keeps secrets the day could not hold.' },
  { id: 'Angin senja membawa aroma perjuangan yang sudah selesai.', en: 'The evening breeze carries the scent of finished struggles.' },
  { id: 'Ada rindu yang hanya berani muncul saat langit berubah warna.', en: 'Some longing only dares to appear when the sky changes color.' },
  { id: 'Senja tidak pernah sama dua kali, sama seperti hari yang kamu jalani.', en: 'No two dusks are ever the same, just like the days you live.' },
  { id: 'Jingga di barat adalah surat pamit paling sopan dari matahari.', en: 'The orange in the west is the most polite farewell letter from the sun.' },
  { id: 'Saat senja, kota menurunkan suaranya dan hati menaikkan doanya.', en: 'At dusk, the city lowers its voice and the heart raises its prayers.' },
  { id: 'Burung-burung pulang lebih dulu, kita menyusul dengan langkah pelan.', en: 'The birds go home first, we follow with slow steps.' },
  { id: 'Senja membuat bayangan gedung pun terlihat seperti puisi.', en: 'Dusk makes even building shadows look like poetry.' },
  { id: 'Tidak semua yang tenggelam itu kalah, matahari buktinya.', en: 'Not everything that sinks has lost, the sun is the proof.' },
  { id: 'Di tepi senja, lelah berubah menjadi lega.', en: 'At the edge of dusk, tiredness turns into relief.' },
  { id: 'Langit senja adalah lukisan yang tidak pernah selesai dipandang.', en: 'The dusk sky is a painting you never finish admiring.' },
  { id: 'Senja mengingatkan kita pulang, bukan menyerah.', en: 'Dusk reminds us to go home, not to give up.' },
  { id: 'Cahaya terakhir selalu yang paling hangat, seperti pelukan sebelum berpisah.', en: 'The last light is always the warmest, like a hug before parting.' },
  { id: 'Ada doa yang sengaja disimpan untuk dibisikkan pada senja.', en: 'Some prayers are saved on purpose to be whispered at dusk.' },
  { id: 'Senja adalah jam pulang bagi matahari dan jam mulai bagi bintang.', en: 'Dusk is homecoming hour for the sun and starting hour for the stars.' },
  { id: 'Warna ungu di ujung hari adalah tanda malam datang dengan sopan.', en: 'The purple at the end of the day is a sign the night arrives politely.' },
  { id: 'Kalau siang terlalu bising, senja selalu punya cara menenangkan.', en: 'When the day is too noisy, dusk always has a way to calm it.' },
  { id: 'Senja jatuh di atap rumah seperti selimut tipis berwarna emas.', en: 'Dusk falls on rooftops like a thin golden blanket.' },
  { id: 'Jalan pulang terasa lebih panjang saat ditemani langit jingga.', en: 'The way home feels longer when accompanied by an orange sky.' },
  { id: 'Senja tidak bertanya seberapa berat harimu, ia hanya menemanimu pulang.', en: 'Dusk never asks how heavy your day was, it simply walks you home.' },
  { id: 'Di sela awan senja, ada harapan yang ikut pulang bersamamu.', en: 'Between the dusk clouds, hope comes home together with you.' },
  { id: 'Matahari pamit tanpa drama, semoga kita juga bisa begitu saat melepas sesuatu.', en: 'The sun leaves without drama, may we learn the same when letting go.' },
  { id: 'Senja adalah pengingat bahwa istirahat juga bagian dari perjalanan.', en: 'Dusk is a reminder that rest is also part of the journey.' },
  { id: 'Suara azan dan langit merah muda, kombinasi paling damai di penghujung hari.', en: 'The call to prayer and a pink sky, the most peaceful pairing at days end.' },
  { id: 'Bahkan hari terburuk pun ditutup senja dengan warna yang baik.', en: 'Even the worst day is closed by dusk with kind colors.' },
  { id: 'Senja membagi langit menjadi dua cerita: yang sudah lewat dan yang akan datang.', en: 'Dusk splits the sky into two stories: what has passed and what is coming.' },
  { id: 'Hangatnya senja tidak lama, tapi cukup untuk menguatkan langkah pulang.', en: 'The warmth of dusk is brief, but enough to strengthen the steps home.' },
  { id: 'Ada nama yang selalu terlintas tiap langit mulai menggelap.', en: 'There is a name that always crosses the mind when the sky begins to darken.' },
  { id: 'Senja di pantai menulis namanya di pasir lalu menghapusnya dengan ombak.', en: 'Dusk at the beach writes its name in the sand then erases it with the waves.' },
  { id: 'Lampu jalan menyala satu-satu, seperti bintang yang turun lebih dekat.', en: 'Street lights turn on one by one, like stars coming down closer.' },
  { id: 'Senja mengajarkan pulang bukan berarti selesai, hanya beristirahat sebentar.', en: 'Dusk teaches that going home does not mean finished, only resting for a while.' },
  { id: 'Kalau hatimu sedang mendung, tunggulah senja, ia pandai menghibur tanpa kata.', en: 'If your heart is cloudy, wait for dusk, it comforts without words.' },
  { id: 'Setiap warna senja adalah janji bahwa besok matahari akan kembali.', en: 'Every color of dusk is a promise that the sun will return tomorrow.' },
  { id: 'Di akhir hari, senja mengumpulkan semua cerita dan menyimpannya di cakrawala.', en: 'At the end of the day, dusk gathers all stories and keeps them on the horizon.' },
  { id: 'Senja yang sama terlihat berbeda dari jendela yang berbeda, begitu juga hidup.', en: 'The same dusk looks different from different windows, and so does life.' },
]

export function randomSenja(rng = Math.random, lang = 'id') {
  const item = SENJA[Math.floor(rng() * SENJA.length)] || SENJA[0]
  return lang === 'en' ? item.en : item.id
}
