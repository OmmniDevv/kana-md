# Standar Teks dan Tampilan KANA

Perintah owner 2026-11-04: seluruh teks di source code WAJIB dipercantik.
Acuan gaya: SC Elaina-MD milik owner (bingkai, small caps, baris beremoji)
digabung gaya menu KANA yang sudah disetujui owner. Teks polos tanpa
bingkai dianggap belum selesai.

## Tata bahasa tampilan

- Judul seksi memakai bingkai rumah:
  Baris pembuka: ╭─❏ <emoji> 「 *JUDUL* 」
  Baris isi: diawali ┊
  Baris penutup: ╰━━━━━━━
- Label memakai small caps (fungsi smallCaps di src/config/templates.js),
  nilai penting ditebalkan dengan *...*.
- Baris info penting boleh memakai emoji di awal baris (satu emoji per baris,
  cocok dengan isinya), meniru baris hadiah di referal Elaina.
- Pesan hasil singkat (klaim, error ringan, konfirmasi) memakai bingkai
  mini satu blok seperti contoh di plugins/user/referal.js.
- Suara moe KANA tetap dipertahankan ({mood}, akhiran khas), jangan jadi kaku.
- Dilarang memakai em dash di semua teks.

## Kartu bergambar

- Keluaran etalase (kartu info yang dipamerkan, contoh: menu, referal,
  profil) memakai pola menu: MB.Button dengan setImage memakai gambar
  header, title, body berbingkai, footer watermark menu.footer, quoted
  fake contact, contextInfo diteruskan. Fallback: gambar plus caption,
  lalu teks polos.
- Gambar header memakai aset di assets/ (menu-banner.jpg, welcome.jpg,
  goodbye.jpg, listbot.jpg, rpg.jpg, referal.jpg). Fitur yang butuh gambar
  baru: generate gambar dengan gaya thumbnail yang sama (tema hijau hitam
  OmniDevv, maskot chibi Kana, tanpa teks di gambar), atau kartu canvas
  untuk data dinamis seperti profil RPG (src/ui/profile-card.js).
- Tombol hanya aksi yang relevan dengan pesan itu (salin, bagikan, ulangi,
  lanjut). Tombol menu generik DILARANG di pesan hasil (perintah owner
  2026-11-04 17:19). Label tombol wajib satu emoji yang cocok lewat
  withButtonEmoji dari template pusat.

## Proses sapuan

- Kerjakan per kategori plugin. Setiap batch: npm test hijau, push,
  lalu tes live Mode A dengan prosedur kunci livetest v3, catat hasil
  di FEATURES.md (bedakan unit hijau dan LIVE LOLOS).
- String id dan en selalu diperbarui berpasangan.
- Ekspektasi tes live (kolom expect) disesuaikan bila teks berubah.
