import { sendButtons } from '../../src/ui/buttons.js'
import { clanWar } from '../../src/rpg/engine.js'

export const config = {
  name: 'clanwar',
  alias: ['perangclan', 'guildwar'],
  category: 'rpg',
  description: { id: 'Perang clan RPG harian: power clan kamu lawan clan lain', en: 'Daily RPG clan war: your clan power against another clan' },
  usage: '.clanwar',
  example: '.clanwar',
  cooldown: 10,
}

export const i18n = {
  id: {
    clanwar: {
      noClan: '╭─❏ ✨ 「 *CLANWAR* 」\n┊ Ehh, kamu belum punya clan nih... buat atau gabung dulu di .clan yaa 🥺\n╰━━━━━━━',
      cooldown: '╭─❏ ✨ 「 *CLANWAR* 」\n┊ Mouu, clan kamu udah perang hari ini~ istirahat dulu, lanjut besok yaa 💤\n╰━━━━━━━',
      result: '╭─❏ ⚔️ 「 *CLANWAR* 」\n┊ ⚔️ HASIL PERANG CLAN ⚔️\n┊ {name} (power {myPower}) vs {opp} (power {oppPower})\n┊ {verdict}\n┊ Hadiah masuk bank clan: {reward} koin 🏦 (bank sekarang {bank})\n┊ {mood}\n╰━━━━━━━',
      win: '🎉 MENANG! Clan kita paling kuat hari ini~',
      lose: '╭─❏ ✨ 「 *CLANWAR* 」\n┊ Mouu, kalah kali ini... kumpulkan power lagi yaa 🥺\n╰━━━━━━━',
      btnClan: 'Info Clan',
      btnDungeon: 'Dungeon',
      btnProfile: 'Profil RPG',
    },
  },
  en: {
    clanwar: {
      noClan: '╭─❏ ✨ 「 *CLANWAR* 」\n┊ Eh, you do not have a clan yet... create or join one in .clan first 🥺\n╰━━━━━━━',
      cooldown: '╭─❏ ✨ 「 *CLANWAR* 」\n┊ Mouu, your clan already fought today~ rest first, continue tomorrow 💤\n╰━━━━━━━',
      result: '╭─❏ ⚔️ 「 *CLANWAR* 」\n┊ ⚔️ CLAN WAR RESULT ⚔️\n┊ {name} (power {myPower}) vs {opp} (power {oppPower})\n┊ {verdict}\n┊ Reward to clan bank: {reward} coins 🏦 (bank now {bank})\n┊ {mood}\n╰━━━━━━━',
      win: '🎉 VICTORY! Our clan is the strongest today~',
      lose: 'Mouu, we lost this time... gather more power 🥺',
      btnClan: 'Clan Info',
      btnDungeon: 'Dungeon',
      btnProfile: 'RPG Profile',
    },
  },
}

export const test = { input: '.clanwar', expect: /clan/i }

export async function handler(ctx) {
  const replies = [
    { text: ctx.t('clanwar.btnClan'), id: '.clan' },
    { text: ctx.t('clanwar.btnDungeon'), id: '.dungeon' },
    { text: ctx.t('clanwar.btnProfile'), id: '.rpg' },
  ]
  const send = (body) =>
    sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
  const res = await clanWar(ctx.storage, ctx.senderDigits)
  if (!res.ok) return send(res.reason === 'cooldown' ? ctx.t('clanwar.cooldown') : ctx.t('clanwar.noClan'))
  return send(
    ctx.t('clanwar.result', {
      name: res.myClan,
      myPower: res.myPower,
      opp: res.oppName,
      oppPower: res.oppPower,
      verdict: res.win ? ctx.t('clanwar.win') : ctx.t('clanwar.lose'),
      reward: res.reward,
      bank: res.clanBank,
      mood: res.win ? ctx.say('senang') : ctx.say('gagal'),
    })
  )
}
