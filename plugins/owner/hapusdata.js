// Reset data bot ke kosong/default: semua namespace data pemakai
// (user, grup, game, limit, premium, sewa) dikosongkan. Namespace
// 'settings' (mode bot dst.) DIPERTAHANKAN, dan sesi login (auth
// Baileys, jadibot, web login) tidak disentuh karena itu sesi, bukan
// data. Untuk pengosongan total termasuk settings, pakai .resetdb.
export const DATA_NAMESPACES = [
  'users', 'groups', 'group_settings', 'kv', 'scores', 'quiz',
  'usage_limits', 'premium', 'sewa_bot', 'clans', 'chatcount',
  'couples', 'birthdays', 'reminders', 'referral', 'tempmail',
  'gachakarakter', 'dedup', 'reply',
]

export const config = {
  name: 'hapusdata',
  alias: [],
  category: 'owner',
  description: { id: 'Reset semua data bot (user, grup, game, limit, premium) ke kosong; pengaturan bot dipertahankan (wajib konfirmasi: .hapusdata ya)', en: 'Reset all bot data (users, groups, games, limits, premium) to empty; bot settings are kept (confirmation required: .hapusdata ya)' },
  usage: '.hapusdata [ya]',
  example: '.hapusdata ya',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    hapusdata: {
      confirm: '╭─❏ ⚠️ 「 *HAPUS SEMUA DATA?* 」\n┊ Perintah ini akan menghapus *{records} data* dari *{namespaces} namespace* (user, grup, game, limit, premium, sewa).\n┊ Pengaturan bot dan sesi login TIDAK ikut terhapus.\n┊ Tindakan ini tidak bisa dibatalkan.\n┊ Kalau yakin, ketik *.hapusdata ya*\n╰━━━━━━━',
      done: '╭─❏ 🗑️ 「 *HAPUSDATA SELESAI* 」\n┊ *{records} data* dari *{namespaces} namespace* sudah dihapus.\n┊ Data bot sekarang kosong seperti baru, pengaturan bot tetap dipertahankan~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    hapusdata: {
      confirm: '╭─❏ ⚠️ 「 *DELETE ALL DATA?* 」\n┊ This command will delete *{records} records* across *{namespaces} namespaces* (users, groups, games, limits, premium, rentals).\n┊ Bot settings and login sessions are NOT deleted.\n┊ This action cannot be undone.\n┊ If you are sure, type *.hapusdata ya*\n╰━━━━━━━',
      done: '╭─❏ 🗑️ 「 *HAPUSDATA DONE* 」\n┊ *{records} records* across *{namespaces} namespaces* have been deleted.\n┊ Bot data is now empty like new, bot settings are kept~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.hapusdata', expect: /menghapus|delete/i }

async function countRecords(storage, namespaces) {
  let total = 0
  for (const ns of namespaces) {
    try {
      total += (await storage.keys(ns)).length
    } catch {}
  }
  return total
}

export async function wipeNamespaces(storage, namespaces) {
  let total = 0
  for (const ns of namespaces) {
    let keys = []
    try {
      keys = await storage.keys(ns)
    } catch {
      keys = []
    }
    for (const key of keys) {
      await storage.delete(ns, key)
      total += 1
    }
  }
  return total
}

export async function handler(ctx) {
  const confirmed = (ctx.args?.[0] || '').toLowerCase() === 'ya'
  try {
    if (!confirmed) {
      const records = await countRecords(ctx.storage, DATA_NAMESPACES)
      return ctx.reply(ctx.t('hapusdata.confirm', { records, namespaces: DATA_NAMESPACES.length }))
    }
    const records = await wipeNamespaces(ctx.storage, DATA_NAMESPACES)
    return ctx.reply(ctx.t('hapusdata.done', { records, namespaces: DATA_NAMESPACES.length }))
  } catch (err) {
    return ctx.reply(ctx.t('hapusdata.fail', { error: err.message }))
  }
}
