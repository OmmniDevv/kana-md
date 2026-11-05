export const config = {
  name: 'deluserall',
  alias: [],
  category: 'owner',
  description: { id: 'Hapus SEMUA user dari database bot (wajib konfirmasi: .deluserall ya)', en: 'Delete ALL users from the bot database (confirmation required: .deluserall ya)' },
  usage: '.deluserall [ya]',
  example: '.deluserall ya',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    deluserall: {
      confirm: '╭─❏ ⚠️ 「 *HAPUS SEMUA USER?* 」\n┊ Perintah ini akan menghapus *{count} data user* dari database bot (profil, XP, saldo, inventaris, status daftar).\n┊ Data grup dan pengaturan bot TIDAK ikut terhapus.\n┊ Tindakan ini tidak bisa dibatalkan.\n┊ Kalau yakin, ketik *.deluserall ya*\n╰━━━━━━━',
      done: '╭─❏ 🗑️ 「 *DELUSERALL SELESAI* 」\n┊ *{count} data user* sudah dihapus dari database bot.\n┊ Semua user harus daftar ulang dari awal yaa~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    deluserall: {
      confirm: '╭─❏ ⚠️ 「 *DELETE ALL USERS?* 」\n┊ This command will delete *{count} user records* from the bot database (profiles, XP, balance, inventory, registration status).\n┊ Group data and bot settings are NOT deleted.\n┊ This action cannot be undone.\n┊ If you are sure, type *.deluserall ya*\n╰━━━━━━━',
      done: '╭─❏ 🗑️ 「 *DELUSERALL DONE* 」\n┊ *{count} user records* have been deleted from the bot database.\n┊ Every user has to register again from scratch~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.deluserall', expect: /menghapus|delete/i }

export async function handler(ctx) {
  const confirmed = (ctx.args?.[0] || '').toLowerCase() === 'ya'
  try {
    const keys = await ctx.storage.keys('users')
    if (!confirmed) {
      const userCount = keys.filter((k) => /^\d+$/.test(k)).length
      return ctx.reply(ctx.t('deluserall.confirm', { count: userCount }))
    }
    for (const key of keys) {
      await ctx.storage.delete('users', key)
    }
    const userCount = keys.filter((k) => /^\d+$/.test(k)).length
    return ctx.reply(ctx.t('deluserall.done', { count: userCount }))
  } catch (err) {
    return ctx.reply(ctx.t('deluserall.fail', { error: err.message }))
  }
}
