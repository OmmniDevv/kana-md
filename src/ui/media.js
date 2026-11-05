// Helper kirim media lewat sock.sendMessage standar Baileys, selalu mengutip
// pesan perintah pengguna. Dipakai plugin downloader.
export async function sendAudio(ctx, buffer, { title, performer, mimetype = 'audio/mp4', caption } = {}) {
  return ctx.sock.sendMessage(
    ctx.chat,
    { audio: buffer, mimetype, fileName: title ? `${title}.m4a` : undefined, ...(caption ? { caption } : {}) },
    { quoted: ctx.raw }
  )
}

export async function sendVideo(ctx, buffer, { caption, mimetype = 'video/mp4' } = {}) {
  return ctx.sock.sendMessage(ctx.chat, { video: buffer, mimetype, caption }, { quoted: ctx.raw })
}

export async function sendImage(ctx, buffer, { caption } = {}) {
  return ctx.sock.sendMessage(ctx.chat, { image: buffer, caption }, { quoted: ctx.raw })
}

export async function sendDocument(ctx, buffer, { fileName, mimetype, caption } = {}) {
  return ctx.sock.sendMessage(ctx.chat, { document: buffer, fileName, mimetype, caption }, { quoted: ctx.raw })
}

// Normalisasi hasil ctx.downloadQuoted()/downloadMedia(). Pipeline
// mengembalikan Buffer polos (downloadMediaMessage tipe 'buffer' dari
// Baileys), tetapi sebagian plugin lama ditulis mengharapkan objek
// { buffer, kind } sehingga tidak pernah lolos gerbang medianya secara
// live (temuan sapuan 2026-11-05: togif selalu membalas BUTUH VIDEO
// walau mengutip video asli). Fungsi ini menerima kedua bentuk dan
// menebak jenis media dari pesan yang dikutip bila kind tidak ada.
export function normalizeDownloadedMedia(media, quotedMessage) {
  const buffer = Buffer.isBuffer(media) ? media : Buffer.isBuffer(media?.buffer) ? media.buffer : null
  if (!buffer?.length) return null
  let kind = typeof media?.kind === 'string' ? media.kind : null
  if (!kind && quotedMessage && typeof quotedMessage === 'object') {
    if (quotedMessage.videoMessage) kind = 'video'
    else if (quotedMessage.imageMessage) kind = 'image'
    else if (quotedMessage.audioMessage) kind = 'audio'
    else if (quotedMessage.stickerMessage) kind = 'sticker'
    else if (quotedMessage.documentMessage) kind = 'document'
  }
  return { buffer, kind }
}

export const MAX_AUDIO_BYTES = 16 * 1024 * 1024
export const MAX_VIDEO_BYTES = 64 * 1024 * 1024
export const MAX_IMAGE_BYTES = 16 * 1024 * 1024
export const MAX_DOCUMENT_BYTES = 64 * 1024 * 1024

export function tooBigError(bytes, maxBytes) {
  const err = new Error(`File terlalu besar (${(bytes / 1048576).toFixed(1)} MB, batas ${(maxBytes / 1048576).toFixed(0)} MB)`)
  err.code = 'TOO_BIG'
  return err
}
