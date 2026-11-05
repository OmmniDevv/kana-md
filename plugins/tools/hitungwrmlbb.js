// Hitung jumlah kemenangan beruntun yang dibutuhkan untuk mencapai
// target winrate Mobile Legends. Rumus lokal standar:
// cari x terkecil sehingga (W + x) / (M + x) mencapai target.
export const config = {
  name: 'hitungwrmlbb',
  alias: ['wrml', 'hitungwr'],
  category: 'tools',
  description: { id: 'Hitung win beruntun yang dibutuhkan untuk target winrate MLBB', en: 'Calculate the win streak needed for an MLBB winrate target' },
  usage: '.hitungwrmlbb <total match> <wr sekarang %> <target %>',
  example: '.hitungwrmlbb 100 50 60',
  cooldown: 3,
}

export const i18n = {
  id: {
    hitungwrmlbb: {
      needInput: '╭─❏ 🎯 「 *FORMAT HITUNG WR* 」\n┊ ᴄᴏɴᴛᴏʜ: *.hitungwrmlbb 100 50 60*\n┊ ᴀʀɢᴜᴍᴇɴ: ᴛᴏᴛᴀʟ ᴍᴀᴛᴄʜ, ᴡʀ ꜱᴇᴋᴀʀᴀɴɢ (%), ᴛᴀʀɢᴇᴛ ᴡʀ (%)\n╰━━━━━━━',
      reached: '╭─❏ 🎯 「 *SUDAH LEWAT TARGET* 」\n┊ ᴡʀ ᴋᴀᴍᴜ *{wr}%* dari *{m} match* (menang {w}).\n┊ ᴛᴀʀɢᴇᴛ *{t}%* sudah tercapai, pertahankan ya~\n╰━━━━━━━',
      out: '╭─❏ 🎯 「 *HITUNG WR MLBB* 」\n┊ ᴛᴏᴛᴀʟ ᴍᴀᴛᴄʜ: *{m}* (menang {w}, wr {wr}%)\n┊ ᴛᴀʀɢᴇᴛ: *{t}%*\n┊ ᴋᴀᴍᴜ ʙᴜᴛᴜʜ *{x} win beruntun* tanpa kalah.\n┊ ꜱᴇᴛᴇʟᴀʜ ɪᴛᴜ: {m2} match, menang {w2}, wr {wr2}%\n╰━━━━━━━',
    },
  },
  en: {
    hitungwrmlbb: {
      needInput: '╭─❏ 🎯 「 *WR CALCULATION FORMAT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.hitungwrmlbb 100 50 60*\n┊ ᴀʀɢꜱ: ᴛᴏᴛᴀʟ ᴍᴀᴛᴄʜᴇꜱ, ᴄᴜʀʀᴇɴᴛ ᴡʀ (%), ᴛᴀʀɢᴇᴛ ᴡʀ (%)\n╰━━━━━━━',
      reached: '╭─❏ 🎯 「 *TARGET ALREADY REACHED* 」\n┊ ʏᴏᴜʀ ᴡʀ ɪꜱ *{wr}%* from *{m} matches* ({w} wins).\n┊ ᴛʜᴇ *{t}%* target is already reached, keep it up~\n╰━━━━━━━',
      out: '╭─❏ 🎯 「 *MLBB WR CALCULATION* 」\n┊ ᴛᴏᴛᴀʟ ᴍᴀᴛᴄʜᴇꜱ: *{m}* ({w} wins, wr {wr}%)\n┊ ᴛᴀʀɢᴇᴛ: *{t}%*\n┊ ʏᴏᴜ ɴᴇᴇᴅ *{x} straight wins*.\n┊ ᴀꜰᴛᴇʀ ᴛʜᴀᴛ: {m2} matches, {w2} wins, wr {wr2}%\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.hitungwrmlbb 100 50 60', expect: /25 win|25 straight/ }

// Hitung win beruntun yang dibutuhkan; null bila input tidak valid.
export function winsNeeded(matches, winrate, target) {
  const m = Number(matches)
  const wr = Number(winrate)
  const t = Number(target)
  if (!Number.isFinite(m) || !Number.isFinite(wr) || !Number.isFinite(t)) return null
  if (m <= 0 || wr < 0 || wr > 100 || t <= 0 || t >= 100) return null
  const wins = Math.round(m * wr / 100)
  if (wr >= t) return { m, w: wins, wr, t, x: 0 }
  const x = Math.ceil((t / 100 * m - wins) / (1 - t / 100))
  return { m, w: wins, wr, t, x }
}

export async function handler(ctx) {
  const parts = (ctx.text || '').trim().split(/\s+/)
  const result = parts.length >= 3 ? winsNeeded(parts[0], parts[1], parts[2]) : null
  if (!result) return ctx.reply(ctx.t('hitungwrmlbb.needInput'))
  if (result.x === 0) return ctx.reply(ctx.t('hitungwrmlbb.reached', result))
  const m2 = result.m + result.x
  const w2 = result.w + result.x
  return ctx.reply(ctx.t('hitungwrmlbb.out', {
    ...result,
    m2,
    w2,
    wr2: (w2 / m2 * 100).toFixed(2),
  }))
}
