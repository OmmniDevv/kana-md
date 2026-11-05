// Ringkasan menu bot dari registry nyata: total plugin, total nama
// perintah termasuk alias, dan rincian jumlah per kategori.
export const config = {
  name: 'totalmenu',
  alias: ['totalfiturmenu', 'menustats'],
  category: 'info',
  description: { id: 'Ringkasan total menu: plugin, perintah, per kategori', en: 'Menu summary: plugins, commands, per category' },
  usage: '.totalmenu',
  example: '.totalmenu',
  cooldown: 5,
}

export const i18n = {
  id: {
    totalmenu: {
      header: '╭─❏ 📚 「 *TOTAL MENU KANA* 」\n┊ ᴘʟᴜɢɪɴ ᴀᴋᴛɪꜰ: *{plugins}*\n┊ ᴛᴏᴛᴀʟ ᴘᴇʀɪɴᴛᴀʜ (ᴛᴇʀᴍᴀꜱᴜᴋ ᴀʟɪᴀꜱ): *{commands}*\n┊ ᴋᴀᴛᴇɢᴏʀɪ: *{cats}*\n┊ ─────',
      item: '┊ {cat}: *{count}*',
      footer: '╰━━━━━━━',
    },
  },
  en: {
    totalmenu: {
      header: '╭─❏ 📚 「 *KANA MENU TOTALS* 」\n┊ ᴀᴄᴛɪᴠᴇ ᴘʟᴜɢɪɴꜱ: *{plugins}*\n┊ ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅꜱ (ɪɴᴄʟᴜᴅɪɴɢ ᴀʟɪᴀꜱᴇꜱ): *{commands}*\n┊ ᴄᴀᴛᴇɢᴏʀɪᴇꜱ: *{cats}*\n┊ ─────',
      item: '┊ {cat}: *{count}*',
      footer: '╰━━━━━━━',
    },
  },
}

export const test = { input: '.totalmenu', expect: /TOTAL MENU|MENU TOTALS/ }

// Hitung ringkasan dari daftar plugin registry.
export function summarizeMenu(plugins) {
  const list = Array.isArray(plugins) ? plugins : []
  let commands = 0
  const perCategory = new Map()
  for (const plugin of list) {
    const cfg = plugin?.config || plugin || {}
    commands += 1 + (Array.isArray(cfg.alias) ? cfg.alias.length : 0)
    const cat = cfg.category || 'lainnya'
    perCategory.set(cat, (perCategory.get(cat) || 0) + 1)
  }
  return {
    plugins: list.length,
    commands,
    cats: perCategory.size,
    perCategory: [...perCategory.entries()].sort((a, b) => b[1] - a[1]),
  }
}

export async function handler(ctx) {
  const summary = summarizeMenu(ctx.registry?.list?.() ?? [])
  const lines = [ctx.t('totalmenu.header', summary)]
  for (const [cat, count] of summary.perCategory) {
    lines.push(ctx.t('totalmenu.item', { cat, count }))
  }
  lines.push(ctx.t('totalmenu.footer'))
  return ctx.reply(lines.join('\n'))
}
