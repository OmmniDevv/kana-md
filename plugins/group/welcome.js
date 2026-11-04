import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { getGroupText } from '../../src/services/group-settings.js'
import { renderTemplate } from '../../src/config/templates.js'
import { digitsOf } from '../../src/services/guard-rules.js'

const here = dirname(fileURLToPath(import.meta.url))

export const config = {
  name: 'welcome',
  alias: [],
  category: 'group',
  description: { id: 'Alihkan sapaan selamat datang grup', en: 'Toggle group welcome greeting' },
  usage: '.welcome <on|off>',
  example: '.welcome on',
  cooldown: 3,
  isGroup: true,
  isAdmin: true,
}

export const i18n = {
  id: {
    welcome: {
      changed: 'Siap~ welcome sekarang {state}. {mood}',
      on: 'AKTIF', off: 'mati',
      usage: 'Pakai: .welcome on atau .welcome off yaa~',
      hello: 'Halo halo @{digits}~ Selamat datang di {group}! KANA seneng banget kamu gabung. Jangan lupa baca rules grup yaa, semoga betah! {mood}',
      helloText: 'Halo halo @{digits}~ Selamat datang di {group}! Semoga betah yaa! {mood}',
      bye: 'Dadahh {name} ({digits})~ Makasih udah pernah main di {group}. Semoga sukses selalu yaa, KANA bakal kangen~ {mood}',
      byeText: 'Dadahh {digits}~ Makasih udah pernah gabung di {group}. Semoga sukses selalu yaa~ {mood}',
    },
  },
  en: {
    welcome: {
      changed: 'Got it~ welcome is now {state}. {mood}',
      on: 'ON', off: 'off',
      usage: 'Use: .welcome on or .welcome off~',
      hello: 'Hello hello @{digits}~ Welcome to {group}! KANA is so happy you joined. Please read the group rules, hope you enjoy it here! {mood}',
      helloText: 'Hello hello @{digits}~ Welcome to {group}! Hope you enjoy it here! {mood}',
      bye: 'Bye bye {name} ({digits})~ Thanks for being in {group}. Wishing you success always, KANA will miss you~ {mood}',
      byeText: 'Bye bye {digits}~ Thanks for joining {group}. Wishing you success always~ {mood}',
    },
  },
}

export const test = { input: '.welcome on', expect: /welcome/i }

export async function handler(ctx) {
  const arg = (ctx.args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(arg)) return ctx.reply(ctx.t('welcome.usage'))
  await updateGroupSettings(ctx.storage, ctx.chat, { welcome: arg === 'on' })
  await ctx.reply(ctx.t('welcome.changed', { state: ctx.t(arg === 'on' ? 'welcome.on' : 'welcome.off'), mood: ctx.say('senang') }))
}

export async function onParticipantsUpdate(ctx) {
  if (ctx.action !== 'add' && ctx.action !== 'remove') return
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  if (ctx.action === 'add' && !settings.welcome) return
  if (ctx.action === 'remove' && !settings.goodbye) return
  let groupName = ctx.chat
  let meta = null
  try {
    meta = await ctx.getGroupMetadata()
    if (meta?.subject) groupName = meta.subject
  } catch {}
  const count = Array.isArray(meta?.participants) ? meta.participants.length : 0
  const isAdd = ctx.action === 'add'
  const kind = isAdd ? 'welcome' : 'goodbye'
  const template = await getGroupText(ctx.storage, ctx.chat, kind)
  for (const participant of ctx.participants ?? []) {
    const jid = typeof participant === 'string' ? participant : participant?.id || String(participant)
    const digits = digitsOf(jid)
    const rendered = renderTemplate(template, {
      user: isAdd ? `@${digits}` : digits,
      group: groupName,
      count,
    })
    const caption =
      rendered.trim() ||
      ctx.t(isAdd ? 'welcome.hello' : 'welcome.bye', {
        digits, group: groupName, name: digits, mood: ctx.say(isAdd ? 'senang' : 'pamit'),
      })
    const textFallback =
      rendered.trim() ||
      ctx.t(isAdd ? 'welcome.helloText' : 'welcome.byeText', {
        digits, group: groupName, mood: ctx.say(isAdd ? 'senang' : 'pamit'),
      })
    const file = isAdd ? 'welcome.jpg' : 'goodbye.jpg'
    let image = null
    try { image = await readFile(join(here, '../../assets', file)) } catch { image = null }
    try {
      if (image) {
        await ctx.sock.sendMessage(ctx.chat, { image, caption, ...(isAdd ? { mentions: [jid] } : {}) })
      } else if (isAdd) {
        await ctx.sendText(textFallback, [jid])
      } else {
        await ctx.sendText(textFallback)
      }
    } catch {
      // Jangan jatuhkan hook karena satu kiriman gagal.
    }
  }
}
