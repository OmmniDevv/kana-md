import { sendButtons } from '../../src/ui/buttons.js'
import { getJadibotManager, listJadibotSessions } from '../../src/services/jadibot.js'

export const config = {
  name: 'stopjadibot',
  alias: ['stopbot', 'berhentijadibot'],
  category: 'owner',
  description: { id: 'Hentikan sesi jadibot (khusus owner)', en: 'Stop a jadibot session (owner only)' },
  usage: '.stopjadibot [nama]',
  example: '.stopjadibot kana2',
  cooldown: 3,
  isOwner: true,
}

export const i18n = {
  id: {
    stopjadibot: {
      noSessions: '╭─❏ 🤖 「 *SESI JADIBOT* 」\n┊ Belum ada sesi jadibot yang aktif kok, Master~\n┊ Slotnya masih kosong semua ✨\n╰━━━━━━━',
      listHeader: '╭─❏ 🤖 「 *SESI JADIBOT AKTIF* 」\n{sessions}\n┊ Pencet tombolnya buat stop sesi yang dipilih yaa, Master~\n╰━━━━━━━',
      sessionLine: '┊ {index}. *{name}* : {number} (ꜱᴇᴊᴀᴋ {startedAt})',
      stopped: '╭─❏ 🤖 「 *SESI DISTOP* 」\n┊ ꜱᴇꜱɪ: *{name}*\n┊ Beres, Master~ sesi itu udah KANA stop. Sampai ketemu lagi yaa sesi kecil~ {mood}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *SESI TIDAK KETEMU* 」\n┊ Hmm, sesi jadibot bernama *{name}* nggak ketemu, Master.\n┊ Cek daftarnya pakai *.stopjadibot* tanpa nama yaa~\n╰━━━━━━━',
      failed: '╭─❏ ⚠️ 「 *GAGAL STOP SESI* 」\n┊ Mouu, gagal menghentikan sesinya, Master.\n┊ ᴇʀʀᴏʀ: *{message}* (╥﹏╥)\n╰━━━━━━━',
      btnStop: 'Stop {name}',
      btnList: 'Daftar Bot',
    },
  },
  en: {
    stopjadibot: {
      noSessions: '╭─❏ 🤖 「 *JADIBOT SESSIONS* 」\n┊ No jadibot session is active yet, Master~\n┊ All slots are still empty ✨\n╰━━━━━━━',
      stopped: '╭─❏ 🤖 「 *SESSION STOPPED* 」\n┊ ꜱᴇꜱꜱɪᴏɴ: *{name}*\n┊ Done, Master~ that session has been stopped by KANA. See you again, little session~ {mood}\n╰━━━━━━━',
      listHeader: '╭─❏ 🤖 「 *ACTIVE JADIBOT SESSIONS* 」\n{sessions}\n┊ Tap a button to stop the chosen session, Master~\n╰━━━━━━━',
      sessionLine: '┊ {index}. *{name}* : {number} (ꜱɪɴᴄᴇ {startedAt})',
      notFound: '╭─❏ 🔍 「 *SESSION NOT FOUND* 」\n┊ Hmm, no jadibot session named *{name}*, Master.\n┊ Check the list with *.stopjadibot* without a name~\n╰━━━━━━━',
      failed: '╭─❏ ⚠️ 「 *FAILED TO STOP SESSION* 」\n┊ Mouu, failed to stop the session, Master.\n┊ ᴇʀʀᴏʀ: *{message}* (╥﹏╥)\n╰━━━━━━━',
      btnStop: 'Stop {name}',
      btnList: 'Bot List',
    },
  },
}

export const test = { input: '.stopjadibot', expect: /jadibot|sesi/i }

export async function handler(ctx) {
  const name = (ctx.args[0] || '').trim()
  const sessions = listJadibotSessions()

  if (!name) {
    if (!sessions.length) {
      const body = ctx.t('stopjadibot.noSessions')
      return sendButtons(ctx.sock, ctx.chat, {
        title: process.env.BOT_NAME || 'KANA',
        body,
        footer: ctx.t('menu.footer'),
        replies: [{ text: ctx.t('stopjadibot.btnList'), id: '.listbot' }],
        textFallback: body,
      })
    }
    const lines = sessions.map((s, i) =>
      ctx.t('stopjadibot.sessionLine', { index: i + 1, name: s.name, number: s.number, startedAt: s.startedAt || '-' })
    )
    const body = ctx.t('stopjadibot.listHeader', { sessions: lines.join('\n') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: process.env.BOT_NAME || 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: sessions
        .slice(0, 10)
        .map((s) => ({ text: ctx.t('stopjadibot.btnStop', { name: s.name }), id: `.stopjadibot ${s.name}` })),
      textFallback: body,
    })
  }

  const manager = getJadibotManager()
  if (!manager) return ctx.reply(ctx.t('stopjadibot.notFound', { name }))
  let stopped
  try {
    stopped = await manager.stop(name)
  } catch (err) {
    return ctx.reply(ctx.t('stopjadibot.failed', { message: err.message }))
  }
  if (!stopped) return ctx.reply(ctx.t('stopjadibot.notFound', { name }))
  const body = ctx.t('stopjadibot.stopped', { name, mood: ctx.say('pamit') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: process.env.BOT_NAME || 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('stopjadibot.btnList'), id: '.listbot' }],
    textFallback: body,
  })
}
