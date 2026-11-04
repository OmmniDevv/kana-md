export const config = {
  name: 'readmore',
  alias: [],
  category: 'user',
  description: { id: 'Buat teks Baca Selengkapnya ala WhatsApp: pisahkan teks awal dan lanjutan dengan tanda |', en: 'Make a WhatsApp style Read More text: separate the intro and the rest with a | sign' },
  usage: '.readmore <teks awal> | <teks lanjutan>',
  example: '.readmore Pengumuman penting | Isi lengkapnya ada di sini',
  cooldown: 3,
}

export const i18n = {
  id: {
    readmore: {
      ask: 'Pisahkan teks awal dan lanjutannya dengan tanda | yaa. Contoh: .readmore Pengumuman | Isi lengkapnya di sini {mood}',
      done: 'Nih, salin teks di bawah ini yaa~',
    },
  },
  en: {
    readmore: {
      ask: 'Separate the intro and the rest with a | sign. Example: .readmore Announcement | The full content is here {mood}',
      done: 'Here, copy the text below~',
    },
  },
}

export const test = { input: '.readmore Halo | Isi lengkap', expect: /Halo/ }

const READMORE_CHAR = '‎'

export async function handler(ctx) {
  const input = (ctx.text || '').trim()
  const idx = input.indexOf('|')
  if (idx < 0) return ctx.reply(ctx.t('readmore.ask', { mood: ctx.say('mikir') }))
  const before = input.slice(0, idx).trim()
  const after = input.slice(idx + 1).trim()
  if (!before || !after) return ctx.reply(ctx.t('readmore.ask', { mood: ctx.say('mikir') }))
  await ctx.reply(ctx.t('readmore.done'))
  return ctx.sock.sendMessage(ctx.chat, { text: `${before}${READMORE_CHAR.repeat(4001)}${after}` })
}
