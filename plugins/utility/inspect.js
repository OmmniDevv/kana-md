
import { parseWhatsappLink, getChannelMetadataByInvite, getGroupInfoByInvite } from '../../src/services/whatsapp-link.js'

// Inspect: periksa tautan grup/saluran WhatsApp jadi info nyata.
// Grup via sock.groupGetInviteInfo(kode) dan saluran via
// sock.newsletterMetadata('invite', kode), keduanya method library
// @rexxhayanasi/elaina-baileys per README-nya. Ditulis ulang penuh:
// file lama berisi info paket npm hasil copy-paste klon.
export const config = {
  name: "inspect",
  alias: ["cekgrup", "ceksaluran", "channelinfo"],
  category: "utility",
  description: { id: "Inspect info grup atau saluran WhatsApp via link", en: "Inspect a WhatsApp group or channel info via its link" },
  usage: ".inspect <link grup/saluran>",
  example: ".inspect https://chat.whatsapp.com/xxx",
  cooldown: 5,
}

export const i18n = {
  id: {
    "inspect": {
      hint: "╭─❏ 🔍 「 *INSPECT* 」\n┊ Kirim tautan grup atau salurannya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.inspect https://chat.whatsapp.com/xxxx*\n╰━━━━━━━",
      invalid: "╭─❏ 🔍 「 *LINK TIDAK VALID* 」\n┊ Yang didukung cuma tautan grup *chat.whatsapp.com/...* dan saluran *whatsapp.com/channel/...* yaa~\n╰━━━━━━━",
      group: "╭─❏ 👥 「 *INFO GRUP* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ɪᴅ: *{id}*\n┊ ᴘᴇᴍɪʟɪᴋ: *{owner}*\n┊ ᴘᴇꜱᴇʀᴛᴀ: *{count}*\n┊ ᴅɪʙᴜᴀᴛ: *{created}*\n┊ {desc}\n╰━━━━━━━",
      channel: "╭─❏ 📢 「 *INFO SALURAN* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ɪᴅ: *{id}*\n┊ ᴘᴇɴɢɪᴋᴜᴛ: *{subs}*\n┊ {desc}\n╰━━━━━━━",
      unavailable: "╭─❏ 🔍 「 *TIDAK BISA DIPERIKSA* 」\n┊ Koneksi bot ini tidak menyediakan cara memeriksa tautan itu~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *INSPECT GAGAL* 」\n┊ Mouu, gagal memeriksa tautannya: *{message}*\n┊ Tautannya mungkin sudah dicabut atau kedaluwarsa~\n╰━━━━━━━",
    },
  },
  en: {
    "inspect": {
      hint: "╭─❏ 🔍 「 *INSPECT* 」\n┊ Send the group or channel link please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.inspect https://chat.whatsapp.com/xxxx*\n╰━━━━━━━",
      invalid: "╭─❏ 🔍 「 *INVALID LINK* 」\n┊ Only group links *chat.whatsapp.com/...* and channel links *whatsapp.com/channel/...* are supported~\n╰━━━━━━━",
      group: "╭─❏ 👥 「 *GROUP INFO* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ɪᴅ: *{id}*\n┊ ᴏᴡɴᴇʀ: *{owner}*\n┊ ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛꜱ: *{count}*\n┊ ᴄʀᴇᴀᴛᴇᴅ: *{created}*\n┊ {desc}\n╰━━━━━━━",
      channel: "╭─❏ 📢 「 *CHANNEL INFO* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ɪᴅ: *{id}*\n┊ ꜰᴏʟʟᴏᴡᴇʀꜱ: *{subs}*\n┊ {desc}\n╰━━━━━━━",
      unavailable: "╭─❏ 🔍 「 *CANNOT INSPECT* 」\n┊ This bot connection does not provide a way to inspect that link~\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *INSPECT FAILED* 」\n┊ Mouu, failed to inspect the link: *{message}*\n┊ The link may have been revoked or expired~\n╰━━━━━━━",
    },
  },
}

export { parseWhatsappLink }
export const test = { input: '.inspect https://chat.whatsapp.com/AbCdEf123', expect: /info grup|group info|kode|gagal|failed/i }
export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  if (!raw) return ctx.reply(ctx.t('inspect.hint'))
  const parsed = parseWhatsappLink(raw)
  if (!parsed) return ctx.reply(ctx.t('inspect.invalid'))
  try {
    if (parsed.type === 'group') {
      let info = null
      if (parsed.code) info = await getGroupInfoByInvite(ctx.sock, parsed.code)
      else if (parsed.jid && typeof ctx.sock?.groupMetadata === 'function') {
        const meta = await ctx.sock.groupMetadata(parsed.jid)
        info = { id: meta.id, name: meta.subject, owner: meta.owner || '', participants: meta.participants ?? [], size: meta.size ?? meta.participants?.length, description: meta.desc || '', creation: meta.creation ?? null }
      }
      if (!info?.id) return ctx.reply(ctx.t('inspect.unavailable'))
      const ownerDigits = String(info.owner || '').split('@')[0]
      const created = info.creation ? new Date(info.creation * 1000).toLocaleString(ctx.lang === 'en' ? 'en-GB' : 'id-ID', { timeZone: 'Asia/Jakarta' }) : '-'
      const body = ctx.t('inspect.group', {
        name: info.name || '-', id: info.id, owner: ownerDigits ? `@${ownerDigits}` : '-',
        count: info.size ?? info.participants?.length ?? 0, created, desc: info.description || '-',
      })
      const mentions = info.owner ? [info.owner] : []
      if (mentions.length) return ctx.sock.sendMessage(ctx.chat, { text: body, mentions }, { quoted: ctx.raw })
      return ctx.reply(body)
    }
    let meta = null
    if (parsed.code) meta = await getChannelMetadataByInvite(ctx.sock, parsed.code)
    else if (parsed.jid && typeof ctx.sock?.newsletterMetadata === 'function') {
      const rawMeta = await ctx.sock.newsletterMetadata('jid', parsed.jid)
      const thread = rawMeta?.thread_metadata ?? rawMeta ?? {}
      meta = { id: rawMeta?.id || parsed.jid, name: thread.name?.text || thread.name || '', subscribers: thread.subscribers_count ?? null, description: thread.description?.text || thread.description || '' }
    }
    if (!meta?.id) return ctx.reply(ctx.t('inspect.unavailable'))
    return ctx.reply(ctx.t('inspect.channel', { name: meta.name || '-', id: meta.id, subs: meta.subscribers ?? '-', desc: meta.description || '-' }))
  } catch (err) {
    return ctx.reply(ctx.t('inspect.fail', { message: err.message }))
  }
}
