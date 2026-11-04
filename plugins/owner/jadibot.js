import { sendButtons } from '../../src/ui/buttons.js'
import {
  createJadibotManager,
  getJadibotManager,
  setJadibotManager,
  pairingCodeFor,
} from '../../src/services/jadibot.js'

export const config = {
  name: 'jadibot',
  alias: ['jadibotstart', 'jadibotqr'],
  category: 'owner',
  description: { id: 'Mulai sesi jadibot di nomor lain (khusus owner)', en: 'Start a jadibot session on another number (owner only)' },
  usage: '.jadibot <nama> <nomor>',
  example: '.jadibot kana2 6281234567890',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    jadibot: {
      usage: '╭─❏ 🤖 「 *JADIBOT* 」\n┊ ꜰᴏʀᴍᴀᴛ: *.jadibot <nama 3-16 huruf/angka> <nomor>*\n┊ ᴄᴏɴᴛᴏʜ: *.jadibot kana2 6281234567890* yaa, Master~\n╰━━━━━━━',
      invalidName: '╭─❏ ⚠️ 「 *NAMA SESI TIDAK VALID* 」\n┊ Mouu, nama sesinya nggak valid, Master.\n┊ Pakai huruf dan angka saja, 3 sampai 16 karakter yaa~\n╰━━━━━━━',
      invalidNumber: '╭─❏ ⚠️ 「 *NOMOR TIDAK VALID* 」\n┊ Mouu, nomornya nggak valid, Master.\n┊ Tulis nomor lengkap dengan kode negara, contoh *6281234567890*~\n╰━━━━━━━',
      maxSessions: '╭─❏ 🙈 「 *SLOT JADIBOT PENUH* 」\n┊ Mouu, slot jadibot udah penuh nih, Master (maksimal *3 sesi* aktif).\n┊ Stop dulu salah satu pakai *.stopjadibot* yaa~\n╰━━━━━━━',
      duplicate: '╭─❏ 🙈 「 *SESI SUDAH AKTIF* 」\n┊ Ehh, sesi bernama *{name}* udah aktif, Master.\n┊ Pakai nama lain atau stop dulu yang itu yaa~\n╰━━━━━━━',
      started: '╭─❏ 🤖 「 *JADIBOT DIMULAI* 」\n┊ ꜱᴇꜱɪ: *{name}*\n┊ ɴᴏᴍᴏʀ: *{number}*\n┊ ᴋᴏᴅᴇ ᴘᴀɪʀɪɴɢ: *{code}*\n┊ Kode juga dikirim KANA ke chat ini lewat notif sesi.\n┊ Masukkan kode pairing yang diminta WhatsApp di nomor itu yaa~ {mood}\n╰━━━━━━━',
      failed: '╭─❏ ⚠️ 「 *JADIBOT GAGAL DIMULAI* 」\n┊ Mouu, sesi jadibotnya gagal dimulai, Master.\n┊ ᴇʀʀᴏʀ: *{message}* (╥﹏╥)\n╰━━━━━━━',
      btnList: 'Daftar Bot',
      btnStop: 'Stop Sesi Ini',
    },
  },
  en: {
    jadibot: {
      usage: '╭─❏ 🤖 「 *JADIBOT* 」\n┊ ꜰᴏʀᴍᴀᴛ: *.jadibot <name 3-16 letters/numbers> <number>*\n┊ ᴇxᴀᴍᴘʟᴇ: *.jadibot kana2 6281234567890*, Master~\n╰━━━━━━━',
      invalidName: '╭─❏ ⚠️ 「 *INVALID SESSION NAME* 」\n┊ Mouu, the session name is not valid, Master.\n┊ Use letters and numbers only, 3 to 16 characters~\n╰━━━━━━━',
      invalidNumber: '╭─❏ ⚠️ 「 *INVALID NUMBER* 」\n┊ Mouu, the number is not valid, Master.\n┊ Write the full number with country code, example *6281234567890*~\n╰━━━━━━━',
      maxSessions: '╭─❏ 🙈 「 *JADIBOT SLOTS FULL* 」\n┊ Mouu, the jadibot slots are full, Master (max *3 active sessions*).\n┊ Stop one first with *.stopjadibot*~\n╰━━━━━━━',
      duplicate: '╭─❏ 🙈 「 *SESSION ALREADY ACTIVE* 」\n┊ Eh, a session named *{name}* is already active, Master.\n┊ Use another name or stop that one first~\n╰━━━━━━━',
      started: '╭─❏ 🤖 「 *JADIBOT STARTED* 」\n┊ ꜱᴇꜱꜱɪᴏɴ: *{name}*\n┊ ɴᴜᴍʙᴇʀ: *{number}*\n┊ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ: *{code}*\n┊ KANA also sent the code to this chat via the session notice.\n┊ Enter the pairing code WhatsApp asks for on that number~ {mood}\n╰━━━━━━━',
      failed: '╭─❏ ⚠️ 「 *JADIBOT FAILED TO START* 」\n┊ Mouu, the jadibot session failed to start, Master.\n┊ ᴇʀʀᴏʀ: *{message}* (╥﹏╥)\n╰━━━━━━━',
      btnList: 'Bot List',
      btnStop: 'Stop This Session',
    },
  },
}

