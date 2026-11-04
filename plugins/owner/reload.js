import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendButtons } from '../../src/ui/buttons.js'
import { loadPlugins } from '../../src/core/plugin-loader.js'

const here = dirname(fileURLToPath(import.meta.url))

export const config = {
  name: 'reload',
  alias: [],
  category: 'owner',
  description: { id: 'Muat ulang semua plugin tanpa restart bot', en: 'Reload all plugins without restarting the bot' },
  usage: '.reload [nama]',
  example: '.reload ping',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    reload: {
      done: '╭─❏ 🔄 「 *RELOAD BERES* 」\n┊ ᴘʟᴜɢɪɴ ᴀᴋᴛɪꜰ: *{active}*\n┊ ᴋᴀʀᴀɴᴛɪɴᴀ: *{quarantined}*\n┊ Reload beres yaa, Master~ {mood}',
      statusActive: '┊ ᴘʟᴜɢɪɴ *{name}*: *ᴀᴋᴛɪꜰ*',
      statusQuarantined: '┊ ᴘʟᴜɢɪɴ *{name}*: *ᴋᴀʀᴀɴᴛɪɴᴀ*\n┊ ᴀʟᴀꜱᴀɴ: *{reason}*',
      statusUnknown: '┊ ᴘʟᴜɢɪɴ *{name}*: *ᴛɪᴅᴀᴋ ᴋᴇᴛᴇᴍᴜ* setelah reload',
      btnOwner: 'Status Bot',
    },
  },
  en: {
    reload: {
      done: '╭─❏ 🔄 「 *RELOAD DONE* 」\n┊ ᴀᴄᴛɪᴠᴇ ᴘʟᴜɢɪɴꜱ: *{active}*\n┊ ǫᴜᴀʀᴀɴᴛɪɴᴇᴅ: *{quarantined}*\n┊ Reload done, Master~ {mood}',
      statusActive: '┊ ᴘʟᴜɢɪɴ *{name}*: *ᴀᴄᴛɪᴠᴇ*',
      statusQuarantined: '┊ ᴘʟᴜɢɪɴ *{name}*: *ǫᴜᴀʀᴀɴᴛɪɴᴇᴅ*\n┊ ʀᴇᴀꜱᴏɴ: *{reason}*',
      statusUnknown: '┊ ᴘʟᴜɢɪɴ *{name}*: *ɴᴏᴛ ꜰᴏᴜɴᴅ* after reload',
      btnOwner: 'Bot Status',
    },
  },
}

export const test = { input: '.reload', expect: /reload/i }

export async function handler(ctx) {
  const dir = join(here, '..', '..', 'plugins')
  const fresh = await loadPlugins(dir)
  const registry = ctx.registry

  if (registry.plugins instanceof Map && registry.aliases instanceof Map) {
    // Ganti isi Map yang sama: closure resolve/list di loader lama membaca
    // Map ini, jadi mutasi di tempat membuat reload terasa tanpa restart.
    registry.plugins.clear()
    for (const [name, plugin] of fresh.plugins) registry.plugins.set(name, plugin)
    registry.aliases.clear()
    for (const [alias, name] of fresh.aliases) registry.aliases.set(alias, name)
  } else {
    registry.plugins = fresh.plugins
    registry.aliases = fresh.aliases
  }
  if (Array.isArray(registry.befores)) {
    registry.befores.length = 0
    registry.befores.push(...fresh.befores)
  } else {
    registry.befores = fresh.befores
  }
  if (Array.isArray(registry.participantHandlers)) {
    registry.participantHandlers.length = 0
    registry.participantHandlers.push(...fresh.participantHandlers)
  } else {
    registry.participantHandlers = fresh.participantHandlers
  }
  if (Array.isArray(registry.quarantined)) {
    registry.quarantined.length = 0
    registry.quarantined.push(...fresh.quarantined)
  } else {
    registry.quarantined = fresh.quarantined
  }

  let body = ctx.t('reload.done', {
    active: fresh.plugins.size,
    quarantined: fresh.quarantined.length,
    mood: ctx.say('sukses'),
  })
  const target = (ctx.args[0] || '').toLowerCase()
  if (target) {
    if (fresh.plugins.has(target)) {
      body += `\n${ctx.t('reload.statusActive', { name: target })}`
    } else {
      const hit = fresh.quarantined.find((q) => q.file.endsWith(`/${target}.js`) || q.file.includes(target))
      body += `\n${
        hit
          ? ctx.t('reload.statusQuarantined', { name: target, reason: hit.reason })
          : ctx.t('reload.statusUnknown', { name: target })
      }`
    }
  }
  body += '\n╰━━━━━━━'
  return sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: ctx.t('reload.btnOwner'), id: '.owner' }],
    textFallback: body,
  })
}
