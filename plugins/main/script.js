export const config = {
  name: 'script',
  alias: ['source', 'repo'],
  category: 'main',
  description: { id: 'Info source code bot KANA: repo, lisensi, dan library', en: 'KANA bot source code info: repo, license, and library' },
  usage: '.script',
  example: '.script',
  cooldown: 5,
}

export const i18n = {
  id: {
    script: {
      body: '╭─❏ 🤖 「 *KANA-MD* 」\n┊ Bot WhatsApp moe open source buatan *OmniDevv*.\n┊\n┊ 🔗 ʀᴇᴘᴏ: *https://github.com/OmmniDevv/kana-md*\n┊ 📜 ʟɪꜱᴇɴꜱɪ: *MIT*\n┊ 📚 ʟɪʙʀᴀʀʏ: *@rexxhayanasi/elaina-baileys 1.4.7*\n┊ 🌐 ᴅᴀꜱʜʙᴏᴀʀᴅ: *https://kana.omnicorp.web.id*\n╰━━━━━━━\nSilakan dipelajari, jangan lupa bintang dan kreditnya yaa~ {mood}',
    },
  },
  en: {
    script: {
      body: '╭─❏ 🤖 「 *KANA-MD* 」\n┊ An open source moe WhatsApp bot by *OmniDevv*.\n┊\n┊ 🔗 ʀᴇᴘᴏ: *https://github.com/OmmniDevv/kana-md*\n┊ 📜 ʟɪᴄᴇɴꜱᴇ: *MIT*\n┊ 📚 ʟɪʙʀᴀʀʏ: *@rexxhayanasi/elaina-baileys 1.4.7*\n┊ 🌐 ᴅᴀꜱʜʙᴏᴀʀᴅ: *https://kana.omnicorp.web.id*\n╰━━━━━━━\nFeel free to learn from it, keep the star and credits please~ {mood}',
    },
  },
}

export const test = { input: '.script', expect: /github/i }

export async function handler(ctx) {
  return ctx.reply(ctx.t('script.body', { mood: ctx.say('senang') }))
}
