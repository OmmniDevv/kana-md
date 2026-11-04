// Router reply bersama (standar reply-first, perintah user 2026-11-04).
// Satu-satunya tempat binding balasan disimpan dan dideteksi: plugin yang
// punya alur lanjutan cukup bindReply() ke pesan botnya dan mendaftarkan
// penangan per kind. Pendeteksian pesan reply dilakukan SATU hook before
// (di plugins/fun/nyerah.js bersama routing kuis), bukan per plugin.
//
// Binding: namespace 'reply', key = JID chat, satu binding aktif per chat
// (sejalan dengan satu sesi kuis per chat). Kedaluwarsa otomatis.

const NS = 'reply'
const handlers = new Map()

export function registerReplyKind(kind, fn) {
  handlers.set(kind, fn)
}

export async function bindReply(storage, chat, { kind, messageId, ownerDigits = '', ttlMs = 300000, data = {} } = {}) {
  if (!kind || !messageId) return false
  await storage.set(NS, chat, {
    kind,
    messageId,
    ownerDigits,
    data,
    expiresAt: Date.now() + ttlMs,
  })
  return true
}

export async function saveReplyData(storage, chat, binding) {
  await storage.set(NS, chat, binding)
  return binding
}

export async function getReplyBinding(storage, chat, now = Date.now()) {
  const binding = await storage.get(NS, chat)
  if (!binding) return null
  if (now > (binding.expiresAt ?? 0)) {
    await storage.delete(NS, chat)
    return null
  }
  return binding
}

export async function clearReply(storage, chat) {
  await storage.delete(NS, chat)
}

// Dipanggil hook before bersama: pesan yang mengutip pesan terikat dari
// pemilik binding diteruskan ke penangan kind-nya. Return false berarti
// pesan dikonsumsi; undefined berarti bukan urusan router ini.
export async function dispatchReply(ctx) {
  const stanzaId = ctx.quoted?.stanzaId
  if (!stanzaId) return undefined
  const text = (ctx.text || '').trim()
  if (!text) return undefined
  const binding = await getReplyBinding(ctx.storage, ctx.chat)
  if (!binding || binding.messageId !== stanzaId) return undefined
  if (binding.ownerDigits && ctx.senderDigits !== binding.ownerDigits) return undefined
  const fn = handlers.get(binding.kind)
  if (!fn) return undefined
  const consumed = await fn(ctx, binding)
  return consumed === true ? false : undefined
}
