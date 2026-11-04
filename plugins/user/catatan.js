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
      usage: 'Pakai gini yaa:\n.catatan simpan <judul> = <isi>\n.catatan lihat <judul>\n.catatan hapus <judul>\n.catatan list',
      badTitle: 'Judulnya kepanjangan nih, maksimal 30 karakter yaa~',
      saved: 'Catatan "{title}" tersimpan~ 📝 (•̀ᴗ•́)و',
      empty: 'Kamu belum punya catatan nih~ Simpan pakai .catatan simpan <judul> = <isi> yaa 🌸',
      listTitle: '📝 Catatan {name}:',
      listItem: '• {title}',
      show: '📝 {title}\n{text}',
      notFound: 'Catatan "{title}" nggak ketemu (╥﹏╥) Cek .catatan list dulu yaa~',
      deleted: 'Catatan "{title}" dihapus~',
      btnList: 'Daftar Catatan',
      btnMenu: 'Menu User',
    },
  },
  en: {
    catatan: {
      usage: 'Use it like this:\n.catatan simpan <title> = <content>\n.catatan lihat <title>\n.catatan hapus <title>\n.catatan list',
      badTitle: 'That title is too long, maximum 30 characters~',
      saved: 'Note "{title}" saved~ 📝 (•̀ᴗ•́)و',
      empty: 'You have no notes yet~ Save one with .catatan simpan <title> = <content> 🌸',
      listTitle: '📝 {name} notes:',
      listItem: '• {title}',
      show: '📝 {title}\n{text}',
      notFound: 'Note "{title}" was not found (╥﹏╥) Check .catatan list first~',
      deleted: 'Note "{title}" deleted~',
      btnList: 'Note List',
      btnMenu: 'User Menu',
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
      { text: ctx.t('catatan.btnMenu'), id: '.menu user' },
    ],
    textFallback: body,
  })
}

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
    ].join('\n')
    return withButtons(ctx, body)
  }

  return ctx.reply(ctx.t('catatan.usage'))
}
