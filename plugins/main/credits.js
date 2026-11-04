import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'credits',
  alias: ['thanks', 'tqto'],
  category: 'main',
  description: { id: 'Lihat kredit dan terima kasih proyek KANA', en: 'See the KANA project credits and thanks' },
  usage: '.credits',
  example: '.credits',
  cooldown: 3,
}

export const i18n = {
  id: {
    credits: {
      title: 'Kredit KANA 💖',
      body: 'KANA berdiri di bahu banyak karya baik. Terima kasih buat:\n\n📚 Library WhatsApp: @rexxhayanasi/elaina-baileys, dibangun di atas Baileys upstream.\n🎵 Yui Agents: metadata Spotify Embed, fallback iTunes, dan referensi lirik (lyrics.ovh dan lrclib).\n📺 Jerexd: referensi snippet downloader YouTube dan TikTok (tikwm) yang diadaptasi jadi fallback.\n🤖 hazeloffc: referensi AI chat rudder.chat (Token Harbor) yang dipakai sebagai fitur opt-in.\n🍳 Layanan publik gratis yang dipakai fitur pencarian: TheMealDB, TVMaze, Wikipedia, dan kawan-kawannya.\n🌸 Dan kamu, yang sudah mau pakai dan jagain KANA tiap hari~\n\n{mood}',
      btnMenu: 'Menu Utama',
      btnOwner: 'Owner',
    },
  },
  en: {
    credits: {
      title: 'KANA Credits 💖',
      body: 'KANA stands on the shoulders of many good works. Thank you to:\n\n📚 WhatsApp library: @rexxhayanasi/elaina-baileys, built on top of upstream Baileys.\n🎵 Yui Agents: Spotify Embed metadata, iTunes fallback, and lyric references (lyrics.ovh and lrclib).\n📺 Jerexd: YouTube and TikTok (tikwm) downloader snippet references adapted into fallbacks.\n🤖 hazeloffc: the rudder.chat AI chat reference (Token Harbor) used as an opt-in feature.\n🍳 Free public services used by search features: TheMealDB, TVMaze, Wikipedia, and friends.\n🌸 And you, for using and looking after KANA every day~\n\n{mood}',
      btnMenu: 'Main Menu',
      btnOwner: 'Owner',
    },
  },
}

export const test = { input: '.credits', expect: /kredit|KANA berdiri/i }

export async function handler(ctx) {
  const body = ctx.t('credits.body', { mood: ctx.say('sayang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('credits.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('credits.btnMenu'), id: '.menu' },
      { text: ctx.t('credits.btnOwner'), id: '.owner' },
    ],
    textFallback: body,
  })
}
