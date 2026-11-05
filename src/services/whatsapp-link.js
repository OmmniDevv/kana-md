// Parser tautan WhatsApp murni (dipakai linkid dan inspect):
// - saluran: whatsapp.com/channel/<kode undangan>
// - grup: chat.whatsapp.com/<kode undangan>
// - JID langsung: <angka>@newsletter atau <angka>@g.us
export function parseWhatsappLink(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return null
  const jid = raw.match(/^(\d+)@(newsletter|g\.us)$/i)
  if (jid) return { type: jid[2].toLowerCase() === 'newsletter' ? 'channel' : 'group', code: '', jid: raw, url: raw }
  const channel = raw.match(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i)
  if (channel) return { type: 'channel', code: channel[1], jid: '', url: `https://whatsapp.com/channel/${channel[1]}` }
  const group = raw.match(/(?:https?:\/\/)?(?:www\.)?chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i)
  if (group) return { type: 'group', code: group[1], jid: '', url: `https://chat.whatsapp.com/${group[1]}` }
  return null
}

// Metadata saluran dari kode undangan, memakai method library yang ada
// di README @rexxhayanasi/elaina-baileys: newsletterMetadata('invite', kode).
// Mengembalikan null bila method tidak tersedia di sock.
export async function getChannelMetadataByInvite(sock, code) {
  if (!sock || typeof sock.newsletterMetadata !== 'function') return null
  const meta = await sock.newsletterMetadata('invite', code)
  if (!meta) return null
  const thread = meta.thread_metadata ?? meta
  return {
    id: meta.id || thread.id || '',
    name: thread.name?.text || thread.name || meta.name || '',
    subscribers: thread.subscribers_count ?? meta.subscribers ?? null,
    description: thread.description?.text || thread.description || '',
  }
}

// Info grup dari kode undangan: sock.groupGetInviteInfo(kode) per README.
export async function getGroupInfoByInvite(sock, code) {
  if (!sock || typeof sock.groupGetInviteInfo !== 'function') return null
  const info = await sock.groupGetInviteInfo(code)
  if (!info) return null
  return {
    id: info.id || '',
    name: info.subject || '',
    owner: info.owner || info.creator || '',
    participants: Array.isArray(info.participants) ? info.participants : [],
    size: info.size ?? (Array.isArray(info.participants) ? info.participants.length : null),
    description: info.desc || '',
    creation: info.creation ?? null,
  }
}
