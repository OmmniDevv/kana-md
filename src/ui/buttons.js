import { MB, checkNativeFlowButtons } from '@rexxhayanasi/elaina-baileys'
import { logger } from '../services/logger.js'
import { defaultFooterText, footerLine } from '../config/templates.js'

// Bungkus MB.Button (README v1.4.7). Balasan tombol kembali sebagai perintah
// biasa lewat pipeline (id tombol = perintah). Gagal kirim tombol: fallback teks.
// Catatan README: quick_reply maksimal 10 dan tidak dicampur jenis lain,
// selain itu maksimal 3 tombol.
// Footer bawaan: bila pemanggil tidak memberi footer, pakai footer
// watermark dari template pusat. Fungsi t opsional lewat opsi { t } dipakai
// bila ada, selain itu watermark netral tanpa i18n. Pemanggil lama yang
// memberi footer sendiri tidak berubah perilakunya.
export async function sendButtons(sock, jid, { title, body, footer, replies = [], textFallback, t } = {}) {
  const resolvedFooter = footer ?? (typeof t === 'function' ? footerLine(t) : defaultFooterText())
  const fallback = textFallback ?? [title, body, resolvedFooter].filter(Boolean).join('\n')
  if (!replies.length) return sock.sendMessage(jid, { text: fallback })
  try {
    const builder = new MB.Button(sock).setTitle(title ?? '').setBody(body ?? '').setFooter(resolvedFooter ?? '')
    for (const r of replies.slice(0, 10)) builder.addReply(r.text, r.id)
    if (typeof checkNativeFlowButtons === 'function') {
      const check = checkNativeFlowButtons(builder)
      if (check && check.ok === false) throw new Error('validasi tombol gagal')
    }
    return await builder.send(jid)
  } catch (err) {
    logger.warn({ err: err.message }, 'tombol gagal, fallback ke teks')
    return sock.sendMessage(jid, { text: fallback })
  }
}
