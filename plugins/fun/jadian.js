// Status hubungan: lihat pasangan kamu (dari .nembak yang diterima).
export const config = {
  name: 'jadian',
  alias: ['statuspacar', 'mypacar'],
  category: 'fun',
  description: { id: 'Lihat status hubungan kamu dari fitur nembak', en: 'See your relationship status from the confess feature' },
  usage: '.jadian',
  example: '.jadian',
  cooldown: 3,
}

export const i18n = {
  id: {
    jadian: {
      single: '╭─❏ 💕 「 *STATUS HUBUNGAN* 」\n┊ Kamu masih jomblo nih~\n┊ Berani nembak seseorang pakai *.nembak @user*?\n╰━━━━━━━ {mood}',
      couple: '╭─❏ 💕 「 *STATUS HUBUNGAN* 」\n┊ Kamu jadian sama *@{partner}*\n┊ ꜱᴇᴊᴀᴋ: *{date}*\n┊ Sudah *{days} hari* bareng~\n╰━━━━━━━',
    },
  },
  en: {
    jadian: {
      single: '╭─❏ 💕 「 *RELATIONSHIP STATUS* 」\n┊ You are still single~\n┊ Dare to confess to someone with *.nembak @user*?\n╰━━━━━━━ {mood}',
      couple: '╭─❏ 💕 「 *RELATIONSHIP STATUS* 」\n┊ You have been dating *@{partner}*\n┊ ᴅᴀᴛɪɴɢ ꜱɪɴᴄᴇ: *{date}*\n┊ That is *{days} days* together~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.jadian', expect: /jomblo|single|jadian|dating/i }

export async function handler(ctx) {
  const rel = await ctx.storage.get('couples', ctx.senderDigits)
  if (!rel?.partner) return ctx.reply(ctx.t('jadian.single', { mood: ctx.say('mikir') }))
  const date = new Date(rel.since).toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID')
  const days = Math.floor((Date.now() - rel.since) / 86400000)
  return ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('jadian.couple', { partner: rel.partner, date, days }),
    mentions: [`${rel.partner}@s.whatsapp.net`],
  }, { quoted: ctx.raw })
}