// Buat manager singleton bila belum ada. StartConnection asli dimuat
// lewat impor dinamis di sini (sesuai kepemilikan Fase 10) dan
// dibungkus jadi startConnectionFn untuk manager: pipeline sesi tetap
// dibuat manager lewat createPipeline yang sama.
async function ensureManager(ctx) {
  const existing = getJadibotManager()
  if (existing) return existing
  const { startConnection } = await import('../../src/core/connection.js')
  const { createSessionAuth } = await import('../../src/services/jadibot.js')
  const ownerDigits = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  const startConnectionFn = async ({ name, number, onMessage, onParticipants }) => {
    const auth = await createSessionAuth(ctx.storage, name)
    const sessionRef = { sock: null }
    const sock = await startConnection({
      auth,
      botNumber: number,
      ownerNumber: ownerDigits,
      botName: process.env.BOT_NAME || 'KANA',
      onMessage,
      onParticipants,
      session: sessionRef,
      autoBio: false,
    })
    return {
      session: sessionRef,
      stop: async () => {
        try {
          sessionRef.sock?.end?.(undefined)
        } catch {}
        try {
          sock?.end?.(undefined)
        } catch {}
      },
    }
  }
  const manager = createJadibotManager({
    storage: ctx.storage,
    registry: ctx.registry,
    owners: ownerDigits ? [ownerDigits] : [],
    defaultLang: ctx.lang,
    startConnectionFn,
  })
  setJadibotManager(manager)
  return manager
}

export const test = { input: '.jadibot', expect: /jadibot/i }

export async function handler(ctx) {
  const [name, number] = ctx.args
  if (!name || !number) return ctx.reply(ctx.t('jadibot.usage'))
  let manager
  try {
    manager = await ensureManager(ctx)
  } catch (err) {
    return ctx.reply(ctx.t('jadibot.failed', { message: err.message }))
  }
  let record
  try {
    record = await manager.start(name, number, { sock: ctx.sock, chat: ctx.chat })
  } catch (err) {
    if (err.code === 'INVALID_NAME') return ctx.reply(ctx.t('jadibot.invalidName'))
    if (err.code === 'INVALID_NUMBER') return ctx.reply(ctx.t('jadibot.invalidNumber'))
    if (err.code === 'MAX_SESSIONS') return ctx.reply(ctx.t('jadibot.maxSessions'))
    if (err.code === 'DUPLICATE') return ctx.reply(ctx.t('jadibot.duplicate', { name }))
    return ctx.reply(ctx.t('jadibot.failed', { message: err.message }))
  }
  const body = ctx.t('jadibot.started', {
    name: record.name,
    number: record.number,
    code: record.pairingCode || pairingCodeFor(record.name),
    mood: ctx.say('senang'),
  })
  return sendButtons(ctx.sock, ctx.chat, {
    title: process.env.BOT_NAME || 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('jadibot.btnList'), id: '.listbot' },
      { text: ctx.t('jadibot.btnStop'), id: `.stopjadibot ${record.name}` },
    ],
    textFallback: body,
  })
}
