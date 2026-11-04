import { readFile } from 'node:fs/promises'
import { MB, checkHtmlApp } from '@rexxhayanasi/elaina-baileys'
import { logger } from '../services/logger.js'

// Mini app HTML lewat MB.sendHtmlApp (terkonfirmasi ada di v1.4.7).
// checkHtmlApp adalah named export top-level di v1.4.7 (bukan MB.checkHtmlApp).
// WebView hanya tampil di Android dan offline: semua aset wajib tertanam di HTML.
//
// Penanda diteruskan WAJIB untuk semua game HTML (pola SC Elaina-MD owner):
// tanpa contextInfo isForwarded, game HTML tidak bekerja di WhatsApp.
// Opsi forwarded dan forwardingScore diteruskan sendHtmlApp ke AIRich.send
// lalu AIRich.build, yang menulisnya ke richResponseMessage.contextInfo.
// Terverifikasi empiris lewat payload relay (fakeSock menangkap relayMessage,
// test/game-forwarded.test.js): forwardingScore 999 benar benar mengalir,
// payload akhir memuat contextInfo { forwardingScore: 999, isForwarded: true,
// forwardedAiBotMessageInfo: { botJid }, forwardOrigin, dan
// botMessageSharingInfo.forwardScore: 999 }.
const FORWARDED_OPTS = { forwarded: true, forwardingScore: 999 }

export async function sendHtmlGame(sock, jid, htmlPath, { title, label, height = 360 } = {}) {
  const html = await readFile(htmlPath, 'utf8')
  if (typeof checkHtmlApp === 'function') {
    const warnings = checkHtmlApp(html, { height })
    if (warnings?.length) logger.warn({ warnings }, 'checkHtmlApp')
  }
  return MB.sendHtmlApp(sock, jid, html, { title, label, height, ...FORWARDED_OPTS })
}

function varsJson(vars) {
  // Escape "<" supaya nama pemain yang mengandung "</script>" tidak bisa
  // menutup tag script suntikan lebih awal. JSON tetap valid.
  return JSON.stringify(vars ?? {}).replace(/</g, '\\u003c')
}

// Suntikkan variabel bot ke HTML game (murni, gampang dites).
// Kontrak Fase 3: vars = { sid, lang, name, token, ws }.
// Bila HTML mengandung token string __BOT_VARS_JSON__, token itu diganti
// JSON vars-nya. Selain itu sisipkan
// <script>window.__BOT = <JSON></script> tepat sebelum </body>
// (atau di akhir dokumen bila tidak ada </body>).
export function buildGameHtml(html, vars) {
  const json = varsJson(vars)
  const source = String(html ?? '')
  if (source.includes('__BOT_VARS_JSON__')) return source.split('__BOT_VARS_JSON__').join(json)
  const script = `<script>window.__BOT = ${json}</script>`
  const idx = source.toLowerCase().lastIndexOf('</body>')
  if (idx === -1) return source + script
  return source.slice(0, idx) + script + source.slice(idx)
}

// Kirim game dengan variabel bot tersuntik: baca file, jalankan
// checkHtmlApp, suntikkan vars, lalu MB.sendHtmlApp.
export async function sendGameWithVars(sock, jid, htmlPath, { title, label, height = 360, vars } = {}) {
  const html = await readFile(htmlPath, 'utf8')
  const built = buildGameHtml(html, vars)
  if (typeof checkHtmlApp === 'function') {
    try {
      const report = checkHtmlApp(built, { height })
      const problems = Array.isArray(report) ? report : [...(report?.problems ?? []), ...(report?.warnings ?? [])]
      if (problems.length) logger.warn({ warnings: problems }, 'checkHtmlApp')
    } catch {}
  }
  return MB.sendHtmlApp(sock, jid, built, { title, label, height, ...FORWARDED_OPTS })
}
