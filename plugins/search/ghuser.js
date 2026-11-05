// Stalk publik GitHub: API resmi GitHub tanpa kunci (rate limit publik),
// kelas pengecualian yang sama dengan Jikan di DECISIONS.md.
export const config = {
  name: 'ghuser',
  alias: [],
  category: 'search',
  description: { id: 'Info profil publik GitHub seseorang dari username', en: 'Public GitHub profile info from a username' },
  usage: '.ghuser <username>',
  example: '.ghuser OmmniDevv',
  cooldown: 10,
}

export const i18n = {
  id: {
    ghuser: {
      hint: '╭─❏ 🐙 「 *PROFIL GITHUB* 」\n┊ Tulis username GitHub-nya yaa~\n┊ Contoh: *.ghuser OmmniDevv*\n╰━━━━━━━',
      body: '╭─❏ 🐙 「 *PROFIL GITHUB* 」\n┊ ɴᴀᴍᴀ: *{name} (@{login})*\n┊ ʙɪᴏ: {bio}\n┊ ʀᴇᴘᴏ ᴘᴜʙʟɪᴋ: *{repos}*\n┊ ᴘᴇɴɢɪᴋᴜᴛ: *{followers}* · ᴍᴇɴɢɪᴋᴜᴛɪ: *{following}*\n┊ ʟᴏᴋᴀꜱɪ: *{location}*\n┊ ʙᴇʀɢᴀʙᴜɴɢ: *{joined}*\n┊ ᴘʀᴏꜰɪʟ: {url}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *USER TIDAK DITEMUKAN* 」\n┊ User GitHub *@{username}* tidak ditemukan. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *GAGAL AMBIL DATA* 」\n┊ Gagal ambil data GitHub: *{error}*\n╰━━━━━━━',
      empty: '-',
    },
  },
  en: {
    ghuser: {
      hint: '╭─❏ 🐙 「 *GITHUB PROFILE* 」\n┊ Write the GitHub username please~\n┊ Example: *.ghuser OmmniDevv*\n╰━━━━━━━',
      body: '╭─❏ 🐙 「 *GITHUB PROFILE* 」\n┊ ɴᴀᴍᴇ: *{name} (@{login})*\n┊ ʙɪᴏ: {bio}\n┊ ᴘᴜʙʟɪᴄ ʀᴇᴘᴏꜱ: *{repos}*\n┊ ꜰᴏʟʟᴏᴡᴇʀꜱ: *{followers}* · ꜰᴏʟʟᴏᴡɪɴɢ: *{following}*\n┊ ʟᴏᴄᴀᴛɪᴏɴ: *{location}*\n┊ ᴊᴏɪɴᴇᴅ: *{joined}*\n┊ ᴘʀᴏꜰɪʟᴇ: {url}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *USER NOT FOUND* 」\n┊ GitHub user *@{username}* was not found. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *FAILED TO FETCH DATA* 」\n┊ Failed to fetch GitHub data: *{error}*\n╰━━━━━━━',
      empty: '-',
    },
  },
}

export const test = { input: '.ghuser OmmniDevv', expect: /.+/ }

export async function handler(ctx) {
  const username = (ctx.text || '').trim().replace(/^@/, '').split(/\s+/)[0]
  if (!username) return ctx.reply(ctx.t('ghuser.hint'))
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { 'user-agent': 'kana-md', accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(20000),
    })
    if (res.status === 404) return ctx.reply(ctx.t('ghuser.notFound', { username, mood: ctx.say('gagal') }))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const d = await res.json()
    const empty = ctx.t('ghuser.empty')
    return ctx.reply(ctx.t('ghuser.body', {
      name: d.name || empty,
      login: d.login,
      bio: d.bio || empty,
      repos: d.public_repos ?? 0,
      followers: d.followers ?? 0,
      following: d.following ?? 0,
      location: d.location || empty,
      joined: d.created_at ? new Date(d.created_at).toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID') : empty,
      url: d.html_url,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('ghuser.fail', { error: err.message }))
  }
}
