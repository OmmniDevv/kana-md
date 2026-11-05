// LiveChart: cari anime, daftar musim, jadwal tayang, peringkat, dan detail
// dari livechart.me. Adaptasi snippet "Anime_list" kiriman user 2026-11-05,
// ditulis ulang gaya KANA (scraper di src/scrapers/anime/livechart.js).
import { livechartSearch, livechartSeason, livechartRankings, livechartSchedule, livechartDetail } from '../../src/scrapers/anime/livechart.js'

export const config = {
  name: "livechart",
  alias: [],
  category: "anime",
  description: { id: "Info anime dari LiveChart: pencarian, daftar per musim, jadwal tayang, peringkat, dan detail", en: "Anime info from LiveChart: search, seasonal lists, airing schedule, rankings, and details" },
  usage: ".livechart <judul> | .livechart musim fall 2026 | .livechart jadwal | .livechart top | .livechart detail <id>",
  example: ".livechart solo leveling",
  cooldown: 5,
}

export const i18n = {
  id: {
    "livechart": {
      hint: "╭─❏ 📺 「 *LIVECHART* 」\n┊ Tulis judul anime yang mau dicari yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.livechart solo leveling*\n┊ Mode lain: *.livechart musim fall 2026*, *.livechart jadwal*, *.livechart top*, *.livechart detail <id>*\n╰━━━━━━━",
      working: "╭─❏ 📺 「 *LAGI MENCARI* 」\n┊ Sebentar, KANA cek LiveChart dulu yaa... {mood}\n╰━━━━━━━",
      list: "╭─❏ 📺 「 *{title}* 」\n┊ {items}\n╰━━━━━━━",
      detail: "╭─❏ 📺 「 *{title}* 」\n┊ {body}\n┊ 🔗 {url}\n╰━━━━━━━",
      empty: "╭─❏ 📺 「 *TIDAK KETEMU* 」\n┊ Mouu, tidak ada hasil di LiveChart buat itu~\n┊ Coba kata kunci lain yaa~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *LIVECHART GAGAL* 」\n┊ Mouu, gagal ambil data LiveChart: *{message}*\n┊ Situsnya lagi bermasalah, coba lagi nanti ya~\n╰━━━━━━━",
    },
  },
  en: {
    "livechart": {
      hint: "╭─❏ 📺 「 *LIVECHART* 」\n┊ Write the anime title to search~\n┊ ᴇxᴀᴍᴘʟᴇ: *.livechart solo leveling*\n┊ Other modes: *.livechart musim fall 2026*, *.livechart jadwal*, *.livechart top*, *.livechart detail <id>*\n╰━━━━━━━",
      working: "╭─❏ 📺 「 *SEARCHING* 」\n┊ One sec, KANA is checking LiveChart... {mood}\n╰━━━━━━━",
      list: "╭─❏ 📺 「 *{title}* 」\n┊ {items}\n╰━━━━━━━",
      detail: "╭─❏ 📺 「 *{title}* 」\n┊ {body}\n┊ 🔗 {url}\n╰━━━━━━━",
      empty: "╭─❏ 📺 「 *NOT FOUND* 」\n┊ Mouu, no LiveChart result for that~\n┊ Try another keyword~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *LIVECHART FAILED* 」\n┊ Mouu, failed to fetch LiveChart data: *{message}*\n┊ The site is having trouble, try again later~\n╰━━━━━━━",
    },
  },
}

const SEASONS = ['winter', 'spring', 'summer', 'fall']

function listBody(rows) {
  return rows.slice(0, 10).map((a, i) => {
    const bits = [(i + 1) + '. *' + a.title + '*']
    if (a.rating) bits.push('⭐ ' + a.rating)
    if (a.premiereDate) bits.push(a.premiereDate)
    if (a.time) bits.push('🕒 ' + a.time + (a.episode ? ' (' + a.episode + ')' : ''))
    bits.push(a.url)
    return bits.join('\n┊    ')
  }).join('\n┊ ')
}

export const test = { input: '.livechart', expect: /tulis|write/i }
export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  if (!raw) return ctx.reply(ctx.t('livechart.hint'))
  const [head, ...rest] = raw.split(/\s+/)
  const mode = head.toLowerCase()
  await ctx.reply(ctx.t('livechart.working', { mood: ctx.say('mikir') }))
  try {
    if (mode === 'jadwal' || mode === 'schedule') {
      const rows = await livechartSchedule()
      if (!rows.length) return ctx.reply(ctx.t('livechart.empty'))
      return ctx.reply(ctx.t('livechart.list', { title: 'JADWAL TAYANG LIVECHART', items: listBody(rows) }))
    }
    if (mode === 'top' || mode === 'ranking' || mode === 'peringkat') {
      const rows = await livechartRankings()
      if (!rows.length) return ctx.reply(ctx.t('livechart.empty'))
      return ctx.reply(ctx.t('livechart.list', { title: 'TOP ANIME LIVECHART', items: listBody(rows) }))
    }
    if (mode === 'musim' || mode === 'season') {
      const season = SEASONS.includes((rest[0] || '').toLowerCase()) ? rest[0].toLowerCase() : 'fall'
      const year = /^\d{4}$/.test(rest[1] || '') ? rest[1] : String(new Date().getFullYear())
      const rows = await livechartSeason(season, year)
      if (!rows.length) return ctx.reply(ctx.t('livechart.empty'))
      return ctx.reply(ctx.t('livechart.list', { title: ('ANIME ' + season + ' ' + year).toUpperCase(), items: listBody(rows) }))
    }
    if (mode === 'detail' || mode === 'info') {
      const id = (rest[0] || '').replace(/\D/g, '')
      if (!id) return ctx.reply(ctx.t('livechart.hint'))
      const d = await livechartDetail(id)
      if (!d) return ctx.reply(ctx.t('livechart.empty'))
      const parts = []
      if (d.english) parts.push('ᴇɴ: ' + d.english)
      if (d.studios.length) parts.push('ꜱᴛᴜᴅɪᴏ: ' + d.studios.join(', '))
      if (d.tags.length) parts.push('ᴛᴀɢ: ' + d.tags.slice(0, 8).join(', '))
      if (d.synopsis) parts.push(d.synopsis.slice(0, 700))
      return ctx.reply(ctx.t('livechart.detail', { title: d.title.toUpperCase(), body: parts.join('\n┊ ') || '-', url: d.url }))
    }
    const rows = await livechartSearch(raw)
    if (!rows.length) return ctx.reply(ctx.t('livechart.empty'))
    return ctx.reply(ctx.t('livechart.list', { title: 'HASIL LIVECHART: ' + raw.toUpperCase().slice(0, 40), items: listBody(rows) }))
  } catch (err) {
    return ctx.reply(ctx.t('livechart.fail', { message: err.message }))
  }
}
