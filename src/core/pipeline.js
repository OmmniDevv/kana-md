import { downloadMediaMessage } from '@rexxhayanasi/elaina-baileys'
import pino from 'pino'
import { t as translate } from '../i18n/index.js'
import { say } from '../persona/moe.js'
import { logger } from '../services/logger.js'
import * as users from '../services/user-service.js'

export const PREFIXES = ['.', '!', '/', '#']

const digits = (s) => String(s ?? '').replace(/\D/g, '')

// Balasan tombol native flow (MB.Button quick_reply dkk.) tiba sebagai
// interactiveResponseMessage dengan paramsJson berbentuk STRING JSON
// (mis. '{"id":".menu download"}'), bukan objek. Parse dulu supaya id
// tombol tertangkap sebagai perintah biasa. Bentuk objek tetap diterima
// untuk kompatibilitas.
function nativeFlowId(m) {
  const params = m.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
  if (!params) return ''
  if (typeof params === 'object') return params.id || ''
  try {
    return JSON.parse(params).id || ''
  } catch {
    return ''
  }
}

function extractText(message) {
  if (!message) return ''
  const m = message
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    nativeFlowId(m) ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.templateButtonReplyMessage?.selectedId ||
    ''
  )
}

function findContextInfo(m) {
  for (const v of Object.values(m ?? {})) {
    if (v && typeof v === 'object' && v.contextInfo) return v.contextInfo
  }
  return null
}

function getQuoted(m) {
  const ci = findContextInfo(m)
  if (!ci?.quotedMessage) return null
  return { message: ci.quotedMessage, sender: ci.participant || '', stanzaId: ci.stanzaId || '' }
}

const SKIP_BEFORE_TYPES = new Set(['protocolMessage', 'reactionMessage', 'messageContextInfo', 'senderKeyDistributionMessage'])

function shouldRunBefores(message) {
  const types = Object.keys(message ?? {})
  return types.some((type) => !SKIP_BEFORE_TYPES.has(type))
}

