import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendButtons } from '../../src/ui/buttons.js'

const here = dirname(fileURLToPath(import.meta.url))

export const config = {
  name: 'listbot',
  alias: ['bots', 'jadibotlist'],
  category: 'main',
  description: { id: 'Daftar bot utama dan sesi jadibot yang aktif', en: 'List of the main bot and active jadibot sessions' },
  usage: '.listbot',
  example: '.listbot',
  cooldown: 5,
}

export const i18n = {
  id: {
    listbot: {
      body: 'Daftar Bot\nBot utama: KANA\nNomor: {number}\nStatus: Online, siap nemenin kamu~\n\nSesi Jadibot Aktif:\n{sessions}\n{mood}',
      numberUnknown: 'belum diatur di env',
      empty: 'Belum ada sesi jadibot yang aktif nih, slotnya masih kosong~',
      sessionLine: '{index}. {name} : {number}',
      imageCaption: 'Daftar bot KANA ada di pesan berikutnya yaa~',
      hint: 'Pencet tombolnya buat lanjut yaa~',
      btnMenu: 'Menu Utama',
      btnOwner: 'Info Owner',
    },
  },
  en: {
    listbot: {
      body: 'Bot List\nMain bot: KANA\nNumber: {number}\nStatus: Online, ready to keep you company~\n\nActive Jadibot Sessions:\n{sessions}\n{mood}',
      numberUnknown: 'not set in env yet',
      empty: 'No active jadibot session yet, the slots are still empty~',
      sessionLine: '{index}. {name} : {number}',
      imageCaption: 'The KANA bot list is in the next message~',
      hint: 'Tap a button to continue~',
      btnMenu: 'Main Menu',
      btnOwner: 'Owner Info',
    },
  },
}

export async function handler(ctx) {
  const number = process.env.BOT_NUMBER || ctx.t('listbot.numberUnknown')
  let sessions = []
  try {
    const mod = await import('../../src/services/jadibot.js')
    if (typeof mod.listJadibotSessions === 'function') {
      sessions = (await mod.listJadibotSessions()) || []
    }
  } catch {
    sessions = []
  }
  const sessionText = sessions.length
    ? sessions
        .map((s, i) => {
          const base = ctx.t('listbot.sessionLine', { index: i + 1, name: s.name || '-', number: s.number || '-' })
          return s.startedAt ? `${base} : ${s.startedAt}` : base
        })
        .join('\n')
    : ctx.t('listbot.empty')
  const body = ctx.t('listbot.body', { number, sessions: sessionText, mood: ctx.say('senang') })

  let image = null
  try {
    image = await readFile(join(here, '../../assets/listbot.jpg'))
  } catch {
    image = null
  }
  if (image) {
    await ctx.sock.sendMessage(ctx.chat, { image, caption: ctx.t('listbot.imageCaption') }, { quoted: ctx.raw })
  }
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body: image ? ctx.t('listbot.hint') : body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('listbot.btnMenu'), id: '.menu' },
      { text: ctx.t('listbot.btnOwner'), id: '.owner' },
    ],
    textFallback: body,
  })
}
