import { esmToCjs } from '../../src/services/code-convert.js'

export const config = {
  name: 'esmtocjs',
  alias: ['esmtocj'],
  category: 'tools',
  description: { id: 'Ubah kode ESM menjadi CommonJS secara lokal', en: 'Convert ESM code to CommonJS locally' },
  usage: '.esmtocjs <kode esm>',
  example: ".esmtocjs import fs from 'fs'",
  cooldown: 5,
}

export const i18n = {
  id: {
    esmtocjs: {
      needCode: '╭─❏ 🧩 「 *KIRIM KODE ESM-NYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.esmtocjs import fs from \'fs\'*\n┊ ʙɪꜱᴀ ᴊᴜɢᴀ ʀᴇᴘʟʏ ᴘᴇꜱᴀɴ ʙᴇʀɪꜱɪ ᴋᴏᴅᴇ.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *TIDAK ADA YANG DIUBAH* 」\n┊ Kode itu tidak memuat pola ESM yang dikenal~\n╰━━━━━━━',
      out: '╭─❏ 🧩 「 *HASIL CJS* 」\n╰━━━━━━━\n',
    },
  },
  en: {
    esmtocjs: {
      needCode: '╭─❏ 🧩 「 *SEND THE ESM CODE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.esmtocjs import fs from \'fs\'*\n┊ ʏᴏᴜ ᴄᴀɴ ᴀʟꜱᴏ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇꜱꜱᴀɢᴇ ᴡɪᴛʜ ᴄᴏᴅᴇ.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *NOTHING CHANGED* 」\n┊ That code has no known ESM patterns~\n╰━━━━━━━',
      out: '╭─❏ 🧩 「 *CJS RESULT* 」\n╰━━━━━━━\n',
    },
  },
}

export const test = { input: ".esmtocjs import fs from 'fs'", expect: /const fs = require\('fs'\)/ }

// Ambil kode dari teks perintah atau pesan yang dikutip.
export function extractCode(ctx) {
  const direct = (ctx.text || '').trim()
  if (direct) return direct
  const q = ctx.quoted?.message || {}
  return (q.conversation || q.extendedTextMessage?.text || '').trim()
}

export async function handler(ctx) {
  const code = extractCode(ctx)
  if (!code) return ctx.reply(ctx.t('esmtocjs.needCode'))
  const out = esmToCjs(code)
  if (out.trim() === code.trim()) return ctx.reply(ctx.t('esmtocjs.failed'))
  if (out.length <= 3000) return ctx.reply(ctx.t('esmtocjs.out') + '```\n' + out + '\n```')
  await ctx.sock.sendMessage(ctx.chat, {
    document: Buffer.from(out, 'utf8'),
    fileName: 'module.cjs',
    mimetype: 'text/plain',
    caption: 'CJS result / Hasil CJS',
  }, { quoted: ctx.raw })
  return undefined
}
