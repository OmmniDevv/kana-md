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

export const MAX_AUDIO_BYTES = 16 * 1024 * 1024
export const MAX_VIDEO_BYTES = 64 * 1024 * 1024
export const MAX_IMAGE_BYTES = 16 * 1024 * 1024
export const MAX_DOCUMENT_BYTES = 64 * 1024 * 1024

export function tooBigError(bytes, maxBytes) {
  const err = new Error(`File terlalu besar (${(bytes / 1048576).toFixed(1)} MB, batas ${(maxBytes / 1048576).toFixed(0)} MB)`)
  err.code = 'TOO_BIG'
  return err
}
