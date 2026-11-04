// Email sementara via mail.tm (API publik gratis tanpa kunci akun):
// .tempmail membuat alamat, .tempmail inbox membaca kotak masuknya.
// Kredensial akun disimpan per pengguna di namespace 'tempmail'.
const API = 'https://api.mail.tm'

export const config = {
  name: 'tempmail',
  alias: ['tempmailbox', 'emailtemp'],
  category: 'user',
  description: { id: 'Email sementara: buat alamat sekali pakai dan baca inbox-nya', en: 'Temporary email: create a disposable address and read its inbox' },
  usage: '.tempmail [inbox]',
  example: '.tempmail',
  cooldown: 10,
}

export const i18n = {
  id: {
    tempmail: {
      created: '╭─❏ 📧 「 *EMAIL SEMENTARA KAMU* 」\n┊ ᴀʟᴀᴍᴀᴛ: *{address}*\n╰━━━━━━━\nAlamat ini siap menerima email. Cek inbox pakai *.tempmail inbox* yaa~',
      exists: '╭─❏ 📧 「 *EMAIL SEMENTARA KAMU* 」\n┊ ᴀʟᴀᴍᴀᴛ: *{address}*\n╰━━━━━━━\nEmail sementaramu sudah ada. Cek inbox pakai *.tempmail inbox* yaa~',
      needCreate: '╭─❏ 📧 「 *EMAIL SEMENTARA* 」\n┊ Kamu belum punya email sementara.\n┊ Buat dulu pakai *.tempmail* yaa~\n╰━━━━━━━',
      empty: '╭─❏ 📭 「 *INBOX KOSONG* 」\n┊ Inbox *{address}* masih kosong.\n╰━━━━━━━',
      inboxHead: '╭─❏ 📬 「 *INBOX* 」\n┊ ᴀʟᴀᴍᴀᴛ: *{address}*\n┊ ᴊᴜᴍʟᴀʜ: *{count} pesan*',
      item: '┊ {n}. ᴅᴀʀɪ: *{from}*\n┊ ꜱᴜʙᴊᴇᴋ: {subject}',
      fail: '╭─❏ ⚠️ 「 *EMAIL GAGAL* 」\n┊ Gagal urus email sementaranya: *{error}*\n╰━━━━━━━',
    },
  },
  en: {
    tempmail: {
      created: '╭─❏ 📧 「 *YOUR TEMPORARY EMAIL* 」\n┊ ᴀᴅᴅʀᴇꜱꜱ: *{address}*\n╰━━━━━━━\nThis address is ready to receive mail. Check the inbox with *.tempmail inbox*~',
      exists: '╭─❏ 📧 「 *YOUR TEMPORARY EMAIL* 」\n┊ ᴀᴅᴅʀᴇꜱꜱ: *{address}*\n╰━━━━━━━\nYour temporary email already exists. Check the inbox with *.tempmail inbox*~',
      needCreate: '╭─❏ 📧 「 *TEMPORARY EMAIL* 」\n┊ You do not have a temporary email yet.\n┊ Create one with *.tempmail* first~\n╰━━━━━━━',
      empty: '╭─❏ 📭 「 *EMPTY INBOX* 」\n┊ Inbox *{address}* is still empty.\n╰━━━━━━━',
      inboxHead: '╭─❏ 📬 「 *INBOX* 」\n┊ ᴀᴅᴅʀᴇꜱꜱ: *{address}*\n┊ ᴄᴏᴜɴᴛ: *{count} messages*',
      item: '┊ {n}. ꜰʀᴏᴍ: *{from}*\n┊ ꜱᴜʙᴊᴇᴄᴛ: {subject}',
      fail: '╭─❏ ⚠️ 「 *EMAIL FAILED* 」\n┊ Failed to handle the temporary email: *{error}*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.tempmail', expect: /email|inbox/i }

function randomPassword() {
  return `kana-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

async function api(path, { token, method = 'GET', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`mail.tm HTTP ${res.status}`)
  return res.status === 204 ? null : res.json()
}

export async function handler(ctx) {
  const sub = (ctx.text || '').trim().toLowerCase()
  const saved = await ctx.storage.get('tempmail', ctx.senderDigits)
  try {
    if (sub === 'inbox') {
      if (!saved) return ctx.reply(ctx.t('tempmail.needCreate'))
      const auth = await api('/token', { method: 'POST', body: { address: saved.address, password: saved.password } })
      const list = await api('/messages?page=1', { token: auth.token })
      const messages = list['hydra:member'] ?? []
      if (!messages.length) return ctx.reply(ctx.t('tempmail.empty', { address: saved.address }))
      const lines = messages.slice(0, 8).map((msg, i) => ctx.t('tempmail.item', {
        n: i + 1,
        from: msg.from?.address ?? '-',
        subject: (msg.subject || '-').slice(0, 70),
      }))
      return ctx.reply(`${ctx.t('tempmail.inboxHead', { address: saved.address, count: messages.length })}\n${lines.join('\n')}\n╰━━━━━━━`)
    }
    if (saved) return ctx.reply(ctx.t('tempmail.exists', { address: saved.address }))
    const domains = await api('/domains')
    const domain = domains['hydra:member']?.[0]?.domain
    if (!domain) throw new Error('mail.tm tidak punya domain aktif')
    const address = `kana${Math.random().toString(36).slice(2, 10)}@${domain}`
    const password = randomPassword()
    await api('/accounts', { method: 'POST', body: { address, password } })
    await ctx.storage.set('tempmail', ctx.senderDigits, { address, password })
    return ctx.reply(ctx.t('tempmail.created', { address }))
  } catch (err) {
    return ctx.reply(ctx.t('tempmail.fail', { error: err.message }))
  }
}
