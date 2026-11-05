import { downloadMediaMessage } from '@rexxhayanasi/elaina-baileys'
import pino from 'pino'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { t as translate } from '../i18n/index.js'
import { say } from '../persona/moe.js'
import { logger } from '../services/logger.js'
import { sendButtons } from '../ui/buttons.js'
import {
  buildFakeQuoted,
  cachedContactThumbnail,
  cachedThumbnail,
  forwardedContextInfo,
  warmFakeContactThumbnail,
  warmFakeThumbnail,
} from '../ui/fake-thumb.js'
import * as users from '../services/user-service.js'
import * as premiumSvc from '../services/premium.js'
import * as limitSvc from '../services/limit.js'

// Panaskan thumbnail untuk fake quoted ala _allfake.js Elaina sekali saja.
warmFakeThumbnail(join(dirname(fileURLToPath(import.meta.url)), '../../assets/menu-banner.jpg'))
// Foto fake kontak memakai asetnya sendiri, terpisah dari banner menu.
warmFakeContactThumbnail(join(dirname(fileURLToPath(import.meta.url)), '../../assets/fake-contact.jpg'))

export const PREFIXES = ['.', '!', '/', '#']

const digits = (s) => String(s ?? '').replace(/\D/g, '')

// Digit identitas dari JID utuh: ambil bagian user sebelum "@" dan
// sebelum ":" lebih dulu, baru ekstrak digit. Wajib untuk JID milik
// koneksi sendiri (sock.user.id / sock.user.lid) karena format Baileys
// membawa suffix perangkat, mis. "6285187605007:14@s.whatsapp.net";
// digits() polos akan menempelkan deviceId ke nomor dan hasilnya
// tidak pernah cocok dengan digit bersih peserta grup. Inilah akar
// bug gerbang botAdmin yang selalu menolak (2026-11-05).
export const jidUserDigits = (jid) => digits(String(jid ?? '').split('@')[0].split(':')[0])

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
  // Statistik ringan untuk dashboard web (kv bot_stats, diflush scheduler).
  const stats = { startedAt: Date.now(), totalCommands: 0, commandCounts: {} }
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
    return candidates.some((c) => c && digitSet.has(jidUserDigits(c)))
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
    // Dedupe id pesan: WhatsApp bisa mengirim ulang pesan yang sama
    // sesudah reconnect, misalnya pesan yang diproses harness livetest
    // tepat sebelum service produksi naik lagi. Tanpa dedupe, satu
    // perintah user dibalas dua kali (kasus .wiki 2026-11-05 17:54).
    // Catatan disimpan di storage bersama supaya instance mana pun yang
    // memproses pertama menahan pemrosesan berikutnya.
    if (key.id) {
      const now = Date.now()
      const seen = ((await storage.get('dedup', chat)) ?? []).filter(
        (e) => e && now - e.at < 30 * 60000
      )
      if (seen.some((e) => e.id === key.id)) return
      seen.push({ id: key.id, at: now })
      await storage.set('dedup', chat, seen.slice(-80))
    }
    const isGroup = chat.endsWith('@g.us')
    const sender = (isGroup ? key.participant : chat) || chat
    const senderAlt = (isGroup ? key.participantAlt : key.remoteJidAlt) || ''
    const text = extractText(raw.message).trim()
    const senderDigits = [digits(sender), digits(senderAlt)].filter(Boolean)
    const senderDigitSet = new Set(senderDigits)
    const primaryDigits = senderDigits[0] || digits(chat)
    const isOwner = ownerDigits.some((o) => senderDigitSet.has(o))
    const botDigits = new Set([jidUserDigits(sock?.user?.id), jidUserDigits(sock?.user?.lid)].filter(Boolean))

    const lang = (await storage.get('users', `${primaryDigits}:lang`)) || defaultLang
    const t = (k, vars) => translate(lang, k, vars)
    // Balasan teks memakai pola _allfake.js Elaina: quoted fake kontak
    // berthumbnail plus contextInfo pesan diteruskan. Tanpa penanda
    // diteruskan, sebagian klien WhatsApp menolak merender pesan bot dan
    // hanya menampilkan gelembung "versi WhatsApp tidak mendukung".
    // Plugin bisa memilih fake lain lewat opsi fake ('troli', 'dokumen',
    // 'toko', 'gif', 'lokasi', 'vn', 'teks') atau mematikan fake dengan
    // fake: 'none' (quoted kembali ke pesan user apa adanya).
    const reply = (txt, opts = {}) => {
      const kind = opts.fake === undefined ? 'kontak' : opts.fake
      // Fake kontak memakai foto kontak khusus; fake lain tetap memakai
      // thumbnail banner menu.
      const isKontak = typeof kind === 'string' && ['kontak', 'contact'].includes(kind.toLowerCase())
      const fake = kind
        ? buildFakeQuoted(kind, {
            botName: process.env.BOT_NAME || 'KANA',
            thumbnail: isKontak ? cachedContactThumbnail() : cachedThumbnail(),
          })
        : null
      // opts.mentions diteruskan ke pesan supaya plugin yang menyebut
      // member (pola .add) benar benar terender sebagai tag @Nama di
      // WhatsApp, bukan angka polos. Dulu opsi ini dibuang diam diam,
      // jadi teks "@nomor" dari plugin tidak pernah jadi mention asli.
      const content = {
        text: txt,
        contextInfo: forwardedContextInfo(),
        ...(opts.mentions?.length ? { mentions: opts.mentions } : {}),
      }
      return sock.sendMessage(chat, content, { quoted: fake ?? raw })
    }
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
    let userProfile = null
    if (!isOwner) {
      const settings = await storage.get('settings', 'bot')
      if (settings?.mode === 'self') return
      userProfile = await users.getProfile(storage, primaryDigits)
      if (userProfile.banned) return
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

    // Gate daftar wajib (keputusan user 2026-11-04): pengguna yang belum
    // terdaftar hanya boleh memakai .daftar dan .help daftar. Perintah lain,
    // termasuk .menu, ditolak dengan peringatan moe + tombol daftar. Owner
    // selalu lolos. Profil dibaca sekali dari blok mode/ban di atas.
    if (!isOwner && cfg.name !== 'daftar') {
      const helpDaftar = cfg.name === 'help' && (args[0] || '').toLowerCase() === 'daftar'
      if (!helpDaftar) {
        const profile = userProfile ?? (await users.getProfile(storage, primaryDigits))
        if (!profile.registered) {
          const body = t('common.notRegistered')
          try {
            await sendButtons(sock, chat, {
              title: 'KANA',
              body,
              footer: t('menu.footer'),
              replies: [
                { text: t('common.registerAutoBtn'), id: '.daftar auto' },
                { text: t('common.registerHowBtn'), id: '.help daftar' },
              ],
              textFallback: body,
            })
          } catch {
            await reply(body)
          }
          return
        }
      }
    }

    // Bendera admin dihitung sekali untuk grup (metadata tercache 60 detik),
    // dipakai gates dan diteruskan ke ctx.
    let flags = { isAdmin: false, isBotAdmin: false, metadata: null }
    if (isGroup && (cfg.isAdmin || cfg.isBotAdmin || cfg.needsAdminInfo)) {
      flags = await computeAdminFlags(sock, chat, senderDigitSet, botDigits)
    }
    if (cfg.isAdmin && !flags.isAdmin) return reply(t('common.adminOnly'))
    if (cfg.isBotAdmin && !flags.isBotAdmin) return reply(t('common.botNotAdmin'))

    // Balasan gate berbayar memakai kartu tombol relevan (.cekprem dan
    // .infopremium), fallback teks selalu ada lewat sendButtons/reply.
    const gateReplies = [
      { text: t('premium.btnCheck'), id: '.cekprem' },
      { text: t('premium.btnInfo'), id: '.infopremium' },
    ]
    const replyGate = async (body) => {
      try {
        await sendButtons(sock, chat, {
          title: 'KANA',
          body,
          footer: t('menu.footer'),
          replies: gateReplies,
          textFallback: body,
        })
      } catch {
        await reply(body)
      }
    }

    // Gate premium (keputusan owner 2026-11-05): plugin config.premium
    // hanya lolos untuk owner, premium personal aktif, sewa grup aktif
    // (di grup itu saja), atau jalur khusus jadibot di service premium.
    // Detail aturan dan pengecualian ada di src/services/premium.js.
    let paidTier = false
    if (!isOwner) {
      paidTier = await premiumSvc.hasPaidTier(storage, { digits: primaryDigits, chat, isGroup })
    }
    if (cfg.premium && !isOwner) {
      const access = await premiumSvc.checkPremiumAccess(storage, {
        digits: primaryDigits,
        chat,
        isGroup,
        commandName: cfg.name,
      })
      if (!access.allowed) {
        const prem = await premiumSvc.getPremiumStatus(storage, primaryDigits)
        const statusText = prem.exists && prem.expired ? t('premium.statusExpired') : t('premium.statusFree')
        const ownerNumber = ownerDigits[0] || ''
        const body = t('premium.denied', {
          feature: cfg.name,
          status: statusText,
          owner: ownerNumber || '-',
          link: ownerNumber ? `https://wa.me/${ownerNumber}` : '-',
          mood: say(lang, 'gagal'),
        })
        await replyGate(body)
        return
      }
      paidTier = true
    }

    // Gate limit harian bergrup (config.limitGroup): downloader berat dan
    // upscale tidak dikunci premium, tetapi dihitung per grup per hari.
    // Percobaan yang ditolak tidak menambah hitungan dan tidak memakan
    // cooldown, karena gate ini jalan sebelum cooldown diset.
    if (cfg.limitGroup && !isOwner) {
      const result = await limitSvc.consumeLimitGroup(storage, primaryDigits, cfg.limitGroup, { paidTier })
      if (!result.ok) {
        const groupKey = `premium.group${cfg.limitGroup[0].toUpperCase()}${cfg.limitGroup.slice(1)}`
        const groupLabel = t(groupKey)
        const body = t('premium.limitOut', {
          group: groupLabel === groupKey ? cfg.limitGroup : groupLabel,
          used: result.used,
          quota: result.quota,
          paidQuota: limitSvc.quotaFor(cfg.limitGroup, true),
          mood: say(lang, 'gagal'),
        })
        await replyGate(body)
        return
      }
    }

    const cdKey = `${cfg.name}:${primaryDigits}`
    const cdMs = (cfg.cooldown ?? 0) * 1000
    const last = cooldowns.get(cdKey) ?? 0
    if (cdMs && Date.now() - last < cdMs) {
      return reply(t('common.cooldown', { seconds: Math.ceil((cdMs - (Date.now() - last)) / 1000) }))
    }

    // Limit harian: config.limit boolean (biaya 1) atau angka (biaya segitu).
    // Plugin limitGroup memakai kuota grupnya sendiri di gate atas, jadi
    // limit generik ini dilewati supaya tidak kena potong dua kali.
    if (cfg.limit && !cfg.limitGroup && !isOwner) {
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

    stats.totalCommands += 1
    stats.commandCounts[cfg.name] = (stats.commandCounts[cfg.name] || 0) + 1
    try {
      await plugin.handler(ctx)
      const xp = !isOwner && cfg.category !== 'owner' ? users.XP_PER_COMMAND : 0
      await users.touchProfile(storage, primaryDigits, { xp, pushName: raw.pushName || '' }).catch(() => {})
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

  return { handle, handleParticipants, stats }
}
