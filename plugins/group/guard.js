import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { applyWarnToSettings, detectGambling, detectLinks, detectPhishing, detectToxic, digitsOf, floodCheck } from '../../src/services/guard-rules.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'guard',
  alias: ['proteksi', 'security', 'groupsecurity'],
  category: 'group',
  description: { id: 'Lihat status proteksi grup', en: 'Show group protection status' },
  usage: '.guard',
  example: '.guard',
  cooldown: 5,
  isGroup: true,
  priority: 20,
}

export const i18n = {
  id: {
    guard: {
      status: 'Status proteksi grup ini:\nWelcome: {welcome}\nGoodbye: {goodbye}\nAntilink: {antilink}\nAntispam: {antispam}\nAntitoxic: {antitoxic}\nAntijudol: {antijudol}\nAntiphising: {antiphising}\nAntidocument: {antidocument}\nAntisticker: {antisticker}\nAntiflood: {antiflood}\nAntitagsw: {antitagsw}\nAntivirtex: {antivirtex}\nAntihidetag: {antihidetag}\nBatas warn: {warnLimit}\n{mood}',
      on: 'AKTIF', off: 'mati', footer: 'Proteksi grup KANA',
      deletedLink: 'Ehh, linknya KANA hapus yaa. @{digits} dapat warn {count}/{limit}. Jangan kirim link di sini~',
      deletedGambling: 'Itu promosi judi, KANA hapus yaa. @{digits} dapat warn {count}/{limit}.',
      deletedPhishing: 'Pesan itu terindikasi phishing, KANA hapus demi keamanan grup. @{digits} dapat warn {count}/{limit}.',
      deletedToxic: 'Mouu, kata katanya kurang sopan, KANA hapus yaa @{digits}. Jaga kata kata yuk~',
      deletedDocument: 'Dokumen tidak diizinkan di grup ini, KANA hapus yaa. @{digits} dapat warn {count}/{limit}.',
      deletedSticker: 'Stiker tidak diizinkan di grup ini, KANA hapus yaa. @{digits} dapat warn {count}/{limit}.',
      deletedTagsw: 'Tag status tidak diizinkan di grup ini, KANA hapus yaa. @{digits} dapat warn {count}/{limit}.',
      deletedVirtex: 'Pesan virtex raksasa KANA hapus demi kenyamanan grup. @{digits} dapat warn {count}/{limit}.',
      deletedHidetag: 'Hidetag ke semua member tidak diizinkan di grup ini, KANA hapus yaa. @{digits} dapat warn {count}/{limit}.',
      deletedFlood: 'Terlalu deras yaa @{digits}, pesan terakhir KANA hapus. Pelan pelan saja~',
      spamWarn: 'Pelan pelan yaa @{digits}, jangan spam. Pesan terakhir KANA hapus~',
      kicked: '@{digits} mencapai batas warn ({limit}) jadi KANA keluarkan dari grup. Maaf ya, demi ketertiban grup~',
      kickFailed: '@{digits} mencapai batas warn ({limit}), tapi KANA belum bisa mengeluarkannya. Bot perlu jadi admin dulu yaa.',
    },
  },
  en: {
    guard: {
      status: 'Protection status for this group:\nWelcome: {welcome}\nGoodbye: {goodbye}\nAntilink: {antilink}\nAntispam: {antispam}\nAntitoxic: {antitoxic}\nAntijudol: {antijudol}\nAntiphising: {antiphising}\nAntidocument: {antidocument}\nAntisticker: {antisticker}\nAntiflood: {antiflood}\nAntitagsw: {antitagsw}\nAntivirtex: {antivirtex}\nAntihidetag: {antihidetag}\nWarn limit: {warnLimit}\n{mood}',
      on: 'ON', off: 'off', footer: 'KANA group protection',
      deletedLink: 'Eh, I removed that link. @{digits} gets warn {count}/{limit}. Please do not send links here~',
      deletedGambling: 'That is gambling promotion, I removed it. @{digits} gets warn {count}/{limit}.',
      deletedPhishing: 'That message looks like phishing, I removed it to keep the group safe. @{digits} gets warn {count}/{limit}.',
      deletedToxic: 'Mouu, those words are not polite, I removed it @{digits}. Let us keep it kind~',
      deletedDocument: 'Documents are not allowed in this group, I removed it. @{digits} gets warn {count}/{limit}.',
      deletedSticker: 'Stickers are not allowed in this group, I removed it. @{digits} gets warn {count}/{limit}.',
      deletedTagsw: 'Status tags are not allowed in this group, I removed it. @{digits} gets warn {count}/{limit}.',
      deletedVirtex: 'That giant virtex message was removed for the group comfort. @{digits} gets warn {count}/{limit}.',
      deletedHidetag: 'Hidetagging all members is not allowed in this group, I removed it. @{digits} gets warn {count}/{limit}.',
      deletedFlood: 'Too fast @{digits}, I removed the last message. Take it slow~',
      spamWarn: 'Slow down @{digits}, please do not spam. I removed the last message~',
      kicked: '@{digits} reached the warn limit ({limit}) so I removed them from the group. Sorry, for the group order~',
      kickFailed: '@{digits} reached the warn limit ({limit}), but I cannot remove them yet. The bot needs to be admin first.',
    },
  },
}

