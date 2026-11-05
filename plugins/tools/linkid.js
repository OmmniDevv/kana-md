
import { parseWhatsappLink, getChannelMetadataByInvite, getGroupInfoByInvite } from '../../src/services/whatsapp-link.js'

// Linkid: ekstrak ID dari tautan WhatsApp. Tautan saluran memberi kode
// undangan plus ID newsletter beneran (newsletterMetadata invite),
// tautan grup memberi kode undangan plus JID grup (groupGetInviteInfo).
// Ditulis ulang penuh: file lama berisi info paket npm hasil copy-paste
// klon yang tidak ada hubungannya dengan tautan WhatsApp.
export const config = {
  name: "linkid",
  alias: ["idlink", "getidlink"],
  category: "tools",
  description: { id: "Ambil ID WhatsApp dari link channel atau grup", en: "Get the WhatsApp ID from a channel or group link" },
  usage: ".linkid <link channel/grup>",
  example: ".linkid https://whatsapp.com/channel/0029Vb8dmsUElagkVPIw9X2P",
  cooldown: 5,
}

export const i18n = {
  id: {
    "linkid": {
      hint: "╭─❏ 🔗 「 *LINK ID* 」\n┊ Kirim tautan WhatsApp-nya yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.linkid https://whatsapp.com/channel/xxxx*\n┊ ᴀᴛᴀᴜ: *.linkid https://chat.whatsapp.com/xxxx*\n╰━━━━━━━",
      invalid: "╭─❏ 🔗 「 *LINK TIDAK VALID* 」\n┊ Yang didukung cuma tautan saluran *whatsapp.com/channel/...* dan tautan grup *chat.whatsapp.com/...* yaa~\n╰━━━━━━━",
      channel: "╭─❏ 📢 「 *CHANNEL DITEMUKAN* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ɪᴅ: *{id}*\n┊ ᴋᴏᴅᴇ ᴜɴᴅᴀɴɢᴀɴ: *{code}*\n┊ ᴘᴇɴɢɪᴋᴜᴛ: *{subs}*\n╰━━━━━━━",
      channelCodeOnly: "╭─❏ 📢 「 *KODE SALURAN* 」\n┊ ᴋᴏᴅᴇ ᴜɴᴅᴀɴɢᴀɴ: *{code}*\n┊ ID salurannya tidak bisa diambil dari koneksi ini, tapi kodenya valid yaa~\n╰━━━━━━━",
      group: "╭─❏ 👥 「 *GRUP DITEMUKAN* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ɪᴅ: *{id}*\n┊ ᴋᴏᴅᴇ ᴜɴᴅᴀɴɢᴀɴ: *{code}*\n╰━━━━━━━",
      groupCodeOnly: "╭─❏ 👥 「 *KODE GRUP* 」\n┊ ᴋᴏᴅᴇ ᴜɴᴅᴀɴɢᴀɴ: *{code}*\n┊ ID grupnya tidak bisa diambil dari koneksi ini, tapi kodenya valid yaa~\n╰━━━━━━━",
      direct: "╭─❏ 🆔 「 *ID LANGSUNG* 」\n┊ ᴊᴇɴɪꜱ: *{type}*\n┊ ɪᴅ: *{id}*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *LINK ID GAGAL* 」\n┊ Mouu, gagal memeriksa tautannya: *{message}*\n╰━━━━━━━",
    },
  },
  en: {
    "linkid": {
      hint: "╭─❏ 🔗 「 *LINK ID* 」\n┊ Send the WhatsApp link please~\n┊ ᴇxᴀᴍᴘʟᴇ: *.linkid https://whatsapp.com/channel/xxxx*\n┊ ᴏʀ: *.linkid https://chat.whatsapp.com/xxxx*\n╰━━━━━━━",
      invalid: "╭─❏ 🔗 「 *INVALID LINK* 」\n┊ Only channel links *whatsapp.com/channel/...* and group links *chat.whatsapp.com/...* are supported~\n╰━━━━━━━",
      channel: "╭─❏ 📢 「 *CHANNEL FOUND* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ɪᴅ: *{id}*\n┊ ɪɴᴠɪᴛᴇ ᴄᴏᴅᴇ: *{code}*\n┊ ꜰᴏʟʟᴏᴡᴇʀꜱ: *{subs}*\n╰━━━━━━━",
      channelCodeOnly: "╭─❏ 📢 「 *CHANNEL CODE* 」\n┊ ɪɴᴠɪᴛᴇ ᴄᴏᴅᴇ: *{code}*\n┊ The channel ID cannot be fetched on this connection, but the code is valid~\n╰━━━━━━━",
      group: "╭─❏ 👥 「 *GROUP FOUND* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ɪᴅ: *{id}*\n┊ ɪɴᴠɪᴛᴇ ᴄᴏᴅᴇ: *{code}*\n╰━━━━━━━",
      groupCodeOnly: "╭─❏ 👥 「 *GROUP CODE* 」\n┊ ɪɴᴠɪᴛᴇ ᴄᴏᴅᴇ: *{code}*\n┊ The group ID cannot be fetched on this connection, but the code is valid~\n╰━━━━━━━",
      direct: "╭─❏ 🆔 「 *DIRECT ID* 」\n┊ ᴛʏᴘᴇ: *{type}*\n┊ ɪᴅ: *{id}*\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *LINK ID FAILED* 」\n┊ Mouu, failed to check the link: *{message}*\n╰━━━━━━━",
    },
  },
}

export { parseWhatsappLink }
export const test = { input: '.linkid https://chat.whatsapp.com/AbCdEf123', expect: /kode|code|grup|group/i }
export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  if (!raw) return ctx.reply(ctx.t('linkid.hint'))
  const parsed = parseWhatsappLink(raw)
  if (!parsed) return ctx.reply(ctx.t('linkid.invalid'))
  if (parsed.jid) {
    return ctx.reply(ctx.t('linkid.direct', { type: parsed.type === 'channel' ? 'channel/newsletter' : 'group', id: parsed.jid }))
  }
  try {
    if (parsed.type === 'channel') {
      const meta = await getChannelMetadataByInvite(ctx.sock, parsed.code).catch(() => null)
      if (meta?.id) {
        return ctx.reply(ctx.t('linkid.channel', { name: meta.name || '-', id: meta.id, code: parsed.code, subs: meta.subscribers ?? '-' }))
      }
      return ctx.reply(ctx.t('linkid.channelCodeOnly', { code: parsed.code }))
    }
    const info = await getGroupInfoByInvite(ctx.sock, parsed.code).catch(() => null)
    if (info?.id) {
      return ctx.reply(ctx.t('linkid.group', { name: info.name || '-', id: info.id, code: parsed.code }))
    }
    return ctx.reply(ctx.t('linkid.groupCodeOnly', { code: parsed.code }))
  } catch (err) {
    return ctx.reply(ctx.t('linkid.fail', { message: err.message }))
  }
}
