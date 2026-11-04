import { readFile } from 'node:fs/promises'
import { MB, checkHtmlApp } from '@rexxhayanasi/elaina-baileys'
import { logger } from '../services/logger.js'

// Mini app HTML lewat MB.sendHtmlApp (terkonfirmasi ada di v1.4.7).
// checkHtmlApp adalah named export top-level di v1.4.7 (bukan MB.checkHtmlApp).
// WebView hanya tampil di Android dan offline: semua aset wajib tertanam di HTML.
export async function sendHtmlGame(sock, jid, htmlPath, { title, label, height = 360 } = {}) {
  const html = await readFile(htmlPath, 'utf8')
  if (typeof checkHtmlApp === 'function') {
    const warnings = checkHtmlApp(html, { height })
    if (warnings?.length) logger.warn({ warnings }, 'checkHtmlApp')
  }
  return MB.sendHtmlApp(sock, jid, html, { title, label, height })
}
