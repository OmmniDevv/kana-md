import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'start',
  alias: ['next'],
  category: 'group',
  description: { id: 'Kartu pembuka KANA di grup ini: perkenalan singkat dan jalan pintas ke menu', en: 'KANA opening card in this group: short intro and a shortcut to the menu' },
  usage: '.start',
  example: '.start',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    start: {
      body: '╭─❏ 👋 「 *MULAI BERSAMA KANA* 」\n┊ Haii semuaa~ Aku *KANA*, asisten grup *{group}*~\n┊ Di sini aku bisa bantu proteksi grup, jadwal, stiker, AI, game, dan banyak lagi~\n┊ Grup ini berisi *{members} member*~\n┊ Pencet tombol di bawah buat mulai yaa~\n╰━━━━━━━ {mood}',
      menu: 'Lihat menu',
      grupinfo: 'Info grup ini',
      footer: 'KANA siap membantu grup ini~',
    },
  },
  en: {
    start: {
      body: '╭─❏ 👋 「 *START WITH KANA* 」\n┊ Haii everyone~ I am *KANA*, the assistant of *{group}*~\n┊ Here I can help with group protection, schedules, stickers, AI, games, and much more~\n┊ This group has *{members} members*~\n┊ Tap a button below to start~\n╰━━━━━━━ {mood}',
      menu: 'See the menu',
      grupinfo: 'This group info',
      footer: 'KANA is ready to help this group~',
    },
  },
}

export const test = { input: '.start', expect: /MULAI BERSAMA KANA|START WITH KANA/ }

export async function handler(ctx) {
  const meta = await ctx.sock.groupMetadata(ctx.chat).catch(() => null)
  const body = ctx.t('start.body', {
    group: meta?.subject || '-',
    members: meta?.participants?.length ?? 0,
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('start.footer'),
    replies: [
      { text: ctx.t('start.menu'), id: '.menu' },
      { text: ctx.t('start.grupinfo'), id: '.grup info' },
    ],
    textFallback: body,
  })
}
