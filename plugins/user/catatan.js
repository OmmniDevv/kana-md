import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'catatan',
  alias: ['note'],
  category: 'user',
  description: { id: 'Simpan dan baca catatan pribadi berdasarkan judul', en: 'Save and read personal notes by title' },
  usage: '.catatan [simpan <judul> = <isi>|lihat <judul>|hapus <judul>|list]',
  example: '.catatan simpan wifi = sandinya di kulkas',
  cooldown: 3,
}

export const i18n = {
  id: {
    catatan: {
      usage: '╭─❏ 📝 「 *CATATAN* 」\n┊ Pakai gini yaa:\n┊ .catatan simpan <judul> = <isi>\n┊ .catatan lihat <judul>\n┊ .catatan hapus <judul>\n┊ .catatan list\n╰━━━━━━━',
      badTitle: '╭─❏ ⚠️ 「 *JUDUL KEPANJANGAN* 」\n┊ Judulnya kepanjangan nih, maksimal 30 karakter yaa~\n╰━━━━━━━',
      saved: '╭─❏ 📝 「 *CATATAN TERSIMPAN* 」\n┊ *"{title}"* tersimpan~ (•̀ᴗ•́)و\n╰━━━━━━━',
      empty: '╭─❏ 📝 「 *CATATAN KAMU* 」\n┊ Kamu belum punya catatan nih~\n┊ Simpan pakai *.catatan simpan <judul> = <isi>* yaa 🌸\n╰━━━━━━━',
      listTitle: '╭─❏ 📝 「 *CATATAN {name}* 」',
      listItem: '┊ • {title}',
      show: '╭─❏ 📝 「 *{title}* 」\n┊ {text}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *CATATAN TIDAK KETEMU* 」\n┊ *"{title}"* nggak ketemu (╥﹏╥)\n┊ Cek *.catatan list* dulu yaa~\n╰━━━━━━━',
      deleted: '╭─❏ 🗑️ 「 *CATATAN DIHAPUS* 」\n┊ *"{title}"* dihapus~\n╰━━━━━━━',
      btnList: 'Daftar Catatan',
    },
  },
  en: {
    catatan: {
      usage: '╭─❏ 📝 「 *NOTES* 」\n┊ Use it like this:\n┊ .catatan simpan <title> = <content>\n┊ .catatan lihat <title>\n┊ .catatan hapus <title>\n┊ .catatan list\n╰━━━━━━━',
      badTitle: '╭─❏ ⚠️ 「 *TITLE TOO LONG* 」\n┊ That title is too long, maximum 30 characters~\n╰━━━━━━━',
      saved: '╭─❏ 📝 「 *NOTE SAVED* 」\n┊ *"{title}"* saved~ (•̀ᴗ•́)و\n╰━━━━━━━',
      empty: '╭─❏ 📝 「 *YOUR NOTES* 」\n┊ You have no notes yet~\n┊ Save one with *.catatan simpan <title> = <content>* 🌸\n╰━━━━━━━',
      listTitle: '╭─❏ 📝 「 *{name} NOTES* 」',
      listItem: '• {title}',
      show: '╭─❏ 📝 「 *{title}* 」\n┊ {text}\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *NOTE NOT FOUND* 」\n┊ *"{title}"* was not found (╥﹏╥)\n┊ Check *.catatan list* first~\n╰━━━━━━━',
      deleted: '╭─❏ 🗑️ 「 *NOTE DELETED* 」\n┊ *"{title}"* deleted~\n╰━━━━━━━',
      btnList: 'Note List',
    },
  },
}

const key = (digits) => `notes:${digits}`

async function loadNotes(ctx) {
  const saved = await ctx.storage.get('kv', key(ctx.senderDigits))
  return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
}

async function withButtons(ctx, body) {
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('catatan.btnList'), id: '.catatan list' },
    ],
    textFallback: body,
  })
}

export const test = { input: '.catatan catatan tes dari sapuan live KANA', expect: /.+/ }

export async function handler(ctx) {
  const sub = (ctx.args[0] || 'list').toLowerCase()
  const notes = await loadNotes(ctx)

  if (sub === 'simpan') {
    const rest = ctx.text.slice(ctx.args[0].length).trim()
    const eq = rest.indexOf('=')
    if (eq < 0) return ctx.reply(ctx.t('catatan.usage'))
    const title = rest.slice(0, eq).trim().toLowerCase()
    const text = rest.slice(eq + 1).trim()
    if (!title || !text) return ctx.reply(ctx.t('catatan.usage'))
    if (title.length > 30) return ctx.reply(ctx.t('catatan.badTitle'))
    notes[title] = { text, at: Date.now() }
    await ctx.storage.set('kv', key(ctx.senderDigits), notes)
    return withButtons(ctx, ctx.t('catatan.saved', { title }))
  }

  if (sub === 'lihat') {
    const title = ctx.args.slice(1).join(' ').trim().toLowerCase()
    if (!title) return ctx.reply(ctx.t('catatan.usage'))
    const note = notes[title]
    if (!note) return ctx.reply(ctx.t('catatan.notFound', { title }))
    return withButtons(ctx, ctx.t('catatan.show', { title, text: note.text }))
  }

  if (sub === 'hapus') {
    const title = ctx.args.slice(1).join(' ').trim().toLowerCase()
    if (!title) return ctx.reply(ctx.t('catatan.usage'))
    if (!notes[title]) return ctx.reply(ctx.t('catatan.notFound', { title }))
    delete notes[title]
    await ctx.storage.set('kv', key(ctx.senderDigits), notes)
    return withButtons(ctx, ctx.t('catatan.deleted', { title }))
  }

  if (sub === 'list') {
    const titles = Object.keys(notes)
    if (!titles.length) return withButtons(ctx, ctx.t('catatan.empty'))
    const body = [
      ctx.t('catatan.listTitle', { name: ctx.pushName || ctx.senderDigits }),
      ...titles.map((title) => ctx.t('catatan.listItem', { title })),
      '╰━━━━━━━',
    ].join('\n')
    return withButtons(ctx, body)
  }

  return ctx.reply(ctx.t('catatan.usage'))
}
