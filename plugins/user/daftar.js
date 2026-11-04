import { sendButtons } from '../../src/ui/buttons.js'
import { getProfile, updateProfile } from '../../src/services/user-service.js'

// .daftar adalah gerbang member KANA (keputusan user 2026-11-04): pipeline
// menolak semua perintah lain dari user yang belum terdaftar. Plugin ini
// tinggal di folder user/ tetapi kategorinya 'main' sesuai keputusan user.
export const config = {
  name: 'daftar',
  alias: ['register', 'reg'],
  category: 'main',
  description: { id: 'Daftar jadi member KANA, wajib sebelum memakai bot', en: 'Register as a KANA member, required before using the bot' },
  usage: '.daftar <nama> atau .daftar auto',
  example: '.daftar Senpai',
  cooldown: 3,
}

export const i18n = {
  id: {
    daftar: {
      needName: '╭─❏ 🌸 「 *DAFTAR DULU YAA* 」\n┊ Tulis namanya dulu yaa~ Contoh: *.daftar Senpai*\n┊ Atau pencet tombol Daftar Otomatis di bawah, nanti KANA pakai nama WhatsApp kamu (≧▽≦) ✨\n╰━━━━━━━',
      success: '╭─❏ 🎉 「 *PENDAFTARAN BERES* 」\n┊ Yayyy, selamat datang, *{name}*!\n┊ Sekarang kamu resmi jadi member KANA~\n╰━━━━━━━ {mood}',
      alreadyTitle: '╭─❏ 🌸 「 *SUDAH TERDAFTAR* 」',
      alreadyBody: '┊ Ehh, kamu sudah terdaftar kok~ (≧▽≦)\n┊ ɴᴀᴍᴀ: *{name}*\n┊ 📅 ᴛᴇʀᴅᴀꜰᴛᴀʀ ꜱᴇᴊᴀᴋ: *{date}*\n┊ 📱 ɴᴏᴍᴏʀ: *{number}*\n╰━━━━━━━\nKetik .menu buat mulai main sama KANA yaa~ ✨',
      btnAuto: '✨ Daftar Otomatis',
      btnProfile: '👤 Profil Aku',
    },
  },
  en: {
    daftar: {
      needName: '╭─❏ 🌸 「 *REGISTER FIRST* 」\n┊ Write your name first~ Example: *.daftar Senpai*\n┊ Or tap the Auto Register button below and KANA will use your WhatsApp name (≧▽≦) ✨\n╰━━━━━━━',
      success: '╭─❏ 🎉 「 *REGISTRATION DONE* 」\n┊ Yayyy, welcome, *{name}*!\n┊ You are officially a KANA member now~\n╰━━━━━━━ {mood}',
      alreadyTitle: '╭─❏ 🌸 「 *ALREADY REGISTERED* 」',
      alreadyBody: '┊ Eh, you are already registered~ (≧▽≦)\n┊ ɴᴀᴍᴇ: *{name}*\n┊ 📅 ʀᴇɢɪꜱᴛᴇʀᴇᴅ ꜱɪɴᴄᴇ: *{date}*\n┊ 📱 ɴᴜᴍʙᴇʀ: *{number}*\n╰━━━━━━━\nType .menu to start playing with KANA~ ✨',
      btnAuto: '✨ Auto Register',
      btnProfile: '👤 My Profile',
    },
  },
}

export const test = { input: '.daftar', expect: /daftar|terdaftar/i }

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)

  if (profile.registered) {
    const date = profile.registeredAt
      ? new Date(profile.registeredAt).toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID')
      : '-'
    const body = `${ctx.t('daftar.alreadyTitle')}\n${ctx.t('daftar.alreadyBody', {
      name: profile.regName || profile.name || '-',
      date,
      number: ctx.senderDigits,
    })}`
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('daftar.btnProfile'), id: '.profil' }],
      textFallback: body,
    })
  }

  const raw = ctx.text.trim()
  let name = raw.toLowerCase() === 'auto' ? (ctx.pushName || '').trim() : raw
  name = name.slice(0, 30)
  if (!name) {
    const body = ctx.t('daftar.needName')
    return sendButtons(ctx.sock, ctx.chat, {
      title: 'KANA',
      body,
      footer: ctx.t('menu.footer'),
      replies: [{ text: ctx.t('daftar.btnAuto'), id: '.daftar auto' }],
      textFallback: body,
    })
  }

  await updateProfile(ctx.storage, ctx.senderDigits, {
    registered: true,
    regName: name,
    name,
    registeredAt: new Date().toISOString(),
  })
  const body = ctx.t('daftar.success', { name, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('daftar.btnProfile'), id: '.profil' }],
    textFallback: body,
  })
}
