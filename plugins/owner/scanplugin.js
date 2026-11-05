export const config = {
  name: 'scanplugin',
  alias: [],
  category: 'owner',
  description: { id: 'Pindai kesehatan registry plugin: total, karantina, plugin tanpa kasus uji atau deskripsi', en: 'Scan plugin registry health: totals, quarantine, plugins without test cases or descriptions' },
  usage: '.scanplugin',
  example: '.scanplugin',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    scanplugin: {
      header: '╭─❏ 🩺 「 *SCAN PLUGIN* 」\n┊ Plugin termuat: *{plugins}*\n┊ Nama perintah: *{commands}* (utama + alias)\n┊ Kategori: *{categories}*\n┊ Dikarantina loader: *{quarantined}*',
      quarantinedRow: '┊   ⚠️ {file}: {reason}',
      noTest: '┊ Tanpa kasus uji ({count}): {names}',
      noDesc: '┊ Tanpa deskripsi dwibahasa ({count}): {names}',
      noI18n: '┊ Tanpa ekspor i18n ({count}): {names}',
      healthy: '┊ ✅ Semua plugin termuat punya kasus uji, deskripsi, dan i18n.',
      footer: '╰━━━━━━━',
      fail: '╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    scanplugin: {
      header: '╭─❏ 🩺 「 *PLUGIN SCAN* 」\n┊ Loaded plugins: *{plugins}*\n┊ Command names: *{commands}* (primary + aliases)\n┊ Categories: *{categories}*\n┊ Quarantined by loader: *{quarantined}*',
      quarantinedRow: '┊   ⚠️ {file}: {reason}',
      noTest: '┊ Missing test cases ({count}): {names}',
      noDesc: '┊ Missing bilingual descriptions ({count}): {names}',
      noI18n: '┊ Missing i18n exports ({count}): {names}',
      healthy: '┊ ✅ Every loaded plugin has a test case, description, and i18n.',
      footer: '╰━━━━━━━',
      fail: '╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.scanplugin', expect: /scan|pindai|plugin/i }

// Ringkasan kesehatan registry murni dari objek registry plugin-loader.
export function buildScanReport(registry) {
  const plugins = typeof registry?.list === 'function' ? registry.list() : []
  const quarantined = Array.isArray(registry?.quarantined) ? registry.quarantined : []
  const categories = new Set()
  let commands = 0
  const noTest = []
  const noDesc = []
  const noI18n = []
  for (const plugin of plugins) {
    const cfg = plugin?.config ?? {}
    const name = cfg.name || '(tanpa nama)'
    categories.add(cfg.category || 'main')
    commands += 1 + (Array.isArray(cfg.alias) ? cfg.alias.length : 0)
    if (!plugin?.test?.input) noTest.push(name)
    if (!cfg.description?.id || !cfg.description?.en) noDesc.push(name)
    if (!plugin?.i18n) noI18n.push(name)
  }
  return {
    plugins: plugins.length,
    commands,
    categories: categories.size,
    quarantined,
    noTest,
    noDesc,
    noI18n,
  }
}

export async function handler(ctx) {
  try {
    const report = buildScanReport(ctx.registry)
    const lines = [ctx.t('scanplugin.header', {
      plugins: report.plugins,
      commands: report.commands,
      categories: report.categories,
      quarantined: report.quarantined.length,
    })]
    for (const q of report.quarantined.slice(0, 10)) {
      lines.push(ctx.t('scanplugin.quarantinedRow', { file: String(q.file || '').split('/').pop(), reason: q.reason || '' }))
    }
    if (report.noTest.length) lines.push(ctx.t('scanplugin.noTest', { count: report.noTest.length, names: report.noTest.slice(0, 15).join(', ') }))
    if (report.noDesc.length) lines.push(ctx.t('scanplugin.noDesc', { count: report.noDesc.length, names: report.noDesc.slice(0, 15).join(', ') }))
    if (report.noI18n.length) lines.push(ctx.t('scanplugin.noI18n', { count: report.noI18n.length, names: report.noI18n.slice(0, 15).join(', ') }))
    if (!report.quarantined.length && !report.noTest.length && !report.noDesc.length && !report.noI18n.length) {
      lines.push(ctx.t('scanplugin.healthy'))
    }
    lines.push(ctx.t('scanplugin.footer'))
    return ctx.reply(lines.join('\n'))
  } catch (err) {
    return ctx.reply(ctx.t('scanplugin.fail', { error: err.message }))
  }
}
