import { getGroupSettings } from '../../src/services/group-service.js'
import { digitsOf } from '../../src/services/guard-rules.js'

export const config = {
  name: 'intro',
  alias: [],
  category: 'group',
  description: { id: 'Tampilkan kartu perkenalanmu mengikuti template intro grup', en: 'Show your introduction card following the group intro template' },
  usage: '.intro',
  example: '.intro',
  cooldown: 5,
  isGroup: true,
}

export const DEFAULT_INTRO = {
  id: 'Halo semua, kenalin yaa~\nɴᴀᴍᴀ: {nama}\nɴᴏᴍᴏʀ: {nomor}\nɢʀᴜᴘ: {grup}\nSemoga betah dan jangan sungkan ngobrol yaa!',
  en: 'Hello everyone, let me introduce myself~\nɴᴀᴍᴇ: {nama}\nɴᴜᴍʙᴇʀ: {nomor}\nɢʀᴏᴜᴘ: {grup}\nMake yourself at home and do not be shy to chat!',
}

export const i18n = {
  id: { intro: { header: '╭─❏ 🎤 「 *KARTU PERKENALAN* 」\n┊ {card}\n╰━━━━━━━' } },
  en: { intro: { header: '╭─❏ 🎤 「 *INTRODUCTION CARD* 」\n┊ {card}\n╰━━━━━━━' } },
}

export const test = { input: '.intro', expect: /perkenalan|introduction/i }

export function renderIntro(template, { nama, nomor, grup }) {
  return String(template)
    .replaceAll('{nama}', nama)
    .replaceAll('{nomor}', nomor)
    .replaceAll('{grup}', grup)
}

export async function handler(ctx) {
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  let groupName = ctx.chat
  try {
    const meta = ctx.groupMetadata ?? (await ctx.getGroupMetadata())
    groupName = meta?.subject || groupName
  } catch {}
  const template = settings.introTemplate || (DEFAULT_INTRO[ctx.lang] ?? DEFAULT_INTRO.id)
  const card = renderIntro(template, {
    nama: ctx.pushName || digitsOf(ctx.sender),
    nomor: digitsOf(ctx.sender),
    grup: groupName,
  })
  const cardLines = card.split('\n').join('\n┊ ')
  return ctx.reply(ctx.t('intro.header', { card: cardLines }))
}
