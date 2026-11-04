export const config = {
  name: 'owner',
  alias: ['status'],
  category: 'owner',
  description: { id: 'Status bot (khusus owner)', en: 'Bot status (owner only)' },
  usage: '.owner',
  example: '.owner',
  isOwner: true,
  cooldown: 3,
}

export const i18n = {
  id: {
    owner: {
      status:
        'Status KANA\nUptime: {uptime} detik\nPlugin aktif: {plugins}\nPlugin karantina: {quarantined}\nStorage: {driver}\nNode: {node}\n{mood}',
    },
  },
  en: {
    owner: {
      status:
        'KANA status\nUptime: {uptime} seconds\nActive plugins: {plugins}\nQuarantined plugins: {quarantined}\nStorage: {driver}\nNode: {node}\n{mood}',
    },
  },
}

export async function handler(ctx) {
  await ctx.reply(
    ctx.t('owner.status', {
      uptime: Math.floor(process.uptime()),
      plugins: ctx.registry.list().length,
      quarantined: ctx.registry.quarantined.length,
      driver: ctx.storage.driver,
      node: process.version,
      mood: ctx.say('senang'),
    })
  )
}
