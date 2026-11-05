export const config = {
  name: 'creator2',
  alias: [],
  category: 'main',
  description: { id: 'Kartu kontak dan info owner bot', en: 'Bot owner contact card and info' },
  usage: '.creator2',
  example: '.creator2',
  cooldown: 5,
}

export const i18n = {
  id: {
    creator2: {
      body: '╭─❏ 👑 「 *OWNER BOT* 」\n┊ Ini kartu kontak owner KANA~\n┊ Nomor: *{number}*\n┊ Chat langsung: {link}\n┊ Kalau ada pertanyaan, laporan bug, atau keperluan premium dan sewa, hubungi owner lewat kartu di atas yaa~\n╰━━━━━━━',
      cardName: 'Owner {bot}',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
      unset: '╭─❏ 👑 「 *OWNER BOT* 」\n┊ Nomor owner belum diatur di konfigurasi bot~\n╰━━━━━━━',
    },
  },
  en: {
    creator2: {
      body: '╭─❏ 👑 「 *BOT OWNER* 」\n┊ Here is the KANA owner contact card~\n┊ Number: *{number}*\n┊ Direct chat: {link}\n┊ For questions, bug reports, or premium and rental matters, reach the owner through the card above~\n╰━━━━━━━',
      cardName: 'Owner of {bot}',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
      unset: '╭─❏ 👑 「 *BOT OWNER* 」\n┊ The owner number is not set in the bot configuration~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.creator2', expect: /owner/i }

export function buildOwnerVcard(name, digits) {
  return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${digits}:+${digits}\nEND:VCARD`
}

export async function handler(ctx) {
  const digits = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  if (!digits) return ctx.reply(ctx.t('creator2.unset'))
  const bot = process.env.BOT_NAME || 'KANA'
  const name = ctx.t('creator2.cardName', { bot })
  try {
    await ctx.sock.sendMessage(ctx.chat, {
      contacts: {
        displayName: name,
        contacts: [{ displayName: name, vcard: buildOwnerVcard(name, digits) }],
      },
    }, { quoted: ctx.raw })
  } catch (err) {
    return ctx.reply(ctx.t('creator2.fail', { error: err.message }))
  }
  return ctx.reply(ctx.t('creator2.body', { number: digits, link: `https://wa.me/${digits}` }))
}
