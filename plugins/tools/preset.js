export const config = {
  name: 'preset',
  alias: [],
  category: 'tools',
  description: { id: 'Generator teks preset siap salin: ubah teks jadi gaya small caps, tebal unicode, fullwidth, dan berbingkai', en: 'Ready-to-copy preset text generator: turn text into small caps, unicode bold, fullwidth, and framed styles' },
  usage: '.preset <teks>',
  example: '.preset halo dunia',
  cooldown: 3,
}

export const i18n = {
  id: {
    preset: {
      hint: '╭─❏ ✨ 「 *PRESET TEKS* 」\n┊ Tulis teksnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.preset halo dunia*\n╰━━━━━━━',
      title: '╭─❏ ✨ 「 *PRESET BUAT KAMU* 」\n┊ ꜱᴀʟɪɴ ʏᴀɴɢ ᴋᴀᴍᴜ ꜱᴜᴋᴀ ʏᴀᴀ~\n{body}\n╰━━━━━━━',
      lSmall: '┊ ꜱᴍᴀʟʟ ᴄᴀᴘꜱ: {v}',
      lBold: '┊ ᴛᴇʙᴀʟ: {v}',
      lWide: '┊ ꜰᴜʟʟᴡɪᴅᴛʜ: {v}',
      lSpace: '┊ ʙᴇʀᴊᴀʀᴀᴋ: {v}',
    },
  },
  en: {
    preset: {
      hint: '╭─❏ ✨ 「 *TEXT PRESET* 」\n┊ Write the text first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.preset halo dunia*\n╰━━━━━━━',
      title: '╭─❏ ✨ 「 *PRESETS FOR YOU* 」\n┊ ᴄᴏᴘʏ ᴛʜᴇ ᴏɴᴇ ʏᴏᴜ ʟɪᴋᴇ~\n{body}\n╰━━━━━━━',
      lSmall: '┊ ꜱᴍᴀʟʟ ᴄᴀᴘꜱ: {v}',
      lBold: '┊ ʙᴏʟᴅ: {v}',
      lWide: '┊ ꜰᴜʟʟᴡɪᴅᴛʜ: {v}',
      lSpace: '┊ ꜱᴘᴀᴄᴇᴅ: {v}',
    },
  },
}

export const test = { input: '.preset halo', expect: /ʜᴀʟᴏ|PRESET/i }

const SMALL = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'q', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' }

export function toSmallCaps(text) {
  return String(text || '').split('').map((c) => SMALL[c.toLowerCase()] ?? c).join('')
}

export function toBold(text) {
  return String(text || '').split('').map((c) => {
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1d41a + c.charCodeAt(0) - 97)
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1d400 + c.charCodeAt(0) - 65)
    if (c >= '0' && c <= '9') return String.fromCodePoint(0x1d7ce + c.charCodeAt(0) - 48)
    return c
  }).join('')
}

export function toFullwidth(text) {
  return String(text || '').split('').map((c) => {
    const code = c.charCodeAt(0)
    if (code >= 33 && code <= 126) return String.fromCodePoint(code + 0xfee0)
    if (c === ' ') return '　'
    return c
  }).join('')
}

export function makePresets(text) {
  const src = String(text || '').slice(0, 80)
  return {
    small: toSmallCaps(src),
    bold: toBold(src),
    wide: toFullwidth(src),
    spaced: src.split('').join(' '),
  }
}

export async function handler(ctx) {
  const q = (ctx.text || '').trim()
  if (!q) return ctx.reply(ctx.t('preset.hint'))
  const p = makePresets(q)
  const body = [
    ctx.t('preset.lSmall', { v: p.small }),
    ctx.t('preset.lBold', { v: p.bold }),
    ctx.t('preset.lWide', { v: p.wide }),
    ctx.t('preset.lSpace', { v: p.spaced }),
  ].join('\n')
  return ctx.reply(ctx.t('preset.title', { body }))
}
