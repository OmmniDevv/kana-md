import { getGroupSettings } from '../../src/services/group-service.js'

export const config = {
  name: 'cekonlyadmin',
  alias: ['onlyadminstatus'],
  category: 'group',
  description: { id: 'Cek status mode onlyadmin di grup (bot hanya melayani admin grup)', en: 'Check the group onlyadmin mode status (bot serves group admins only)' },
  usage: '.cekonlyadmin',
  example: '.cekonlyadmin',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    cekonlyadmin: {
      body: '╭─❏ 🔒 「 *STATUS ONLYADMIN* 」\n┊ ᴍᴏᴅᴇ ᴏɴʟʏᴀᴅᴍɪɴ: *{status}*\n┊ ᴍᴏᴅᴇ ʙᴏᴛ ꜱᴇᴋᴀʀᴀɴɢ: *{mode}*\n┊ {desc}\n┊ Ubah lewat *.botmode admin* atau *.botmode publik* (khusus admin grup)\n╰━━━━━━━ {mood}',
      on: 'AKTIF', off: 'NONAKTIF',
      descOn: 'Hanya admin grup yang bisa menggunakan bot di grup ini~',
      descOff: 'Semua member grup bisa menggunakan bot di grup ini~',
    },
  },
  en: {
    cekonlyadmin: {
      body: '╭─❏ 🔒 「 *ONLYADMIN STATUS* 」\n┊ ᴏɴʟʏᴀᴅᴍɪɴ ᴍᴏᴅᴇ: *{status}*\n┊ ᴄᴜʀʀᴇɴᴛ ʙᴏᴛ ᴍᴏᴅᴇ: *{mode}*\n┊ {desc}\n┊ Change it with *.botmode admin* or *.botmode public* (group admins only)\n╰━━━━━━━ {mood}',
      on: 'ON', off: 'OFF',
      descOn: 'Only group admins can use the bot in this group~',
      descOff: 'All group members can use the bot in this group~',
    },
  },
}

export const test = { input: '.cekonlyadmin', expect: /STATUS ONLYADMIN|ONLYADMIN STATUS/ }

export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const mode = settings.botMode || 'publik'
  const onlyAdmin = mode === 'admin'
  return ctx.reply(ctx.t('cekonlyadmin.body', {
    status: ctx.t(onlyAdmin ? 'cekonlyadmin.on' : 'cekonlyadmin.off'),
    mode,
    desc: ctx.t(onlyAdmin ? 'cekonlyadmin.descOn' : 'cekonlyadmin.descOff'),
    mood: ctx.say('senang'),
  }))
}
