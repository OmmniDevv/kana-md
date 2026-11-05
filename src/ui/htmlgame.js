// Pengiriman bubble mini app HTML5 (richResponseMessage), pola Elaina-MD.
//
// Temuan audit 2026-11-05: bubble yang dibentuk MessageBuilder.sendHtmlApp
// milik library tiba di HP user sebagai placeholder "versi WhatsApp tidak
// mendukung" (hanya teks fallback yang terbaca), sementara game Elaina
// dengan payload yang sama-sama richResponseMessage tampil normal.
// Perbedaannya ada di bentuk relay-nya, jadi pengiriman di sini meniru
// persis relay manual Elaina (plugins/game/game-blockblast.js):
// - relay hanya membawa botForwardedMessage, TANPA messageContextInfo
//   botMetadata/botResponseId bawaan library di level atas;
// - payload HTML berupa FRAGMEN (style + isi body, tanpa doctype dan
//   tanpa tag html/head/body), bukan dokumen HTML utuh;
// - submessage pembuka messageType 2 berisi label game;
// - section unifiedResponse tanpa __typename luar, trusted_sources
//   terisi, dan messageId relay sama dengan response_id di payload;
// - contextInfo persis: forwardingScore 1, isForwarded true,
//   forwardedAiBotMessageInfo.botJid Meta AI, forwardOrigin 4
//   (penanda diteruskan sesuai aturan proyek).
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
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
      },
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

// Kirim satu bubble game: tempel style pengunci tinggi di awal fragmen
// (pengganti script lockHeight library yang tidak dipakai lagi), lalu
// relay dengan bentuk Elaina.
function deliverGame(sock, jid, { title, label, html, height = 600 }) {
  const sized = `<style>html,body{height:${height}px;overflow:hidden}</style>\n${String(html ?? '')}`
  const relay = buildGameRelay(jid, { title: label ?? title ?? 'KANA', html: sized })
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
