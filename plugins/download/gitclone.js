import { fetchRepoZip } from '../../src/scrapers/download/gitclone.js'
import { sendDocument, MAX_DOCUMENT_BYTES } from '../../src/ui/media.js'

export const config = {
  name: 'gitclone',
  alias: ['gitdl'],
  category: 'download',
  description: { id: 'Unduh repo GitHub publik sebagai arsip ZIP', en: 'Download a public GitHub repository as a ZIP archive' },
  usage: '.gitclone <link repo github>',
  example: '.gitclone https://github.com/octocat/Hello-World',
  cooldown: 20,
  limit: 2,
}

export const i18n = {
  id: {
    gitclone: {
      needUrl: '╭─❏ 🔗 「 *KIRIM LINK REPONNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.gitclone https://github.com/octocat/Hello-World*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA ambilin arsip repo *{repo}* dulu... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *GAGAL AMBIL REPO* 」\n┊ Mouu, gagal ambil reponya: *{message}*\n┊ Pastikan linknya repo publik yang benar ya~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *REPO KEGEDEAN* 」\n┊ Aduh, arsip reponya kegedean buat dikirim lewat WhatsApp (di atas *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 📦 「 *GITCLONE* 」\n┊ ʀᴇᴘᴏ: *{owner}/{repo}*\n┊ ᴜᴋᴜʀᴀɴ: *{size}*\n╰━━━━━━━',
    },
  },
  en: {
    gitclone: {
      needUrl: '╭─❏ 🔗 「 *SEND THE REPO LINK* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.gitclone https://github.com/octocat/Hello-World*\n╰━━━━━━━',
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is fetching the archive of *{repo}*... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *FAILED TO FETCH REPO* 」\n┊ Mouu, failed to fetch the repo: *{message}*\n┊ Make sure it is a valid public repo link~\n╰━━━━━━━',
      tooBig: '╭─❏ 🙈 「 *REPO TOO BIG* 」\n┊ Oops, the repo archive is too big to send over WhatsApp (over *64 MB*)~\n╰━━━━━━━',
      caption: '╭─❏ 📦 「 *GITCLONE* 」\n┊ ʀᴇᴘᴏ: *{owner}/{repo}*\n┊ sɪᴢᴇ: *{size}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.gitclone https://github.com/octocat/Hello-World', expect: /Hello-World/i }

function formatSize(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return bytes + ' B'
}

export async function handler(ctx) {
  const raw = (ctx.text || '').match(/https?:\/\/[^\s]+/)?.[0] || ctx.args[0]
  if (!raw) return ctx.reply(ctx.t('gitclone.needUrl'))
  const label = raw.replace(/^https?:\/\/(www\.)?github\.com\//i, '')
  await ctx.reply(ctx.t('gitclone.working', { repo: label, mood: ctx.say('mikir') }))
  let zip
  try {
    zip = await fetchRepoZip(raw, { maxBytes: MAX_DOCUMENT_BYTES })
  } catch (err) {
    if (err.code === 'TOO_BIG') return ctx.reply(ctx.t('gitclone.tooBig'))
    return ctx.reply(ctx.t('gitclone.failed', { message: err.message }))
  }
  await sendDocument(ctx, zip.buffer, {
    fileName: zip.fileName,
    mimetype: 'application/zip',
    caption: ctx.t('gitclone.caption', { owner: zip.owner, repo: zip.repo, size: formatSize(zip.size) }),
  })
}
