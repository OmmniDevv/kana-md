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
      status: '╭─❏ 🛡️ 「 *STATUS PROTEKSI GRUP* 」\n┊ ᴡᴇʟᴄᴏᴍᴇ: *{welcome}*\n┊ ɢᴏᴏᴅʙʏᴇ: *{goodbye}*\n┊ ᴀɴᴛɪʟɪɴᴋ: *{antilink}*\n┊ ᴀɴᴛɪꜱᴘᴀᴍ: *{antispam}*\n┊ ᴀɴᴛɪᴛᴏxɪᴄ: *{antitoxic}*\n┊ ᴀɴᴛɪᴊᴜᴅᴏʟ: *{antijudol}*\n┊ ᴀɴᴛɪᴘʜɪꜱɪɴɢ: *{antiphising}*\n┊ ᴀɴᴛɪᴅᴏᴄᴜᴍᴇɴᴛ: *{antidocument}*\n┊ ᴀɴᴛɪꜱᴛɪᴄᴋᴇʀ: *{antisticker}*\n┊ ᴀɴᴛɪꜰʟᴏᴏᴅ: *{antiflood}*\n┊ ᴀɴᴛɪᴛᴀɢꜱᴡ: *{antitagsw}*\n┊ ᴀɴᴛɪᴠɪʀᴛᴇx: *{antivirtex}*\n┊ ᴀɴᴛɪʜɪᴅᴇᴛᴀɢ: *{antihidetag}*\n┊ ʙᴀᴛᴀꜱ ᴡᴀʀɴ: *{warnLimit}*\n╰━━━━━━━ {mood}',
      on: 'AKTIF', off: 'mati', footer: 'Proteksi grup KANA',
      enableBtn: 'Aktifkan {feature}',
      deletedLink: '╭─❏ 🔗 「 *LINK DIHAPUS* 」\n┊ Ehh, linknya KANA hapus yaa~\n┊ *@{digits}* dapat warn *{count}/{limit}*, jangan kirim link di sini~\n╰━━━━━━━',
      deletedGambling: '╭─❏ 🎰 「 *PROMOSI JUDI DIHAPUS* 」\n┊ Itu promosi judi, KANA hapus yaa~\n┊ *@{digits}* dapat warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedPhishing: '╭─❏ 🎣 「 *PHISHING DIHAPUS* 」\n┊ Pesan itu terindikasi phishing, KANA hapus demi keamanan grup~\n┊ *@{digits}* dapat warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedToxic: '╭─❏ 🙊 「 *KATA KASAR DIHAPUS* 」\n┊ Mouu, kata katanya kurang sopan, KANA hapus yaa *@{digits}*~\n┊ Jaga kata kata yuk~\n╰━━━━━━━',
      deletedDocument: '╭─❏ 📄 「 *DOKUMEN DIHAPUS* 」\n┊ Dokumen tidak diizinkan di grup ini, KANA hapus yaa~\n┊ *@{digits}* dapat warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedSticker: '╭─❏ 🏷️ 「 *STIKER DIHAPUS* 」\n┊ Stiker tidak diizinkan di grup ini, KANA hapus yaa~\n┊ *@{digits}* dapat warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedTagsw: '╭─❏ 📣 「 *TAG STATUS DIHAPUS* 」\n┊ Tag status tidak diizinkan di grup ini, KANA hapus yaa~\n┊ *@{digits}* dapat warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedVirtex: '╭─❏ 💥 「 *VIRTEX DIHAPUS* 」\n┊ Pesan virtex raksasa KANA hapus demi kenyamanan grup~\n┊ *@{digits}* dapat warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedHidetag: '╭─❏ 📣 「 *HIDETAG DIHAPUS* 」\n┊ Hidetag ke semua member tidak diizinkan di grup ini, KANA hapus yaa~\n┊ *@{digits}* dapat warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedFlood: '╭─❏ 🌊 「 *TERLALU DERAS* 」\n┊ Terlalu deras yaa *@{digits}*, pesan terakhir KANA hapus~\n┊ Pelan pelan saja~\n╰━━━━━━━',
      spamWarn: '╭─❏ 🌊 「 *JANGAN SPAM* 」\n┊ Pelan pelan yaa *@{digits}*, jangan spam~\n┊ Pesan terakhir KANA hapus~\n╰━━━━━━━',
      kicked: '╭─❏ 👋 「 *BATAS WARN TERCAPAI* 」\n┊ *@{digits}* mencapai batas warn *({limit})* jadi KANA keluarkan dari grup~\n┊ Maaf ya, demi ketertiban grup~\n╰━━━━━━━',
      kickLink: '╭─❏ 👋 「 *KELUAR KARENA LINK* 」\n┊ *@{digits}* ngirim link dan aksi antilink grup ini *kick langsung*, jadi KANA keluarkan dari grup~\n┊ Maaf ya, demi ketertiban grup~\n╰━━━━━━━',
      kickLinkFailed: '╭─❏ ⚠️ 「 *LINK TERDETEKSI* 」\n┊ *@{digits}* ngirim link dan aksi antilink grup ini *kick langsung*, tapi KANA belum bisa mengeluarkannya~\n┊ Bot perlu jadi admin grup dulu yaa~\n╰━━━━━━━',
      kickFailed: '╭─❏ ⚠️ 「 *BATAS WARN TERCAPAI* 」\n┊ *@{digits}* mencapai batas warn *({limit})*, tapi KANA belum bisa mengeluarkannya~\n┊ Bot perlu jadi admin grup dulu yaa~\n╰━━━━━━━',
    },
  },
  en: {
    guard: {
      status: '╭─❏ 🛡️ 「 *GROUP PROTECTION STATUS* 」\n┊ ᴡᴇʟᴄᴏᴍᴇ: *{welcome}*\n┊ ɢᴏᴏᴅʙʏᴇ: *{goodbye}*\n┊ ᴀɴᴛɪʟɪɴᴋ: *{antilink}*\n┊ ᴀɴᴛɪꜱᴘᴀᴍ: *{antispam}*\n┊ ᴀɴᴛɪᴛᴏxɪᴄ: *{antitoxic}*\n┊ ᴀɴᴛɪᴊᴜᴅᴏʟ: *{antijudol}*\n┊ ᴀɴᴛɪᴘʜɪꜱɪɴɢ: *{antiphising}*\n┊ ᴀɴᴛɪᴅᴏᴄᴜᴍᴇɴᴛ: *{antidocument}*\n┊ ᴀɴᴛɪꜱᴛɪᴄᴋᴇʀ: *{antisticker}*\n┊ ᴀɴᴛɪꜰʟᴏᴏᴅ: *{antiflood}*\n┊ ᴀɴᴛɪᴛᴀɢꜱᴡ: *{antitagsw}*\n┊ ᴀɴᴛɪᴠɪʀᴛᴇx: *{antivirtex}*\n┊ ᴀɴᴛɪʜɪᴅᴇᴛᴀɢ: *{antihidetag}*\n┊ ᴡᴀʀɴ ʟɪᴍɪᴛ: *{warnLimit}*\n╰━━━━━━━ {mood}',
      on: 'ON', off: 'off', footer: 'KANA group protection',
      enableBtn: 'Enable {feature}',
      deletedLink: '╭─❏ 🔗 「 *LINK REMOVED* 」\n┊ Eh, I removed that link~\n┊ *@{digits}* gets warn *{count}/{limit}*, please do not send links here~\n╰━━━━━━━',
      deletedGambling: '╭─❏ 🎰 「 *GAMBLING PROMO REMOVED* 」\n┊ That is gambling promotion, I removed it~\n┊ *@{digits}* gets warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedPhishing: '╭─❏ 🎣 「 *PHISHING REMOVED* 」\n┊ That message looks like phishing, I removed it to keep the group safe~\n┊ *@{digits}* gets warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedToxic: '╭─❏ 🙊 「 *RUDE WORDS REMOVED* 」\n┊ Mouu, those words are not polite, I removed it *@{digits}*~\n┊ Let us keep it kind~\n╰━━━━━━━',
      deletedDocument: '╭─❏ 📄 「 *DOCUMENT REMOVED* 」\n┊ Documents are not allowed in this group, I removed it~\n┊ *@{digits}* gets warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedSticker: '╭─❏ 🏷️ 「 *STICKER REMOVED* 」\n┊ Stickers are not allowed in this group, I removed it~\n┊ *@{digits}* gets warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedTagsw: '╭─❏ 📣 「 *STATUS TAG REMOVED* 」\n┊ Status tags are not allowed in this group, I removed it~\n┊ *@{digits}* gets warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedVirtex: '╭─❏ 💥 「 *VIRTEX REMOVED* 」\n┊ That giant virtex message was removed for the group comfort~\n┊ *@{digits}* gets warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedHidetag: '╭─❏ 📣 「 *HIDETAG REMOVED* 」\n┊ Hidetagging all members is not allowed in this group, I removed it~\n┊ *@{digits}* gets warn *{count}/{limit}*~\n╰━━━━━━━',
      deletedFlood: '╭─❏ 🌊 「 *TOO FAST* 」\n┊ Too fast *@{digits}*, I removed the last message~\n┊ Take it slow~\n╰━━━━━━━',
      spamWarn: '╭─❏ 🌊 「 *DO NOT SPAM* 」\n┊ Slow down *@{digits}*, please do not spam~\n┊ I removed the last message~\n╰━━━━━━━',
      kicked: '╭─❏ 👋 「 *WARN LIMIT REACHED* 」\n┊ *@{digits}* reached the warn limit *({limit})* so I removed them from the group~\n┊ Sorry, for the group order~\n╰━━━━━━━',
      kickLink: '╭─❏ 👋 「 *REMOVED FOR LINK* 」\n┊ *@{digits}* sent a link and this group antilink action is *instant kick*, so I removed them from the group~\n┊ Sorry, for the group order~\n╰━━━━━━━',
      kickLinkFailed: '╭─❏ ⚠️ 「 *LINK DETECTED* 」\n┊ *@{digits}* sent a link and this group antilink action is *instant kick*, but I cannot remove them yet~\n┊ The bot needs to be a group admin first~\n╰━━━━━━━',
      kickFailed: '╭─❏ ⚠️ 「 *WARN LIMIT REACHED* 」\n┊ *@{digits}* reached the warn limit *({limit})*, but I cannot remove them yet~\n┊ The bot needs to be a group admin first~\n╰━━━━━━━',
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

  // Aksi antilink 'kick' (diatur .setantilinkkick): link pertama langsung
  // dikeluarkan, tanpa menunggu batas warn seperti jalur warn biasa.
  if (violated === 'guard.deletedLink' && settings.antilinkAction === 'kick') {
    await deleteMessage(ctx)
    let kicked = false
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [ctx.sender], 'remove')
      kicked = true
    } catch { kicked = false }
    await ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t(kicked ? 'guard.kickLink' : 'guard.kickLinkFailed', { digits: digitsOf(ctx.sender) }),
      mentions: [ctx.sender],
    })
    return false
  }

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
  if (!offFeatures.length) return ctx.reply(body)
  await sendButtons(ctx.sock, ctx.chat, {
    title: 'KANA',
    body,
    footer: ctx.t('guard.footer'),
    replies: [
      ...offFeatures.map((f) => ({ text: ctx.t('guard.enableBtn', { feature: f }), id: `.protect ${f} on` })),
    ],
    textFallback: body,
  })
}
