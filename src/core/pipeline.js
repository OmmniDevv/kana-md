import { t as translate } from '../i18n/index.js'
import { say } from '../persona/moe.js'
import { logger } from '../services/logger.js'

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

// Pipeline sederhana: parse -> prefix -> resolve -> gates -> handler (error boundary).
export function createPipeline({ registry, storage, owners = [], defaultLang = 'id' }) {
  const cooldowns = new Map()
  const ownerDigits = owners.map(digits).filter(Boolean)

  async function handle(sock, raw) {
    const key = raw.key ?? {}
    const chat = key.remoteJid
    if (!chat || chat === 'status@broadcast' || key.fromMe) return
    const isGroup = chat.endsWith('@g.us')
    const sender = (isGroup ? key.participant : chat) || chat
    const senderAlt = (isGroup ? key.participantAlt : key.remoteJidAlt) || ''
    const text = extractText(raw.message).trim()
    if (!text) return

    const prefix = PREFIXES.find((p) => text.startsWith(p))
    if (!prefix) return
    const body = text.slice(prefix.length).trim()
    if (!body) return
    const [rawCommand, ...args] = body.split(/\s+/)
    const plugin = registry.resolve(rawCommand)
    const senderDigits = [digits(sender), digits(senderAlt)]
    const isOwner = ownerDigits.some((o) => senderDigits.includes(o))

    const lang = (await storage.get('users', `${digits(sender)}:lang`)) || defaultLang
    const t = (k, vars) => translate(lang, k, vars)
    const reply = (txt) => sock.sendMessage(chat, { text: txt }, { quoted: raw })

    if (!plugin) {
      await reply(t('common.unknownCommand', { command: rawCommand }))
      return
    }

    const cfg = plugin.config
    if (cfg.isOwner && !isOwner) return reply(t('common.ownerOnly'))
    if (cfg.isGroup && !isGroup) return reply(t('common.groupOnly'))
    if (cfg.isPrivate && isGroup) return reply(t('common.privateOnly'))

    const cdKey = `${cfg.name}:${digits(sender)}`
    const cdMs = (cfg.cooldown ?? 0) * 1000
    const last = cooldowns.get(cdKey) ?? 0
    if (cdMs && Date.now() - last < cdMs) {
      return reply(t('common.cooldown', { seconds: Math.ceil((cdMs - (Date.now() - last)) / 1000) }))
    }
    cooldowns.set(cdKey, Date.now())

    const ctx = {
      sock,
      chat,
      sender,
      senderAlt,
      isGroup,
      isOwner,
      args,
      text: args.join(' '),
      command: cfg.name,
      lang,
      t,
      say: (mood) => say(lang, mood),
      reply,
      storage,
      registry,
      raw,
    }

    try {
      await plugin.handler(ctx)
    } catch (err) {
      logger.error({ err: err.message, command: cfg.name }, 'handler error')
      await reply(t('common.error'))
    }
  }

  return { handle }
}
