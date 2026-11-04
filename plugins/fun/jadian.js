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
      single: 'Kamu masih jomblo. Berani nembak seseorang pakai .nembak @user? {mood}',
      couple: '💕 Kamu jadian sama @{partner} sejak {date}. Sudah {days} hari bareng~',
    },
  },
  en: {
    jadian: {
      single: 'You are still single. Dare to confess to someone with .nembak @user? {mood}',
      couple: '💕 You have been dating @{partner} since {date}. That is {days} days together~',
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
