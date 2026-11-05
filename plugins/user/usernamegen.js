import { sendButtons } from '../../src/ui/buttons.js'
import { getUsernames, normalizeMode, normalizeTheme, USERNAME_MODES, USERNAME_THEMES } from '../../src/scrapers/tools/usernamegen.js'

// Usernamegen: daftar username asli dari API Nexray, format argumen
// pipa ala Elaina: .usernamegen <nama> | <theme> | <mode>.
// Bukan lagi generator lokal dari awalan dan akhiran karangan.
export const config = {
  name: 'usernamegen',
  alias: ['genusername', 'buatusername', 'genuser', 'username'],
  category: 'user',
  description: { id: 'Buat daftar username dari API Nexray berdasarkan nama, tema, dan mode', en: 'Generate usernames from the Nexray API by name, theme, and mode' },
  usage: '.usernamegen <nama> | <theme> | <mode>',
  example: '.usernamegen kana | fantasy | instans',
  cooldown: 5,
}

export const MAX_USERNAME_RESULTS = 15

export const i18n = {
  id: {
    usernamegen: {
      title: 'Generator Username',
      usage: '╭─❏ ✨ 「 *GENERATOR USERNAME* 」\n┊ ᴄᴀʀᴀ ᴘᴀᴋᴀɪ: *.usernamegen <nama> | <theme> | <mode>*\n┊ ᴛᴇᴍᴀ: {themes}\n┊ ᴍᴏᴅᴇ: {modes}\n┊ ᴄᴏɴᴛᴏʜ: *.usernamegen kana | fantasy | instans*\n╰━━━━━━━',
      result: '╭─❏ ✨ 「 *USERNAME GENERATOR* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴛᴇᴍᴀ: *{theme}*\n┊ ᴍᴏᴅᴇ: *{mode}*\n┊\n{list}\n┊\n┊ Sumber: API Nexray\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *USERNAME GAGAL* 」\n┊ Mouu, sumber usernamenya lagi tidak bisa dihubungi: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
      btnAgain: 'Buat Lagi',
    },
  },
  en: {
    usernamegen: {
      title: 'Username Generator',
      usage: '╭─❏ ✨ 「 *USERNAME GENERATOR* 」\n┊ ᴜꜱᴇ: *.usernamegen <name> | <theme> | <mode>*\n┊ ᴛʜᴇᴍᴇꜱ: {themes}\n┊ ᴍᴏᴅᴇꜱ: {modes}\n┊ ᴇxᴀᴍᴘʟᴇ: *.usernamegen kana | fantasy | instans*\n╰━━━━━━━',
      result: '╭─❏ ✨ 「 *USERNAME GENERATOR* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ᴛʜᴇᴍᴇ: *{theme}*\n┊ ᴍᴏᴅᴇ: *{mode}*\n┊\n{list}\n┊\n┊ Source: Nexray API\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *USERNAME FAILED* 」\n┊ Mouu, the username source cannot be reached: *{message}*\n┊ Try again later please~\n╰━━━━━━━',
      btnAgain: 'Generate Again',
    },
  },
}

export const test = { input: '.usernamegen kana | fantasy | instans', expect: /username generator/i }

// Urai teks pipa "nama | tema | mode" ala Elaina.
export function parseUsernameArgs(text) {
  const parts = String(text || '').split('|').map((v) => v.trim())
  const name = parts[0] || ''
  if (!name) return null
  return {
    name: name.slice(0, 60),
    theme: normalizeTheme(parts[1] || 'action'),
    mode: normalizeMode(parts[2] || 'instans'),
  }
}

export function formatUsernames(t, input, usernames) {
  const shown = usernames.slice(0, MAX_USERNAME_RESULTS)
  const list = shown.map((u, i) => `┊ ${i + 1}. ${u}`).join('\n')
  return t('usernamegen.result', { name: input.name, theme: input.theme, mode: input.mode, list })
}

export async function handler(ctx, { fetchUsernames = getUsernames } = {}) {
  const input = parseUsernameArgs(ctx.text || '')
  if (!input) {
    return ctx.reply(ctx.t('usernamegen.usage', { themes: USERNAME_THEMES.join(', '), modes: USERNAME_MODES.join(', ') }))
  }
  let usernames
  try {
    usernames = await fetchUsernames(input.name, { theme: input.theme, mode: input.mode })
  } catch (err) {
    return ctx.reply(ctx.t('usernamegen.fail', { message: err.message }))
  }
  const body = formatUsernames(ctx.t, input, usernames)
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('usernamegen.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('usernamegen.btnAgain'), id: `.usernamegen ${input.name} | ${input.theme} | ${input.mode}` }],
    textFallback: body,
  })
}
