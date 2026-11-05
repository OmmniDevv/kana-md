// Susun muatan pin pesan untuk sock.sendMessage(chat, { pin, type }).
// Bentuk ini didukung jalur kirim library elaina-baileys 1.4.7
// (messages-send.js mengenali content.pin dan membentuk
// pinInChatMessage) dan meniru perilaku pinpesan RYO-YAMADA-MD
// (audit RYO 2026-11-05), ditulis ulang gaya KANA.
// type 1 = sematkan, type 2 = lepas sematan.

export function botDigitsOf(botJid) {
  return String(botJid || '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

export function buildPinContent(quoted, chat, { isGroup = false, botJid = '' } = {}) {
  if (!quoted?.stanzaId) return null
  const sender = String(quoted.sender || '')
  const senderDigits = sender.split('@')[0].split(':')[0].replace(/\D/g, '')
  const key = {
    remoteJid: chat,
    fromMe: Boolean(senderDigits) && senderDigits === botDigitsOf(botJid),
    id: quoted.stanzaId,
  }
  if (isGroup && sender) key.participant = sender
  return key
}

export function buildPinPayload(quoted, chat, options = {}) {
  const key = buildPinContent(quoted, chat, options)
  if (!key) return null
  return { pin: key, type: options.unpin ? 2 : 1 }
}
