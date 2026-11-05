import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'

export const config = {
  name: 'getpp',
  alias: ['ambillpp', 'ppgrup'],
  category: 'group',
  description: { id: 'Ambil foto profil grup, atau foto profil user yang di-tag', en: 'Get the group profile picture, or the tagged user profile picture' },
  usage: '.getpp [@user]',
  example: '.getpp',
  cooldown: 5,
}

export const i18n = {
  id: {
    getpp: {
      captionGroup: '╭─❏ 🖼️ 「 *FOTO PROFIL GRUP* 」\n┊ Ini foto profil grupnya yaa~\n╰━━━━━━━ {mood}',
      captionUser: '╭─❏ 🖼️ 「 *FOTO PROFIL* 」\n┊ Ini foto profil *@{digits}* yaa~\n╰━━━━━━━ {mood}',
      notFound: '╭─❏ 🔍 「 *FOTO PROFIL TIDAK KETEMU* 」\n┊ Foto profilnya tidak ketemu atau disembunyikan pengaturannya~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *GAGAL AMBIL FOTO* 」\n┊ Gagal ambil foto profil: {error}\n╰━━━━━━━',
    },
  },
  en: {
    getpp: {
      captionGroup: '╭─❏ 🖼️ 「 *GROUP PROFILE PICTURE* 」\n┊ Here is the group profile picture~\n╰━━━━━━━ {mood}',
      captionUser: '╭─❏ 🖼️ 「 *PROFILE PICTURE* 」\n┊ Here is the profile picture of *@{digits}*~\n╰━━━━━━━ {mood}',
      notFound: '╭─❏ 🔍 「 *PROFILE PICTURE NOT FOUND* 」\n┊ The profile picture was not found or is hidden by privacy settings~\n╰━━━━━━━ {mood}',
      fail: '╭─❏ ⚠️ 「 *FAILED TO GET PICTURE* 」\n┊ Failed to get the profile picture: {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.getpp 6285869074622', expect: /.+/ }

export async function handler(ctx) {
  const target = ctx.mentionedJids?.[0] ?? ctx.chat
  const isUser = target !== ctx.chat
  let url = null
  try {
    url = await ctx.sock.profilePictureUrl(target, 'image')
  } catch {
    url = null
  }
  if (!url) return ctx.reply(ctx.t('getpp.notFound', { mood: ctx.say('malu') }))
  try {
    const media = await downloadBuffer(url, { maxBytes: 5 * 1024 * 1024 })
    const caption = isUser
      ? ctx.t('getpp.captionUser', { digits: target.split('@')[0], mood: ctx.say('senang') })
      : ctx.t('getpp.captionGroup', { mood: ctx.say('senang') })
    return sendImage(ctx, media.buffer, { caption })
  } catch (err) {
    return ctx.reply(ctx.t('getpp.fail', { error: err.message }))
  }
}
