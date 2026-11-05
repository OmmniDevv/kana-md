// Buat GitHub Gist publik lewat API resmi GitHub (api.github.com/gists).
// API gist publik wajib token GitHub; token dibaca dari GITHUB_TOKEN
// atau GH_TOKEN di env bot. Tanpa token, perintah membalas jujur bahwa
// fitur menunggu token, bukan berpura-pura berhasil.
export const config = {
  name: 'vgist',
  alias: ['gist', 'creategist'],
  category: 'tools',
  description: { id: 'Buat GitHub Gist dari teks (butuh token GitHub di bot)', en: 'Create a GitHub Gist from text (needs a GitHub token on the bot)' },
  usage: '.vgist <nama-berkas> <isi teks>',
  example: '.vgist catatan.txt halo dunia',
  cooldown: 15,
  limit: 3,
}

export const i18n = {
  id: {
    vgist: {
      needInput: '╭─❏ 🐙 「 *FORMAT GIST* 」\n┊ ᴄᴏɴᴛᴏʜ: *.vgist catatan.txt halo dunia*\n┊ ᴛᴏᴋᴇɴ ᴘᴇʀᴛᴀᴍᴀ ᴊᴀᴅɪ ɴᴀᴍᴀ ʙᴇʀᴋᴀꜱ, ꜱɪꜱᴀɴʏᴀ ɪꜱɪ ɢɪꜱᴛ.\n╰━━━━━━━',
      noToken: '╭─❏ 🔑 「 *BELUM ADA TOKEN GITHUB* 」\n┊ Mouu, API Gist GitHub wajib token dan bot belum punya *GITHUB_TOKEN* di konfigurasinya~\n┊ Minta owner pasang token dulu ya. Alternatif tanpa token: *.pastebin* buat paste teks.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA buat gistnya dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL BUAT GIST* 」\n┊ Mouu, gagal buat gistnya: *{message}*\n╰━━━━━━━',
      done: '╭─❏ 🐙 「 *GIST JADI* 」\n┊ ʙᴇʀᴋᴀꜱ: *{file}*\n┊ ɴɪʜ ᴛᴀᴜᴛᴀɴɴʏᴀ: {url}\n╰━━━━━━━',
    },
  },
  en: {
    vgist: {
      needInput: '╭─❏ 🐙 「 *GIST FORMAT* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.vgist notes.txt hello world*\n┊ ᴛʜᴇ ꜰɪʀꜱᴛ ᴛᴏᴋᴇɴ ʙᴇᴄᴏᴍᴇꜱ ᴛʜᴇ ꜰɪʟᴇ ɴᴀᴍᴇ, ᴛʜᴇ ʀᴇꜱᴛ ɪꜱ ᴛʜᴇ ᴄᴏɴᴛᴇɴᴛ.\n╰━━━━━━━',
      noToken: '╭─❏ 🔑 「 *NO GITHUB TOKEN YET* 」\n┊ Mouu, the GitHub Gist API needs a token and the bot has no *GITHUB_TOKEN* configured~\n┊ Ask the owner to set one. Token-free alternative: *.pastebin* for text pastes.\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is creating the gist... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO CREATE GIST* 」\n┊ Mouu, failed to create the gist: *{message}*\n╰━━━━━━━',
      done: '╭─❏ 🐙 「 *GIST READY* 」\n┊ ꜰɪʟᴇ: *{file}*\n┊ ʜᴇʀᴇ ɪꜱ ᴛʜᴇ ʟɪɴᴋ: {url}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.vgist catatan.txt halo dari kana', expect: /GIST|TOKEN|GITHUB/ }

// Urai "nama.txt isi teks" dari teks perintah.
export function parseGistInput(text) {
  const m = String(text || '').trim().match(/^(\S+\.\w{1,10})\s+([\s\S]+)$/)
  if (!m) return null
  return { file: m[1], content: m[2] }
}

async function createGist(token, file, content) {
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      'user-agent': 'KANA-Bot',
    },
    body: JSON.stringify({
      description: 'Dibuat dari bot KANA',
      public: true,
      files: { [file]: { content } },
    }),
  })
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
  const json = await res.json()
  return json.html_url
}

export async function handler(ctx, { create = createGist, token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '' } = {}) {
  const parsed = parseGistInput(ctx.text || '')
  if (!parsed) return ctx.reply(ctx.t('vgist.needInput'))
  if (!token) return ctx.reply(ctx.t('vgist.noToken'))
  await ctx.reply(ctx.t('vgist.working', { mood: ctx.say('mikir') }))
  try {
    const url = await create(token, parsed.file, parsed.content)
    return ctx.reply(ctx.t('vgist.done', { file: parsed.file, url }))
  } catch (err) {
    return ctx.reply(ctx.t('vgist.failed', { message: err.message }))
  }
}
