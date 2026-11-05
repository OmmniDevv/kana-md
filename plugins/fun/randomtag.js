// Randomtag: pilih satu member grup secara acak dari metadata grup lalu
// tag beneran memakai mentions, seperti fitur Elaina-MD. Khusus grup.
export const config = {
  name: 'randomtag',
  alias: ['rtag'],
  category: 'fun',
  description: { id: 'Tag satu member grup secara acak', en: 'Tag one random group member' },
  usage: '.randomtag',
  example: '.randomtag',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    randomtag: {
      result: '╭─❏ 🎲 「 *RANDOM TAG* 」\n┊ KANA memilih satu member secara acak...\n┊\n┊ ✨ Yang terpilih: *@{digits}*\n┊ Jangan kaget yaa, lagi diperhatikan KANA nih~\n╰━━━━━━━',
      empty: '╭─❏ 🎲 「 *RANDOM TAG* 」\n┊ Hmm, tidak ada member lain yang bisa dipilih di grup ini~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *RANDOM TAG GAGAL* 」\n┊ Mouu, data grupnya gagal diambil: *{message}*\n╰━━━━━━━',
    },
  },
  en: {
    randomtag: {
      result: '╭─❏ 🎲 「 *RANDOM TAG* 」\n┊ KANA picked one member at random...\n┊\n┊ ✨ The chosen one: *@{digits}*\n┊ Do not be startled, KANA is watching you~\n╰━━━━━━━',
      empty: '╭─❏ 🎲 「 *RANDOM TAG* 」\n┊ Hmm, there is no other member to pick in this group~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *RANDOM TAG FAILED* 」\n┊ Mouu, group data failed to load: *{message}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.randomtag', expect: /random tag/i }

function digitsOf(value) {
  return String(value ?? '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

// JID tag untuk satu peserta: utamakan nomor telepon (phoneNumber), lalu
// id/JID apa adanya supaya format LID tidak dirusak.
export function participantJid(participant) {
  if (!participant) return null
  if (typeof participant === 'string') return participant
  if (participant.phoneNumber) {
    const digits = digitsOf(participant.phoneNumber)
    return digits ? `${digits}@s.whatsapp.net` : null
  }
  return participant.id || participant.jid || participant.lid || null
}

// Daftar JID member unik selain bot.
export function memberJids(participants, botJid) {
  const botDigits = digitsOf(botJid)
  const seen = new Set()
  const out = []
  for (const participant of participants ?? []) {
    const jid = participantJid(participant)
    if (!jid) continue
    const digits = digitsOf(participant?.phoneNumber || jid)
    if (!digits || digits === botDigits || seen.has(digits)) continue
    seen.add(digits)
    out.push(jid)
  }
  return out
}

export function pickRandomMember(participants, { botJid = '', rng = Math.random } = {}) {
  const members = memberJids(participants, botJid)
  if (!members.length) return null
  return members[Math.min(members.length - 1, Math.floor(rng() * members.length))]
}

export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try {
      meta = await ctx.getGroupMetadata()
    } catch (err) {
      return ctx.reply(ctx.t('randomtag.fail', { message: err.message }))
    }
  }
  const picked = pickRandomMember(meta?.participants ?? [], { botJid: ctx.botJid })
  if (!picked) return ctx.reply(ctx.t('randomtag.empty'))
  const digits = digitsOf(picked)
  return ctx.sock.sendMessage(
    ctx.chat,
    { text: ctx.t('randomtag.result', { digits }), mentions: [picked] },
    { quoted: ctx.raw }
  )
}
