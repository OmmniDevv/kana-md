import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'add',
  alias: ['tambah'],
  category: 'group',
  description: { id: 'Tambah member ke grup dari nomor', en: 'Add a member to the group by number' },
  usage: '.add <nomor>',
  example: '.add 6281234567890',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: { add: { noTarget: '╭─❏ 📥 「 *MAU TAMBAH SIAPA?* 」\n┊ Tulis nomor yang mau ditambah ke grup yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.add 6281234567890*\n╰━━━━━━━', ok: '╭─❏ 🎉 「 *MEMBER BARU DATANG* 」\n┊ *@{digits}* udah KANA tambahkan ke grup~\n┊ Selamat datang yaa~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *GAGAL MENAMBAHKAN* 」\n┊ *@{digits}*: {error}\n┊ Kadang nomor itu membatasi undangan grup, coba pakai *.linkgrup* yaa~\n╰━━━━━━━' } },
  en: { add: { noTarget: '╭─❏ 📥 「 *WHO SHOULD BE ADDED?* 」\n┊ Write the number to add to the group~\n┊ ᴇxᴀᴍᴘʟᴇ: *.add 6281234567890*\n╰━━━━━━━', ok: '╭─❏ 🎉 「 *NEW MEMBER ARRIVED* 」\n┊ *@{digits}* has been added to the group~\n┊ Welcome~\n╰━━━━━━━', fail: '╭─❏ ⚠️ 「 *FAILED TO ADD* 」\n┊ *@{digits}*: {error}\n┊ Sometimes that number restricts group invites, try *.linkgrup* instead~\n╰━━━━━━━' } },
}

export const test = { input: '.add', expect: /grup|group/i }

export async function handler(ctx) {
  const numbers = ctx.args.map((a) => String(a).replace(/\D/g, '')).filter((d) => d.length >= 9 && d.length <= 15)
  if (!numbers.length) return ctx.reply(ctx.t('add.noTarget'))
  for (const digits of numbers) {
    const jid = `${digits}@s.whatsapp.net`
    try {
      const res = await ctx.sock.groupParticipantsUpdate(ctx.chat, [jid], 'add')
      const item = Array.isArray(res) ? res.find((r) => digitsOf(r?.jid || jid) === digits) : null
      if (item && item.status && String(item.status) !== '200') throw new Error(`status ${item.status}`)
      await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('add.ok', { digits }), mentions: [jid] }, { quoted: ctx.raw })
    } catch (err) {
      await ctx.reply(ctx.t('add.fail', { digits, error: err.message }))
    }
  }
}
