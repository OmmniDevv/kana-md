import { cjsToEsm, esmToCjs, detectDirection } from '../../src/services/code-convert.js'

// Konversi modul dua arah: arah ditebak dari isi kode. Kode CJS diubah
// ke ESM, kode ESM diubah ke CJS.
export const config = {
  name: 'toesm',
  alias: ['tocjs'],
  category: 'tools',
  description: { id: 'Ubah kode CJS ke ESM atau sebaliknya (arah otomatis)', en: 'Convert CJS code to ESM or back (auto direction)' },
  usage: '.toesm <kode>',
  example: ".toesm const fs = require('fs')",
  cooldown: 5,
}

export const i18n = {
  id: {
    toesm: {
      needCode: '╭─❏ 🧩 「 *KIRIM KODENYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.toesm const fs = require(\'fs\')*\n┊ ᴀʀᴀʜ ᴋᴏɴᴠᴇʀꜱɪ ᴅɪᴛᴇʙᴀᴋ ᴏᴛᴏᴍᴀᴛɪꜱ ᴅᴀʀɪ ɪꜱɪ ᴋᴏᴅᴇ.\n╰━━━━━━━',
      unknown: '╭─❏ 🤔 「 *ARAH TIDAK KETAHUAN* 」\n┊ Kode itu tidak terlihat seperti CJS maupun ESM~\n┊ ᴘᴀᴋᴀɪ *.cjstoesm* ᴀᴛᴀᴜ *.esmtocjs* ᴋᴀʟᴀᴜ ᴍᴀᴜ ᴍᴀᴋꜱᴀ ᴀʀᴀʜɴʏᴀ.\n╰━━━━━━━',
      outEsm: '╭─❏ 🧩 「 *HASIL ESM* 」\n╰━━━━━━━\n',
      outCjs: '╭─❏ 🧩 「 *HASIL CJS* 」\n╰━━━━━━━\n',
    },
  },
  en: {
    toesm: {
      needCode: '╭─❏ 🧩 「 *SEND THE CODE* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.toesm const fs = require(\'fs\')*\n┊ ᴛʜᴇ ᴅɪʀᴇᴄᴛɪᴏɴ ɪꜱ ɢᴜᴇꜱꜱᴇᴅ ꜰʀᴏᴍ ᴛʜᴇ ᴄᴏᴅᴇ.\n╰━━━━━━━',
      unknown: '╭─❏ 🤔 「 *DIRECTION UNKNOWN* 」\n┊ That code looks like neither CJS nor ESM~\n┊ ᴜꜱᴇ *.cjstoesm* ᴏʀ *.esmtocjs* ᴛᴏ ꜰᴏʀᴄᴇ ᴀ ᴅɪʀᴇᴄᴛɪᴏɴ.\n╰━━━━━━━',
      outEsm: '╭─❏ 🧩 「 *ESM RESULT* 」\n╰━━━━━━━\n',
      outCjs: '╭─❏ 🧩 「 *CJS RESULT* 」\n╰━━━━━━━\n',
    },
  },
}

export const test = { input: ".toesm const fs = require('fs')", expect: /import fs from 'fs'/ }

// Ambil kode dari teks perintah atau pesan yang dikutip.
export function extractCode(ctx) {
  const direct = (ctx.text || '').trim()
  if (direct) return direct
  const q = ctx.quoted?.message || {}
  return (q.conversation || q.extendedTextMessage?.text || '').trim()
}

export async function handler(ctx) {
  const code = extractCode(ctx)
  if (!code) return ctx.reply(ctx.t('toesm.needCode'))
  const direction = detectDirection(code)
  if (!direction) return ctx.reply(ctx.t('toesm.unknown'))
  const out = direction === 'esm' ? cjsToEsm(code) : esmToCjs(code)
  const header = direction === 'esm' ? ctx.t('toesm.outEsm') : ctx.t('toesm.outCjs')
  if (out.length <= 3000) return ctx.reply(header + '```\n' + out + '\n```')
  await ctx.sock.sendMessage(ctx.chat, {
    document: Buffer.from(out, 'utf8'),
    fileName: direction === 'esm' ? 'module.mjs' : 'module.cjs',
    mimetype: 'text/plain',
    caption: 'Convert result / Hasil konversi',
  }, { quoted: ctx.raw })
  return undefined
}
