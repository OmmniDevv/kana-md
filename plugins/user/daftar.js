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
      needName: 'Tulis namanya dulu yaa~ Contoh: .daftar Senpai. Atau pencet tombol Daftar Otomatis di bawah, nanti KANA pakai nama WhatsApp kamu (≧▽≦) ✨',
      success: 'Yayyy, selamat datang, {name}! 🎉 Pendaftaran kamu beres, sekarang kamu resmi jadi member KANA~ {mood}',
      alreadyTitle: 'Ehh, kamu sudah terdaftar kok~ (≧▽≦)',
      alreadyBody: '🌸 Nama: {name}\n📅 Terdaftar sejak: {date}\n📱 Nomor: {number}\n\nKetik .menu buat mulai main sama KANA yaa~ ✨',
      btnAuto: '✨ Daftar Otomatis',
      btnProfile: '👤 Profil Aku',
      btnMenu: '📋 Menu Utama',
    },
  },
  en: {
    daftar: {
      needName: 'Write your name first~ Example: .daftar Senpai. Or tap the Auto Register button below and KANA will use your WhatsApp name (≧▽≦) ✨',
      success: 'Yayyy, welcome, {name}! 🎉 Your registration is done, you are officially a KANA member now~ {mood}',
      alreadyTitle: 'Eh, you are already registered~ (≧▽≦)',
      alreadyBody: '🌸 Name: {name}\n📅 Registered since: {date}\n📱 Number: {number}\n\nType .menu to start playing with KANA~ ✨',
      btnAuto: '✨ Auto Register',
      btnProfile: '👤 My Profile',
      btnMenu: '📋 Main Menu',
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
      replies: [
        { text: ctx.t('daftar.btnMenu'), id: '.menu' },
        { text: ctx.t('daftar.btnProfile'), id: '.profil' },
      ],
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
    replies: [
      { text: ctx.t('daftar.btnMenu'), id: '.menu' },
      { text: ctx.t('daftar.btnProfile'), id: '.profil' },
    ],
    textFallback: body,
  })
}
