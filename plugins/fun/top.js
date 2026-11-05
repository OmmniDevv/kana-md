// Top grup: leaderboard iseng yang men-tag member acak untuk satu topik,
// meniru mekanik fitur top Elaina-MD owner (acak peserta grup dari metadata,
// tampilkan peringkat dengan mention beneran), diperluas ke 10 member
// sesuai perintah user. Hanya untuk grup; gerbang isGroup di pipeline
// menjawab pesan khusus grup di chat pribadi.
export const config = {
  name: 'top',
  alias: ['top10', 'toplist'],
  category: 'fun',
  description: { id: 'Leaderboard grup: tag 10 member acak untuk topik tertentu', en: 'Group leaderboard: tag 10 random members for a given topic' },
  usage: '.top <topik>',
  example: '.top gay',
  cooldown: 10,
  isGroup: true,
}

export const i18n = {
  id: {
    top: {
      usage: '╭─❏ 🏆 「 *TOP GRUP* 」\n┊ Topiknya apa dulu yaa~\n┊ Contoh: *.top gay*\n╰━━━━━━━',
      tooFew: '╭─❏ 🏆 「 *TOP {topic}* 」\n┊ Member grupnya kurang dari 2 orang nih, belum bisa dibikin top~\n╰━━━━━━━',
      header: '╭─❏ 🏆 「 *TOP {count} {topic}* 」',
      row: '┊ {medal} @{digits}',
      footer: '╰━━━━━━━\nAcakan iseng KANA yaa, jangan dianggap serius~',
    },
  },
  en: {
    top: {
      usage: '╭─❏ 🏆 「 *GROUP TOP* 」\n┊ Give me a topic first please~\n┊ Example: *.top gay*\n╰━━━━━━━',
      tooFew: '╭─❏ 🏆 「 *TOP {topic}* 」\n┊ This group has fewer than 2 members, cannot build a top list yet~\n╰━━━━━━━',
      header: '╭─❏ 🏆 「 *TOP {count} {topic}* 」',
      row: '┊ {medal} @{digits}',
      footer: '╰━━━━━━━\nJust KANA random fun, do not take it seriously~',
    },
  },
}

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

function digitsOf(jid) {
  return String(jid ?? '').split('@')[0].split(':')[0]
}

// Ambil JID peserta dari metadata grup (bentuk objek { id } atau string),
// buang botnya sendiri. Murni, gampang dites.
export function memberJids(participants, botJid) {
  const botDigits = digitsOf(botJid)
  const seen = new Set()
  const out = []
  for (const p of participants ?? []) {
    const jid = typeof p === 'string' ? p : p?.id
    if (!jid || typeof jid !== 'string') continue
    const digits = digitsOf(jid)
    if (!digits || digits === botDigits || seen.has(digits)) continue
    seen.add(digits)
    out.push(`${digits}@s.whatsapp.net`)
  }
  return out
}

// Acak Fisher-Yates dengan rng yang bisa disuntik buat tes, lalu ambil
// paling banyak count teratas.
export function pickTop(participants, { botJid = '', count = 10, rng = Math.random } = {}) {
  const members = memberJids(participants, botJid)
  for (let i = members.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[members[i], members[j]] = [members[j], members[i]]
  }
  return members.slice(0, Math.max(0, count))
}

// Susun teks peringkat. picked adalah daftar JID urut peringkat.
export function formatTop(t, topic, picked) {
  const lines = [t('top.header', { count: picked.length, topic: String(topic).toUpperCase() })]
  picked.forEach((jid, i) => {
    lines.push(t('top.row', { medal: MEDALS[i] ?? `${i + 1}.`, digits: digitsOf(jid) }))
  })
  lines.push(t('top.footer'))
  return lines.join('\n')
}

export const test = { input: '.top gay', expect: /cuma bisa dipakai di grup|only works in groups/i }

export async function handler(ctx) {
  const topic = (ctx.text || '').trim()
  if (!topic) return ctx.reply(ctx.t('top.usage'))
  const meta = ctx.groupMetadata ?? (await ctx.getGroupMetadata().catch(() => null))
  const picked = pickTop(meta?.participants ?? [], { botJid: ctx.botJid, count: 10 })
  if (picked.length < 2) return ctx.reply(ctx.t('top.tooFew', { topic: topic.toUpperCase() }))
  const text = formatTop(ctx.t, topic, picked)
  return ctx.sock.sendMessage(ctx.chat, { text, mentions: picked }, { quoted: ctx.raw })
}
