import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { getGroupText } from '../../src/services/group-settings.js'
import { renderTemplate } from '../../src/config/templates.js'
import { digitsOf } from '../../src/services/guard-rules.js'
import { resolveGroupMembers } from '../../src/services/group-members.js'

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
      changed: '╭─❏ 👋 「 *WELCOME GRUP* 」\n┊ Siap~ welcome sekarang *{state}*~\n╰━━━━━━━ {mood}',
      on: 'AKTIF', off: 'mati',
      usage: '╭─❏ 👋 「 *WELCOME GRUP* 」\n┊ Pakai: *.welcome on* atau *.welcome off* yaa~\n╰━━━━━━━',
      hello: '╭─❏ 🎉 「 *SELAMAT DATANG* 」\n┊ Halo halo *@{digits}*~\n┊ Selamat datang di *{group}*!\n┊ KANA seneng banget kamu gabung, jangan lupa baca rules grup yaa, semoga betah!\n╰━━━━━━━ {mood}',
      helloText: '╭─❏ 🎉 「 *SELAMAT DATANG* 」\n┊ Halo halo *@{digits}*~\n┊ Selamat datang di *{group}*, semoga betah yaa!\n╰━━━━━━━ {mood}',
      bye: '╭─❏ 👋 「 *SAMPAI JUMPA* 」\n┊ Dadahh *@{digits}*~\n┊ Makasih udah pernah main di *{group}*, semoga sukses selalu yaa, KANA bakal kangen~\n╰━━━━━━━ {mood}',
      byeText: '╭─❏ 👋 「 *SAMPAI JUMPA* 」\n┊ Dadahh *@{digits}*~\n┊ Makasih udah pernah gabung di *{group}*, semoga sukses selalu yaa~\n╰━━━━━━━ {mood}',
    },
  },
  en: {
    welcome: {
      changed: '╭─❏ 👋 「 *GROUP WELCOME* 」\n┊ Got it~ welcome is now *{state}*~\n╰━━━━━━━ {mood}',
      on: 'ON', off: 'off',
      usage: '╭─❏ 👋 「 *GROUP WELCOME* 」\n┊ Use: *.welcome on* or *.welcome off*~\n╰━━━━━━━',
      hello: '╭─❏ 🎉 「 *WELCOME* 」\n┊ Hello hello *@{digits}*~\n┊ Welcome to *{group}*!\n┊ KANA is so happy you joined, please read the group rules, hope you enjoy it here!\n╰━━━━━━━ {mood}',
      helloText: '╭─❏ 🎉 「 *WELCOME* 」\n┊ Hello hello *@{digits}*~\n┊ Welcome to *{group}*, hope you enjoy it here!\n╰━━━━━━━ {mood}',
      bye: '╭─❏ 👋 「 *SEE YOU AGAIN* 」\n┊ Bye bye *@{digits}*~\n┊ Thanks for being in *{group}*, wishing you success always, KANA will miss you~\n╰━━━━━━━ {mood}',
      byeText: '╭─❏ 👋 「 *SEE YOU AGAIN* 」\n┊ Bye bye *@{digits}*~\n┊ Thanks for joining *{group}*, wishing you success always~\n╰━━━━━━━ {mood}',
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

// Semua digit identitas satu peserta (id, phoneNumber, lid, jid), supaya
// peserta berbentuk LID tetap bisa dicocokkan ke member bernomor asli.
function identityDigits(participant) {
  if (!participant) return []
  if (typeof participant === 'string') return [digitsOf(participant)].filter(Boolean)
  return [participant.id, participant.phoneNumber, participant.lid, participant.jid]
    .map((v) => digitsOf(v))
    .filter(Boolean)
}

export async function onParticipantsUpdate(ctx) {
  if (ctx.action !== 'add' && ctx.action !== 'remove') return
  const settings = await getGroupSettings(ctx.storage, ctx.chat)
  if (ctx.action === 'add' && !settings.welcome) return
  if (ctx.action === 'remove' && !settings.goodbye) return
  const isAdd = ctx.action === 'add'
  // Metadata segar langsung dari sock. ctx.getGroupMetadata memakai cache
  // 60 detik: member yang baru dikeluarkan masih ikut terhitung di sana
  // (kasus goodbye menulis "sisa 3 member" padahal harusnya 2).
  let meta = null
  try { meta = await ctx.sock.groupMetadata(ctx.chat) } catch {}
  if (!meta) {
    try { meta = await ctx.getGroupMetadata() } catch {}
  }
  let groupName = ctx.chat
  if (meta?.subject) groupName = meta.subject
  const freshParticipants = Array.isArray(meta?.participants) ? meta.participants : []
  // Peta resolusi LID ke nomor telepon asli (field phoneNumber metadata).
  // Untuk remove, peserta yang dikeluarkan bisa sudah hilang dari metadata
  // segar; lengkapi dari metadata tercache yang masih memuatnya.
  const { byDigits } = resolveGroupMembers(freshParticipants)
  if (!isAdd) {
    try {
      const cached = await ctx.getGroupMetadata()
      const extra = resolveGroupMembers(cached?.participants ?? []).byDigits
      for (const [d, m] of extra) if (!byDigits.has(d)) byDigits.set(d, m)
    } catch {}
  }
  // Hitungan dari metadata segar, disesuaikan dengan aksinya: remove
  // mengurangi target yang masih tercatat, add menambah target yang
  // belum tercatat, supaya angka tidak basi mengikuti cache.
  const present = new Set()
  for (const p of freshParticipants) for (const d of identityDigits(p)) present.add(d)
  let count = freshParticipants.length
  for (const participant of ctx.participants ?? []) {
    const seen = identityDigits(participant).some((d) => present.has(d))
    if (isAdd && !seen) count += 1
    if (!isAdd && seen) count -= 1
  }
  if (count < 0) count = 0
  const kind = isAdd ? 'welcome' : 'goodbye'
  const template = await getGroupText(ctx.storage, ctx.chat, kind)
  for (const participant of ctx.participants ?? []) {
    const rawJid = typeof participant === 'string' ? participant : participant?.id || String(participant)
    const member = identityDigits(participant).map((d) => byDigits.get(d)).find(Boolean) ?? null
    const ownPhone =
      participant && typeof participant === 'object' && participant.phoneNumber
        ? digitsOf(participant.phoneNumber)
        : rawJid.endsWith('@s.whatsapp.net')
          ? digitsOf(rawJid)
          : ''
    const digits = member?.digits || ownPhone || digitsOf(rawJid)
    const name = member?.name || digits
    const mentionJid = member?.jid || (digits ? `${digits}@s.whatsapp.net` : rawJid)
    const rendered = renderTemplate(template, {
      // Welcome dan goodbye sama sama menyebut member sebagai @nomor
      // dan kirimannya membawa mentions, supaya terender sebagai tag
      // nama asli di WhatsApp, bukan angka polos.
      user: `@${digits}`,
      group: groupName,
      count,
    })
    const caption =
      rendered.trim() ||
      ctx.t(isAdd ? 'welcome.hello' : 'welcome.bye', {
        digits, group: groupName, name, mood: ctx.say(isAdd ? 'senang' : 'pamit'),
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
        await ctx.sock.sendMessage(ctx.chat, { image, caption, mentions: [mentionJid] })
      } else {
        await ctx.sendText(textFallback, [mentionJid])
      }
    } catch {
      // Jangan jatuhkan hook karena satu kiriman gagal.
    }
  }
}
