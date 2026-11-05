import { sendButtons } from '../../src/ui/buttons.js'
import { findHero } from '../../src/scrapers/random/superhero.js'

// Superhero: data asli dari dataset akabab superhero-api (pengganti
// API lolhuman Elaina yang butuh API key berbayar). Gambar hero
// dikirim bersama teks statistik mengikuti susunan Elaina: identitas,
// powerstats, appearance, aliases, work.
export const config = {
  name: 'superhero',
  alias: ['hero', 'pahlawan'],
  category: 'random',
  description: { id: 'Cari informasi superhero dari dataset akabab', en: 'Look up superhero info from the akabab dataset' },
  usage: '.superhero <nama>',
  example: '.superhero batman',
  cooldown: 5,
}

export const i18n = {
  id: {
    superhero: {
      title: 'Info Superhero',
      usage: '╭─❏ 🦸 「 *SUPERHERO* 」\n┊ Tulis nama superheronya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.superhero batman*\n╰━━━━━━━',
      caption: '🦸 *SUPERHERO INFO*\n\n╭─❏ 👤 「 *IDENTITAS* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ɴᴀᴍᴀ ʟᴇɴɢᴋᴀᴘ: *{fullName}*\n┊ ᴀʟɪɢɴᴍᴇɴᴛ: *{alignment}*\n┊ ᴘᴜʙʟɪꜱʜᴇʀ: *{publisher}*\n╰━━━━━━━\n╭─❏ ⚡ 「 *POWERSTATS* 」\n┊ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ: *{intelligence}*\n┊ ꜱᴛʀᴇɴɢᴛʜ: *{strength}*\n┊ ꜱᴘᴇᴇᴅ: *{speed}*\n┊ ᴅᴜʀᴀʙɪʟɪᴛʏ: *{durability}*\n┊ ᴘᴏᴡᴇʀ: *{power}*\n┊ ᴄᴏᴍʙᴀᴛ: *{combat}*\n╰━━━━━━━\n╭─❏ 📊 「 *PENAMPILAN* 」\n┊ ɢᴇɴᴅᴇʀ: *{gender}*\n┊ ʀᴀꜱ: *{race}*\n┊ ᴛɪɴɢɢɪ: *{height}*\n┊ ʙᴇʀᴀᴛ: *{weight}*\n┊ ᴍᴀᴛᴀ: *{eyes}*\n┊ ʀᴀᴍʙᴜᴛ: *{hair}*\n╰━━━━━━━\n╭─❏ 🎭 「 *ALIAS* 」\n┊ {aliases}\n╰━━━━━━━\n╭─❏ 💼 「 *PEKERJAAN* 」\n┊ ᴏᴋᴜᴘᴀꜱɪ: *{occupation}*\n┊ ʙᴀꜱᴇ: *{base}*\n╰━━━━━━━\nSumber: dataset akabab superhero-api',
      notFound: '╭─❏ 💦 「 *SUPERHERO TIDAK KETEMU* 」\n┊ Hero bernama *{query}* tidak ada di datasetnya. Coba nama lain yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *SUPERHERO GAGAL* 」\n┊ Mouu, dataset superheronya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Hero Lain',
    },
  },
  en: {
    superhero: {
      title: 'Superhero Info',
      usage: '╭─❏ 🦸 「 *SUPERHERO* 」\n┊ Write the superhero name first please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.superhero batman*\n╰━━━━━━━',
      caption: '🦸 *SUPERHERO INFO*\n\n╭─❏ 👤 「 *IDENTITY* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ꜰᴜʟʟ ɴᴀᴍᴇ: *{fullName}*\n┊ ᴀʟɪɢɴᴍᴇɴᴛ: *{alignment}*\n┊ ᴘᴜʙʟɪꜱʜᴇʀ: *{publisher}*\n╰━━━━━━━\n╭─❏ ⚡ 「 *POWERSTATS* 」\n┊ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ: *{intelligence}*\n┊ ꜱᴛʀᴇɴɢᴛʜ: *{strength}*\n┊ ꜱᴘᴇᴇᴅ: *{speed}*\n┊ ᴅᴜʀᴀʙɪʟɪᴛʏ: *{durability}*\n┊ ᴘᴏᴡᴇʀ: *{power}*\n┊ ᴄᴏᴍʙᴀᴛ: *{combat}*\n╰━━━━━━━\n╭─❏ 📊 「 *APPEARANCE* 」\n┊ ɢᴇɴᴅᴇʀ: *{gender}*\n┊ ʀᴀᴄᴇ: *{race}*\n┊ ʜᴇɪɢʜᴛ: *{height}*\n┊ ᴡᴇɪɢʜᴛ: *{weight}*\n┊ ᴇʏᴇꜱ: *{eyes}*\n┊ ʜᴀɪʀ: *{hair}*\n╰━━━━━━━\n╭─❏ 🎭 「 *ALIASES* 」\n┊ {aliases}\n╰━━━━━━━\n╭─❏ 💼 「 *WORK* 」\n┊ ᴏᴄᴄᴜᴘᴀᴛɪᴏɴ: *{occupation}*\n┊ ʙᴀꜱᴇ: *{base}*\n╰━━━━━━━\nSource: akabab superhero-api dataset',
      notFound: '╭─❏ 💦 「 *SUPERHERO NOT FOUND* 」\n┊ A hero named *{query}* is not in the dataset. Try another name please~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *SUPERHERO FAILED* 」\n┊ Mouu, the superhero dataset cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Another Hero',
    },
  },
}

