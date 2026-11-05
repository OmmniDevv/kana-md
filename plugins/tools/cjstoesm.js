import { cjsToEsm } from '../../src/services/code-convert.js'

export const config = {
  name: 'cjstoesm',
  alias: ['cjstoes'],
  category: 'tools',
  description: { id: 'Ubah kode CommonJS menjadi ESM secara lokal', en: 'Convert CommonJS code to ESM locally' },
  usage: '.cjstoesm <kode cjs>',
  example: ".cjstoesm const fs = require('fs')",
  cooldown: 5,
}

export const i18n = {
  id: {
    cjstoesm: {
      needCode: '╭─❏ 🧩 「 *KIRIM KODE CJS-NYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.cjstoesm const fs = require(\'fs\')*\n┊ ʙɪꜱᴀ ᴊᴜɢᴀ ʀᴇᴘʟʏ ᴘᴇꜱᴀɴ ʙᴇʀɪꜱɪ ᴋᴏᴅᴇ.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *TIDAK ADA YANG DIUBAH* 」\n┊ Kode itu tidak memuat pola CommonJS yang dikenal~\n╰━━━━━━━',
      out: '╭─❏ 🧩 「 *HASIL ESM* 」\n╰━━━━━━━\n',
    },
  },
  en: {
    cjstoesm: {
      needCode: '╭─❏ 🧩 「 *SEND THE CJS CODE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.cjstoesm const fs = require(\'fs\')*\n┊ ʏᴏᴜ ᴄᴀɴ ᴀʟꜱᴏ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇꜱꜱᴀɢᴇ ᴡɪᴛʜ ᴄᴏᴅᴇ.\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *NOTHING CHANGED* 」\n┊ That code has no known CommonJS patterns~\n╰━━━━━━━',
      out: '╭─❏ 🧩 「 *ESM RESULT* 」\n╰━━━━━━━\n',
    },
  },
}

export const test = { input: ".cjstoesm const fs = require('fs')", expect: /import fs from 'fs'/ }

// Ambil kode dari teks perintah atau pesan yang dikutip.
export function extractCode(ctx) {
  const direct = (ctx.text || '').trim()
  if (direct) return direct
  const q = ctx.quoted?.message || {}
  return (q.conversation || q.extendedTextMessage?.text || '').trim()
}

export async function handler(ctx) {
  const code = extractCode(ctx)
  if (!code) return ctx.reply(ctx.t('cjstoesm.needCode'))
  const out = cjsToEsm(code)
  if (out.trim() === code.trim()) return ctx.reply(ctx.t('cjstoesm.failed'))
  if (out.length <= 3000) return ctx.reply(ctx.t('cjstoesm.out') + '```\n' + out + '\n```')
  await ctx.sock.sendMessage(ctx.chat, {
    document: Buffer.from(out, 'utf8'),
    fileName: 'module.mjs',
    mimetype: 'text/plain',
    caption: 'ESM result / Hasil ESM',
  }, { quoted: ctx.raw })
  return undefined
}