const FEATURES = ['welcome', 'goodbye', 'antilink', 'antispam', 'antitoxic', 'antijudol', 'antiphising', 'antidocument', 'antisticker', 'antiflood', 'antitagsw', 'antivirtex', 'antihidetag']
const spamState = new Map()
const floodState = new Map()

async function senderIsAdminOrOwner(ctx) {
  if (ctx.isOwner) return true
  try {
    const meta = await ctx.getGroupMetadata()
    if (!meta?.participants) return false
    const myDigits = digitsOf(ctx.sender)
    return meta.participants.some((p) => {
      if (!p.admin) return false
      return [p.id, p.phoneNumber, p.lid, p.jid].some((c) => c && digitsOf(c) === myDigits)
    })
  } catch {
    return false
  }
}

async function deleteMessage(ctx) {
  try { await ctx.sock.sendMessage(ctx.chat, { delete: ctx.raw.key }) } catch {}
}

export async function applyWarn(ctx, settings, reasonKey) {
  const digits = digitsOf(ctx.sender)
  const result = applyWarnToSettings(settings, digits, settings.warnLimit)
  await updateGroupSettings(ctx.storage, ctx.chat, { warns: result.warns })
  if (result.shouldKick) {
    let kicked = false
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [ctx.sender], 'remove')
      kicked = true
    } catch { kicked = false }
    await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t(kicked ? 'guard.kicked' : 'guard.kickFailed', { digits, limit: result.limit }),
      mentions: [ctx.sender],
    })
    return result
  }
  await ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t(reasonKey, { digits, count: result.count, limit: result.limit }),
    mentions: [ctx.sender],
  })
  return result
}

