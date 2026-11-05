import { DATA_NAMESPACES, wipeNamespaces } from './hapusdata.js'

// Reset database bot ke keadaan pabrik: SEMUA namespace data
// dikosongkan, termasuk 'settings' (mode bot kembali ke default).
// Yang tidak disentuh hanya sesi login (auth Baileys, jadibot,
// web login) karena itu sesi koneksi, bukan data bot. Bila cukup
// mengosongkan data tanpa menyentuh pengaturan, pakai .hapusdata.
export const RESETDB_NAMESPACES = [...DATA_NAMESPACES, 'settings']

export const config = {
  name: 'resetdb',
  alias: [],
  category: 'owner',
  description: { id: 'Kosongkan seluruh database bot termasuk pengaturan, kembali ke default pabrik (wajib konfirmasi: .resetdb ya)', en: 'Empty the whole bot database including settings, back to factory defaults (confirmation required: .resetdb ya)' },
  usage: '.resetdb [ya]',
  example: '.resetdb ya',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    resetdb: {
      confirm: '╭─❏ ⚠️ 「 *RESET DATABASE TOTAL?* 」\n┊ Perintah ini akan menghapus *{records} data* dari *{namespaces} namespace*, termasuk pengaturan bot (mode bot kembali ke default).\n┊ Hanya sesi login yang tidak disentuh.\n┊ Tindakan ini tidak bisa dibatalkan.\n┊ Kalau yakin, ketik *.resetdb ya*\n╰━━━━━━━',
      done: '╭─❏ 🗑️ 「 *RESETDB SELESAI* 」\n┊ *{records} data* dari *{namespaces} namespace* sudah dihapus.\n┊ Database bot sekarang persis seperti baru pertama dipasang~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    resetdb: {
      confirm: '╭─❏ ⚠️ 「 *FULL DATABASE RESET?* 」\n┊ This command will delete *{records} records* across *{namespaces} namespaces*, including bot settings (bot mode returns to default).\n┊ Only login sessions are left untouched.\n┊ This action cannot be undone.\n┊ If you are sure, type *.resetdb ya*\n╰━━━━━━━',
      done: '╭─❏ 🗑️ 「 *RESETDB DONE* 」\n┊ *{records} records* across *{namespaces} namespaces* have been deleted.\n┊ The bot database is now exactly like a fresh install~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.resetdb', expect: /menghapus|delete/i }

export async function handler(ctx) {
  const confirmed = (ctx.args?.[0] || '').toLowerCase() === 'ya'
  try {
    if (!confirmed) {
      let records = 0
      for (const ns of RESETDB_NAMESPACES) {
        try {
          records += (await ctx.storage.keys(ns)).length
        } catch {}
      }
      return ctx.reply(ctx.t('resetdb.confirm', { records, namespaces: RESETDB_NAMESPACES.length }))
    }
    const records = await wipeNamespaces(ctx.storage, RESETDB_NAMESPACES)
    return ctx.reply(ctx.t('resetdb.done', { records, namespaces: RESETDB_NAMESPACES.length }))
  } catch (err) {
    return ctx.reply(ctx.t('resetdb.fail', { error: err.message }))
  }
}
