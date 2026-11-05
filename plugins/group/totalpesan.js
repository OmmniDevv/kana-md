import { aggregateTopchat } from './topchat.js'

export const config = {
  name: 'totalpesan',
  alias: ['totalchat'],
  category: 'group',
  description: { id: 'Total pesan grup ini yang tercatat KANA (data yang sama dengan .topchat)', en: 'Total messages of this group recorded by KANA (same data as .topchat)' },
  usage: '.totalpesan',
  example: '.totalpesan',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    totalpesan: {
      body: '╭─❏ 💬 「 *TOTAL PESAN GRUP* 」\n┊ ɢʀᴜᴘ: *{group}*\n┊ ᴛᴏᴛᴀʟ ᴘᴇꜱᴀɴ ᴛᴇʀᴄᴀᴛᴀᴛ: *{total} pesan*\n┊ ᴅᴀʀɪ: *{members} member* yang tercatat ngobrol\n┊ {topLine}\n╰━━━━━━━ {mood}',
      top: 'ᴘᴀʟɪɴɢ ʙᴀɴʏᴀᴋ: *@{digits}* ({count} pesan)',
      empty: 'Belum ada pesan tercatat di grup ini; hitungan mulai sejak KANA aktif mencatat yaa~',
    },
  },
  en: {
    totalpesan: {
      body: '╭─❏ 💬 「 *TOTAL GROUP MESSAGES* 」\n┊ ɢʀᴏᴜᴘ: *{group}*\n┊ ʀᴇᴄᴏʀᴅᴇᴅ ᴍᴇꜱꜱᴀɢᴇꜱ: *{total} messages*\n┊ ꜰʀᴏᴍ: *{members} members* recorded chatting\n┊ {topLine}\n╰━━━━━━━ {mood}',
      top: 'ᴍᴏꜱᴛ: *@{digits}* ({count} messages)',
      empty: 'No messages recorded in this group yet; counting starts once KANA is actively recording~',
    },
  },
}

export const test = { input: '.totalpesan', expect: /TOTAL PESAN GRUP|TOTAL GROUP MESSAGES/ }

// Total pesan grup dari storage chatcount, sumber data yang sama dengan
// .topchat. Baris topchat dipakai supaya identitas member konsisten
// walau kunci hitungan masih JID/LID mentah.
export async function handler(ctx) {
  const meta = await ctx.sock.groupMetadata(ctx.chat).catch(() => null)
  const counts = (await ctx.storage.get('chatcount', ctx.chat)) ?? {}
  const total = Object.values(counts).reduce((acc, n) => acc + Number(n || 0), 0)
  const rows = aggregateTopchat(counts, meta?.participants ?? [])
  const topLine = rows.length
    ? ctx.t('totalpesan.top', { digits: rows[0].digits, count: rows[0].count })
    : ctx.t('totalpesan.empty')
  return ctx.reply(ctx.t('totalpesan.body', {
    group: meta?.subject || '-',
    total,
    members: rows.length,
    topLine,
    mood: ctx.say('senang'),
  }), rows.length ? { mentions: [rows[0].jid] } : {})
}
