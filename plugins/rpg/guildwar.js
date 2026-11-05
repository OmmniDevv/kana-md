// Perbaikan audit templat 2026-11-06 (gelombang 2): versi lama mesin duel
// angka taruhan generik tanpa guild sama sekali. Sekarang perang guild
// nyata memakai clanWar engine yang sama dengan .clanwar: power guild
// dihitung dari member, lawan guild lain atau guild bayangan, hadiah
// masuk kas guild, dan ada jeda harian di data guild.
import { clanWar } from '../../src/rpg/engine.js'

export const config = {
  name: 'guildwar',
  alias: [],
  category: 'rpg',
  description: { id: 'Perang guild harian nyata: power guildmu lawan guild lain, hadiah masuk kas guild', en: 'Real daily guild war: your guild power against another guild, reward goes to the guild bank' },
  usage: '.guildwar',
  example: '.guildwar',
  cooldown: 10,
}

export const i18n = {
  id: {
    guildwar: {
      noGuild: '╭─❏ 🏰 「 *GUILDWAR* 」\n┊ Kamu belum punya guild. Buat pakai .createguild <nama> atau gabung pakai .joinguild <id>\n╰━━━━━━━',
      cooldown: '╭─❏ 🏰 「 *GUILDWAR* 」\n┊ Guildmu sudah perang hari ini. Istirahat dulu, lanjut besok yaa~\n╰━━━━━━━',
      win: '╭─❏ 🏰 「 *GUILDWAR* 」\n┊ ⚔️ *{mine}* (power {mpower}) vs *{opp}* (power {opower}): MENANG!\n┊ Hadiah *+{reward} koin* masuk kas guild, kas sekarang: *{bank} koin*\n╰━━━━━━━',
      lose: '╭─❏ 🏰 「 *GUILDWAR* 」\n┊ ⚔️ *{mine}* (power {mpower}) vs *{opp}* (power {opower}): kalah kali ini\n┊ Hadiah hiburan *+{reward} koin* tetap masuk kas guild, kas sekarang: *{bank} koin*\n╰━━━━━━━',
    },
  },
  en: {
    guildwar: {
      noGuild: '╭─❏ 🏰 「 *GUILDWAR* 」\n┊ You have no guild yet. Create one with .createguild <name> or join with .joinguild <id>\n╰━━━━━━━',
      cooldown: '╭─❏ 🏰 「 *GUILDWAR* 」\n┊ Your guild already warred today. Rest first, continue tomorrow~\n╰━━━━━━━',
      win: '╭─❏ 🏰 「 *GUILDWAR* 」\n┊ ⚔️ *{mine}* (power {mpower}) vs *{opp}* (power {opower}): YOU WIN!\n┊ Reward *+{reward} coins* goes to the guild bank, bank now: *{bank} coins*\n╰━━━━━━━',
      lose: '╭─❏ 🏰 「 *GUILDWAR* 」\n┊ ⚔️ *{mine}* (power {mpower}) vs *{opp}* (power {opower}): you lose this time\n┊ Consolation *+{reward} coins* still goes to the guild bank, bank now: *{bank} coins*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.guildwar', expect: /belum punya guild|no guild yet|sudah perang|already warred|kas guild|guild bank/i }

export async function handler(ctx) {
  const res = await clanWar(ctx.storage, ctx.senderDigits)
  if (!res.ok) {
    return ctx.reply(ctx.t(res.reason === 'cooldown' ? 'guildwar.cooldown' : 'guildwar.noGuild'))
  }
  return ctx.reply(ctx.t(res.win ? 'guildwar.win' : 'guildwar.lose', {
    mine: res.myClan,
    mpower: res.myPower,
    opp: res.oppName,
    opower: res.oppPower,
    reward: res.reward,
    bank: res.clanBank,
  }))
}
