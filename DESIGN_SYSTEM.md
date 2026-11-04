# DESIGN_SYSTEM: KANA

Token visual untuk aset gambar (thumbnail, kartu welcome, banner) dan pesan bot.

## Warna brand
- Violet utama: `#8B5CF6`
- Fuchsia aksen: `#D946EF`
- Latar gelap: `#17102B` (violet sangat gelap)
- Latar kartu: `#241845`
- Teks utama: `#FFFFFF`
- Teks sekunder: `#D8CCFF`

## Tipografi aset
- Judul besar: DejaVu Sans Bold (font sistem, tertanam saat komposisi PIL).
- Subteks: DejaVu Sans.

## Maskot
- Maskot resmi: set pose transparan Kana dari proyek it-reels (`public/brand/mascot/`, 14 pose PNG RGBA).
- Pose yang dipakai aset base: `halo.png` (thumbnail dan welcome), `fight.png` (banner RPG).
- Maskot selalu tampil utuh, tidak dipotong wajahnya, diletakkan di sisi kanan komposisi.

## Pola aset
- Thumbnail repo: 1280x640, latar gelap violet dengan lingkaran aksen fuchsia, maskot besar di kanan, teks KANA besar dan subteks "Bot WhatsApp Moe" di kiri.
- Kartu welcome: 1024x576, pola sama, teks sambutan grup.
- Banner RPG: 1024x576, pola sama, teks petualangan RPG.

## Nada pesan
- Persona moe gaya Kana: manis, hangat, playful, kaomoji secukupnya (maksimal 1 kaomoji dan 3 emoji per pesan).
- Informasi selalu nomor satu: perintah, link, dan langkah tidak boleh tenggelam dalam hiasan.
