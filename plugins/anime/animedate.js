import { lcScheduleToday } from '../../src/scrapers/kindb/lc-schedule.js'

export const config = {
  name: 'animedate',
  alias: [],
  category: 'anime',
  description: { id: 'Kalender rilis anime: jadwal tayang episode dari LiveChart.me', en: 'Anime release calendar: episode airing schedule from LiveChart.me' },
  usage: '.animedate',
  example: '.animedate',
  cooldown: 10,
}

export const i18n = {
  id: {
    animedate: {
      title: '╭─❏ 🗓️ 「 *JADWAL RILIS ANIME* 」\n┊ ꜱᴜᴍʙᴇʀ: *LiveChart.me*\n{list}\n╰━━━━━━━',
      line: '┊ {time} *{title}* {ep}',
      ep: '(Ep. {n})',
      empty: '╭─❏ 🗓️ 「 *JADWAL RILIS ANIME* 」\n┊ Jadwalnya lagi kosong dari LiveChart nih, coba lagi nanti yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal ambil jadwal rilis: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
    },
  },
  en: {
    animedate: {
      title: '╭─❏ 🗓️ 「 *ANIME RELEASE SCHEDULE* 」\n┊ ꜱᴏᴜʀᴄᴇ: *LiveChart.me*\n{list}\n╰━━━━━━━',
      line: '┊ {time} *{title}* {ep}',
      ep: '(Ep. {n})',
      empty: '╭─❏ 🗓️ 「 *ANIME RELEASE SCHEDULE* 」\n┊ The schedule is empty from LiveChart right now, try again later~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to fetch the release schedule: *{message}*\n┊ Try again later~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.animedate', expect: /LiveChart|JADWAL RILIS/i }

export async function handler(ctx) {
  try {
    const rows = (await lcScheduleToday(12)).slice(0, 12)
    if (!rows.length) return ctx.reply(ctx.t('animedate.empty'))
    const list = rows.map((r) => ctx.t('animedate.line', {
      time: r.time ? '[' + r.time + ']' : '',
      title: r.title,
      ep: r.episode ? ctx.t('animedate.ep', { n: r.episode }) : '',
    })).join('\n')
    return ctx.reply(ctx.t('animedate.title', { list }))
  } catch (err) {
    return ctx.reply(ctx.t('animedate.fail', { message: err.message }))
  }
}
