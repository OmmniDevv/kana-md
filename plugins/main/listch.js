export const config = {
  name: 'listch',
  alias: [],
  category: 'main',
  description: { id: 'Daftar saluran (channel) WhatsApp yang diikuti akun bot', en: 'List of WhatsApp channels followed by the bot account' },
  usage: '.listch',
  example: '.listch',
  cooldown: 5,
}

export const i18n = {
  id: {
    listch: {
      header: '╭─❏ 📣 「 *SALURAN DIIKUTI ({count})* 」',
      row: '┊ {index}. *{name}*\n┊    {id}',
      footer: '╰━━━━━━━',
      empty: '╭─❏ 📣 「 *SALURAN DIIKUTI* 」\n┊ Akun bot belum mengikuti saluran apa pun~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    listch: {
      header: '╭─❏ 📣 「 *FOLLOWED CHANNELS ({count})* 」',
      row: '┊ {index}. *{name}*\n┊    {id}',
      footer: '╰━━━━━━━',
      empty: '╭─❏ 📣 「 *FOLLOWED CHANNELS* 」\n┊ The bot account does not follow any channel yet~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.listch', expect: /saluran|channel/i }

const MAX_ROWS = 30

// Nama channel dari metadata newsletter: bentuknya bisa string polos
// atau objek teks bertingkat, jadi dibaca defensif seperti referensi.
export function channelName(ch) {
  let name = ch?.name?.text || ch?.thread_metadata?.name?.text || ch?.name || ch?.thread_metadata?.name || ''
  if (typeof name !== 'string') name = ''
  return name.trim() || 'Unknown Channel'
}

export async function handler(ctx) {
  try {
    if (typeof ctx.sock?.newsletterSubscribed !== 'function') {
      return ctx.reply(ctx.t('listch.fail', { error: 'newsletterSubscribed tidak tersedia di library' }))
    }
    const res = await ctx.sock.newsletterSubscribed()
    const channels = Array.isArray(res) ? res.filter((ch) => ch?.id) : []
    if (!channels.length) return ctx.reply(ctx.t('listch.empty'))
    const lines = [ctx.t('listch.header', { count: channels.length })]
    channels.slice(0, MAX_ROWS).forEach((ch, i) => {
      lines.push(ctx.t('listch.row', { index: i + 1, name: channelName(ch), id: ch.id }))
    })
    lines.push(ctx.t('listch.footer'))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('listch.fail', { error: err.message }))
  }
}
