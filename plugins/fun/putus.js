// Putus: akhiri hubungan dari fitur nembak.
export const config = {
  name: 'putus',
  alias: ['breakup'],
  category: 'fun',
  description: { id: 'Putus dari pasangan fitur nembak', en: 'Break up with your confess-feature partner' },
  usage: '.putus',
  example: '.putus',
  cooldown: 3,
}

export const i18n = {
  id: {
    putus: {
      single: '╭─❏ 💔 「 *PUTUS* 」\n┊ Kamu tidak punya pasangan, jadi tidak ada yang diputus.\n╰━━━━━━━ {mood}',
      done: '╭─❏ 💔 「 *RESMI PUTUS* 」\n┊ Kamu dan *@{partner}* resmi putus.\n┊ Semoga cepat move on yaa~\n╰━━━━━━━',
    },
  },
  en: {
    putus: {
      single: '╭─❏ 💔 「 *BREAK UP* 」\n┊ You have no partner, so there is nothing to break up from.\n╰━━━━━━━ {mood}',
      done: '╭─❏ 💔 「 *OFFICIALLY BROKE UP* 」\n┊ You and *@{partner}* officially broke up.\n┊ Hope you move on soon~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.putus', expect: /pasangan|partner/i }

export async function handler(ctx) {
  const rel = await ctx.storage.get('couples', ctx.senderDigits)
  if (!rel?.partner) return ctx.reply(ctx.t('putus.single', { mood: ctx.say('mikir') }))
  await ctx.storage.delete('couples', ctx.senderDigits)
  await ctx.storage.delete('couples', rel.partner)
  return ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('putus.done', { partner: rel.partner }),
    mentions: [`${rel.partner}@s.whatsapp.net`],
  }, { quoted: ctx.raw })
}