export const test = { input: '.superhero batman', expect: /superhero info/i }

const dash = (v) => {
  if (v === undefined || v === null || v === '' || v === 'null') return '-'
  return String(v)
}
const listJoin = (v) => (Array.isArray(v) && v.length ? v.join(' / ') : '-')

export function formatHero(t, hero) {
  const stats = hero.powerstats || {}
  const bio = hero.biography || {}
  const app = hero.appearance || {}
  const work = hero.work || {}
  const aliases = Array.isArray(bio.aliases) ? bio.aliases.filter((a) => a && a !== '-') : []
  return t('superhero.caption', {
    name: dash(hero.name),
    fullName: dash(bio['full-name']),
    alignment: dash(bio.alignment),
    publisher: dash(bio.publisher),
    intelligence: dash(stats.intelligence),
    strength: dash(stats.strength),
    speed: dash(stats.speed),
    durability: dash(stats.durability),
    power: dash(stats.power),
    combat: dash(stats.combat),
    gender: dash(app.gender),
    race: dash(app.race),
    height: listJoin(app.height),
    weight: listJoin(app.weight),
    eyes: dash(app['eye-color']),
    hair: dash(app['hair-color']),
    aliases: aliases.length ? aliases.slice(0, 5).join(', ') : '-',
    occupation: dash(work.occupation),
    base: dash(work.base),
  })
}

export async function handler(ctx, { fetchHero = findHero } = {}) {
  const query = (ctx.text || '').trim().slice(0, 60)
  if (!query) return ctx.reply(ctx.t('superhero.usage'))
  let hero
  try {
    hero = await fetchHero(query)
  } catch (err) {
    return ctx.reply(ctx.t('superhero.fail', { message: err.message }))
  }
  if (!hero) return ctx.reply(ctx.t('superhero.notFound', { query }))
  const caption = formatHero(ctx.t, hero)
  const imageUrl = hero.images?.md || hero.images?.lg || hero.images?.sm
  if (imageUrl && ctx.sock?.sendMessage) {
    try {
      return await ctx.sock.sendMessage(ctx.chat, { image: { url: imageUrl }, caption }, { quoted: ctx.raw })
    } catch {
      // Gambar gagal dikirim, jatuh ke teks di bawah.
    }
  }
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('superhero.title'),
    body: caption,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('superhero.btnAgain'), id: '.superhero' }],
    textFallback: caption,
  })
}