// Pipeline: parse -> before hooks (middleware, semua pesan) -> prefix ->
// resolve -> gates (owner/group/private/admin/botAdmin/ban/mode/limit/
// cooldown) -> handler (error boundary) -> XP.
export function createPipeline({ registry, storage, owners = [], defaultLang = 'id' }) {
  const cooldowns = new Map()
  const ownerDigits = owners.map(digits).filter(Boolean)
  const groupMetaCache = new Map()

  async function getGroupMetadata(sock, jid) {
    const hit = groupMetaCache.get(jid)
    if (hit && Date.now() - hit.at < 60000) return hit.data
    try {
      const data = await sock.groupMetadata(jid)
      groupMetaCache.set(jid, { at: Date.now(), data })
      return data
    } catch {
      return null
    }
  }

  // Cocokkan peserta grup dengan sekumpulan digit (JID/PN/LID bisa berbeda).
  function participantMatches(participant, digitSet) {
    const candidates = [participant?.id, participant?.phoneNumber, participant?.lid, participant?.jid]
    return candidates.some((c) => c && digitSet.has(digits(c)))
  }

  async function computeAdminFlags(sock, chat, senderDigitSet, botDigitSet) {
    const meta = await getGroupMetadata(sock, chat)
    if (!meta?.participants) return { isAdmin: false, isBotAdmin: false, metadata: meta }
    let isAdmin = false
    let isBotAdmin = false
    for (const p of meta.participants) {
      if (p.admin) {
        if (participantMatches(p, senderDigitSet)) isAdmin = true
        if (participantMatches(p, botDigitSet)) isBotAdmin = true
      }
    }
    return { isAdmin, isBotAdmin, metadata: meta }
  }

  function downloadMedia(sock, message) {
    return downloadMediaMessage(message, 'buffer', {}, {
      logger: pino({ level: 'silent' }),
      reuploadRequest: sock.updateMediaMessage,
    })
  }

  async function handle(sock, raw) {
    const key = raw.key ?? {}
    const chat = key.remoteJid
    if (!chat || chat === 'status@broadcast' || key.fromMe) return
    const isGroup = chat.endsWith('@g.us')
    const sender = (isGroup ? key.participant : chat) || chat
    const senderAlt = (isGroup ? key.participantAlt : key.remoteJidAlt) || ''
    const text = extractText(raw.message).trim()
    const senderDigits = [digits(sender), digits(senderAlt)].filter(Boolean)
    const senderDigitSet = new Set(senderDigits)
    const primaryDigits = senderDigits[0] || digits(chat)
    const isOwner = ownerDigits.some((o) => senderDigitSet.has(o))
    const botDigits = new Set([digits(sock?.user?.id), digits(sock?.user?.lid)].filter(Boolean))

    const lang = (await storage.get('users', `${primaryDigits}:lang`)) || defaultLang
    const t = (k, vars) => translate(lang, k, vars)
    const reply = (txt) => sock.sendMessage(chat, { text: txt }, { quoted: raw })
    const quoted = getQuoted(raw.message)
    const contextInfo = findContextInfo(raw.message)

    const baseCtx = {
      sock,
      chat,
      sender,
      senderAlt,
      senderDigits: primaryDigits,
      pushName: raw.pushName || '',
      isGroup,
      isOwner,
      isAdmin: false,
      isBotAdmin: false,
      text,
      lang,
      t,
      say: (mood) => say(lang, mood),
      reply,
      storage,
      registry,
      raw,
      quoted,
      mentionedJids: contextInfo?.mentionedJid ?? [],
      botJid: sock?.user?.id || '',
      getGroupMetadata: () => getGroupMetadata(sock, chat),
      downloadMedia: (message = raw) => downloadMedia(sock, message),
      downloadQuoted: () =>
        quoted
          ? downloadMedia(sock, {
              key: { remoteJid: chat, id: quoted.stanzaId, participant: quoted.sender },
              message: quoted.message,
            })
          : Promise.reject(new Error('tidak ada pesan yang dikutip')),
    }

    // Middleware: jalan untuk semua pesan (termasuk tanpa prefix) supaya
    // proteksi grup, afk, kuis, dan custom command bisa bekerja.
    if (shouldRunBefores(raw.message)) {
      for (const plugin of registry.befores ?? []) {
        try {
          const result = await plugin.before(baseCtx)
          if (result === false) return
        } catch (err) {
          logger.error({ err: err.message, plugin: plugin.config.name }, 'before hook error')
        }
      }
    }

    const prefix = PREFIXES.find((p) => text.startsWith(p))
    if (!prefix) return
    const body = text.slice(prefix.length).trim()
    if (!body) return
    const [rawCommand, ...args] = body.split(/\s+/)

    // Mode self: hanya owner yang dilayani, diam untuk pengguna lain.
    if (!isOwner) {
      const settings = await storage.get('settings', 'bot')
      if (settings?.mode === 'self') return
      const profile = await users.getProfile(storage, primaryDigits)
      if (profile.banned) return
    }

    const plugin = registry.resolve(rawCommand)
    if (!plugin) {
      await reply(t('common.unknownCommand', { command: rawCommand }))
      return
    }

    const cfg = plugin.config
    if (cfg.isOwner && !isOwner) return reply(t('common.ownerOnly'))
    if (cfg.isGroup && !isGroup) return reply(t('common.groupOnly'))
    if (cfg.isPrivate && isGroup) return reply(t('common.privateOnly'))

    // Bendera admin dihitung sekali untuk grup (metadata tercache 60 detik),
    // dipakai gates dan diteruskan ke ctx.
    let flags = { isAdmin: false, isBotAdmin: false, metadata: null }
    if (isGroup && (cfg.isAdmin || cfg.isBotAdmin || cfg.needsAdminInfo)) {
      flags = await computeAdminFlags(sock, chat, senderDigitSet, botDigits)
    }
    if (cfg.isAdmin && !flags.isAdmin) return reply(t('common.adminOnly'))
    if (cfg.isBotAdmin && !flags.isBotAdmin) return reply(t('common.botNotAdmin'))

    const cdKey = `${cfg.name}:${primaryDigits}`
    const cdMs = (cfg.cooldown ?? 0) * 1000
    const last = cooldowns.get(cdKey) ?? 0
    if (cdMs && Date.now() - last < cdMs) {
      return reply(t('common.cooldown', { seconds: Math.ceil((cdMs - (Date.now() - last)) / 1000) }))
    }

    // Limit harian: config.limit boolean (biaya 1) atau angka (biaya segitu).
    if (cfg.limit && !isOwner) {
      const cost = cfg.limit === true ? 1 : Number(cfg.limit) || 1
      const result = await users.consumeLimit(storage, primaryDigits, cost)
      if (!result.ok) return reply(t('common.limitOut', { limit: users.DEFAULT_DAILY_LIMIT }))
    }
    cooldowns.set(cdKey, Date.now())

    const ctx = {
      ...baseCtx,
      isAdmin: flags.isAdmin,
      isBotAdmin: flags.isBotAdmin,
      groupMetadata: flags.metadata,
      args,
      text: args.join(' '),
      command: cfg.name,
    }

    try {
      await plugin.handler(ctx)
      if (!isOwner && cfg.category !== 'owner') {
        await users.addXp(storage, primaryDigits, users.XP_PER_COMMAND).catch(() => {})
      }
    } catch (err) {
      logger.error({ err: err.message, command: cfg.name }, 'handler error')
      await reply(t('common.error'))
    }
  }

  // Event peserta grup (welcome/goodbye dkk.) diteruskan ke plugin yang
  // mengekspor onParticipantsUpdate.
  async function handleParticipants(sock, event) {
    const chat = event?.id
    if (!chat) return
    const handlers = registry.participantHandlers ?? []
    if (!handlers.length) return
    const lang =
      (await storage.get('groups', chat).then((s) => s?.lang).catch(() => '')) || defaultLang
    const ctx = {
      sock,
      chat,
      participants: event.participants ?? [],
      action: event.action,
      author: event.author || '',
      storage,
      registry,
      lang,
      t: (k, vars) => translate(lang, k, vars),
      say: (mood) => say(lang, mood),
      sendText: (txt, mentions) => sock.sendMessage(chat, { text: txt, ...(mentions?.length ? { mentions } : {}) }),
      getGroupMetadata: () => getGroupMetadata(sock, chat),
    }
    for (const plugin of handlers) {
      try {
        await plugin.onParticipantsUpdate(ctx)
      } catch (err) {
        logger.error({ err: err.message, plugin: plugin.config.name }, 'participants hook error')
      }
    }
  }

  return { handle, handleParticipants }
}
