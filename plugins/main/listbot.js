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
      body: '╭─❏ 🤖 「 *DAFTAR BOT* 」\n┊ ʙᴏᴛ ᴜᴛᴀᴍᴀ: *KANA*\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ ꜱᴛᴀᴛᴜꜱ: *Online*, siap nemenin kamu~\n┊\n┊ 📜 ꜱᴇꜱɪ ᴊᴀᴅɪʙᴏᴛ ᴀᴋᴛɪꜰ:\n{sessions}\n╰━━━━━━━ {mood}',
      numberUnknown: 'belum diatur di env',
      empty: '┊ Belum ada sesi jadibot yang aktif nih, slotnya masih kosong~',
      sessionLine: '┊ {index}. *{name}* : {number}',
      imageCaption: '╭─❏ 🤖 「 *DAFTAR BOT KANA* 」\n┊ Daftar lengkapnya ada di pesan berikutnya yaa~\n╰━━━━━━━',
      hint: '╭─❏ 🤖 「 *DAFTAR BOT* 」\n┊ Pencet tombolnya buat lanjut yaa~\n╰━━━━━━━',
      btnOwner: 'Info Owner',
    },
  },
  en: {
    listbot: {
      body: '╭─❏ 🤖 「 *BOT LIST* 」\n┊ ᴍᴀɪɴ ʙᴏᴛ: *KANA*\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ ꜱᴛᴀᴛᴜꜱ: *Online*, ready to keep you company~\n┊\n┊ 📜 ᴀᴄᴛɪᴠᴇ ᴊᴀᴅɪʙᴏᴛ ꜱᴇꜱꜱɪᴏɴꜱ:\n{sessions}\n╰━━━━━━━ {mood}',
      numberUnknown: 'not set in env yet',
      empty: '┊ No active jadibot session yet, the slots are still empty~',
      sessionLine: '┊ {index}. *{name}* : {number}',
      imageCaption: '╭─❏ 🤖 「 *KANA BOT LIST* 」\n┊ The full list is in the next message~\n╰━━━━━━━',
      hint: '╭─❏ 🤖 「 *BOT LIST* 」\n┊ Tap a button to continue~\n╰━━━━━━━',
      btnOwner: 'Owner Info',
    },
  },
}

export const test = { input: '.listbot', expect: /daftar bot|jadibot/i }

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
      { text: ctx.t('listbot.btnOwner'), id: '.owner' },
    ],
    textFallback: body,
  })
}
