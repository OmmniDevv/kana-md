> [!WARNING]
> **This project is still under active development (work in progress).** Features may change, break, or be incomplete. Use at your own risk.
> **Proyek ini masih dalam pengembangan aktif (WIP).** Fitur dapat berubah, rusak, atau belum lengkap. Gunakan dengan risiko sendiri.

# KANA

![Thumbnail KANA](thumbnail.png)

**English** | [Bahasa Indonesia](#versi-bahasa-indonesia)

KANA is a moe WhatsApp bot with the persona of Kana: sweet, warm, and playful. It is built on `@rexxhayanasi/elaina-baileys` version 1.4.7 (pinned exact), pure ESM, Node 20 or later. Every user-facing string goes through an i18n system (Indonesian and English), every feature is an independent plugin, and interactive button navigation is a first-class rule: feature outputs that have a next step ship with buttons plus a text fallback.

Detailed feature status lives in [FEATURES.md](FEATURES.md), technical decisions in [docs/DECISIONS.md](docs/DECISIONS.md), snippet sources and credits in [docs/SNIPPETS.md](docs/SNIPPETS.md), and the web dashboard data contract in [docs/WEB.md](docs/WEB.md).

## Features

- Pairing code login (custom 8 character code), exponential backoff reconnect with jitter, clean stop on loggedOut.
- Persistent WhatsApp session: Postgres via `usePostgresAuthState` for production, local files in `.dev-data/` for development.
- Message pipeline with multi-prefix (`.`, `!`, `/`, `#`), middleware hooks for group protection, quizzes, AFK, and custom commands, plus gates: owner, group, private, group admin, bot admin, ban, self mode, daily limit, and cooldown. Every handler runs inside an error boundary.
- XP and levels for users, a daily limit system, and per-user profiles stored through a two-driver storage layer (`local` JSON for dev, `supabase` Postgres table `bot.kv` with RLS enabled and no anon policies).
- Button-first UX: menus navigate by category buttons, downloads offer follow-up buttons, quizzes accept button answers, and every button falls back to plain text when button delivery fails.
- HTML mini games sent with `MB.sendHtmlApp` (full view on Android, text label elsewhere), with an optional WebSocket score channel (HMAC token per player, validated server side).
- Group toolkit: welcome and goodbye cards, anti-link, anti-spam, anti-toxic, anti-gambling, anti-phishing, warn with auto-kick, admin tools, scheduled open and close, AFK, attendance, native polls, group rules, and per-group custom commands.
- RPG and economy on a single data-driven engine (items, recipes, monsters, jobs are data, not files per action).
- Free scrapers only, behind a shared runner: SSRF guard, retries, circuit breaker, size limits, and honest error replies when a source dies. Free scrapers break from time to time by nature.
- Optional AI chat (rudder.chat) that activates only when the owner fills session cookies in `.env`. No paid APIs anywhere.

## Command catalog

Prefix: `.` (also `!`, `/`, `#`). Buttons in bot replies carry the same commands, so tapping a button is the same as typing it.

### Main and profile

| Command | Function |
|---|---|
| `.menu [category\|all]` | Button-navigated menu, per category or full text |
| `.listbot` | List of active bots (main bot plus jadibot sessions) |
| `.ping` | Check the bot is alive |
| `.help [command]` | Command details |
| `.lang [id\|en]` | Change language per user |
| `.webcode` (alias `.loginweb`) | One-time web dashboard login code |
| `.credits` | Project credits and thanks |
| `.daftar <name>` or `.daftar auto` | Register as a member (required before using the bot); auto uses your WhatsApp name |
| `.profil` (alias `.me`) | Your profile: level, XP, limit, balance |
| `.level` | Your level and XP progress |
| `.limit` | Your remaining daily limit |
| `.leaderboard` (alias `.lb`) | XP leaderboard |
| `.carifitur <keyword>` | Search commands by keyword |
| `.kalkulator <expr>` | Safe calculator (no eval) |
| `.konversi <value> <from> <to>` | Unit conversion (length, weight, temperature, data, time) |
| `.todo <add\|list\|done\|del>` | Personal todo list |
| `.catatan <save\|list\|show\|del>` | Personal notes per user |
| `.ingatkan <minutes> <text>` | Personal reminder, delivered by the scheduler |
| `.transfer <number> <amount>` | Send coins to another member |
| `.jam` | Current time in WIB, WITA, WIT, and UTC |

### Download

| Command | Function |
|---|---|
| `.aio <link>` | Auto-detect a link and route it to the right downloader |
| `.spotify <title or link>` | Search Spotify and send the audio |
| `.play <title>` | Search YouTube and send the audio |
| `.yts <keyword>` | YouTube search results, pick with buttons |
| `.ytmp4 <title or link>` | YouTube video download |
| `.pinterest <keyword>` | Search Pinterest images |
| `.fb <link>` | Download a Facebook video or reel |
| `.ig <link>` | Download an Instagram photo or video |
| `.tiktok <link>` | Download a TikTok video or slideshow without watermark |
| `.mediafire <link>` | Download a public MediaFire file |
| `.gdrive <link>` | Download a public Google Drive file |
| `.soundcloud`, `.threads`, `.capcut` | Honest status: these reply clearly when no verified free source is available |

### Search and tools

| Command | Function |
|---|---|
| `.lirik <title or Spotify link>` | Song lyrics |
| `.komik <title>` | Search comics on Komikcast |
| `.font <keyword>` / `.font dl <slug>` | Search DaFont fonts / download the font file |
| `.wiki <keyword>` | Wikipedia summary (Indonesian first) |
| `.kbbi <word>` | Indonesian dictionary (KBBI) entry |
| `.chord <song>` | Guitar chords when a public source is reachable |
| `.gambar <keyword>` | Image search |
| `.anime <title>` | Anime and manga info from Jikan (MyAnimeList data) |
| `.cuaca <city>` | Weather from Open-Meteo |
| `.gempa` | Latest earthquakes from BMKG |
| `.sholat <city>` | Prayer schedule (myQuran), plus group reminder toggle |
| `.kurs <amount> <from> <to>` | Currency conversion |
| `.terjemah <lang> <text>` (alias `.tr`) | Translate text |
| `.qr <text>` | Generate a QR code image |
| `.scanqr` (reply to an image) | Read a QR code from an image |
| `.shortlink <url>` | Shorten a URL |
| `.ssweb <url>` | Website screenshot |
| `.resep <keyword>` | Recipe search (TheMealDB) |
| `.film <title>` | TV show info (TVMaze) |
| `.ocr` (reply to an image) | Honest status: OCR is not available yet, the bot says so clearly |

### HTML games

| Command | Function |
|---|---|
| `.games` | Game list with play buttons |
| `.game <id>` | Send a game: `dino`, `flappy`, `snake`, `2048`, `tetris`, `memory`, `breakout`, `tictactoe`, plus `minesweeper`, `whackamole`, `blockblast`; `.hello` sends the built-in sample game |
| `.topgame [id]` | Game leaderboards |
| `.slot <bet>` | Coin slot machine (virtual coins only) |
| `.blackjack <bet>`, `.hit`, `.stand` | Blackjack against the dealer |
| `.daduvs <bet>` | Dice duel against the bot |

### Group

| Command | Function |
|---|---|
| `.protect <feature> <on\|off>` | Toggle welcome, goodbye, antilink, antispam, antitoxic, antijudol, antiphising |
| `.guard` | Group protection status (the guard middleware deletes and warns automatically) |
| `.welcome <on\|off>` | Welcome and goodbye cards using the official banner assets |
| `.warn @user [reason]`, `.warnings [@user]` | Warn members; auto-kick at the group limit |
| `.kick`, `.add`, `.promote`, `.demote` | Member administration (admin only, bot must be admin) |
| `.tagall [text]`, `.hidetag [text]` | Mention everyone, visibly or hidden |
| `.grup <open\|close\|info>` | Open or close the group now |
| `.jadwalgrup <open HH:mm> <close HH:mm>` | Scheduled open and close |
| `.setname`, `.setdesc`, `.setppgrup` | Group subject, description, picture |
| `.linkgrup`, `.revoke` | Invite link and reset |
| `.afk [reason]` | Set AFK status; the bot notices when you are back or mentioned |
| `.absen <start\|check\|close>` | Attendance sessions |
| `.poll <question> \| <option1> \| <option2>` | Native WhatsApp poll |
| `.rules`, `.setrules <text>` | Group rules |
| `.customcmd <add\|del\|list>` | Per-group custom commands (exact-text triggers) |

### Sticker and maker

| Command | Function |
|---|---|
| `.sticker` (alias `.s`, reply to media) | Sticker from an image, video, or GIF, with pack and author from config |
| `.toimg`, `.tovideo`, `.tomp3`, `.tovn` | Media conversion via ffmpeg |
| `.brat <text>`, `.attp <text>`, `.ttp <text>` | Text stickers |
| `.emojimix <emoji1> <emoji2>` | Emoji Kitchen mix when the combination exists |
| `.meme <top> \| <bottom>` | Simple meme on your image or a generated background |
| `.smeme <top> \| <bottom>` | Meme sticker from a quoted image |
| `.circle` (reply to an image) | Circle-cropped transparent PNG |
| `.fakechat`, `.faketweet` | Parody makers, always watermarked PARODI |
| `.quotly` (reply to a message) | Quote card |
| `.carbon <code>` | Code card |
| `.textstyle <text>` | Fancy text styles |
| `.logo <text>` | Simple logo card |
| `.hd` (reply to an image) | Plain 2x upscale with ffmpeg (not AI, labeled honestly) |
| `.removebg` | Honest status: no free local background removal yet |

### RPG and economy

| Command | Function |
|---|---|
| `.rpg`, `.menurpg` | RPG menu and your RPG profile (RPG banner header) |
| `.daily`, `.hourly`, `.weekly` | Periodic coin and item claims |
| `.mining`, `.fishing`, `.hunting`, `.farming` | Gather resources (data-driven outcomes) |
| `.craft`, `.recipes` | Craft items from recipes |
| `.shop`, `.buy <item>` | Shop and buying |
| `.inventory` (alias `.inv`) | Your items |
| `.bank <deposit\|withdraw> <amount>` | Bank storage |
| `.duel @user`, `.dungeon` | PvP duel and a simple dungeon run |
| `.pet` | Adopt and feed a pet |
| `.job [name]` | Choose a job for gathering bonuses |
| `.clan`, `.clanwar` | Clan basics and a simple clan war |
| `.gacha` | Spend 100 coins for a random item |

### Fun, quiz, and religious

| Command | Function |
|---|---|
| `.family100`, `.caklontong`, `.asahotak`, `.tekateki` | Quiz games with sessions per chat |
| `.susunkata`, `.tebakgambar`, `.tebakbendera`, `.tebakkimia` | Word scramble, picture clue, flag, and chemistry quizzes |
| `.jawab <answer>` | Answer the active quiz (buttons also work) |
| `.nyerah` | Give up the active quiz |
| `.truth`, `.dare` | Truth or dare prompts (original data) |
| `.suit <rock\|scissors\|paper>` | Rock paper scissors against the bot |
| `.bola8 <question>` | Magic 8 ball answers (for fun) |
| `.joke` | A random original joke |
| `.motivasi`, `.pantun` | Original motivational quotes and pantun poems |
| `.cekjodoh`, `.cekkhodam`, `.zodiak` | Just-for-fun checks, with an entertainment disclaimer |
| `.cekmood`, `.cekberuntung`, `.cekpintar`, `.artinama <name>` | More just-for-fun checks, with an entertainment disclaimer |
| `.weton <DD-MM-YYYY>` | Javanese weton day calculation (for fun) |
| `.ayat`, `.hadits` | Daily verse or hadith from a small original dataset |
| `.religi <HH:mm\|off>` | Daily religious reminder for the group |

### AI (opt-in)

| Command | Function |
|---|---|
| `.ai <message>` | AI chat: rudder.chat when the owner configured it, otherwise the free Pollinations fallback; per-user short memory |
| `.aireset` | Clear your AI chat memory |
| `.aiimg <prompt>` | Text to image via a free public provider |
| `.vision` (reply to an image) | Ask about an image when a free provider is configured |
| `.ringkas <text or link>` | Summarize text or an article |
| `.tts <text>` | Text to speech voice note (free public TTS) |

### Owner

| Command | Function |
|---|---|
| `.owner` (alias `.status`) | Bot status |
| `.mode <public\|self>` | Bot serving mode |
| `.ban <number>`, `.unban <number>` | Ban and unban users |
| `.broadcast <text>` | Broadcast to opted-in chats only, rate limited |
| `.subscribe`, `.subscribe off` | Group opt-in and opt-out for broadcasts (group admin) |
| `.dbstats` | Storage usage statistics |
| `.scraperhealth` | Scraper source health |
| `.reload [plugin]` | Reload plugins without restarting |
| `.jadibot <name> <number>`, `.stopjadibot <name>` | Extra bot sessions (owner only, max 3) |

## Installation

New to this? Follow the beginner friendly [TUTORIAL.md](TUTORIAL.md): database setup on Supabase, running the bot with Docker, on a VPS, or in Termux, WhatsApp pairing, and deploying the web dashboard to Vercel, step by step.

Requirements: Node 20 or later (22+ recommended) and ffmpeg.

```bash
npm install
cp .env.example .env
# fill BOT_NUMBER and OWNER_NUMBER in .env (international format, digits only)
npm start
```

If `BOT_NUMBER` is empty, the bot stops cleanly with an explanation. On the first run with a number filled in, the pairing code is printed in the log: open WhatsApp, Linked devices, Link a device, then choose link with phone number instead.

Other commands:

```bash
npm test            # unit and contract tests (node:test)
npm run i18n:check  # id and en key parity check
```

## Configuration (.env)

| Variable | Meaning |
|---|---|
| `BOT_NAME` | Bot display name (default KANA) |
| `BOT_NUMBER` | Bot WhatsApp number, digits only, international format |
| `OWNER_NUMBER` | Owner number, same format |
| `DEFAULT_LANG` | Default language: `id` or `en` |
| `TIMEZONE` | Timezone label (default Asia/Jakarta) |
| `STORAGE_DRIVER` | `local` for dev, `supabase` for production |
| `DATABASE_URL` | Postgres pooler connection string (Supabase), server side only |
| `AUTO_BIO`, `BIO_ON_TEMPLATE`, `BIO_OFF_TEMPLATE` | Automatic profile bio on connect, with placeholders |
| `RUDDER_USER_ID`, `RUDDER_COOKIE_C0`, `RUDDER_COOKIE_C1`, `RUDDER_TH_WHO` | Optional rudder.chat AI session (owner fills manually) |
| `SCORE_WS_PORT` | WebSocket score channel port for HTML games (empty means off) |
| `WEB_LOGIN_URL` | Web dashboard login page (default https://kana.omnicorp.web.id/login) |
| `LIVETEST`, `TEST_CHATS` | Live test harness switches (see scripts/livetest.js) |

Secrets live only in `.env` (gitignored). `.env.example` contains variable names only.

## Writing a plugin

Create a file in `plugins/<category>/<name>.js`:

```js
export const config = {
  name: 'sample',
  alias: [],
  category: 'main',
  description: { id: 'Deskripsi singkat', en: 'Short description' },
  usage: '.sample',
  example: '.sample',
  cooldown: 3,
  // optional gates: isOwner, isGroup, isPrivate, isAdmin, isBotAdmin, limit
}

export const i18n = {
  id: { sample: { reply: 'Halo dari plugin contoh~' } },
  en: { sample: { reply: 'Hello from the sample plugin~' } },
}

export async function handler(ctx) {
  await ctx.reply(ctx.t('sample.reply'))
}
```

Rules: every user-facing string goes through `ctx.t()` and the plugin `i18n` export (never hardcoded), outputs with a next step include buttons via `src/ui/buttons.js` with a text fallback, and a broken plugin is quarantined automatically by the loader so the bot never dies because of one plugin. A plugin may also export `before(ctx)` (middleware for every message) and `onParticipantsUpdate(ctx)` (group member events).

## Web dashboard

A separate web team builds the KANA dashboard. The bot side contract: members type their number on the web login page, the web writes a request record, and the bot watcher sends the verification code to that WhatsApp number automatically. The manual fallback is the `.webcode` command. Dashboard statistics come from the same storage: user profiles in the `users` namespace and a `bot_stats` record in the `kv` namespace. Full contract in [docs/WEB.md](docs/WEB.md).

## Risk notice

This library uses an unofficial WhatsApp API, so the bot number can be restricted or banned by WhatsApp. Use a spare number for the bot, never your main number. Do not send mass messages, and keep pauses between messages while testing.

## Thanks To

- **Rexxhayanasi** for [@rexxhayanasi/elaina-baileys](https://www.npmjs.com/package/@rexxhayanasi/elaina-baileys), the WhatsApp Web library this bot is built on, and **WhiskeySockets** for the upstream [Baileys](https://github.com/WhiskeySockets/Baileys) foundation.
- **Yui Agents** for the Spotify embed metadata and lyrics snippet (sources: Spotify Embed, iTunes Search API, [lyrics.ovh](https://lyrics.ovh), [lrclib](https://lrclib.net)).
- **Jerexd** for the tikwm TikTok fallback, Komikcast, and DaFont scraper snippets.
- **hazeloffc** ([t.me/hazeloffc](https://t.me/hazeloffc)) for the rudder.chat AI chat snippet.
- **MichelleBot** for [brat-canvas](https://github.com/MichelleBot/brat-canvas), the brat style image generator behind the .brat sticker.
- **The project owner** for their own scraper code: Spotify search and download, YouTube audio, Pinterest, Facebook and Instagram via SnapSave, and TikTok via tiklydown.
- Public services the scrapers talk to: [spotmp3.net](https://spotmp3.net), [spotidown.app](https://spotidown.app), [snapsave.app](https://snapsave.app), tiklydown, [tikwm.com](https://tikwm.com), [Jikan](https://jikan.moe) (MyAnimeList data), [Open-Meteo](https://open-meteo.com), [BMKG](https://data.bmkg.go.id) open data, and the myQuran prayer API. Full triage notes in [docs/SNIPPETS.md](docs/SNIPPETS.md).

## License

MIT, see [LICENSE](LICENSE). Copyright (c) 2026 OmniDevv.

<a name="versi-bahasa-indonesia"></a>

<details>
<summary>🇮🇩 Baca dalam Bahasa Indonesia</summary>

# KANA (Bahasa Indonesia)

KANA adalah bot WhatsApp moe dengan persona Kana yang manis, hangat, dan playful. Dibangun di atas `@rexxhayanasi/elaina-baileys` versi 1.4.7 (di-pin exact), ESM murni, Node 20 ke atas. Semua string yang dilihat pengguna melewati sistem i18n (Indonesia dan Inggris), setiap fitur adalah plugin mandiri, dan navigasi tombol interaktif adalah aturan utama: keluaran fitur yang punya langkah lanjutan wajib disertai tombol plus fallback teks.

Status fitur terperinci ada di [FEATURES.md](FEATURES.md), keputusan teknis di [docs/DECISIONS.md](docs/DECISIONS.md), sumber snippet dan kredit di [docs/SNIPPETS.md](docs/SNIPPETS.md), dan kontrak data dashboard web di [docs/WEB.md](docs/WEB.md).

## Fitur

- Login kode pairing (kode kustom 8 karakter), reconnect exponential backoff plus jitter, berhenti bersih saat loggedOut.
- Sesi WhatsApp persisten: Postgres lewat `usePostgresAuthState` untuk production, file lokal di `.dev-data/` untuk dev.
- Pipeline pesan multi-prefix (`.`, `!`, `/`, `#`), hook middleware untuk proteksi grup, kuis, AFK, dan custom command, plus gates: owner, grup, private, admin grup, bot admin, ban, mode self, limit harian, dan cooldown. Setiap handler berjalan di dalam error boundary.
- XP dan level pengguna, sistem limit harian, dan profil per pengguna yang disimpan lewat storage dua driver (`local` JSON untuk dev, `supabase` Postgres tabel `bot.kv` dengan RLS aktif tanpa policy anon).
- UX tombol lebih dulu: menu bernavigasi tombol kategori, hasil downloader menawarkan tombol lanjutan, kuis menerima jawaban tombol, dan setiap tombol punya fallback teks biasa bila pengiriman tombol gagal.
- Mini game HTML yang dikirim lewat `MB.sendHtmlApp` (tampil penuh di Android, label teks di klien lain), dengan kanal skor WebSocket opsional (token HMAC per pemain, divalidasi di server).
- Perangkat grup: kartu welcome dan goodbye, antilink, antispam, antitoxic, antijudol, antiphising, warn dengan auto-kick, perangkat admin, buka tutup terjadwal, AFK, absen, polling native, rules grup, dan custom command per grup.
- RPG dan ekonomi di atas satu engine berbasis data (item, resep, monster, pekerjaan adalah data, bukan file per aksi).
- Scraper gratis saja, di belakang runner bersama: proteksi SSRF, retry, circuit breaker, batas ukuran, dan balasan error yang jujur saat sumber mati. Scraper gratis memang akan rusak berkala.
- Chat AI opsional (rudder.chat) yang hanya aktif bila owner mengisi cookie sesi di `.env`. Tidak ada API berbayar di mana pun.

## Katalog perintah

Prefix: `.` (juga `!`, `/`, `#`). Tombol di balasan bot membawa perintah yang sama, jadi menekan tombol sama dengan mengetik perintahnya.

### Utama dan profil

| Perintah | Fungsi |
|---|---|
| `.menu [kategori\|all]` | Menu navigasi tombol, per kategori atau teks penuh |
| `.listbot` | Daftar bot aktif (bot utama plus sesi jadibot) |
| `.ping` | Cek bot hidup |
| `.help [perintah]` | Detail perintah |
| `.lang [id\|en]` | Ganti bahasa per pengguna |
| `.webcode` (alias `.loginweb`) | Kode login dashboard web sekali pakai |
| `.credits` | Kredit dan terima kasih proyek |
| `.daftar <nama>` atau `.daftar auto` | Daftar jadi member (wajib sebelum memakai bot); auto memakai nama WhatsApp kamu |
| `.profil` (alias `.me`) | Profil kamu: level, XP, limit, saldo |
| `.level` | Level dan progres XP kamu |
| `.limit` | Sisa limit harian kamu |
| `.leaderboard` (alias `.lb`) | Leaderboard XP |
| `.carifitur <kata kunci>` | Cari perintah berdasarkan kata kunci |
| `.kalkulator <ekspresi>` | Kalkulator aman (tanpa eval) |
| `.konversi <nilai> <dari> <ke>` | Konversi satuan (panjang, berat, suhu, data, waktu) |
| `.todo <add\|list\|done\|del>` | Daftar todo pribadi |
| `.catatan <simpan\|list\|lihat\|hapus>` | Catatan pribadi per pengguna |
| `.ingatkan <menit> <teks>` | Pengingat pribadi, dikirim scheduler |
| `.transfer <nomor> <jumlah>` | Kirim koin ke member lain |
| `.jam` | Jam sekarang WIB, WITA, WIT, dan UTC |

### Download

| Perintah | Fungsi |
|---|---|
| `.aio <link>` | Deteksi link otomatis dan arahkan ke downloader yang cocok |
| `.spotify <judul atau link>` | Cari lagu Spotify dan kirim audionya |
| `.play <judul>` | Cari lagu di YouTube dan kirim audionya |
| `.yts <kata kunci>` | Hasil pencarian YouTube, pilih pakai tombol |
| `.ytmp4 <judul atau link>` | Unduh video YouTube |
| `.pinterest <kata kunci>` | Cari gambar Pinterest |
| `.fb <link>` | Unduh video atau reel Facebook |
| `.ig <link>` | Unduh foto atau video Instagram |
| `.tiktok <link>` | Unduh video atau slide TikTok tanpa watermark |
| `.mediafire <link>` | Unduh berkas publik MediaFire |
| `.gdrive <link>` | Unduh berkas publik Google Drive |
| `.soundcloud`, `.threads`, `.capcut` | Status jujur: perintah ini membalas jelas saat belum ada sumber gratis terverifikasi |

### Pencarian dan alat

| Perintah | Fungsi |
|---|---|
| `.lirik <judul atau link Spotify>` | Lirik lagu |
| `.komik <judul>` | Cari komik di Komikcast |
| `.font <kata kunci>` / `.font dl <slug>` | Cari font DaFont / unduh berkas fontnya |
| `.wiki <kata kunci>` | Ringkasan Wikipedia (Indonesia lebih dulu) |
| `.kbbi <kata>` | Entri Kamus Besar Bahasa Indonesia |
| `.chord <lagu>` | Kunci gitar saat sumber publik terjangkau |
| `.gambar <kata kunci>` | Pencarian gambar |
| `.anime <judul>` | Info anime dan manga dari Jikan (data MyAnimeList) |
| `.cuaca <kota>` | Cuaca dari Open-Meteo |
| `.gempa` | Gempa terbaru dari BMKG |
| `.sholat <kota>` | Jadwal sholat (myQuran), plus pengalih pengingat grup |
| `.kurs <jumlah> <dari> <ke>` | Konversi mata uang |
| `.terjemah <bahasa> <teks>` (alias `.tr`) | Terjemahkan teks |
| `.qr <teks>` | Buat gambar kode QR |
| `.scanqr` (balas gambar) | Baca kode QR dari gambar |
| `.shortlink <url>` | Pendekkan URL |
| `.ssweb <url>` | Screenshot situs web |
| `.resep <kata kunci>` | Pencarian resep (TheMealDB) |
| `.film <judul>` | Info acara TV (TVMaze) |
| `.ocr` (balas gambar) | Status jujur: OCR belum tersedia, bot menyatakannya dengan jelas |

### Game HTML

| Perintah | Fungsi |
|---|---|
| `.games` | Daftar game dengan tombol main |
| `.game <id>` | Kirim game: `dino`, `flappy`, `snake`, `2048`, `tetris`, `memory`, `breakout`, `tictactoe`, plus `minesweeper`, `whackamole`, `blockblast`; `.hello` mengirim game contoh bawaan |
| `.topgame [id]` | Leaderboard game |
| `.slot <bet>` | Mesin slot koin (koin virtual saja) |
| `.blackjack <bet>`, `.hit`, `.stand` | Blackjack melawan dealer |
| `.daduvs <bet>` | Duel dadu melawan bot |

### Grup

| Perintah | Fungsi |
|---|---|
| `.protect <fitur> <on\|off>` | Alihkan welcome, goodbye, antilink, antispam, antitoxic, antijudol, antiphising |
| `.guard` | Status proteksi grup (middleware guard menghapus dan memberi warn otomatis) |
| `.welcome <on\|off>` | Kartu welcome dan goodbye memakai aset banner resmi |
| `.warn @user [alasan]`, `.warnings [@user]` | Peringatkan member; auto-kick di batas grup |
| `.kick`, `.add`, `.promote`, `.demote` | Administrasi member (khusus admin, bot wajib admin) |
| `.tagall [teks]`, `.hidetag [teks]` | Sebut semua member, terlihat atau tersembunyi |
| `.grup <open\|close\|info>` | Buka atau tutup grup sekarang |
| `.jadwalgrup <open HH:mm> <close HH:mm>` | Buka tutup terjadwal |
| `.setname`, `.setdesc`, `.setppgrup` | Nama, deskripsi, foto grup |
| `.linkgrup`, `.revoke` | Tautan undangan dan reset |
| `.afk [alasan]` | Pasang status AFK; bot menyadari saat kamu kembali atau disebut |
| `.absen <start\|check\|close>` | Sesi absensi |
| `.poll <pertanyaan> \| <opsi1> \| <opsi2>` | Polling native WhatsApp |
| `.rules`, `.setrules <teks>` | Rules grup |
| `.customcmd <add\|del\|list>` | Custom command per grup (pemicu teks persis) |

### Stiker dan maker

| Perintah | Fungsi |
|---|---|
| `.sticker` (alias `.s`, balas media) | Stiker dari gambar, video, atau GIF, dengan pack dan author dari config |
| `.toimg`, `.tovideo`, `.tomp3`, `.tovn` | Konversi media lewat ffmpeg |
| `.brat <teks>`, `.attp <teks>`, `.ttp <teks>` | Stiker teks |
| `.emojimix <emoji1> <emoji2>` | Campuran Emoji Kitchen bila kombinasinya ada |
| `.meme <atas> \| <bawah>` | Meme sederhana di gambarmu atau latar buatan |
| `.smeme <atas> \| <bawah>` | Stiker meme dari gambar yang dikutip |
| `.circle` (balas gambar) | PNG transparan terpotong lingkaran |
| `.fakechat`, `.faketweet` | Maker parodi, selalu berwatermark PARODI |
| `.quotly` (balas pesan) | Kartu kutipan |
| `.carbon <kode>` | Kartu kode |
| `.textstyle <teks>` | Gaya teks fancy |
| `.logo <teks>` | Kartu logo sederhana |
| `.hd` (balas gambar) | Perbesar 2x biasa lewat ffmpeg (bukan AI, diberi label jujur) |
| `.removebg` | Status jujur: belum ada penghapus latar gratis lokal |

### RPG dan ekonomi

| Perintah | Fungsi |
|---|---|
| `.rpg`, `.menurpg` | Menu RPG dan profil RPG kamu (header banner RPG) |
| `.daily`, `.hourly`, `.weekly` | Klaim koin dan item berkala |
| `.mining`, `.fishing`, `.hunting`, `.farming` | Kumpulkan sumber daya (hasil berbasis data) |
| `.craft`, `.recipes` | Buat item dari resep |
| `.shop`, `.buy <item>` | Toko dan pembelian |
| `.inventory` (alias `.inv`) | Item kamu |
| `.bank <deposit\|withdraw> <jumlah>` | Simpan dan ambil koin di bank |
| `.duel @user`, `.dungeon` | Duel PvP dan lari dungeon sederhana |
| `.pet` | Adopsi dan beri makan peliharaan |
| `.job [nama]` | Pilih pekerjaan untuk bonus mengumpulkan |
| `.clan`, `.clanwar` | Dasar clan dan perang clan sederhana |
| `.gacha` | Belanjakan 100 koin untuk item acak |

### Fun, kuis, dan religi

| Perintah | Fungsi |
|---|---|
| `.family100`, `.caklontong`, `.asahotak`, `.tekateki` | Game kuis dengan sesi per chat |
| `.susunkata`, `.tebakgambar`, `.tebakbendera`, `.tebakkimia` | Susun kata, petunjuk gambar, bendera, dan kimia |
| `.jawab <jawaban>` | Jawab kuis aktif (tombol juga bisa) |
| `.nyerah` | Menyerah dari kuis aktif |
| `.truth`, `.dare` | Pertanyaan truth atau dare (data original) |
| `.suit <batu\|gunting\|kertas>` | Suit melawan bot |
| `.bola8 <pertanyaan>` | Jawaban bola ajaib (hiburan) |
| `.joke` | Lelucon acak original |
| `.motivasi`, `.pantun` | Kutipan motivasi dan pantun original |
| `.cekjodoh`, `.cekkhodam`, `.zodiak` | Cek hiburan semata, dengan disclaimer hiburan |
| `.cekmood`, `.cekberuntung`, `.cekpintar`, `.artinama <nama>` | Cek hiburan tambahan, dengan disclaimer hiburan |
| `.weton <DD-MM-YYYY>` | Hitung weton Jawa (hiburan) |
| `.ayat`, `.hadits` | Ayat atau hadits harian dari dataset original kecil |
| `.religi <HH:mm\|off>` | Pengingat religi harian untuk grup |

### AI (opt-in)

| Perintah | Fungsi |
|---|---|
| `.ai <pesan>` | Chat AI: rudder.chat bila owner mengonfigurasinya, selain itu fallback gratis Pollinations; memori singkat per pengguna |
| `.aireset` | Hapus memori chat AI kamu |
| `.aiimg <prompt>` | Teks ke gambar lewat penyedia publik gratis |
| `.vision` (balas gambar) | Tanya tentang gambar saat penyedia gratis terkonfigurasi |
| `.ringkas <teks atau link>` | Ringkas teks atau artikel |
| `.tts <teks>` | Teks ke suara jadi pesan suara (TTS publik gratis) |

### Owner

| Perintah | Fungsi |
|---|---|
| `.owner` (alias `.status`) | Status bot |
| `.mode <public\|self>` | Mode layanan bot |
| `.ban <nomor>`, `.unban <nomor>` | Blokir dan buka blokir pengguna |
| `.broadcast <teks>` | Siaran hanya ke chat yang opt-in, dengan rate limit |
| `.subscribe`, `.subscribe off` | Opt-in dan opt-out siaran untuk grup (admin grup) |
| `.dbstats` | Statistik pemakaian storage |
| `.scraperhealth` | Kesehatan sumber scraper |
| `.reload [plugin]` | Muat ulang plugin tanpa restart |
| `.jadibot <nama> <nomor>`, `.stopjadibot <nama>` | Sesi bot tambahan (khusus owner, maks 3) |

## Instalasi

Baru pertama kali? Ikuti [TUTORIAL.md](TUTORIAL.md) yang ramah pemula: bikin database Supabase, menjalankan bot dengan Docker, di VPS, atau di Termux, pairing WhatsApp, dan deploy dashboard web ke Vercel, langkah demi langkah.

Syarat: Node 20 ke atas (disarankan 22+) dan ffmpeg.

```bash
npm install
cp .env.example .env
# isi BOT_NUMBER dan OWNER_NUMBER di .env (format internasional, hanya digit)
npm start
```

Bila `BOT_NUMBER` masih kosong, bot berhenti rapi dengan pesan penjelasan. Saat pertama jalan dengan nomor terisi, kode pairing dicetak di log: buka WhatsApp, Perangkat tertaut, Tautkan perangkat, lalu pilih tautkan dengan nomor telepon saja.

Perintah lain:

```bash
npm test            # tes unit dan kontrak (node:test)
npm run i18n:check  # cek paritas kunci id dan en
```

## Konfigurasi (.env)

| Variabel | Arti |
|---|---|
| `BOT_NAME` | Nama tampilan bot (default KANA) |
| `BOT_NUMBER` | Nomor WhatsApp bot, hanya digit, format internasional |
| `OWNER_NUMBER` | Nomor owner, format sama |
| `DEFAULT_LANG` | Bahasa default: `id` atau `en` |
| `TIMEZONE` | Label zona waktu (default Asia/Jakarta) |
| `STORAGE_DRIVER` | `local` untuk dev, `supabase` untuk production |
| `DATABASE_URL` | String koneksi pooler Postgres (Supabase), hanya di server |
| `AUTO_BIO`, `BIO_ON_TEMPLATE`, `BIO_OFF_TEMPLATE` | Bio profil otomatis saat connect, dengan placeholder |
| `RUDDER_USER_ID`, `RUDDER_COOKIE_C0`, `RUDDER_COOKIE_C1`, `RUDDER_TH_WHO` | Sesi AI rudder.chat opsional (diisi manual oleh owner) |
| `SCORE_WS_PORT` | Port kanal skor WebSocket untuk game HTML (kosong berarti nonaktif) |
| `WEB_LOGIN_URL` | Halaman login dashboard web (default https://kana.omnicorp.web.id/login) |
| `LIVETEST`, `TEST_CHATS` | Sakelar harness tes live (lihat scripts/livetest.js) |

Rahasia hanya ada di `.env` (gitignored). `.env.example` hanya berisi nama variabel.

## Cara menulis plugin

Buat file baru di `plugins/<kategori>/<nama>.js`:

```js
export const config = {
  name: 'contoh',
  alias: [],
  category: 'main',
  description: { id: 'Deskripsi singkat', en: 'Short description' },
  usage: '.contoh',
  example: '.contoh',
  cooldown: 3,
  // gates opsional: isOwner, isGroup, isPrivate, isAdmin, isBotAdmin, limit
}

export const i18n = {
  id: { contoh: { reply: 'Halo dari plugin contoh~' } },
  en: { contoh: { reply: 'Hello from the sample plugin~' } },
}

export async function handler(ctx) {
  await ctx.reply(ctx.t('contoh.reply'))
}
```

Aturan: semua string yang dilihat pengguna wajib lewat `ctx.t()` dan ekspor `i18n` plugin (tidak boleh hardcoded), keluaran yang punya langkah lanjutan menyertakan tombol lewat `src/ui/buttons.js` dengan fallback teks, dan plugin yang rusak dikarantina otomatis oleh loader supaya bot tidak mati karena satu plugin. Plugin juga boleh mengekspor `before(ctx)` (middleware untuk semua pesan) dan `onParticipantsUpdate(ctx)` (event member grup).

## Dashboard web

Tim web terpisah membangun dashboard KANA. Kontrak dari sisi bot: member memasukkan nomor di halaman login web, web menulis record permintaan, dan watcher bot mengirim kode verifikasi ke nomor WhatsApp itu secara otomatis. Cadangan manualnya adalah perintah `.webcode`. Statistik dashboard datang dari storage yang sama: profil pengguna di namespace `users` dan record `bot_stats` di namespace `kv`. Kontrak lengkap di [docs/WEB.md](docs/WEB.md).

## Catatan risiko

Library ini memakai API WhatsApp tidak resmi, jadi ada risiko nomor diblokir atau dibanned oleh WhatsApp. Pakai nomor cadangan untuk bot, jangan nomor utama. Jangan kirim pesan massal dan beri jeda antar pesan saat pengujian.

## Thanks To

- **Rexxhayanasi** untuk [@rexxhayanasi/elaina-baileys](https://www.npmjs.com/package/@rexxhayanasi/elaina-baileys), library WhatsApp Web yang menjadi fondasi bot ini, dan **WhiskeySockets** untuk fondasi [Baileys](https://github.com/WhiskeySockets/Baileys) upstream.
- **Yui Agents** untuk snippet metadata Spotify embed dan lirik (sumber: Spotify Embed, iTunes Search API, [lyrics.ovh](https://lyrics.ovh), [lrclib](https://lrclib.net)).
- **Jerexd** untuk snippet fallback TikTok tikwm, Komikcast, dan DaFont.
- **hazeloffc** ([t.me/hazeloffc](https://t.me/hazeloffc)) untuk snippet chat AI rudder.chat.
- **MichelleBot** untuk [brat-canvas](https://github.com/MichelleBot/brat-canvas), generator gambar gaya brat di balik stiker .brat.
- **Owner proyek** untuk kode scraper kirimannya sendiri: pencarian dan unduhan Spotify, audio YouTube, Pinterest, Facebook dan Instagram via SnapSave, dan TikTok via tiklydown.
- Layanan publik yang dipakai scraper: [spotmp3.net](https://spotmp3.net), [spotidown.app](https://spotidown.app), [snapsave.app](https://snapsave.app), tiklydown, [tikwm.com](https://tikwm.com), [Jikan](https://jikan.moe) (data MyAnimeList), [Open-Meteo](https://open-meteo.com), data terbuka [BMKG](https://data.bmkg.go.id), dan API sholat myQuran. Catatan triage lengkap di [docs/SNIPPETS.md](docs/SNIPPETS.md).

## Lisensi

MIT, lihat [LICENSE](LICENSE). Copyright (c) 2026 OmniDevv.

</details>
