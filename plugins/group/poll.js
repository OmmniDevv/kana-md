export const config = {
  name: 'poll',
  alias: ['polling'],
  category: 'group',
  description: { id: 'Buat polling di grup', en: 'Create a poll in the group' },
  usage: '.poll <pertanyaan> | opsi1 | opsi2 | ...',
  example: '.poll Makan apa? | Nasi goreng | Mie ayam',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    poll: {
      usage: '╭─❏ 🗳️ 「 *POLLING GRUP* 」\n┊ Pakai: *.poll Pertanyaan | opsi 1 | opsi 2*\n┊ Minimal *2* opsi, maksimal *12* yaa~\n╰━━━━━━━',
      tooFew: '╭─❏ 🗳️ 「 *OPSINYA KURANG* 」\n┊ Opsinya kurang nih, minimal *2* opsi yaa~\n╰━━━━━━━',
      tooMany: '╭─❏ 🗳️ 「 *OPSINYA KEBANYAKAN* 」\n┊ Opsinya kebanyakan, maksimal *12* yaa~\n╰━━━━━━━',
      fallback: '╭─❏ 🗳️ 「 *POLLING GRUP* 」\n┊ Polling asli gagal terkirim, ini versi teksnya yaa~\n┊ *{question}*\n┊ {options}\n╰━━━━━━━\nBalas dengan nomor opsinya~',
      optionLine: '{index}. {option}',
    },
  },
  en: {
    poll: {
      usage: '╭─❏ 🗳️ 「 *GROUP POLL* 」\n┊ Use: *.poll Question | option 1 | option 2*\n┊ Minimum *2* options, maximum *12*~\n╰━━━━━━━',
      tooFew: '╭─❏ 🗳️ 「 *NOT ENOUGH OPTIONS* 」\n┊ Not enough options, minimum *2* please~\n╰━━━━━━━',
      tooMany: '╭─❏ 🗳️ 「 *TOO MANY OPTIONS* 」\n┊ Too many options, maximum *12* please~\n╰━━━━━━━',
      fallback: '╭─❏ 🗳️ 「 *GROUP POLL* 」\n┊ The real poll failed to send, here is the text version~\n┊ *{question}*\n┊ {options}\n╰━━━━━━━\nReply with the option number~',
      optionLine: '{index}. {option}',
    },
  },
}

export function parsePoll(text) {
  const parts = String(text ?? '').split('|').map((s) => s.trim()).filter(Boolean)
  const [question, ...values] = parts
  return { question: question || '', values }
}

export const test = { input: '.poll', expect: /grup|group/i }

export async function handler(ctx) {
  const { question, values } = parsePoll(ctx.text)
  if (!question || !values.length) return ctx.reply(ctx.t('poll.usage'))
  if (values.length < 2) return ctx.reply(ctx.t('poll.tooFew'))
  if (values.length > 12) return ctx.reply(ctx.t('poll.tooMany'))
  try {
    await ctx.sock.sendMessage(ctx.chat, { poll: { name: question, values, selectableCount: 1 } })
  } catch {
    const options = values.map((option, i) => ctx.t('poll.optionLine', { index: i + 1, option })).join('\n┊ ')
    await ctx.reply(ctx.t('poll.fallback', { question, options }))
  }
}
