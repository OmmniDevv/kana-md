import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'todo',
  alias: [],
  category: 'user',
  description: { id: 'Kelola daftar tugas pribadi kamu', en: 'Manage your personal todo list' },
  usage: '.todo [add <teks>|list|done <n>|del <n>|clear]',
  example: '.todo add beli kopi',
  cooldown: 3,
}

export const i18n = {
  id: {
    todo: {
      usage: '╭─❏ 📝 「 *CARA PAKAI TODO* 」\n┊ .todo add <tugas>\n┊ .todo list\n┊ .todo done <nomor>\n┊ .todo del <nomor>\n┊ .todo clear\n╰━━━━━━━',
      empty: '╭─❏ 📝 「 *DAFTAR TUGAS* 」\n┊ Daftar tugasmu masih kosong nih~\n┊ Tambah pakai *.todo add <tugas>* yaa 🌸\n╰━━━━━━━',
      added: '╭─❏ ✅ 「 *TUGAS DITAMBAH* 」\n┊ *"{text}"*\n┊ ɴᴏᴍᴏʀ: *{n}*~ (•̀ᴗ•́)و\n╰━━━━━━━',
      listTitle: '╭─❏ 📝 「 *DAFTAR TUGAS {name}* 」',
      item: '┊ {n}. {mark} {text}',
      doneMark: '✅',
      openMark: '⬜',
      done: '╭─❏ 🎉 「 *TUGAS SELESAI* 」\n┊ Horee, tugas nomor *{n}* ditandai selesai:\n┊ *"{text}"*~\n╰━━━━━━━',
      deleted: '╭─❏ 🗑️ 「 *TUGAS DIHAPUS* 」\n┊ Tugas nomor *{n}* dihapus:\n┊ *"{text}"*~\n╰━━━━━━━',
      cleared: '╭─❏ ✨ 「 *DAFTAR DIBERSIHKAN* 」\n┊ Semua tugas dibersihkan. Lembaran baru nih~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TUGAS TIDAK KETEMU* 」\n┊ Nomor tugas *{n}* nggak ada di daftarmu (╥﹏╥)\n╰━━━━━━━',
      btnList: 'Lihat Daftar',
    },
  },
  en: {
    todo: {
      usage: '╭─❏ 📝 「 *HOW TO USE TODO* 」\n┊ .todo add <task>\n┊ .todo list\n┊ .todo done <number>\n┊ .todo del <number>\n┊ .todo clear\n╰━━━━━━━',
      empty: '╭─❏ 📝 「 *TODO LIST* 」\n┊ Your todo list is still empty~\n┊ Add one with *.todo add <task>* 🌸\n╰━━━━━━━',
      added: '╭─❏ ✅ 「 *TASK ADDED* 」\n┊ *"{text}"*\n┊ ɴᴜᴍʙᴇʀ: *{n}*~ (•̀ᴗ•́)و\n╰━━━━━━━',
      listTitle: '╭─❏ 📝 「 *{name} TODO LIST* 」',
      item: '┊ {n}. {mark} {text}',
      doneMark: '✅',
      openMark: '⬜',
      done: '╭─❏ 🎉 「 *TASK DONE* 」\n┊ Hooray, task number *{n}* marked done:\n┊ *"{text}"*~\n╰━━━━━━━',
      deleted: '╭─❏ 🗑️ 「 *TASK DELETED* 」\n┊ Task number *{n}* deleted:\n┊ *"{text}"*~\n╰━━━━━━━',
      cleared: '╭─❏ ✨ 「 *LIST CLEARED* 」\n┊ All tasks cleared. A fresh sheet~\n╰━━━━━━━',
      notFound: '╭─❏ 🔍 「 *TASK NOT FOUND* 」\n┊ Task number *{n}* is not on your list (╥﹏╥)\n╰━━━━━━━',
      btnList: 'View List',
    },
  },
}

const key = (digits) => `todo:${digits}`

async function loadTodos(ctx) {
  const saved = await ctx.storage.get('kv', key(ctx.senderDigits))
  return Array.isArray(saved) ? saved : []
}

async function saveTodos(ctx, todos) {
  await ctx.storage.set('kv', key(ctx.senderDigits), todos)
}

function listBody(ctx, todos) {
  if (!todos.length) return ctx.t('todo.empty')
  const lines = [ctx.t('todo.listTitle', { name: ctx.pushName || ctx.senderDigits })]
  todos.forEach((item, i) => {
    lines.push(
      ctx.t('todo.item', { n: i + 1, mark: item.done ? ctx.t('todo.doneMark') : ctx.t('todo.openMark'), text: item.text })
    )
  })
  lines.push('╰━━━━━━━')
  return lines.join('\n')
}

async function withButtons(ctx, body, { listButton = true } = {}) {
  const replies = []
  if (listButton) replies.push({ text: ctx.t('todo.btnList'), id: '.todo list' })
  if (!replies.length) return ctx.reply(body)
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies,
    textFallback: body,
  })
}

export const test = { input: '.todo', expect: /tugas|todo/i }

export async function handler(ctx) {
  const sub = (ctx.args[0] || 'list').toLowerCase()
  const todos = await loadTodos(ctx)

  if (sub === 'add') {
    const text = ctx.args.slice(1).join(' ').trim()
    if (!text) return ctx.reply(ctx.t('todo.usage'))
    todos.push({ text, done: false, at: Date.now() })
    await saveTodos(ctx, todos)
    return withButtons(ctx, ctx.t('todo.added', { text, n: todos.length }))
  }

  if (sub === 'list') {
    return withButtons(ctx, listBody(ctx, todos), { listButton: false })
  }

  if (sub === 'done' || sub === 'del') {
    const n = Number(ctx.args[1])
    if (!Number.isInteger(n) || n < 1 || n > todos.length) return ctx.reply(ctx.t('todo.notFound', { n: ctx.args[1] || '-' }))
    if (sub === 'done') {
      todos[n - 1].done = true
      await saveTodos(ctx, todos)
      return withButtons(ctx, ctx.t('todo.done', { n, text: todos[n - 1].text }))
    }
    const [removed] = todos.splice(n - 1, 1)
    await saveTodos(ctx, todos)
    return withButtons(ctx, ctx.t('todo.deleted', { n, text: removed.text }))
  }

  if (sub === 'clear') {
    await saveTodos(ctx, [])
    return withButtons(ctx, ctx.t('todo.cleared'))
  }

  return ctx.reply(ctx.t('todo.usage'))
}
