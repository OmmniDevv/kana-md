import { digitsOf } from '../../src/services/guard-rules.js'

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
      title: '🏆 MEMBER PALING AKTIF\n\n{list}\n\nDihitung dari pesan yang KANA lihat sejak fitur ini aktif yaa~',
      line: '{rank}. @{digits}: {count} pesan',
      empty: 'Belum ada pesan yang tercatat di grup ini. Ngobrol dulu yuk~ {mood}',
    },
  },
  en: {
    topchat: {
      title: '🏆 MOST ACTIVE MEMBERS\n\n{list}\n\nCounted from messages KANA saw since this feature is active~',
      line: '{rank}. @{digits}: {count} messages',
      empty: 'No messages recorded in this group yet. Start chatting~ {mood}',
    },
  },
}

export const test = { input: '.topchat', expect: /aktif|active/i }

// Penghitung aktivitas grup: satu-satunya tugas hook ini adalah menaikkan
// counter pengirim di namespace 'chatcount'. Diam untuk non-grup dan
// pesan dari bot sendiri.
export async function before(ctx) {
  if (!ctx.isGroup) return
  if (ctx.raw?.key?.fromMe) return
  const digits = digitsOf(ctx.sender)
  if (!digits) return
  try {
    const counts = (await ctx.storage.get('chatcount', ctx.chat)) ?? {}
    counts[digits] = Number(counts[digits] ?? 0) + 1
    await ctx.storage.set('chatcount', ctx.chat, counts)
  } catch {}
}

export async function handler(ctx) {
  const counts = (await ctx.storage.get('chatcount', ctx.chat)) ?? {}
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
  if (!rows.length) return ctx.reply(ctx.t('topchat.empty', { mood: ctx.say('malu') }))
  const mentions = rows.map(([digits]) => `${digits}@s.whatsapp.net`)
  const list = rows.map(([digits, count], i) => ctx.t('topchat.line', { rank: i + 1, digits, count })).join('\n')
  await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('topchat.title', { list }), mentions }, { quoted: ctx.raw })
}
