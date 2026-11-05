import { digitsOf } from '../../src/services/guard-rules.js'
import { resolveGroupMembers } from '../../src/services/group-members.js'

export const config = {
  name: 'topchat',
  alias: ['palingaktif'],
  category: 'group',
  description: { id: 'Member paling aktif di grup ini berdasarkan hitungan pesan KANA', en: 'Most active members in this group based on KANA message counting' },
  usage: '.topchat',
  example: '.topchat',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    topchat: {
      title: '╭─❏ 🏆 「 *MEMBER PALING AKTIF* 」\n┊ {list}\n╰━━━━━━━\nDihitung dari pesan yang KANA lihat sejak fitur aktif yaa~',
      line: '{rank}. *@{digits}*: *{count} pesan*',
      empty: '╭─❏ 🏆 「 *MEMBER PALING AKTIF* 」\n┊ Belum ada pesan yang tercatat di grup ini~\n┊ Ngobrol dulu yuk biar aktif~\n╰━━━━━━━ {mood}',
    },
  },
  en: {
    topchat: {
      title: '╭─❏ 🏆 「 *MOST ACTIVE MEMBERS* 」\n┊ {list}\n╰━━━━━━━\nCounted from messages KANA saw since this feature is active~',
      line: '{rank}. *@{digits}*: *{count} messages*',
      empty: '╭─❏ 🏆 「 *MOST ACTIVE MEMBERS* 」\n┊ No messages recorded in this group yet~\n┊ Start chatting to get active~\n╰━━━━━━━ {mood}',
    },
  },
}

export const test = { input: '.topchat', expect: /aktif|active/i }

// Penghitung aktivitas grup: satu-satunya tugas hook ini adalah menaikkan
// counter pengirim di namespace 'chatcount'. Diam untuk non-grup dan
// pesan dari bot sendiri. Kunci hitungan adalah digit NOMOR TELEPON
// pengirim: utamakan JID berakhiran s.whatsapp.net di antara sender dan
// senderAlt (di grup mode LID salah satunya LID dan yang lain nomor
// asli), supaya satu orang tidak terpecah jadi dua kunci.
export async function before(ctx) {
  if (!ctx.isGroup) return
  if (ctx.raw?.key?.fromMe) return
  const pnSource = [ctx.senderAlt, ctx.sender].find((j) => typeof j === 'string' && j.endsWith('@s.whatsapp.net'))
  const digits = digitsOf(pnSource ?? ctx.sender)
  if (!digits) return
  try {
    const counts = (await ctx.storage.get('chatcount', ctx.chat)) ?? {}
    counts[digits] = Number(counts[digits] ?? 0) + 1
    await ctx.storage.set('chatcount', ctx.chat, counts)
  } catch {}
}

// Gabungkan hitungan mentah ke member asli grup. Data lama bisa berisi
// kunci LID orang yang sama, bahkan digit JID grup itu sendiri (pernah
// terhitung 58 pesan di Test bot); keduanya tidak boleh tampil: kunci
// LID digabung ke nomor aslinya, kunci yang bukan peserta dibuang.
export function aggregateTopchat(counts, participants, chatJid = '') {
  const { byDigits } = resolveGroupMembers(participants)
  const agg = new Map()
  for (const [key, count] of Object.entries(counts ?? {})) {
    const member = byDigits.get(key)
    if (member) {
      agg.set(member.digits, (agg.get(member.digits) ?? 0) + Number(count ?? 0))
    } else if (!participants?.length && key !== digitsOf(chatJid)) {
      // Metadata tidak tersedia: tampilkan kunci apa adanya kecuali
      // JID grupnya sendiri, yang pasti bukan member.
      agg.set(key, (agg.get(key) ?? 0) + Number(count ?? 0))
    }
  }
  return [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
}

export async function handler(ctx) {
  const counts = (await ctx.storage.get('chatcount', ctx.chat)) ?? {}
  const meta = ctx.groupMetadata ?? (await ctx.getGroupMetadata().catch(() => null))
  const rows = aggregateTopchat(counts, meta?.participants ?? [], ctx.chat)
  if (!rows.length) return ctx.reply(ctx.t('topchat.empty', { mood: ctx.say('malu') }))
  const mentions = rows.map(([digits]) => `${digits}@s.whatsapp.net`)
  const list = rows.map(([digits, count], i) => ctx.t('topchat.line', { rank: i + 1, digits, count })).join('\n┊ ')
  await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('topchat.title', { list }), mentions }, { quoted: ctx.raw })
}
