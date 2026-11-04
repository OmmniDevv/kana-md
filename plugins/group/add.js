import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'add',
  alias: [],
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
  id: { add: { noTarget: 'Tulis nomor yang mau ditambah yaa, contoh .add 6281234567890~', ok: '@{digits} udah KANA tambahkan ke grup. Selamat datang~', fail: 'Gagal menambahkan @{digits}: {error}. Kadang nomor itu membatasi undangan grup, coba pakai .linkgrup yaa.' } },
  en: { add: { noTarget: 'Write the number to add, for example .add 6281234567890~', ok: '@{digits} has been added to the group. Welcome~', fail: 'Failed to add @{digits}: {error}. Sometimes that number restricts group invites, try .linkgrup instead.' } },
}

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
