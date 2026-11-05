// Pengiriman bubble mini app HTML5 (richResponseMessage), varian
// RYO-YAMADA (format C).
//
// Riwayat format, semuanya divonis langsung oleh owner di HP-nya:
// - Bentuk library MessageBuilder.sendHtmlApp tiba sebagai placeholder
//   "versi WhatsApp tidak mendukung" (hanya teks fallback terbaca).
// - Format A, paritas total dengan Elaina-MD (bedah tangkapan handler
//   Elaina asli game-blockblast.js dan game-tetris.js sampai level wire
//   hasil encode proto library, 2026-11-05): data base64, payload
//   fragmen, submessage judul singkat, tanpa messageContextInfo,
//   botJid Meta AI di contextInfo, trusted_sources terisi, messageId
//   relay sama dengan response_id di payload. Tetap placeholder.
// - Format B, varian pain-bot: messageContextInfo berisi botMetadata
//   lengkap dengan verificationMetadata (rantai sertifikat dan tanda
//   tangan acak), data JSON mentah bukan base64, typename
//   FOAHtmlPrimitiveDemoDONOTUSE, submessages kosong, trusted_sources
//   kosong, HTML dokumen utuh. Tetap placeholder.
// - Format C, varian dominan RYO-YAMADA-MD: TAMPIL jadi game beneran,
//   vonis owner 2026-11-05 23:24 WIB. Ini referensi perilaku dari
//   plugins/game/tetris.js repo RYO-YAMADA-MD, ditulis ulang di sini
//   mengikuti bentuknya, bukan salinan kode. Bedanya dari format A
//   hanya titik berikut:
//   * messageContextInfo di level atas pesan: deviceListMetadata {}
//     versi 2 plus botMetadata ramping { messageDisclaimerText: '',
//     botResponseId } dan TANPA verificationMetadata sama sekali.
//   * botResponseId adalah UUID acak tersendiri, selalu berbeda dari
//     response_id di payload.
//   * forwardedAiBotMessageInfo.botJid adalah '0@bot', bukan botJid
//     Meta AI.
//   * trusted_sources di payload array kosong.
//   * options relay kosong {} (messageId bawaan library), tidak lagi
//     dipaksa sama dengan response_id.
//   Sisanya sama seperti format A: data base64 JSON tanpa __typename
//   root/section (primitive GenAIaeacdsnwHtmlPrimitive, view_model
//   GenAISingleLayoutViewModel), submessage messageType 2 berisi judul
//   singkat game (argumen title; kalimat label dari i18n plugin tidak
//   dipakai untuk bubble), payload fragmen apa adanya lewat
//   toGameFragment tanpa tempelan style pengunci tinggi (argumen
//   height diterima demi kompatibilitas pemanggil tapi tidak
//   disuntik), dan contextInfo forwardingScore 1, isForwarded true,
//   forwardOrigin 4 sebagai penanda diteruskan sesuai aturan proyek.
//
// Tanda tangan publik dipertahankan dari versi lama supaya semua plugin
// game tidak berubah: sendHtmlGame(sock, jid, htmlPath, { title, label,
// height }) dan sendGameWithVars(sock, jid, htmlPath, { title, label,
// height, vars }).
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'

export const GAME_BOT_JID = '0@bot'
export const GAME_FORWARD_ORIGIN = 4

// Ubah dokumen HTML utuh menjadi fragmen: ambil semua blok
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
// dengan bentuk varian RYO-YAMADA (format C) yang terbukti tampil di HP
// owner: messageContextInfo berisi botMetadata ramping selalu menyertai
// content di level atas, dan options kosong supaya messageId memakai
// bawaan library.
export function buildGameRelay(jid, { title, html, responseId = randomUUID() }) {
  const payload = toGameFragment(html)
  const content = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: '',
        botResponseId: randomUUID(),
      },
    },
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
                    trusted_sources: [],
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
  return { jid, content, options: {} }
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
// varian RYO-YAMADA (format C). Submessage selalu judul singkat
// (argumen title); argumen label diterima demi kompatibilitas pemanggil
// lama tapi SENGAJA tidak dipakai, karena bentuk yang terbukti tampil
// memakai nama singkat game di submessage, bukan kalimat label.
// Argumen height juga tidak disuntik ke payload (lihat catatan
// riwayat format di kepala file).
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
