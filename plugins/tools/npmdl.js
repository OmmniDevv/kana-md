import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendDocument } from '../../src/ui/media.js'

export const config = {
  name: 'npmdl',
  alias: [],
  category: 'tools',
  description: { id: 'Unduh paket npm sebagai berkas tarball .tgz dari registry npm resmi dan kirim sebagai dokumen', en: 'Download an npm package as a .tgz tarball from the official npm registry and send it as a document' },
  usage: '.npmdl <nama paket>',
  example: '.npmdl express',
  cooldown: 10,
}

export const i18n = {
  id: {
    npmdl: {
      hint: '╭─❏ 📦 「 *UNDUH NPM* 」\n┊ Tulis nama paket npmnya dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.npmdl express*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *PAKET TIDAK KETEMU* 」\n┊ Mouu, paket *{q}* tidak ada di registry npm~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ Mouu, gagal unduh paket: *{message}*\n┊ Coba lagi nanti ya~\n╰━━━━━━━',
      caption: '╭─❏ 📦 「 *{name}@{version}* 」\n┊ ᴛᴀʀʙᴀʟʟ ʀᴇꜱᴍɪ ᴅᴀʀɪ ʀᴇɢɪꜱᴛʀʏ ɴᴘᴍ ({size})\n┊ {desc}\n╰━━━━━━━',
      toolarge: '╭─❏ 📦 「 *{name}@{version}* 」\n┊ Tarballnya kegedean buat dikirim lewat chat ({size}).\n┊ ᴜɴᴅᴜʜ ʟᴀɴɢꜱᴜɴɢ: {url}\n╰━━━━━━━',
      badfile: '╭─❏ 💦 「 *BERKAS TIDAK VALID* 」\n┊ Berkas dari registry bukan tarball gzip yang valid, jadi tidak dikirim.\n┊ ᴛᴀᴜᴛᴀɴ ʀᴇꜱᴍɪ: {url}\n╰━━━━━━━',
    },
  },
  en: {
    npmdl: {
      hint: '╭─❏ 📦 「 *NPM DOWNLOAD* 」\n┊ Write the npm package name first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.npmdl express*\n╰━━━━━━━',
      notfound: '╭─❏ 🔍 「 *PACKAGE NOT FOUND* 」\n┊ Mouu, package *{q}* does not exist on the npm registry~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ Mouu, failed to download the package: *{message}*\n┊ Try again later~\n╰━━━━━━━',
      caption: '╭─❏ 📦 「 *{name}@{version}* 」\n┊ ᴏꜰꜰɪᴄɪᴀʟ ᴛᴀʀʙᴀʟʟ ꜰʀᴏᴍ ᴛʜᴇ ɴᴘᴍ ʀᴇɢɪꜱᴛʀʏ ({size})\n┊ {desc}\n╰━━━━━━━',
      toolarge: '╭─❏ 📦 「 *{name}@{version}* 」\n┊ The tarball is too large to send in chat ({size}).\n┊ ᴅᴏᴡɴʟᴏᴀᴅ ᴅɪʀᴇᴄᴛʟʏ: {url}\n╰━━━━━━━',
      badfile: '╭─❏ 💦 「 *INVALID FILE* 」\n┊ The registry file is not a valid gzip tarball, so it was not sent.\n┊ ᴏꜰꜰɪᴄɪᴀʟ ʟɪɴᴋ: {url}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.npmdl express', expect: /express|tgz|tarball/i }

const MAX_SEND = 12 * 1024 * 1024

export function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

export function isGzip(buf) {
  return Boolean(buf) && buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b
}

export async function handler(ctx) {
  const q = (ctx.text || '').trim().split(/\s+/)[0]
  if (!q) return ctx.reply(ctx.t('npmdl.hint'))
  try {
    const res = await fetch('https://registry.npmjs.org/' + encodeURIComponent(q), {
      signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'KANA-Bot', Accept: 'application/json' },
    })
    if (res.status === 404) return ctx.reply(ctx.t('npmdl.notfound', { q }))
    if (!res.ok) throw new Error('Registry balas HTTP ' + res.status)
    const meta = await res.json()
    const version = meta['dist-tags']?.latest
    const ver = meta.versions?.[version]
    const tarball = ver?.dist?.tarball
    if (!version || !tarball) return ctx.reply(ctx.t('npmdl.notfound', { q }))
    let buf
    try {
      buf = (await downloadBuffer(tarball, { maxBytes: MAX_SEND })).buffer
    } catch {
      return ctx.reply(ctx.t('npmdl.toolarge', { name: meta.name || q, version, size: '> ' + formatSize(MAX_SEND), url: tarball }))
    }
    if (!isGzip(buf)) return ctx.reply(ctx.t('npmdl.badfile', { url: tarball }))
    const caption = ctx.t('npmdl.caption', {
      name: meta.name || q, version, size: formatSize(buf.length),
      desc: ver.description || meta.description || '-',
    })
    return await sendDocument(ctx, buf, { fileName: (meta.name || q).replace(/[@/]/g, '_') + '-' + version + '.tgz', mimetype: 'application/gzip', caption })
  } catch (err) {
    return ctx.reply(ctx.t('npmdl.fail', { message: err.message }))
  }
}
