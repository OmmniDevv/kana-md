
export const config = {
  name: 'textstyle',
  alias: ['fancy', 'style', 'styleteks'],
  category: 'maker',
  description: { id: 'Ubah teks jadi varian huruf unicode fancy', en: 'Turn text into fancy unicode letter variants' },
  usage: '.textstyle <teks>',
  example: '.textstyle halo kana',
  cooldown: 3,
}

export const i18n = {
  id: {
    textstyle: {
      needText: '╭─❏ ✏️ 「 *BUTUH TEKS* 」\n┊ Ketik teksnya dulu yaa, contoh: *.textstyle halo kana*~\n╰━━━━━━━',
      header: '╭─❏ ✨ 「 *VARIAN GAYA TEKS* 」\n┊ Varian gaya buat *"{text}"*:',
      boldLabel: '┊ ᴛᴇʙᴀʟ',
      italicLabel: '┊ ᴍɪʀɪɴɢ',
      scriptLabel: '┊ ꜱᴄʀɪᴘᴛ',
      monoLabel: '┊ ᴍᴏɴᴏ',
      smallLabel: '┊ ᴋᴇᴄɪʟ',
      foot: '╰━━━━━━━',
    },
  },
  en: {
    textstyle: {
      needText: '╭─❏ ✏️ 「 *TEXT NEEDED* 」\n┊ Type the text first, example: *.textstyle hello kana*~\n╰━━━━━━━',
      header: '╭─❏ ✨ 「 *TEXT STYLE VARIANTS* 」\n┊ Style variants for *"{text}"*:',
      boldLabel: '┊ ʙᴏʟᴅ',
      italicLabel: '┊ ɪᴛᴀʟɪᴄ',
      scriptLabel: '┊ ꜱᴄʀɪᴘᴛ',
      monoLabel: '┊ ᴍᴏɴᴏ',
      smallLabel: '┊ ꜱᴍᴀʟʟ ᴄᴀᴘꜱ',
      foot: '╰━━━━━━━',
    },
  },
}

// Pemetaan alfanumerik matematika unicode: basis per gaya + pengecualian
// untuk huruf yang tidak ada di blok matematika (mis. h miring dan huruf script).
function mathMap(upperBase, lowerBase, digitBase, exceptions = {}) {
  const map = { ...exceptions }
  for (let i = 0; i < 26; i++) {
    const up = String.fromCharCode(65 + i)
    const low = String.fromCharCode(97 + i)
    if (!map[up] && upperBase) map[up] = String.fromCodePoint(upperBase + i)
    if (!map[low] && lowerBase) map[low] = String.fromCodePoint(lowerBase + i)
  }
  if (digitBase) for (let d = 0; d <= 9; d++) map[String(d)] = String.fromCodePoint(digitBase + d)
  return map
}

const SCRIPT_EXCEPTIONS = {
  B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ',
  e: 'ℯ', g: 'ℊ', o: 'ℴ',
}
const SMALL_CAPS = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ',
  k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ',
  u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
}

export const FANCY_MAPS = {
  bold: mathMap(0x1d400, 0x1d41a, 0x1d7ce),
  italic: mathMap(0x1d434, 0x1d44e, null, { h: 'ℎ' }),
  script: mathMap(0x1d49c, 0x1d4b6, null, SCRIPT_EXCEPTIONS),
  monospace: mathMap(0x1d670, 0x1d68a, 0x1d7f6),
  smallcaps: SMALL_CAPS,
}

export function toFancy(text, style) {
  const map = FANCY_MAPS[style]
  if (!map) return String(text ?? '')
  return [...String(text ?? '')].map((ch) => map[ch] ?? ch).join('')
}

export const test = { input: '.textstyle halo kana', expect: /Varian gaya/i }

export async function handler(ctx) {
  const text = ctx.text.trim()
  if (!text) return ctx.reply(ctx.t('textstyle.needText'))
  const lines = [
    ctx.t('textstyle.header', { text }),
    `${ctx.t('textstyle.boldLabel')}: *${toFancy(text, 'bold')}*`,
    `${ctx.t('textstyle.italicLabel')}: *${toFancy(text, 'italic')}*`,
    `${ctx.t('textstyle.scriptLabel')}: *${toFancy(text, 'script')}*`,
    `${ctx.t('textstyle.monoLabel')}: *${toFancy(text, 'monospace')}*`,
    `${ctx.t('textstyle.smallLabel')}: *${toFancy(text.toLowerCase(), 'smallcaps')}*`,
    ctx.t('textstyle.foot'),
  ]
  return ctx.reply(lines.join('\n'))
}
