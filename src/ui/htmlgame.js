// Pengiriman bubble mini app HTML5 (richResponseMessage), pola Elaina-MD.
//
// Temuan audit 2026-11-05: bubble yang dibentuk MessageBuilder.sendHtmlApp
// milik library tiba di HP user sebagai placeholder "versi WhatsApp tidak
// mendukung" (hanya teks fallback yang terbaca), sementara game Elaina
// dengan payload yang sama-sama richResponseMessage tampil normal.
//
// Bedah total 2026-11-05 (tangkapan sock tiruan dari handler Elaina asli
// game-blockblast.js dan game-tetris.js vs handler KANA, lalu diff rekursif
// di level argumen relayMessage DAN di level wire hasil encode proto
// library) menyempitkan perbedaan ke titik berikut, dan file ini sekarang
// menyamakan semuanya:
// - botForwardedMessage Elaina HANYA berisi message. Versi sebelumnya di
//   sini menyelipkan messageContextInfo (deviceListMetadata) di dalam
//   botForwardedMessage; field itu memang dibuang encoder proto
//   (FutureProofMessage hanya membaca .message), tapi tetap dihapus demi
//   paritas argumen persis.
// - Submessage messageType 2 Elaina berisi NAMA SINGKAT game ("Block
//   Blast Mini", "Tetris Tetromino"). Versi KANA sebelumnya mengirim
//   kalimat label panjang dari i18n plugin; sekarang submessage selalu
//   judul singkat game (argumen title), label kalimat tidak lagi dipakai
//   untuk bubble.
// - Payload Elaina adalah fragmen game apa adanya, TANPA awalan apa pun.
//   Versi KANA sebelumnya menempel style pengunci tinggi
//   (html,body{height:Npx}) di depan fragmen; tempelan itu dihapus, tinggi
//   panggung diatur CSS game sendiri seperti di Elaina. Argumen height
//   masih diterima demi kompatibilitas pemanggil tapi tidak lagi disuntik.
// - Sisanya sudah sama dan dipertahankan: section unifiedResponse tanpa
//   __typename luar, trusted_sources terisi, messageId relay sama dengan
//   response_id di payload, contextInfo forwardingScore 1, isForwarded
//   true, forwardedAiBotMessageInfo.botJid Meta AI, forwardOrigin 4
//   (penanda diteruskan sesuai aturan proyek). Jalur kirim library
//   (relayMessage, encodeWAMessage, proto) terbukti identik antara
//   elaina-baileys 1.3.10 yang dipakai Elaina dan 1.4.7 yang dipakai KANA,
//   jadi tidak ada perbedaan stack yang perlu dikejar.
//
// Tanda tangan publik dipertahankan dari versi lama supaya semua plugin
// game tidak berubah: sendHtmlGame(sock, jid, htmlPath, { title, label,
// height }) dan sendGameWithVars(sock, jid, htmlPath, { title, label,
// height, vars }).
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'

export const GAME_BOT_JID = '867051314767696@bot'
export const GAME_FORWARD_ORIGIN = 4
const TRUSTED_SOURCES = ['kana.omnicorp.web.id']

// Ubah dokumen HTML utuh menjadi fragmen ala Elaina: ambil semua blok
// style dari head, lalu isi body apa adanya (termasuk script di dalamnya).
// HTML yang sudah berupa fragmen dibiarkan utuh.
export function toGameFragment(html) {
  const source = String(html ?? '')
  if (!/<\s*(?:!doctype|html|head|body)\b/i.test(source)) return source
  const styles = []
  const headMatch = source.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  if (headMatch) {
    for (const m of headMatch[1].matchAll(/<style[^>]*>[\s\S]*?<\/style>/gi)) styles.push(m[0])
  }
  const bodyMatch = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const body = bodyMatch ? bodyMatch[1] : source
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?(?:html|head|body)[^>]*>/gi, '')
  // Konten fragmen yang sudah ditempel di depan dokumen (mis. style
  // pengunci tinggi dari deliverGame) tidak boleh ikut terbuang.
  const docStart = source.search(/<!doctype|<html\b/i)
  const prefix = docStart > 0 ? source.slice(0, docStart).trim() : ''
  return [prefix, ...styles, body.trim()].filter(Boolean).join('\n')
}

// Susun pesan relay bubble game. Mengembalikan { jid, content, options }
// persis seperti yang dikirim Elaina lewat sock.relayMessage.
export function buildGameRelay(jid, { title, html, responseId = randomUUID() }) {
  const payload = toGameFragment(html)
  const content = {
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: title }],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify({
              response_id: responseId,
              sections: [{
                view_model: {
                  primitive: {
                    __typename: 'GenAIaeacdsnwHtmlPrimitive',
                    payload,
                    trusted_sources: [...TRUSTED_SOURCES],
                  },
                  __typename: 'GenAISingleLayoutViewModel',
                },
              }],
            })).toString('base64'),
          },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: GAME_BOT_JID },
            forwardOrigin: GAME_FORWARD_ORIGIN,
          },
        },
      },
    },
  }
  return { jid, content, options: { messageId: responseId } }
}

// Suntik variabel game ke HTML mentah: ganti placeholder
// __BOT_VARS_JSON__ dengan JSON vars, atau sisipkan script
// window.__BOT tepat sebelum </body> bila placeholder tidak ada.
// JSON di-escape supaya script game tidak putus oleh urutan </script>
// di dalam nilainya.
export function buildGameHtml(html, gameVars) {
  const varsJson = JSON.stringify(gameVars ?? {})
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
  const source = String(html ?? '')
  if (source.includes('__BOT_VARS_JSON__')) {
    return source.replace('__BOT_VARS_JSON__', () => varsJson)
  }
  const inject = `<script>window.__BOT = ${varsJson};</script>`
  if (source.includes('</body>')) return source.replace('</body>', `${inject}</body>`)
  return source + inject
}

// Kirim satu bubble game: relay fragmen game apa adanya dengan bentuk
// Elaina. Submessage selalu judul singkat (argumen title); argumen label
// diterima demi kompatibilitas pemanggil lama tapi SENGAJA tidak dipakai,
// karena bentuk Elaina yang terbukti tampil memakai nama singkat game di
// submessage, bukan kalimat label. Argumen height juga tidak lagi
// disuntik ke payload (lihat catatan bedah di kepala file).
function deliverGame(sock, jid, { title, label, html, height = 600 }) {
  void label
  void height
  const relay = buildGameRelay(jid, { title: title ?? 'KANA', html: String(html ?? '') })
  return sock.relayMessage(relay.jid, relay.content, relay.options)
}

// Kirim game dari berkas HTML tanpa variabel.
export async function sendHtmlGame(sock, jid, htmlPath, { title, label, height = 600 } = {}) {
  const html = await readFile(htmlPath, 'utf8')
  return deliverGame(sock, jid, { title, label, html, height })
}

// Kirim game dari berkas HTML dengan variabel tersuntik.
export async function sendGameWithVars(sock, jid, htmlPath, { title, label, height = 600, vars } = {}) {
  const rawHtml = await readFile(htmlPath, 'utf8')
  const html = buildGameHtml(rawHtml, vars)
  return deliverGame(sock, jid, { title, label, html, height })
}