export async function before(ctx) {
  if (!ctx.isGroup) return
  if (await senderIsAdminOrOwner(ctx)) return
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  const msg = ctx.raw?.message ?? {}

  // Penjaga berbasis tipe pesan (tidak butuh teks): stiker, dokumen,
  // tag status, dan hidetag massal.
  if (settings.antisticker && msg.stickerMessage) {
    await deleteMessage(ctx)
    await applyWarn(ctx, settings, 'guard.deletedSticker')
    return false
  }
  if (settings.antidocument && msg.documentMessage) {
    await deleteMessage(ctx)
    await applyWarn(ctx, settings, 'guard.deletedDocument')
    return false
  }
  if (settings.antitagsw) {
    const hasTagsw =
      Boolean(msg.groupStatusMentionMessage) ||
      Object.values(msg).some((v) => v && typeof v === 'object' && Array.isArray(v.contextInfo?.groupStatusMentionJid) && v.contextInfo.groupStatusMentionJid.length > 0)
    if (hasTagsw) {
      await deleteMessage(ctx)
      await applyWarn(ctx, settings, 'guard.deletedTagsw')
      return false
    }
  }
  if (settings.antihidetag && (ctx.mentionedJids?.length ?? 0) > 0) {
    try {
      const meta = await ctx.getGroupMetadata()
      const total = meta?.participants?.length ?? 0
      if (total > 2 && ctx.mentionedJids.length >= total - 1) {
        await deleteMessage(ctx)
        await applyWarn(ctx, settings, 'guard.deletedHidetag')
        return false
      }
    } catch {}
  }

  if (!ctx.text) return
  const text = ctx.text

  if (settings.antiflood) {
    const key = `flood:${ctx.chat}:${digitsOf(ctx.sender)}`
    const now = Date.now()
    const arr = [...(floodState.get(key) ?? []), now].filter((ts) => now - ts < 30000)
    floodState.set(key, arr)
    if (arr.length > 12) {
      floodState.set(key, [])
      await deleteMessage(ctx)
      await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('guard.deletedFlood', { digits: digitsOf(ctx.sender) }), mentions: [ctx.sender] })
      return false
    }
  }

  if (settings.antivirtex && text.length > 3500) {
    await deleteMessage(ctx)
    await applyWarn(ctx, settings, 'guard.deletedVirtex')
    return false
  }

  if (settings.antispam) {
    const key = `${ctx.chat}:${digitsOf(ctx.sender)}`
    const now = Date.now()
    const arr = [...(spamState.get(key) ?? []), now].filter((ts) => now - ts < 10000)
    spamState.set(key, arr)
    if (floodCheck(arr, now)) {
      spamState.set(key, [])
      await deleteMessage(ctx)
      await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('guard.spamWarn', { digits: digitsOf(ctx.sender) }), mentions: [ctx.sender] })
      return false
    }
  }

  let violated = null
  if (settings.antilink && detectLinks(text).length) violated = 'guard.deletedLink'
  else if (settings.antijudol && detectGambling(text).length) violated = 'guard.deletedGambling'
  else if (settings.antiphising && detectPhishing(text).length) violated = 'guard.deletedPhishing'

  if (violated) {
    await deleteMessage(ctx)
    await applyWarn(ctx, settings, violated)
    return false
  }

  if (settings.antitoxic && detectToxic(text, settings.toxicWords).length) {
    await deleteMessage(ctx)
    await ctx.sock.sendMessage(ctx.chat, { text: ctx.t('guard.deletedToxic', { digits: digitsOf(ctx.sender) }), mentions: [ctx.sender] })
    return false
  }
}

export const test = { input: '.guard', expect: /grup|group/i }

export async function handler(ctx) {
  const s = await getGroupSettings(ctx.storage, ctx.chat)
  const onOff = (v) => ctx.t(v ? 'guard.on' : 'guard.off')
  const body = ctx.t('guard.status', {
    welcome: onOff(s.welcome), goodbye: onOff(s.goodbye), antilink: onOff(s.antilink),
    antispam: onOff(s.antispam), antitoxic: onOff(s.antitoxic), antijudol: onOff(s.antijudol),
    antiphising: onOff(s.antiphising), antidocument: onOff(s.antidocument), antisticker: onOff(s.antisticker),
    antiflood: onOff(s.antiflood), antitagsw: onOff(s.antitagsw), antivirtex: onOff(s.antivirtex),
    antihidetag: onOff(s.antihidetag), warnLimit: s.warnLimit, mood: ctx.say('senang'),
  })
  const offFeatures = FEATURES.filter((f) => !s[f]).slice(0, 4)
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('guard.footer'),
    replies: [
      ...offFeatures.map((f) => ({ text: `Aktifkan ${f}`, id: `.protect ${f} on` })),
      { text: 'Menu grup', id: '.menu group' },
    ],
    textFallback: body,
  })
}
