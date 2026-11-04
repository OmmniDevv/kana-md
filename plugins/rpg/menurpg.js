import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendButtons } from '../../src/ui/buttons.js'

const here = dirname(fileURLToPath(import.meta.url))

export const config = {
  name: 'menurpg',
  alias: ['rpgmenu'],
  category: 'rpg',
  description: { id: 'Menu lengkap perintah RPG', en: 'Full RPG commands menu' },
  usage: '.menurpg',
  example: '.menurpg',
  cooldown: 3,
}

export const i18n = {
  id: {
    menurpg: {
      body: '╭─❏ ⚔️ 「 *MENURPG* 」\n┊ ⚔️ MENU RPG KANA ⚔️\n\n┊ 🎁 Klaim: .daily .hourly .weekly\n┊ ⛏️ Kumpul: .mining .fishing .hunting .farming\n┊ 🔨 Buat: .craft .recipes\n┊ 🛒 Ekonomi: .shop .buy .inventory .bank\n┊ ⚔️ Tarung: .duel .dungeon .clanwar\n┊ 🐾 Teman: .pet .job .clan\n┊ 👤 Profil: .rpg\n\n┊ {mood}\n╰━━━━━━━',
      caption: 'Menu RPG KANA ⚔️ pencet tombolnya yaa~',
      hint: 'Mau mulai dari mana nih?',
      btnDaily: 'Klaim Harian',
      btnMining: 'Tambang',
      btnFishing: 'Mancing',
      btnDungeon: 'Dungeon',
      btnShop: 'Toko',
      btnProfile: 'Profil RPG',
    },
  },
  en: {
    menurpg: {
      body: '╭─❏ ⚔️ 「 *MENURPG* 」\n┊ ⚔️ KANA RPG MENU ⚔️\n\n┊ 🎁 Claims: .daily .hourly .weekly\n┊ ⛏️ Gather: .mining .fishing .hunting .farming\n┊ 🔨 Make: .craft .recipes\n┊ 🛒 Economy: .shop .buy .inventory .bank\n┊ ⚔️ Battle: .duel .dungeon .clanwar\n┊ 🐾 Friends: .pet .job .clan\n┊ 👤 Profile: .rpg\n\n┊ {mood}\n╰━━━━━━━',
      caption: 'KANA RPG Menu ⚔️ tap a button~',
      hint: 'Where do you want to start?',
      btnDaily: 'Daily Claim',
      btnMining: 'Mining',
      btnFishing: 'Fishing',
      btnDungeon: 'Dungeon',
      btnShop: 'Shop',
      btnProfile: 'RPG Profile',
    },
  },
}

export const test = { input: '.menurpg', expect: /RPG/i }

export async function handler(ctx) {
  const body = ctx.t('menurpg.body', { mood: ctx.say('salam') })
  let image = null
  try {
    image = await readFile(join(here, '../../assets/rpg.jpg'))
  } catch {
    image = null
  }
  if (image) {
    await ctx.sock.sendMessage(ctx.chat, { image, caption: ctx.t('menurpg.caption') }, { quoted: ctx.raw })
  }
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA RPG',
    body: image ? ctx.t('menurpg.hint') + '\n\n' + body : body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('menurpg.btnDaily'), id: '.daily' },
      { text: ctx.t('menurpg.btnMining'), id: '.mining' },
      { text: ctx.t('menurpg.btnFishing'), id: '.fishing' },
      { text: ctx.t('menurpg.btnDungeon'), id: '.dungeon' },
      { text: ctx.t('menurpg.btnShop'), id: '.shop' },
      { text: ctx.t('menurpg.btnProfile'), id: '.rpg' },
    ],
    textFallback: body,
  })
}
