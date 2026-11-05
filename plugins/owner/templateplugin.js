export const config = {
  name: 'templateplugin',
  alias: [],
  category: 'owner',
  description: { id: 'Hasilkan kerangka plugin baru format KANA (config, i18n, test, handler) dari nama fitur', en: 'Generate a new KANA-format plugin skeleton (config, i18n, test, handler) from a feature name' },
  usage: '.templateplugin <nama>',
  example: '.templateplugin fiturbaru',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    templateplugin: {
      header: '╭─❏ 🧩 「 *TEMPLATE PLUGIN: {name}* 」\n┊ Ini kerangka plugin format KANA buat *{name}*. Simpan sebagai berkas *plugins/<kategori>/{name}.js* lalu isi logika handlernya yaa~\n╰━━━━━━━',
      caption: 'Kerangka plugin KANA: {name}.js',
      usage: '╭─❏ 🧩 「 *TEMPLATEPLUGIN* 」\n┊ Format: *.templateplugin <nama>*\n┊ Contoh: *.templateplugin fiturbaru*\n┊ Nama hanya boleh huruf kecil dan angka~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    templateplugin: {
      header: '╭─❏ 🧩 「 *PLUGIN TEMPLATE: {name}* 」\n┊ Here is a KANA-format plugin skeleton for *{name}*. Save it as *plugins/<category>/{name}.js* and fill in the handler logic~\n╰━━━━━━━',
      caption: 'KANA plugin skeleton: {name}.js',
      usage: '╭─❏ 🧩 「 *TEMPLATEPLUGIN* 」\n┊ Format: *.templateplugin <name>*\n┊ Example: *.templateplugin newfeature*\n┊ Names may only use lowercase letters and digits~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.templateplugin contohfitur', expect: /contohfitur/ }

// Kerangka plugin persis format yang dimuat plugin-loader KANA:
// config + i18n dwibahasa + kasus uji terdaftar + handler.
export function buildPluginSkeleton(name) {
  const lines = [
    'export const config = {',
    `  name: '${name}',`,
    '  alias: [],',
    "  category: 'main',",
    `  description: { id: 'Deskripsi fitur ${name}', en: 'Description of the ${name} feature' },`,
    `  usage: '.${name}',`,
    `  example: '.${name}',`,
    '  cooldown: 3,',
    '}',
    '',
    'export const i18n = {',
    '  id: {',
    `    ${name}: {`,
    `      body: '╭─❏ ✨ 「 *${name.toUpperCase()}* 」\\n┊ Isi balasan fitur ${name} di sini~\\n╰━━━━━━━',`,
    "      fail: '╭─❏ 💦 「 *GAGAL* 」\\n┊ {error}\\n╰━━━━━━━',",
    '    },',
    '  },',
    '  en: {',
    `    ${name}: {`,
    `      body: '╭─❏ ✨ 「 *${name.toUpperCase()}* 」\\n┊ Put the ${name} feature reply here~\\n╰━━━━━━━',`,
    "      fail: '╭─❏ 💦 「 *FAILED* 」\\n┊ {error}\\n╰━━━━━━━',",
    '    },',
    '  },',
    '}',
    '',
    `export const test = { input: '.${name}', expect: /${name}/i }`,
    '',
    'export async function handler(ctx) {',
    '  try {',
    `    return ctx.reply(ctx.t('${name}.body'))`,
    '  } catch (err) {',
    `    return ctx.reply(ctx.t('${name}.fail', { error: err.message }))`,
    '  }',
    '}',
    '',
  ]
  return lines.join('\n')
}

export async function handler(ctx) {
  const name = (ctx.args?.[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!name) return ctx.reply(ctx.t('templateplugin.usage'))
  try {
    const code = buildPluginSkeleton(name)
    try {
      await ctx.sock.sendMessage(ctx.chat, {
        document: Buffer.from(code),
        fileName: `${name}.js`,
        mimetype: 'text/javascript',
        caption: ctx.t('templateplugin.caption', { name }),
      }, { quoted: ctx.raw })
    } catch {}
    return ctx.reply(ctx.t('templateplugin.header', { name }) + '\n\n```\n' + code + '```')
  } catch (err) {
    return ctx.reply(ctx.t('templateplugin.fail', { error: err.message }))
  }
}
