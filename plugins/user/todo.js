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
      usage: 'Pakai gini yaa:\n.todo add <tugas>\n.todo list\n.todo done <nomor>\n.todo del <nomor>\n.todo clear',
      empty: 'Daftar tugasmu masih kosong nih~ Tambah pakai .todo add <tugas> yaa 🌸',
      added: 'Siap, tugas ditambah: "{text}" (nomor {n})~ (•̀ᴗ•́)و',
      listTitle: '📝 Daftar tugas {name}:',
      item: '{n}. {mark} {text}',
      doneMark: '✅',
      openMark: '⬜',
      done: 'Horee, tugas nomor {n} ditandai selesai: "{text}"~ 🎉',
      deleted: 'Tugas nomor {n} dihapus: "{text}"~',
      cleared: 'Semua tugas dibersihkan. Lembaran baru nih~ ✨',
      notFound: 'Nomor tugas {n} nggak ada di daftarmu (╥﹏╥)',
      btnList: 'Lihat Daftar',
    },
  },
  en: {
    todo: {
      usage: 'Use it like this:\n.todo add <task>\n.todo list\n.todo done <number>\n.todo del <number>\n.todo clear',
      empty: 'Your todo list is still empty~ Add one with .todo add <task> 🌸',
      added: 'Done, task added: "{text}" (number {n})~ (•̀ᴗ•́)و',
      listTitle: '📝 {name} todo list:',
      item: '{n}. {mark} {text}',
      doneMark: '✅',
      openMark: '⬜',
      done: 'Hooray, task number {n} marked done: "{text}"~ 🎉',
      deleted: 'Task number {n} deleted: "{text}"~',
      cleared: 'All tasks cleared. A fresh sheet~ ✨',
      notFound: 'Task number {n} is not on your list (╥﹏╥)',
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
