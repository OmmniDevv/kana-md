# FEATURES: status KANA

## Preflight Fase 0 (2026-11-04)
- Node v24.22.1 (target 20 ke atas: lolos), npm 10.9.4, ffmpeg 8.1.2 tersedia.
- `@rexxhayanasi/elaina-baileys` versi exact terbaru dari `npm view`: 1.4.7, di-pin di package.json.
- README library dibaca: Penyimpanan Sesi, Kode Pairing, Pengalamatan LID/PN/JID, Button, Mini App HTML, Penanganan Masalah.
- API terverifikasi langsung dari paket 1.4.7: `usePostgresAuthState` ada (named export), `MB.sendHtmlApp` ada, `MB.checkNativeFlowButtons` ada, `checkHtmlApp` ada sebagai named export top-level (bukan `MB.checkHtmlApp`).
- Tes jaringan WhatsApp dan Supabase: informasional saja, pairing ditunda sampai user memberi NOMOR_BOT dan NOMOR_OWNER. Belum ada kredensial Supabase yang diberikan, jadi koneksi Supabase belum diuji live.
- Folder `./reference/` tidak tersedia di workspace saat base dibangun, jadi tidak ada yang dibaca atau disalin dari referensi. Daftar fitur referensi belum dijelajahi.

## Base Fase 1
| Fitur | Status |
|---|---|
| Koneksi pairing code + reconnect backoff/jitter + loggedOut berhenti | Kode selesai, belum dites live (menunggu nomor) |
| Sesi Postgres `usePostgresAuthState` (driver supabase) | Kode selesai, belum dites live |
| Sesi lokal `useMultiFileAuthState` di .dev-data (driver local) | Kode selesai |
| Pipeline multi-prefix (. ! / #), gates owner/group/private/cooldown, error boundary | Selesai |
| Plugin loader + karantina plugin rusak | Selesai, dites unit |
| i18n id + en, fallback en ke id ke kunci, `npm run i18n:check` | Selesai, hijau |
| Persona moe KANA dua bahasa | Selesai |
| Storage local (JSON .dev-data) | Selesai, dites kontrak |
| Storage supabase (bot.kv + migrasi SQL, RLS aktif tanpa policy anon) | Kode selesai, belum dites live |
| Plugin ping, menu, lang, help, owner (status) | Selesai |
| Tombol MB.Button + fallback teks | Kode selesai, belum dites live |
| Game HTML contoh (games/hello, perintah .hello) | Kode selesai, belum dites live di HP |
| Tes unit dan kontrak (node:test) | 5 tes, hijau |
| Spike S1 sampai S7 | Belum jalan, semua butuh pairing dan HP user |

## Scraper dan plugin downloader/search/AI (2026-11-04, atas kiriman user)

Status di bagian ini: kode terpasang + tes unit hijau + smoke test loader.
Tes live di bot tetap menunggu pairing (Gate 1). Tes jaringan langsung dari
VM pada 2026-11-04: Pinterest search berhasil (3 hasil), Spotify search
berhasil (hasil pertama "Sepatu"), metadata iTunes fallback berhasil
("Sepatu", Tulus). Sisanya belum diuji jaringan satu per satu.

| Modul / plugin | Sumber | Status |
|---|---|---|
| src/scrapers/runner.js (SSRF guard, retry, circuit breaker, downloadBuffer, withTempDir) | Kerangka spesifikasi 4.8 | Terpasang, dites unit |
| src/scrapers/spotify/spotify.js, plugin .spotify | Kode kiriman user (spotmp3 + spotidown) | Terpasang, search lolos tes jaringan |
| src/scrapers/spotify/metadata.js, plugin .lirik, fallback metadata .spotify | Yui Agents (Spotify Embed + iTunes + lirik lyrics.ovh/lrclib) | Terpasang, iTunes lolos tes jaringan |
| src/scrapers/youtube/youtube.js, plugin .play dan .yts | Kode kiriman user (@distube/ytdl-core), diubah ke file temp | Terpasang |
| src/scrapers/pinterest/pinterest.js, plugin .pinterest | Kode kiriman user | Terpasang, lolos tes jaringan |
| src/scrapers/facebook/facebook.js, plugin .fb | Kode kiriman user (snapsave.app) | Terpasang |
| src/scrapers/instagram/instagram.js, plugin .ig | Kode kiriman user (snapsave.app) | Terpasang |
| src/scrapers/tiktok/tiktok.js, plugin .tiktok | Kode kiriman user (tiklydown) + fallback tikwm dari snippet Jerexd, https://dpaste.org/YNLWj/raw | Terpasang |
| src/scrapers/komik/komikcast.js, plugin .komik | Adaptasi snippet Jerexd, https://paste.c-net.org/PresumeCaddy | Terpasang |
| src/scrapers/font/dafont.js, plugin .font | Adaptasi snippet Jerexd, https://paste.c-net.org/SworeSmashed | Terpasang |
| src/scrapers/ai/rudder.js, plugin .ai | Snippet rudder.chat oleh hazeloffc (t.me/hazeloffc) | Terpasang, opt-in: aktif hanya bila RUDDER_USER_ID, RUDDER_COOKIE_C0, RUDDER_COOKIE_C1, RUDDER_TH_WHO diisi di .env |

| src/services/auto-bio.js | Fitur dari user: bio profil otomatis | Terpasang, dites unit; tes live menunggu bot connect |

Detail auto bio: saat connection open, bio profil bot diisi status ON plus
runtime dari template (BIO_ON_TEMPLATE, placeholder {bot}, {runtime},
{since}), diperbarui tiap 5 menit, dan diubah ke OFF (BIO_OFF_TEMPLATE)
pada shutdown rapi. Default template moe bawaan kode bila env kosong.
Toggle AUTO_BIO (default true). API sock.updateProfileStatus terkonfirmasi
di README dan kode library v1.4.7. Kegagalan update bio tidak fatal.

Perbaikan bug base dari pairing live 2026-11-04: (1) src/index.js sekarang
memuat .env lewat src/load-env.js (process.loadEnvFile bawaan Node,
diimpor pertama); (2) jeda requestPairingCode diubah 3000 ms menjadi
6000 ms (terbukti berhasil live dengan kode KANAMOE1), dan jalur loggedOut
tetap memanggil clearAuth() agar sisa sesi tidak terdaftar yang korup
dibersihkan dengan aman.

Triage lengkap semua link paste ada di docs/SNIPPETS.md. Catatan jujur:
scraper gratis akan rusak berkala; runner dibuat agar kegagalannya rapi
(error jelas ke pengguna) dan perbaikannya murah. Batas kirim media:
audio 16 MB, video 64 MB, gambar 16 MB, dokumen 64 MB.

## Menu ala Elaina-MD (2026-11-04, permintaan user)

Catatan riwayat: mekanisme pada tabel awal ini sudah digantikan oleh port final dari SC Elaina-MD v6.3.0 milik owner pada seksi port menu di bawah. Formatter registry dan prinsip dinamis tanpa daftar hardcoded tetap dipakai.

| Item | Status |
|---|---|
| Menu gaya bot MD klasik: bingkai box-drawing, header nama bot + sapaan moe ke user (pushName), runtime, mode (env BOT_MODE, default public), jumlah plugin dan perintah (termasuk alias), tanggal + jam WIB | Terpasang, dites unit + smoke test loader |
| Seksi per kategori dari registry (main, download, search, ai, owner) dengan ikon dan judul 「 KATEGORI 」, perintah format "│ ◦ .nama" teks polos | Terpasang, dinamis dari registry, tidak ada daftar hardcoded |
| Formatter murni di src/ui/format.js (formatMenu, formatWibDateTime, sortCategories), label semua lewat i18n; nada id moe + alay, en moe polos | Terpasang, dites unit |
| Gambar header assets/welcome.png: jadi caption bila menu muat 1024 karakter, selain itu gambar terpisah lalu teks menu; tombol quick reply .ping/.help/.owner dipertahankan dengan fallback teks | Terpasang (smoke test lokal: gambar terkirim, fallback teks jalan) |
| Help (.help) diselaraskan: detail perintah dan hint dalam bingkai yang sama | Terpasang |

## Port menu dari SC Elaina-MD v6.3.0 milik owner (2026-11-04, koreksi final user)

Sumber mekanisme adalah SC Elaina-MD v6.3.0 milik owner sendiri, repo OmmniDevv/Elaina-MD, terutama plugins/main/menu.js, plugins/main/menucat.js, plugins/main/allmenu.js, dan lib/menuHelper.js. Bukan SC publik lain.

| Item | Status |
|---|---|
| .menu utama gaya Cantarella: reaksi loading, MB.Button dengan title nama bot, body info moe berisi sapaan, nama, owner, uptime, memori, total perintah, jam dan tanggal WIB, tautan repo, footer, serta gambar banner | Terpasang, dites unit dari payload relayMessage |
| Tombol menu utama: single_select berisi section dan row per kategori dengan id ".menu <key kategori>", cta_url ke repo GitHub kana-md, cta_copy nama bot, quick reply ".menu all" dan ".ping", serta quick reply ".menu owner" khusus owner | Terpasang, dites unit untuk owner dan non-owner |
| Quoted menu utama adalah fake contactMessage ala SC owner; contextInfo hanya memakai mentionedJid, isForwarded, dan forwardingScore tanpa info newsletter karangan | Terpasang, dites unit |
| Fallback menu utama: bila MB.Button gagal, bot mengirim banner sebagai image plus caption, atau teks bila banner tidak ada. Caption selalu memuat daftar perintah ".menu <kategori>" yang terlihat oleh pengirim sebagai jalan keluar lengkap | Terpasang, dites unit dengan relayMessage yang sengaja dibuat gagal |
| .menu <kategori>: tepat satu pesan teks satu kategori memakai formatter KANA, dengan quoted fake orderMessage troli dan thumbnail banner 300x300 | Terpasang, dites unit |
| .menu all: tepat satu pesan teks penuh semua kategori yang terlihat oleh pengirim, dengan quoted fake troli yang sama dan contextInfo mentionedJid, forwardingScore 9, isForwarded true | Terpasang, dites unit |
| Thumbnail troli dibuat dari banner memakai jpeg-js: crop tengah ke area persegi lalu resize nearest neighbor ke 300x300 dan encode JPEG quality 80 | Terpasang, dimensi hasil dibuktikan di tes unit |
| Menu user belum daftar tidak berubah: gate pipeline tetap menampilkan peringatan + tombol daftar | Terpasang (test/registration-gate.test.js) |
| Pipeline membuktikan id ".menu download" tertangkap dari single_select, listResponseMessage, quick reply native flow, template button reply, dan buttons response | Terpasang, dites unit (test/pipeline-buttons.test.js) |
| Perbaikan harness livetest: TEST_CHATS digit mentah dinormalisasi jadi JID penuh sebelum pesan sintetis dibangun (normalizeChatJid), memperbaiki error jidDecode yang menggagalkan semua uji builtin | Terpasang, dites unit (test/livetest.test.js) |

Pelajaran dari lib/menuHelper.js SC owner tetap berlaku: single_select dibuang di banyak klien WhatsApp, sedangkan quick_reply didukung lebih luas dengan batas 10. Karena itu fallback teks menu utama wajib memuat daftar kategori lengkap, dan single_select baru tidak diperkenalkan untuk tombol di luar menu utama.

Status tes live port menu: ⏳ menunggu tes live oleh parent agent bareng user (kode terpasang + tes unit hijau; subagent port tidak menjalankan livetest dan tidak me-restart service).

## Aset resmi dari user (2026-11-04)

| Item | Status |
|---|---|
| assets/menu-banner.jpg (banner KANA MD hijau): gambar header MB.Button pada .menu utama, sumber thumbnail troli 300x300 pada .menu <kategori> dan .menu all, serta gambar fallback menu utama | Terpasang |
| thumbnail.png root repo diganti banner KANA MD 1280x720 dari user; README meng-embed thumbnail.png | Terpasang, terverifikasi di GitHub |
| assets/welcome.jpg: gambar utama kartu welcome grup (caption moe + mention member baru) | Terpasang di plugin welcome Fase 4 |
| assets/goodbye.jpg: gambar pesan goodbye grup (caption moe + nama member keluar) | Terpasang di plugin welcome Fase 4 |
| assets/listbot.jpg: header perintah .listbot | Terpasang Fase 2 |
| assets/rpg.jpg: header menu dan profil RPG, menggantikan rpg.png untuk semua pemakaian RPG | Dipakai Fase 8 |
| welcome.png dan rpg.png hasil generate lama tetap di repo sebagai cadangan, tidak dipakai lagi | Tercatat |

## Aturan tetap: semua fitur memakai button (keputusan user 2026-11-04)

Setiap keluaran fitur yang punya langkah lanjutan wajib menyertakan tombol MB.Button lewat src/ui/buttons.js (quick_reply maks 10, tidak dicampur jenis lain; id tombol adalah perintah valid berprefix titik), badan pesan tetap memuat versi teks perintahnya, dan kegagalan kirim tombol selalu jatuh ke fallback teks. Label tombol lewat i18n id+en. Rincian per kategori ada di laporan pembangunan dan di plugin masing-masing. Menu utama .menu memakai mekanisme khusus dari SC Elaina-MD v6.3.0 milik owner, lihat seksi port menu di atas; single_select tidak diperkenalkan untuk tombol di luar menu utama.

## Persona ekspresif (keputusan user 2026-11-04)

Keluaran bot dibuat ekspresif: pool persona moe di src/persona/moe.js diperkaya variasi emoji dan kaomoji per mood. Batas lama prompt (maks 1 kaomoji + 3 emoji) dilonggarkan atas perintah langsung user; informasi inti (angka, tautan, perintah, error) tetap jelas terbaca.

## Sistem daftar wajib (keputusan user 2026-11-04)

| Item | Status |
|---|---|
| Field profil: registered (bool), regName, registeredAt di user-service | Terpasang, dites unit |
| .daftar (alias register, kategori main): .daftar <nama> mendaftar; .daftar auto memakai pushName (tombol Daftar Otomatis); yang sudah terdaftar mendapat info akunnya; balasan sukses bertombol ke .menu dan .profil | Terpasang, dites unit |
| Gate di pipeline: user belum terdaftar hanya boleh .daftar dan .help daftar; perintah lain termasuk .menu ditolak dengan peringatan moe + tombol [Daftar Otomatis .daftar auto] [Cara Daftar .help daftar]; owner selalu lolos | Terpasang, dites unit (test/registration-gate.test.js, 6 tes) |
| Statistik web (kv bot_stats): totalUsers hanya menghitung user terdaftar sebagai member | Terpasang di scheduler |
| Pengingat pribadi .ingatkan (Fase ekstra) disimpan di namespace reminders dan dikirim scheduler saat jatuh tempo | Scheduler terpasang; plugin di gelombang ekstra |

## Gelombang Fase 2 sampai 6 (2026-11-04)

Status umum gelombang ini: kode terpasang + tes unit hijau (total suite 127 tes, i18n:check hijau, loader 99 plugin 0 karantina). ⏳ Semua menunggu tes live bareng user; belum ada yang dinyatakan lulus live.

| Fase | Isi | Perintah |
|---|---|---|
| Fase 2 Core UX | Profil, XP/level, limit harian, leaderboard XP, pencarian fitur, mode public/self, ban/unban, broadcast ke grup opt-in (.subscribe/.subscribe off) dengan jeda antar kirim, statistik storage, kesehatan scraper, reload plugin, daftar bot | .daftar .profil .level .limit .leaderboard .carifitur .listbot .subscribe .mode .ban .unban .broadcast .dbstats .scraperhealth .reload |
| Fase 3 Game HTML | Token HMAC per pemain, server skor WebSocket murni Node (aktif hanya bila SCORE_WS_PORT diisi; validasi token, rate limit, batas skor per game, skor terbaik ke namespace scores), katalog game dari folder games/, 11 game mandiri (8 wajib + 3 tambahan) dengan kontrol sentuh, pause saat hidden, kirim skor via window.__BOT | .games .game .topgame; game: dino, flappy, snake, 2048, tetris, memory, breakout, tictactoe, minesweeper, whackamole, blockblast |
| Fase 4 Grup | Proteksi middleware (antilink, antispam/flood, antitoxic dengan daftar kata grup, antijudol, antiphising) dengan warn otomatis dan auto-kick, welcome/goodbye memakai aset resmi user, admin (kick/add/promote/demote), tagall/hidetag, buka/tutup + jadwal grup (dieksekusi scheduler), set nama/deskripsi/foto, link/revoke, AFK, absen, polling native, rules, custom command per grup | .protect .guard .welcome .warn .warnings .kick .add .promote .demote .tagall .hidetag .grup .jadwalgrup .setname .setdesc .setppgrup .linkgrup .revoke .afk .absen .poll .rules .setrules .customcmd |
| Fase 5 Pencarian dan unduhan | 12 modul scraper search + mediafire/gdrive/ytmp4; tes jaringan jujur: Wikipedia, myQuran, Open-Meteo, BMKG, er-api, Bing Images, mShots, TinyURL terbukti jalan dari VM; KBBI, Jikan, Google Translate gtx gagal dari lingkungan VM (plugin menjawab jujur); chordtela hasil dirender client-side sehingga parser berakhir jujur belum bisa dijangkau | .wiki .kbbi .chord .gambar .anime .cuaca .gempa .sholat .kurs .terjemah .qr .scanqr .shortlink .ssweb .ocr .aio .ytmp4 .mediafire .gdrive .soundcloud .threads .capcut |
| Fase 6 Stiker dan maker | Konversi stiker WebP + injeksi EXIF pack/author (parser baca-balik dites), konversi media ffmpeg, brat/attp/ttp, emojimix Emoji Kitchen, meme, fakechat/faketweet berlabel PARODI jelas, quotly, carbon, textstyle, logo, hd (perbesaran biasa, diberi label jujur bukan AI) | .sticker .toimg .tovideo .tomp3 .tovn .brat .attp .ttp .emojimix .meme .fakechat .faketweet .quotly .carbon .textstyle .logo .hd .removebg |

## Gelombang Fase 7 sampai 10 + ekstra (2026-11-04)

Status umum: kode terpasang + tes unit hijau (total suite 241 tes, i18n:check hijau, loader 174 plugin 0 karantina, boot bersih tanpa BOT_NUMBER). ⏳ Semua menunggu tes live bareng user.

| Fase | Isi | Perintah |
|---|---|---|
| Fase 7 AI | Provider AI: rudder.chat bila terkonfigurasi, fallback Pollinations publik gratis; memori percakapan per user (kv aimem, 6 pasang) hanya dipakai saat mengobrol; text-to-image Pollinations (terbukti HTTP 200 dari VM); TTS Google Translate publik (terbukti 200 audio dari VM); ringkas URL/teks; vision siap pakai bila owner mengisi VISION_API_URL, selain itu menjawab jujur belum terkonfigurasi | .ai .aireset .aiimg .vision .ringkas .tts |
| Fase 8 RPG dan ekonomi | Engine + data (31 item, 8 resep, 8 monster, 6 job, 11 entri shop): klaim berkala, gather 4 aktivitas, craft, shop beli/jual, bank tanpa bunga, duel PvP, dungeon 3 gelombang, pet, clan + clan war; header assets/rpg.jpg di .rpg dan .menurpg | .rpg .menurpg .daily .hourly .weekly .mining .fishing .hunting .farming .craft .recipes .shop .buy .inventory .bank .duel .dungeon .pet .job .clan .clanwar |
| Fase 9 Kuis, fun, religi | Engine kuis (sesi per chat di kv, TTL, XP): dataset original (caklontong 21, asahotak 21, tekateki 21, family100 21, susunkata 38 kata, bendera 26, kimia 20 unsur, tebakgambar 12); jawaban bisa lewat tombol A-D, perintah .jawab, atau teks biasa (before); truth 22, dare 21, khodam 21, jokes 16; cek-* dan zodiak dengan disclaimer; ayat/hadits + pengingat religi grup (scheduler mengirim sesuai religiTime); seed dataset ke storage lewat scripts/seed.js | .family100 .caklontong .asahotak .tekateki .susunkata .tebakgambar .tebakbendera .tebakkimia .jawab .nyerah .truth .dare .cekjodoh .cekkhodam .zodiak .ayat .hadits .religi |
| Fase 10 Jadibot | Manajer sesi owner-only: maks 3 sesi, auth terpisah per nama sesi, pipeline yang sama, kode pairing diberitahukan ke owner, berhenti per sesi; .listbot menampilkan sesi aktif lewat listJadibotSessions() | .jadibot .stopjadibot |
| Ekstra (perintah user: perbanyak fitur) | Tools: kalkulator aman tanpa eval, konversi satuan, todo, catatan, pengingat pribadi (scheduler mengirim), transfer koin, jam 4 zona; game teks: slot koin virtual, blackjack (+hit/stand), daduvs, suit; fun: bola8, cekmood/cekberuntung/cekpintar, motivasi, pantun, weton (jangkar 17-08-1945 Jumat Legi, teruji), artinama, joke; maker: smeme, circle (terverifikasi ffmpeg asli); search: resep TheMealDB, film TVMaze; RPG: gacha; main: credits | .kalkulator .konversi .todo .catatan .ingatkan .transfer .jam .slot .blackjack .hit .stand .daduvs .suit .bola8 .cekmood .cekberuntung .cekpintar .motivasi .pantun .weton .artinama .joke .smeme .circle .resep .film .gacha .credits |
| Consistency pass tombol | Plugin lama diseragamkan ke aturan button: yts (tombol hasil ke .play URL), play (menerima URL YouTube langsung + tombol susulan), spotify (URL langsung + tombol hasil), pinterest, fb, ig, tiktok, lirik, komik, font, ping, lang | (mengedit plugin yang sudah ada) |
| Harness tes live Mode A | scripts/livetest.js: hanya aktif bila LIVETEST=1 dan bukan production; menolak chat di luar TEST_CHATS; cek kesehatan akun (fetchAccountReachoutTimelock + fetchNewChatMessageCap, berhenti total bila dibatasi); jeda acak 2-4 detik, batas 20 pesan/menit; hasil ke test/live-results.json sebagai status terkirim + panduan expect untuk dicocokkan user di HP (Mode A tidak memvonis otomatis). Tes unit logika penolakan hijau; harness TIDAK dijalankan | Siap pakai menunggu sesi tes bareng user |
| Kontrak login web | Alur utama: web menulis web_login_requests, watcher bot (src/services/web-login-watcher.js, polling 20 detik, sudah diwiring di index.js) mengirim kode via WhatsApp lalu menghapus codePlain dan menandai sent; anti-spam jeda 2 menit dan maks 5 kode per nomor per hari (web_login_limits); record kedaluwarsa dihapus. Cadangan manual: .webcode (namespace web_login, hash sha256, 10 menit, sekali pakai). Kontrak lengkap di docs/WEB.md. Fix 2026-11-05: expiresAt kini didukung dua format (epoch ms dan string ISO dari web) lewat src/services/expires-at.js; sebelumnya record ISO dihapus sebagai kedaluwarsa tanpa kirim kode | .webcode |
| Jembatan HTTPS login web | AKTIF + LIVE LOLOS 2026-11-04 16:31 WIB: src/services/supabase-rest.js + web-bridge.js merutekan ns web_login_requests, web_login_limits, dan kv bot_stats ke PostgREST Supabase (skema bot) karena pg dari VM timeout; storage utama bot tetap lokal. Tes end to end nyata: record pending nomor owner ditanam lewat REST, dalam satu siklus polling status berubah sent, attempts 1, codePlain terhapus, kode terkirim ke WhatsApp owner. Penanda watchdog: ~/workspace/kana-md-run/data/bridge-health.json ditulis atomik tiap siklus (lastPollOkAt, lastCodeSentAt, lastError); abort cold-start pertama tercatat lalu pulih (lastError kembali null, latensi REST sekitar 1,8 detik). LIVE LOLOS ULANG 2026-11-05 11:14 WIB sesudah fix expiresAt ISO: request-code web nyata untuk nomor owner, status endpoint pending berubah sent dalam sekitar 10 detik, lastCodeSentAt bergerak ke 2026-11-05T04:14:18.947Z, verify web balas ok role owner dan GET /api/me 200 role owner | (layanan latar) |

## Belum dibangun atau ditunda (jujur)

- OCR (.ocr): plugin menjawab jujur belum tersedia; tesseract.js dinilai terlalu berat dan data latihnya butuh unduhan runtime.
- Remove background (.removebg): belum ada cara lokal gratis yang nyata tanpa model atau key; plugin menjawab jujur.
- SoundCloud, CapCut: SELESAI 2026-11-04 malam, scraper asli terverifikasi lokal (lihat bagian Ekspansi paritas). Threads: DINONAKTIFKAN 2026-11-04 malam (halaman shell login di semua UA, berkas di disabled-plugins/threads.js).
- Vision (.vision): struktur siap, menunggu owner mengisi VISION_API_URL (endpoint kompatibel gaya OpenAI dengan image_url); tanpa itu plugin menjawab belum terkonfigurasi.
- Skor game hanya tercatat bila owner mengisi SCORE_WS_PORT dan SCORE_WS_HOST yang bisa dijangkau HP; tanpa itu game tetap bisa dimainkan tanpa papan skor online.
- Pairing jadibot nyata dan semua fitur gelombang ini belum diuji live (aturan proyek: tidak pairing dan tidak mengirim pesan WhatsApp tanpa instruksi owner di chat utama). Harness Mode A siap untuk sesi tes tersebut.
- Bot live di /tmp/kana-pair masih menjalankan kode sebelum gelombang fitur ini; restart dengan kode baru menunggu giliran owner di chat utama.

## Ekspansi 700 perintah (2026-11-04, perintah user, sedang berjalan)

Target: minimal 700 perintah terdaftar (unik + alias) dan minimal 420 perintah unik, semua fitur memakai button, semua plugin dites live satu per satu. Alur kerja wajib dari user (15:44 WIB): setiap selesai 1 plugin langsung tes live di WhatsApp saat itu juga lewat harness Mode A difilter per plugin (TEST_FILTER), error diperbaiki di tempat sebelum lanjut plugin berikutnya; pengaman kesehatan akun tetap berlaku penuh dan tes berhenti total bila akun capped/warned/timelock. Hasil tes live per plugin dicatat di tabel hasil tes live di bawah.

### Batch Fondasi Ekspansi (2026-11-04)

| Item | Status |
|---|---|
| Template teks satu tempat: src/config/templates.js (kunci i18n template baku, footerLine/withFooter, default welcome/goodbye dengan placeholder {user} {group} {count}, renderTemplate, smallCaps); locale inti tambah blok template simetris id/en | Terpasang, dites unit (test/templates-settings.test.js) |
| Footer abu ala Elaina jadi pola baku: src/ui/buttons.js memakai footer bawaan dari template pusat bila pemanggil tidak memberi footer; footer eksplisit pemanggil lama tidak ditimpa | Terpasang, dites unit |
| Settings teks grup persisten: src/services/group-settings.js (namespace kv group_settings), welcome/goodbye grup membaca teks efektif dari settings dengan fallback default template pusat; plugin welcome di-retrofit | Terpasang, dites unit |
| Perintah admin grup baru: .setwelcome dan .setgoodbye (tanpa argumen menampilkan teks efektif, argumen teks menyimpan maks 500 karakter, argumen reset mengembalikan default) | Terpasang, dites unit; total plugin kini 176 |
| Game HTML wajib diteruskan: src/ui/htmlgame.js meneruskan forwarded: true + forwardingScore: 999 secara eksplisit ke MB.sendHtmlApp pada kedua jalur kirim; terbukti dari payload relay untuk semua 12 game di folder games/ plus jalur .hello (contextInfo isForwarded true, forwardingScore 999, forwardedAiBotMessageInfo ada) | Terpasang, dites unit (test/game-forwarded.test.js, 14 tes) |
| Footer .games dan .topgame diseragamkan ke kunci template pusat (menu.footer) | Terpasang |
| externalAdReply: grep di src/, plugins/, scripts/, test/ bersih, 0 temuan | Terverifikasi 2026-11-04 |
| Harness livetest: dukungan TEST_FILTER (regex nama plugin/input), TEST_OFFSET, TEST_LIMIT untuk tes per plugin atau per irisan; hasil uji kini mencatat nama plugin | Terpasang, dites unit (test/livetest.test.js, 15 tes) |
| Dependensi @napi-rs/canvas 1.1.0 (pin exact) untuk kartu profil canvas | Terpasang, terverifikasi jalan di VM (render PNG) |

### Aset gambar generate (assets/gen/, hasil fitur generate gambar, diperiksa visual satu per satu)

| Aset | Pemakaian | Hasil periksa visual |
|---|---|---|
| profile-bg.png | Latar kartu profil canvas | Lolos: maskot chibi rambut hijau + headphone telinga kucing di meja holografik, sisi kiri gelap bersih untuk overlay teks, tanpa teks/watermark |
| rpg-battle.png | Seni header RPG | Lolos: ksatria chibi melawan slime bayangan, hutan gelap aksen hijau, tanpa teks/watermark |
| games-art.png | Seni menu game | Lolos (versi regenerasi): maskot rambut hijau + headphone telinga kucing yang sama, ruang arcade hijau hitam, tanpa teks/watermark. Versi pertama rambut pink dibuang karena tidak konsisten dengan maskot |

Catatan: games-art.png belum dipasang ke keluaran .games karena helper sendButtons belum punya slot gambar header; aset tersimpan dan siap dipakai saat helper mendukung gambar.

### Hasil tes live per plugin (Mode A, difilter per plugin)

Definisi selesai per gerbang kualitas user (2026-11-04 16:01 WIB): tes unit hanya saringan awal. Plugin dihitung beres hanya bila berstatus LIVE LOLOS di tabel ini, artinya uji harness Mode A terfilter plugin itu berakhir completed, terkirim, dan nol baris "handler error" di log harness. Plugin yang belum LIVE LOLOS tidak ditulis selesai di dokumen ini. Penilaian visual balasan di HP owner tetap menjadi cek tampilan tambahan.

PROSEDUR WAJIB JENDELA TES LIVE (akar masalah terbukti 2026-11-04): cron kana-bot-watchdog (5 menit, self-healing) WAJIB dijeda (enabled false) selama jendela tes live dan diaktifkan lagi sesudahnya. Bukti: dua jendela tanpa jeda menghasilkan gugus kegagalan "Connection Closed" pada plugin pengirim media (watchdog menghidupkan bot produksi saat service sengaja dihentikan untuk harness, dua proses berebut satu sesi WA); jendela yang sama sesudah watchdog dijeda: 6 dari 6 lulus bersih tanpa perubahan kode plugin.

CATATAN JENDELA SEARCH 2026-11-04 16:38-16:43 WIB: film, kurs, ocr, qr, resep, scanqr, shortlink, ssweb LIVE LOLOS (terkirim, 0 handler error; ocr dan scanqr BELUM TERUJI PENUH karena butuh media kutipan yang tidak bisa dikirim harness teks, balasan pengingatnya terkirim anggun). Sepuluh plugin lain (anime, chord, cuaca, font, gambar, gempa, kbbi, sholat, terjemah, wiki) gagal "Connection Closed" BUKAN karena handler atau sumber: run watchdog yang sudah terlanjur mengantre sebelum jeda menghidupkan bot produksi 16 detik sesudah service dihentikan, dua proses berebut satu sesi WA sepanjang jendela (jurnal membuktikan flap tersambung-putus tiap beberapa detik). Prosedur diperkeras (v3): jeda watchdog + service dihentikan lalu dipantau 25 detik dan dihentikan ulang bila hidup lagi sebelum tes dimulai. Kesepuluh plugin itu dites ulang dengan v3.

| Plugin | Uji | Status live | Catatan |
|---|---|---|---|
| profil | .profil | LIVE LOLOS 2026-11-04 16:03 WIB | Kartu canvas terkirim, 0 handler error; service dipulihkan dan tersambung lagi sesudah tes |
| ai | .ai | LIVE LOLOS PENUH | Tes live input asli 2026-11-04 16:22 WIB: pertanyaan "Apa ibu kota Jepang?" dijawab Tokyo, terkirim, 0 handler error |
| aiimg | .aiimg | LIVE LOLOS PENUH | Tes live prompt asli 2026-11-04 16:22 WIB: gambar kucing oren berkacamata terkirim, 0 handler error |
| aireset | .aireset | LIVE LOLOS 2026-11-04 16:05 WIB | Terkirim, 0 handler error; tanpa argumen memang fungsi aslinya (reset memori) |
| ringkas | .ringkas | LIVE LOLOS PENUH | Tes live teks asli 3 kalimat 2026-11-04 16:22 WIB, ringkasan terkirim, 0 handler error |
| tts | .tts (plugin ai) | LIVE LOLOS PENUH | Tes live teks asli 2026-11-04 16:22 WIB, voice note terkirim, 0 handler error |
| vision | .vision | LIVE LOLOS 2026-11-04 16:05 WIB | Terkirim, 0 handler error; perilaku aslinya memang menjawab belum dikonfigurasi tanpa VISION_API_URL |
| aio | .aio | LIVE LOLOS PENUH | Tes live link TikTok asli 2026-11-04 16:23 WIB lewat rantai unduh TikTok, terkirim, 0 handler error |
| capcut | .capcut | LIVE LOLOS 2026-11-04 16:05 WIB | Terkirim, 0 handler error; CATATAN audit paritas: ini STUB yang hanya membalas belum tersedia, status fitur SEBAGIAN, wajib diport scrapernya sebelum dihitung fitur selesai |
| fb | .fb | LIVE LOLOS PENUH | Tes live link FB publik asli 2026-11-04 16:23 WIB, video terkirim, 0 handler error |
| gdrive | .gdrive | LIVE LOLOS PENUH | Tes live link Drive publik asli 2026-11-04 16:23 WIB, berkas terkirim, 0 handler error |
| ig | .ig | GANGGUAN SUMBER | Tes live ulang input asli 2026-11-04 16:23 WIB: balasan terkirim 0 handler error, tetapi isinya pemberitahuan gagal karena SnapSave membalas "Empty response from SnapSave" untuk dua link IG publik asli berbeda (bukti smoke VM); bukan lulus penuh |
| lirik | .lirik | LIVE LOLOS PENUH | Tes live ulang input asli "Tulus Sepatu" 2026-11-04 16:33 WIB, lirik terkirim, 0 handler error |
| mediafire | .mediafire | LIVE LOLOS PENUH | Tes live ulang input asli 2026-11-04 16:36 WIB, PDF publik 1,17 MB terunduh dan terkirim, 0 handler error. Kegagalan run sebelumnya BUKAN bug plugin: cron watchdog menghidupkan bot produksi di tengah jendela tes sehingga sesi WA saling menggantikan ("Connection Closed"); sesudah watchdog dijeda selama jendela, lulus bersih |
| pinterest | .pinterest | LIVE LOLOS PENUH | Tes live ulang input asli 2026-11-04 16:36 WIB, hasil gambar "kucing lucu" terkirim, 0 handler error. Kegagalan run sebelumnya BUKAN bug plugin: cron watchdog menghidupkan bot produksi di tengah jendela tes sehingga sesi WA saling menggantikan ("Connection Closed"); sesudah watchdog dijeda selama jendela, lulus bersih |
| play | .play | LIVE LOLOS PENUH | Tes live ulang input asli 2026-11-04 16:36 WIB, audio "Me at the zoo" terunduh dan terkirim, 0 handler error. Kegagalan run sebelumnya BUKAN bug plugin: cron watchdog menghidupkan bot produksi di tengah jendela tes sehingga sesi WA saling menggantikan ("Connection Closed"); sesudah watchdog dijeda selama jendela, lulus bersih |
| soundcloud | .soundcloud | LIVE LOLOS 2026-11-04 16:06 WIB | Terkirim, 0 handler error; CATATAN audit paritas: ini STUB, status fitur SEBAGIAN, wajib diport scrapernya sebelum dihitung fitur selesai |
| spotify | .spotify | LIVE LOLOS PENUH | Tes live ulang input asli 2026-11-04 16:36 WIB, lagu "Sepatu" Tulus terunduh dan terkirim, 0 handler error. Kegagalan run sebelumnya BUKAN bug plugin: cron watchdog menghidupkan bot produksi di tengah jendela tes sehingga sesi WA saling menggantikan ("Connection Closed"); sesudah watchdog dijeda selama jendela, lulus bersih |
| threads | .threads | LIVE LOLOS 2026-11-04 16:06 WIB | Terkirim, 0 handler error; CATATAN audit paritas: ini STUB, status fitur SEBAGIAN, wajib diport scrapernya sebelum dihitung fitur selesai |
| tiktok | .tiktok | LIVE LOLOS PENUH | Tes live ulang input asli 2026-11-04 16:36 WIB, video TikTok publik terunduh dan terkirim, 0 handler error. Kegagalan run sebelumnya BUKAN bug plugin: cron watchdog menghidupkan bot produksi di tengah jendela tes sehingga sesi WA saling menggantikan ("Connection Closed"); sesudah watchdog dijeda selama jendela, lulus bersih |
| ytmp4 | .ytmp4 | LIVE LOLOS PENUH | Tes live ulang input asli 2026-11-04 16:36 WIB, video "Me at the zoo" terunduh dan terkirim, 0 handler error. Kegagalan run sebelumnya BUKAN bug plugin: cron watchdog menghidupkan bot produksi di tengah jendela tes sehingga sesi WA saling menggantikan ("Connection Closed"); sesudah watchdog dijeda selama jendela, lulus bersih |
| yts | .yts | LIVE LOLOS PENUH | Tes live kata kunci asli "Tulus Sepatu" 2026-11-04 16:24 WIB, hasil pencarian terkirim, 0 handler error |
| komik | .komik | LIVE LOLOS PENUH | Tes live judul asli "Solo Leveling" 2026-11-04 16:23 WIB, hasil komik terkirim, 0 handler error |

### Hasil jendela tes live ekspansi (2026-11-04 sore, prosedur kunci livetest.lock)

Jendela 1 (prosedur kunci): font, gambar, gempa, kbbi, 24 plugin cek (cekbaik sampai cekoverpower), apakah: semua completed, terkirim, 0 handler error (baris ringkasan terbaca selama jendela; berkas log jendela hilang karena restart VM menghapus /tmp, hasil yang terbaca dicatat di sini apa adanya).

Jendela 2 (prosedur kunci, sesudah retrofit kuis reply + wiki fake image + aturan tombol; ringkasan utuh tersimpan di ~/workspace/kana-md-run/scratch/livetest-logs/summary.txt): 39 dari 39 completed, 0 handler error: anime, chord, cuaca, sholat, terjemah (antre tes ulang v3 tuntas), family100, susunkata, tebakbendera, tebakkimia, tebakgambar, asahotak, caklontong, tekateki, tebakhewan, tebaknegara, tebakprovinsi, tebakmakanan, tebakprofesi, tebakkalimat, tebaksurah, tebaklagu, tebaklirik, tebakfilm, tebakgame, tebakbola, tebakdrakor, nyerah, wiki, kapankah, bisakah, benarkah, akankah, asmaulhusna, kisahnabi, hijriyah, niatsholat, doaharian, murottal, cekgila. Status tiap plugin ini: LIVE LOLOS.

Verifikasi live pola reply (skenario khusus, prosedur kunci): 10/10 OK. Mulai .tekateki: sesi ada dan ID pesan pertanyaan terikat; reply jawaban salah: sesi tetap jalan; teks biasa berisi jawaban benar tanpa reply: diabaikan; reply ke pesan lain berisi jawaban benar: diabaikan; reply jawaban benar ke pesan pertanyaan: sesi selesai dan XP owner bertambah (0 ke 10). Hangman: binding tercipta, reply huruf pertama tercatat di data tebakan, .hangman stop membersihkan binding. Kasus reply dari user lain dibuktikan di tes unit fase9 (hook yang sama), karena chat uji harness adalah DM owner.

Sampel aturan tombol (koreksi user 17:19): payload relay cekgila diverifikasi lokal berisi tepat SATU tombol quick_reply "Cek Lagi", tanpa Menu Fun dan tanpa karakter panah; cekgila juga LIVE LOLOS di jendela 2.

### Batch ekspansi A (2026-11-04 sore): kuis, cek, tanya, islamic, fun lokal, primbon, tools, user, game reply

Registry sesudah batch ini: 261 plugin unik / 483 perintah terdaftar, 0 karantina, npm test 338 hijau.

- Kuis tebak topik generik (engine TEXT_SETS): tebakhewan, tebaknegara, tebakprovinsi, tebakmakanan, tebakprofesi, tebakkalimat, tebaksurah, tebaklagu, tebaklirik, tebakfilm, tebakgame, tebakbola, tebakdrakor. Dataset dwibahasa ditulis tangan di src/data/quiz.js.
- Kuis baru: cerdascermat dan kuisumum (pilihan ganda, dataset baru), riddle (teka-teki bebas TEXT_SETS), kataacak (acak kata panjang, dataset KATA_ACAK).
- Keluarga cek (24): cekbaik, cekbucin, cekcantik, cekcreative, cekcupu, cekgabut, cekgacha, cekgamer, cekganteng, cekgila, cekimut, cekintrovert, cekjahat, cekjomblo, cekkarma, cekkaya, cekkece, cekkepribadian, cekkpopers, ceklapar, cekmalas, cekngantuk, cekotaku, cekoverpower. Persen deterministik dari nama target, stabil per target.
- Mesin tanya (5): apakah, kapankah, bisakah, benarkah, akankah.
- Islamic (6): asmaulhusna (99 nama terverifikasi), kisahnabi (25 nabi), hijriyah (kalender Islam Intl), niatsholat (7 niat), doaharian (14 doa), murottal (audio per ayat equran.id, pengecualian API publik tanpa kunci khusus konten Quran seperti pola .sholat MyQuran).
- Fun lokal: quotebijak, quotesanime, senja, bacot, faktaunik, kerangajaib, puisi, gennama, suratcinta, gachakarakter, rate, cekperfoma, cekpacar, soulmatch.
- Primbon: tafsirmimpi (30 kata kunci dataset lokal), nomerhoki (deterministik nama + tanggal lahir).
- Tools user: morse, biner, base64, fliptext, readmore, genpass, usernamegen, umur, bmi.
- User: setbio (bio persisten di profil), birthday (set/list, namespace birthdays), referal (kode + klaim bonus XP dua arah), tukarxp (10 XP = 1 koin).
- Game reply-first di router bersama: hangman, tebakangka, sambungkata, mathgame, ulartangga.
- Retrofit standar baru ke plugin lama: seluruh kuis dijawab lewat reply (perintah .jawab dihapus), tombol menu generik dicabut dari pesan hasil fun, emoji back diganti 🏠, wiki menjadi satu pesan fake image.

Status tes live batch A: yang tercantum di subbab jendela di atas LIVE LOLOS. Sisanya (tools user, user baru, game reply selain hangman parsial, kuis baru cerdascermat/kuisumum/riddle/kataacak, fun lokal selain yang di jendela) menunggu jendela tes berikutnya; hangman sudah terbukti sebagian lewat skenario reply live (mulai + reply huruf + stop), belum dihitung LIVE LOLOS penuh per plugin.

## Ekspansi paritas Elaina (2026-11-04 malam, koreksi target user 18:01 WIB)

Target diganti user: bukan angka 700/420, melainkan paritas fitur Elaina-MD penuh. Audit final di docs/DECISIONS.md bagian "Lampiran paritas": 846 nama fitur Elaina semuanya berstatus akhir (525 terdaftar persis di registry KANA, 114 fallback terpetakan, 76 dilarang, 112 dikecualikan beralasan probe, 19 artefak ekstraksi). Registry saat ini: 417 plugin unik, 1024 perintah termasuk alias, 0 karantina, npm test 339 hijau.

### Selesai sesi ini (terverifikasi lokal, menunggu jendela tes live #3)

- Guard grup +6 aturan (antidocument, antisticker, antiflood, antitagsw, antivirtex, antihidetag) dan plugin grup baru: mute, unmute, listadmin, tagadmin, getpp, del (reply-first), grupstats, topchat, slowmode, intro, setintro.
- Plugin owner baru: join, leave, block, unblock, setppbot, setnamebot, listgrup, cleartmp, restart, getplugin.
- RPG: energi + kerja, heal, istirahat, misi, boss, arena, petualang, harta, sell, makan, use, monthly, yearly, simulator cafe (.cafe subperintah), kriminal dan penjara: maling, merampok, copet, penjara (bebas bayar denda / kabur).
- Kartu canvas baru (src/ui/cards.js): levelcard, rpgcard, buatquote, wanted, movieposter, tarot, ytcomment, fakediscord (semua template orisinal KANA; ytcomment dan fakediscord berlabel MEME).
- Audio fx kini 16 plugin (8 lama + blown, earrape, fat, robot, slow, fast, smooth, squirrel), semua filter terverifikasi ffmpeg lokal.
- Maker: pixelate, logoglow, logogold, logoneon, logometal, togif, getexif, resize, imgstyle (anime/manga/watercolor/vintage/abu/cermin), nulis, barcode, ytcomment, fakediscord.
- Anime (nekos.best SFW; waifu.pics mati dan dibajak situs judi): waifu, neko, husbu, kitsune, ppcouple, 14 GIF reaksi (hug, pat, slap, dance, cry, blush, smug, poke, wink, smile, wave, happy, cuddle, kiss), animeimgsearch (trace.moe).
- Search/info: berita (RSS), ghuser, githubsearch, githubtrend, cekip, dnslookup, robloxstalk, applemusic, playstore (scrape hasil + blob data, pasangan judul-paket terverifikasi), alquran, ayatkursi, harilibur (Nager.Date + tabel lunar SKB 2026), npm, mcstatus.
- Download: capcut dan soundcloud STUB DIGANTI scraper asli (capcut: meta template, video 1,47 MB terunduh lokal; soundcloud: resolve API, MP3 4,04 MB terunduh lokal, trek DRM FairPlay ditolak jujur), transkrip YouTube (caption via data pemutar ytdl-core, lirik asli terverifikasi), tiktokmp3, ytmp3, pixeldrain (API resmi, info + range 206 terverifikasi).
- Threads DINONAKTIFKAN: halaman threads.net dan threads.com membalas shell login di semua UA; berkas dipindah ke disabled-plugins/threads.js.
- Fun/user/main: totalfitur, script, runtime, role, advice, alay, gombal, fml, namaninja, cektinggi, sisaumur, bagaimana, dimana, mengapa, berapa, siapa, coinflip, resetwarn, tagme, sendkontak, menfess (anomin via bot), nembak/jadian/putus (reply-first penuh), suitpvp (reply dua tahap), kecocokannama, sifatbisnis, potensipenyakit, misteri, sipaling, cat, dog, islamquotes, aiueo, hidetext, react, ceklid, tempmail (mail.tm), fetchweb, report.
- Kuis topik baru (dataset lokal, mekanisme reply bersama): tebakheroml, tebakkartun, tebakjkt, tebakwarna, siapakahaku.
- Game HTML catur lengkap di katalog (games/chess; mesin legal-move terverifikasi: 20 langkah pembuka dan skakmat Fool's Mate terdeteksi).
- Gelombang alias 1+2: sekitar 220 nama Elaina dipetakan ke plugin kanonis KANA (termasuk 57 nama di gelombang 2 sesi ini).
- Aturan user sore diterapkan: kuis full reply (.jawab dihapus), reply-router bersama, wiki fake image, tombol hasil tanpa menu generik, emoji back tanpa panah.

Status tes live: jendela 1 dan 2 (69 plugin) LIVE LOLOS tercatat di tabel atas dan summary scratch; pola reply terverifikasi 10/10 skenario. Sisa plugin sesi ini menunggu JENDELA TES LIVE #3 (prosedur kunci v3) sebelum berstatus LIVE LOLOS; yang tidak bisa diuji di DM owner (fitur khusus grup, aksi owner destruktif) akan dicatat apa adanya.

## Jendela tes live #3 (penutup misi ekspansi, 2026-11-04 malam WIB)

Prosedur kunci v3 penuh (livetest.lock dibuat sebelum service berhenti, watchdog melewati self-healing selama kunci ada). Driver per plugin (harness Mode A terfilter, input ASLI dari ekspor tes tiap plugin, chat owner saja): **batch A 150/150 completed, batch B 149/149 completed, total 299/299, NOL handler error di seluruh jendela** (ringkasan mentah: kana-md-run/scratch/summary-window3.txt).

Batch A LIVE LOLOS: waifu, neko, husbu, kitsune, ppcouple, hug, pat, slap, dance, cry, blush, smug, poke, wink, smile, wave, happy, cuddle, kiss, animeimgsearch, capcut, soundcloud, transkrip, pixeldrain, tiktokmp3, ytmp3, ghuser, cekip, dnslookup, robloxstalk, applemusic, playstore, alquran, ayatkursi, harilibur, npm, mcstatus, githubtrend, githubsearch, barcode, tempmail, fetchweb, report, dog, cat, misteri, sipaling, islamquotes, aiueo, hidetext, react, ceklid, kecocokannama, sifatbisnis, potensipenyakit, tebakheroml, tebakkartun, tebakjkt, tebakwarna, siapakahaku, cafe, maling, merampok, copet, penjara, menfess, nembak, jadian, putus, suitpvp, kerja, heal, istirahat, misi, boss, arena, petualang, harta, sell, makan, use, monthly, yearly, levelcard, rpgcard, buatquote, wanted, movieposter, tarot, nulis, imgstyle, togif, getexif, resize, pixelate, logoglow, ytcomment, fakediscord, bass, blown, earrape, fat, robot, slow, fast, smooth, squirrel, totalfitur, script, runtime, role, advice, alay, gombal, fml, namaninja, cektinggi, sisaumur, bagaimana, dimana, mengapa, berapa, siapa, coinflip, berita, listgrup, cleartmp, getplugin, audio8d, chipmunk, deep, echo, nightcore, reverse, slowrev, artinama, ayat, bacot, bola8, cekbaik, cekberuntung, cekbucin, cekcantik, cekcreative, cekcupu, cekgabut, cekgacha, cekgamer, cekganteng, cekimut.

Batch B LIVE LOLOS: cekintrovert, cekjahat, cekjodoh, cekjomblo, cekkarma, cekkaya, cekkece, cekkepribadian, cekkhodam, cekkpopers, ceklapar, cekmalas, cekmood, cekngantuk, cekotaku, cekoverpower, cekpacar, cekperfoma, cekpintar, cerdascermat, dare, faktaunik, gachakarakter, gennama, hadits, hangman, joke, kataacak, kerangajaib, kuisumum, mathgame, motivasi, nomerhoki, pantun, puisi, quotebijak, quotesanime, rate, religi, riddle, sambungkata, senja, soulmatch, suit, suratcinta, tafsirmimpi, tebakangka, truth, ulartangga, weton, zodiak, blackjack, daduvs, game, games, hit, slot, stand, topgame, getpp, jadwalgrup, listadmin, resetwarn, sendkontak, tagadmin, tagme, warnings, credits, hello, help, lang, listbot, menu, ping, webcode, attp, brat, carbon, circle, emojimix, fakechat, faketweet, hd, logo, logogold, logometal, logoneon, meme, quotly, removebg, smeme, sticker, textstyle, toimg, tomp3, tovideo, tovn, ttp, dbstats, mode, owner, reload, scraperhealth, bank, buy, clan, clanwar, craft, daily, duel, dungeon, farming, fishing, gacha, hourly, hunting, inventory, job, menurpg, mining, pet, recipes, rpg, shop, weekly, base64, biner, birthday, bmi, carifitur, catatan, daftar, fliptext, genpass, ingatkan, jam, kalkulator, konversi, leaderboard, level, limit, morse, readmore, referal, todo, transfer, tukarxp, umur, usernamegen.

Dengan ini seluruh katalog yang bisa dites lewat DM owner sudah LIVE LOLOS: 72 nama dari jendela-jendela sebelumnya + 299 jendela ini = 371 dari 417 plugin registry.

46 plugin grup/owner berikut TIDAK dites lewat DM karena memang butuh konteks grup atau bersifat destruktif/owner (menendang member, mengubah grup, me-restart bot): dinilai dari logika handler + tes unit (339/339 hijau) dan dicatat jujur sebagai BELUM LIVE LOLOS DM: join, leave, block, unblock, setppbot, setnamebot, restart, ban, unban, broadcast, jadibot, stopjadibot, setbio, setppgrup, kick, add, warn, promote, demote, setwelcome, setgoodbye, setname, setdesc, setrules, intro, setintro, slowmode, mute, unmute, guard, protect, welcome, customcmd, del, grupstats, topchat, tagall, hidetag, linkgrup, revoke, absen, poll, rules, grup, afk, subscribe.

### Verifikasi khusus keluarga stiker (laporan user 19:36 WIB)

Bug .ttp (stiker tidak bisa dibuka) sudah diperbaiki di chat utama (commit 9e0d40b: injectStickerExif membuat chunk VP8X). Di jendela ini keluarga stiker dites ulang dengan input asli dan byte stiker yang benar-benar terkirim diperiksa satu per satu: .ttp, .brat, .attp (animasi 3 frame), dan .sticker dari gambar asli semuanya menghasilkan WebP sah: chunk VP8X ada dengan bit EXIF menyala, chunk EXIF berisi metadata pack "KANA" yang terbaca balik, ukuran 512x512, dan ter-decode bersih oleh libwebp (PIL). Catatan alat: ffmpeg lokal gagal men-decode WebP animasi yang sah (keterbatasan parser native-nya, stream 0x0) sehingga orakel decode untuk stiker animasi adalah libwebp, bukan ffmpeg.

### Insiden infrastruktur selama jendela

Unit systemd kana-bot.service ternyata hilang dari /etc/systemd/system (pola pasca VM replace yang sudah dikenal). Selama kunci livetest ada, watchdog memang menahan self-healing, jadi di akhir jendela unit ditulis ulang manual (ExecStart start-kana-bot.sh, Restart=always), daemon-reload, enable, start. Bot tersambung TEPAT SATU kali (19:52:50 WIB), PID stabil, nol putus selama pemantauan 4 menit, lalu kunci livetest dihapus. Status akhir: bot produksi aktif dan stabil dengan 417 plugin, 0 karantina.

## Temuan visual owner 2026-11-04 23:09 WIB (sapuan percantik teks)

Teks hasil sapuan gelombang 1 tampil bagus di HP owner (help, lang, credits berbingkai rapi, terkonfirmasi screenshot owner). TAPI ada satu gelembung sistem WhatsApp "You received a message but your version of WhatsApp doesn't support it" di antara pesan bot jam 23:09 WIB: satu pesan bot tidak bisa dirender klien WA owner. Tersangka utama: pesan MB.Button native flow (kartu referal atau menu utama atau kartu profil), karena pesan sendButtons/quick reply terbukti tampil normal di HP owner selama ini. Menunggu identifikasi perintah pemicunya dari owner. ARAH SEMENTARA: pola MB.Button TIDAK diperluas ke keluaran etalase lain sampai ada vonis; batch sapuan berikutnya memprioritaskan teks berbingkai + sendButtons quick reply dan gambar plus caption untuk yang butuh visual.

## Sapuan percantik teks: gelombang 1 (user, main, group) 2026-11-04 malam

Unit: npm test 339/339 hijau sesudah ekspektasi tes disesuaikan ke teks baru (ping/lang tanpa tombol menu generik, kartu profil berbingkai, guard warn berbingkai). Push: e8174b5 (user), eaa7794 (main), 8b19e71 + 4d14649 (group), e02e233 (templates pusat + tes). Catatan push: dua percobaan gabungan 86 berkas gagal "not a fast forward" karena head repo bergerak oleh pekerjaan chat utama; dipecah per kategori dengan retry, semua mendarat dan blob profil remote terverifikasi sama dengan lokal.

Isi: 81 plugin dipercantik (user 29, main 12, group 40): bingkai rumah ╭─❏/┊/╰━━━━━━━, label small caps, nilai tebal, tombol menu generik dibuang dari pesan hasil (profil, catatan, ingatkan, jam, kalkulator, konversi, leaderboard, daftar, transfer, grup, guard, protect, lang, ping, listbot, webcode, credits, subscribe), default welcome/goodbye pusat di templates.js ikut dibingkai. referal.js dan menu.js tidak diubah di gelombang ini.

Tes live jendela sapuan 1 (prosedur kunci v3, Mode A, chat owner): 48/48 terkirim, NOL handler error, NOL warning/fallback di log harness: user 29 (base64, biner, birthday, bmi, carifitur, catatan, ceklid, daftar, fetchweb, fliptext, genpass, ingatkan, jam, kalkulator, konversi, leaderboard, level, limit, morse, profil, readmore, role, setbio, tempmail, todo, transfer, tukarxp, umur, usernamegen), main 11 (credits, hello, help, lang, listbot, ping, report, runtime, script, totalfitur, webcode), group aman DM 8 (getpp, jadwalgrup, listadmin, resetwarn, sendkontak, tagadmin, tagme, warnings). Status: LIVE LOLOS (dengan catatan Mode A: vonis visual akhir di HP owner; owner sudah mengonfirmasi help/lang/credits tampil berbingkai rapi). subscribe dan sisa plugin group khusus konteks grup tidak dites DM (perubahan teks saja, logika tidak berubah, tes unit hijau). Service dinyalakan ulang: PID 21878, tersambung tepat satu kali, stabil.

### Klarifikasi jendela 23:09 (koreksi chat utama 23:12)

Pesan-pesan jam 23:09 di screenshot owner adalah JENDELA TES GELOMBANG 1 di atas (bukan tes manual owner). Urutan persis tersimpan di test/live-results.json (generatedAt 23:11:36 WIB, 48 entri) dan ringkasan tertulis kana-md-run/scratch/summary-sapuan-gelombang1-2026-11-04-2309.md. Balasan yang menjadi gelembung "WhatsApp doesn't support it" teridentifikasi: di antara balasan credits (23:09:35) dan uji ".help ping" (23:09:41) hanya ada balasan hello (23:09:39), yaitu pesan game HTML .hello dari plugins/main/game.js lewat sendHtmlGame. Jadi pemicunya pesan game HTML, bukan MB.Button. Pola pesan game HTML DITAHAN dari jendela tes berikutnya sampai keputusan pengganti dari chat utama; MB.Button (profil/referal/menu) berstatus tersangka terpisah, belum ada vonis. Semua jendela berikutnya wajib meninggalkan catatan audit (live-results.json standar atau ringkasan tertulis bernama jelas di kana-md-run/scratch).

## Sapuan percantik teks: gelombang 2, 3, 4 (fun, download, search, maker, rpg, game, ai, anime, audio, owner) 2026-11-04 malam

Unit: npm test 344/344 hijau penuh, termasuk gerbang otomatis larangan externalAdReply (test/no-external-adreply.test.js, commit chat utama 28ac08f; grep di src/ dan plugins/ nol temuan) dan 7 perbaikan ekspektasi buttons-consistency: tes lama mengharapkan tombol penutup ".menu download" pada buildYtsButtons, buildSpotifyDoneButtons, buildPlayButtons dan teks lama query kosong; ekspektasi diperbarui ke perilaku perintah owner 17:19 (tanpa tombol menu generik, pesan query kosong berbingkai KETIK KATA KUNCINYA / KETIK JUDUL LAGUNYA), ditambah assertion eksplisit tidak ada id tombol berawalan .menu.

Isi: 302 berkas plugin dipercantik (fun 134, rpg 40, maker 38, search 33, anime 20, owner 20, download 18, audio 16, game 8, ai 6; ditambah rpg.js dan kawan-kawan di kategori rpg/game sesuai hitungan folder). Pola sama dengan gelombang 1: bingkai rumah, label small caps, nilai tebal, id+en berpasangan, tanpa em dash (satu pengecualian jujur: karakter atribusi pada render canvas kartu quote di src/ui/cards.js, bukan teks chat). Tombol menu generik dan key btnMenu yatim dibuang massal (grep akhir: btnMenu nol, id ".menu" di pesan hasil nol di luar plugins/main/menu.js). Data verbatim dijaga: dataset kuis, ayat religi, lirik, prompt AI, filter ffmpeg, logika ekonomi RPG, dan mekanisme reply kuis tidak berubah. Pesan jawab kuis bersama (jawab.* di plugins/fun/nyerah.js, dipakai src/quiz/respond.js) ikut berbingkai penuh. Handler audio bersama src/audio/fx.js kini memakai key processing (pesan sedang memproses) dan done (caption hasil) yang ditambahkan sapuan audio. cleartmp TIDAK mengadopsi cleanKanaTmp: semantik umur file-nya beda (cleartmp menghapus semua folder kana- tanpa syarat umur), dicatat sebagai peluang terpisah. MB.Button TIDAK diperluas ke keluaran baru mana pun (sesuai tahan vonis); pola yang dipakai teks berbingkai + quick reply + gambar/caption. Push per kategori dengan chunk 25 berkas + retry, semua chunk OK; head terakhir 3ded60e.

Tes live (prosedur kunci v3; catatan lengkap kana-md-run/scratch/summary-sapuan-jendelaABC-2026-11-04-2359.md):
- Jendela A (DM, verifikasi gelembung + gelombang 1): game (.hello), credits, help, lang, brat, profil, referal = 7/7 terkirim, 0 handler error, 0 warn. .hello dikirim ulang di atas kerangka fake/forwarded 14339f7; sisi harness bersih, vonis visual gelembung hilang atau belum tetap penilaian owner di HP.
- Jendela B (DM, sampel gelombang 2/3/4): 41 plugin (fun, download, maker stiker, search, rpg, game, ai, anime, audio, owner aman, leave jalur validasi DM) = 41/41 terkirim, 0 handler error, 0 warn.
- Jendela C (GRUP, lihat bagian fase grup di bawah): 58/58 terkirim, 0 handler error, 0 warn.

## Fase tes grup "Test bot" (perintah owner 2026-11-04 23:34 WIB: "Test lagi, sampe no error")

Grup ditemukan lewat groupFetchAllParticipating dengan subject persis "Test bot": JID 120363409948890046@g.us, 2 peserta (owner superadmin, bot admin). Jendela C menjalankan 58 plugin di konteks grup itu: seluruh kategori group (40: absen, add, afk, customcmd, del, demote, getpp, grup, grupstats, guard, hidetag, intro, jadwalgrup, kick, linkgrup, listadmin, mute, poll, promote, protect, resetwarn, revoke, rules, sendkontak, setdesc, setgoodbye, setintro, setname, setppgrup, setrules, setwelcome, slowmode, tagadmin, tagall, tagme, topchat, unmute, warn, warnings, welcome) plus 18 plugin owner konteks grup (ban, block, broadcast, cleartmp, dbstats, getplugin, jadibot, join, listgrup, mode, owner, reload, scraperhealth, setnamebot, setppbot, stopjadibot, unban, unblock). Hasil: 58/58 terkirim, NOL handler error, NOL warn. Status: LIVE LOLOS (grup), terpisah dari LIVE LOLOS (DM).

Keamanan fase grup: semua input uji adalah jalur validasi tanpa target (perintah destruktif tanpa argumen membalas hint/error yang benar); tidak ada member sungguhan yang di-kick, di-ban, atau di-block. broadcast tanpa teks berhenti di hint dan tidak menyebar ke grup lain. jadibot tanpa argumen berhenti di usage. Teruji sebagian dengan alasan: (1) leave dites di DM saja (jendela B) karena .leave di dalam grup akan mengeluarkan bot dari grup tes beneran; (2) restart tidak diuji live di mana pun karena handler-nya mengakhiri proses by design (membunuh proses harness; di produksi memang fungsinya di bawah systemd), dinilai dari tes unit + logika handler. Dengan fase ini, 46 plugin yang sebelumnya "BELUM LIVE LOLOS DM" kini berstatus: 44 LIVE LOLOS (grup), leave teruji sebagian (validasi DM), restart belum live (by design). Satu-satunya sisa lama di luar fase ini: subscribe (konteks grup, teks saja) dan vonis visual owner untuk gelembung .hello.

### Insiden infrastruktur jendela ABC

VM mengalami replace sekitar 23:22 WIB: unit kana-bot.service hilang dari /etc/systemd/system dan bot tidak berjalan saat jendela dimulai (watchdog menahan diri karena kunci livetest). Jendela berjalan dalam keadaan service berhenti penuh. Di penutup misi unit ditulis ulang persis pola watchdog, daemon-reload, enable, start, dan koneksi final diverifikasi sebelum kunci livetest dihapus.

## Sistem premium, sewa bot, dan limit harian (perintah owner 2026-11-05 11:12, koreksi 11:16)

Unit: npm test 364/364 hijau penuh, termasuk 16 tes baru di test/premium.test.js (service premium/sewa, limit grup, gate pipeline, tanda menu, routing bridge). Registry memuat 426 plugin, 0 karantina. Dokumen resmi: docs/PREMIUM.md.

Isi: service src/services/premium.js (namespace premium dan sewa_bot, durasi 7d/30d/2w/1y/permanen, perpanjangan menumpuk, kedaluwarsa malas) dan src/services/limit.js (namespace usage_limits per tanggal WIB). Gate terpusat di pipeline: premium sesudah gate admin, limit grup sesudah gate premium dan sebelum cooldown; plugin limitGroup melewati limit generik supaya tidak kena potong dua kali. Namespace premium, sewa_bot, dan usage_limits dirutekan lewat web-bridge REST Supabase supaya panel web dan bot berbagi data yang sama.

Plugin baru: owner addprem, delprem, listprem, addsewa, delsewa, listsewa; user cekprem (plus sisa limit), ceksewa, infopremium (daftar dinamis dari registry). Aktivasi selalu manual oleh owner, tanpa payment gateway.

Tanda: menu memberi akhiran 💎 untuk premium dan ⏳ untuk limit, legenda di menu utama, kategori, dan all. Katalog web menampilkan badge Premium dan Limit dari parser.

Premium awal 14 plugin: ai, aiimg, aireset, ringkas, tts, vision, jadibot, stopjadibot, removebg, ssweb, ocr, game, hello, topgame. Jadibot bukan lagi owner-only (kategori user): sewa grup tidak membukanya, hanya premium personal atau sewa jadibot; stopjadibot tetap bisa dipakai pemegang sesi aktif walau premium berakhir, dan non-owner hanya bisa menghentikan sesinya sendiri. Tidak ditemukan sebagai plugin tersendiri: twitter, dailymotion, ephoto (dicatat di docs/PREMIUM.md, tidak dikarang).

Koreksi owner 11:16 diterapkan: downloader berat dan upscale BUKAN premium, melainkan limitGroup. Download (aio, capcut, fb, gdrive, ig, mediafire, pixeldrain, soundcloud, spotify, tiktok, tiktokmp3, ytmp4): gratis 5 kali per hari, premium/sewa grup 50 kali, owner tanpa batas. Upscale (hd): gratis 3 kali, premium/sewa 20 kali. Reset tengah malam WIB, percobaan ditolak tidak menambah hitungan. Bukti gate penolakan user gratis dari tes unit pipeline (nomor owner selalu lolos gate, jadi penolakan tidak bisa dibuktikan dari chat owner). Tes live Mode A jendela v3 dijalankan 2026-11-05: 10 perintah misi ini (addprem, delprem, listprem, addsewa, delsewa, listsewa, cekprem, ceksewa, infopremium, jadibot) terkirim 10/10 dengan 0 error ke chat owner, cek kesehatan akun lolos sebelum mulai, dan .jadibot dari nomor owner berhenti di usage (lolos gate premium, bukan pesan premium). Sesudah tes, service produksi dinyalakan lagi, aktif, tersambung tepat satu kali, dan kunci livetest terhapus. Vonis tampilan balasan tetap menunggu penilaian visual user di HP.
