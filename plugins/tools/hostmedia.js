// Daftar layanan host berkas populer untuk media WhatsApp beserta
// batas ukurannya. Data ringkasan umum agar pengguna bisa memilih
// tempat unggah sebelum memakai .upload atau .tourl.
export const config = {
  name: 'hostmedia',
  alias: ['mediahost', 'hostingmedia'],
  category: 'tools',
  description: { id: 'Daftar layanan host media dan batas ukuran unggahnya', en: 'List of media hosting services and their upload size limits' },
  usage: '.hostmedia',
  example: '.hostmedia',
  cooldown: 5,
}

export const i18n = {
  id: {
    hostmedia: {
      body: '╭─❏ 🗄️ 「 *HOST MEDIA POPULER* 」\n┊ 1. *uguu.se* (dipakai .upload)\n┊ ᴜᴋᴜʀᴀɴ ᴍᴀᴋꜱ ±128 ᴍʙ, ʙᴇʀᴋᴀꜱ ꜱᴇᴍᴇɴᴛᴀʀᴀ 3 ᴊᴀᴍ\n┊ 2. *Catbox (catbox.moe)*\n┊ ᴜᴋᴜʀᴀɴ ᴍᴀᴋꜱ 200 ᴍʙ, ᴘᴇʀᴍᴀɴᴇɴ, ᴡᴀᴊɪʙ ᴅᴀꜰᴛᴀʀ ᴜɴᴛᴜᴋ ꜰɪᴛᴜʀ ᴘᴇɴᴜʜ\n┊ 3. *Litterbox (litterbox.catbox.moe)*\n┊ ᴠᴇʀꜱɪ ꜱᴇᴍᴇɴᴛᴀʀᴀ ᴄᴀᴛʙᴏx, 1 ɢʙ, 1 ꜱᴀᴍᴘᴀɪ 3 ʜᴀʀɪ\n┊ 4. *tmpfiles.org*\n┊ ᴜᴋᴜʀᴀɴ ᴍᴀᴋꜱ 100 ᴍʙ, ᴋᴇᴅᴀʟᴜᴡᴀʀꜱᴀ 60 ᴍᴇɴɪᴛ\n┊ 5. *file.io*\n┊ ʙᴇʀᴋᴀꜱ ᴛᴇʀʜᴀᴘᴜꜱ ᴏᴛᴏᴍᴀᴛɪꜱ ꜱᴇᴛᴇʟᴀʜ ᴅɪᴜɴᴅᴜʜ\n┊ ᴄᴀᴛᴀᴛᴀɴ: 0x0.ꜱᴛ ꜱᴇᴅᴀɴɢ ᴍᴇɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ ᴜɴɢɢᴀʜᴀɴ ᴘᴜʙʟɪᴋ.\n┊ ᴜɴɢɢᴀʜ ʟᴀɴɢꜱᴜɴɢ ᴅᴀʀɪ ʙᴏᴛ: ᴋᴇᴛɪᴋ *.upload* ꜱᴀᴍʙɪʟ ᴋɪʀɪᴍ ᴍᴇᴅɪᴀ.\n╰━━━━━━━',
    },
  },
  en: {
    hostmedia: {
      body: '╭─❏ 🗄️ 「 *POPULAR MEDIA HOSTS* 」\n┊ 1. *uguu.se* (used by .upload)\n┊ ᴍᴀx ±128 ᴍʙ, ꜰɪʟᴇꜱ ʟᴀꜱᴛ 3 ʜᴏᴜʀꜱ\n┊ 2. *Catbox (catbox.moe)*\n┊ ᴍᴀx 200 ᴍʙ, ᴘᴇʀᴍᴀɴᴇɴᴛ, ᴀᴄᴄᴏᴜɴᴛ ɴᴇᴇᴅᴇᴅ ꜰᴏʀ ꜰᴜʟʟ ꜰᴇᴀᴛᴜʀᴇꜱ\n┊ 3. *Litterbox (litterbox.catbox.moe)*\n┊ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴄᴀᴛʙᴏx, 1 ɢʙ, 1 ᴛᴏ 3 ᴅᴀʏꜱ\n┊ 4. *tmpfiles.org*\n┊ ᴍᴀx 100 ᴍʙ, ᴇxᴘɪʀᴇꜱ ɪɴ 60 ᴍɪɴᴜᴛᴇꜱ\n┊ 5. *file.io*\n┊ ꜰɪʟᴇꜱ ᴅᴇʟᴇᴛᴇᴅ ᴀꜰᴛᴇʀ ᴛʜᴇ ꜰɪʀꜱᴛ ᴅᴏᴡɴʟᴏᴀᴅ\n┊ ɴᴏᴛᴇ: 0x0.ꜱᴛ ᴄᴜʀʀᴇɴᴛʟʏ ᴅɪꜱᴀʙʟᴇᴅ ᴘᴜʙʟɪᴄ ᴜᴘʟᴏᴀᴅꜱ.\n┊ ᴜᴘʟᴏᴀᴅ ꜰʀᴏᴍ ᴛʜᴇ ʙᴏᴛ: ᴛʏᴘᴇ *.upload* ᴡɪᴛʜ ᴀ ᴍᴇᴅɪᴀ.\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.hostmedia', expect: /HOST MEDIA|MEDIA HOSTS/ }

export async function handler(ctx) {
  return ctx.reply(ctx.t('hostmedia.body'))
}
