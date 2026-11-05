import { getProfile } from '../../src/services/user-service.js'
import { memberJids, participantJid } from './randomtag.js'

// Jodoh grup: pasangkan dua member grup berbeda secara acak dan tag dua
// duanya, seperti fitur jodoh Elaina-MD. Nama memakai nama profil KANA
// bila member sudah mengisi profil, selain itu cukup @nomor.
export const config = {
  name: 'jodoh',
  alias: [],
  category: 'fun',
  description: { id: 'Pasangkan dua member grup secara acak dengan tag', en: 'Pair two random group members with tags' },
  usage: '.jodoh',
  example: '.jodoh',
  cooldown: 5,
  isGroup: true,
}

export const i18n = {
  id: {
    jodoh: {
      result: '╭─❏ 💘 「 *JODOH RANDOM* 」\n┊ 👤 {label1}\n┊ ❤️\n┊ 👤 {label2}\n┊\n┊ 📊 Kecocokan: *{percent}%*\n┊ {bar}\n┊ Status: *{status}*\n┊ {hearts}\n┊\n┊ _{quote}_\n╰━━━━━━━',
      tooFew: '╭─❏ 💘 「 *JODOH RANDOM* 」\n┊ Minimal ada 2 member selain KANA buat dijodohkan~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *JODOH GAGAL* 」\n┊ Mouu, data grupnya gagal diambil: *{message}*\n╰━━━━━━━',
      statuses: ['Butuh usaha lebih', 'Bisa dicoba', 'Lumayan cocok', 'Sangat cocok', 'JODOH SEJATI'],
      quotes: [
        'Cinta sejati tidak pernah mengenal jarak.',
        'Dua hati yang bersatu takkan terpisahkan.',
        'Kalian seperti puzzle yang pas banget.',
        'Chemistry-nya kuat banget nih.',
        'Couple goals banget sih kalian.',
        'Kayaknya semesta lagi kerja sama nih.',
        'Perfect match detected.',
        'Jodoh memang tidak ke mana.',
      ],
    },
  },
  en: {
    jodoh: {
      result: '╭─❏ 💘 「 *RANDOM MATCH* 」\n┊ 👤 {label1}\n┊ ❤️\n┊ 👤 {label2}\n┊\n┊ 📊 Compatibility: *{percent}%*\n┊ {bar}\n┊ Status: *{status}*\n┊ {hearts}\n┊\n┊ _{quote}_\n╰━━━━━━━',
      tooFew: '╭─❏ 💘 「 *RANDOM MATCH* 」\n┊ At least 2 members besides KANA are needed for a match~\n╰━━━━━━━',
      fail: '╭─❏ 💦 「 *MATCH FAILED* 」\n┊ Mouu, group data failed to load: *{message}*\n╰━━━━━━━',
      statuses: ['Needs more effort', 'Worth a try', 'Pretty compatible', 'Very compatible', 'TRUE MATCH'],
      quotes: [
        'True love knows no distance.',
        'Two united hearts cannot be separated.',
        'You two fit like perfect puzzle pieces.',
        'The chemistry is really strong.',
        'Total couple goals, you two.',
        'The universe seems to be cooperating.',
        'Perfect match detected.',
        'Fate really does its thing.',
      ],
    },
  },
}

export const test = { input: '.jodoh', expect: /jodoh random|random match/i }

function digitsOf(jid) {
  return String(jid ?? '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

// Pilih dua member berbeda (Fisher-Yates, rng bisa disuntik buat tes).
export function pickPair(participants, { botJid = '', rng = Math.random } = {}) {
  const members = memberJids(participants, botJid)
  if (members.length < 2) return null
  for (let i = members.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)))
    ;[members[i], members[j]] = [members[j], members[i]]
  }
  return [members[0], members[1]]
}

export function statusIndex(percent) {
  if (percent >= 90) return 4
  if (percent >= 70) return 3
  if (percent >= 50) return 2
  if (percent >= 30) return 1
  return 0
}

export function heartsFor(percent) {
  const count = Math.max(1, Math.ceil(percent / 20))
  return '💕'.repeat(count)
}

export function progressBar(percent) {
  const filled = Math.floor(percent / 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

export function formatMatch(t, langPack, { label1, label2, percent, quote }) {
  return t('jodoh.result', {
    label1,
    label2,
    percent,
    bar: progressBar(percent),
    status: langPack.statuses[statusIndex(percent)],
    hearts: heartsFor(percent),
    quote,
  })
}

export async function handler(ctx) {
  let meta = ctx.groupMetadata
  if (!meta) {
    try {
      meta = await ctx.getGroupMetadata()
    } catch (err) {
      return ctx.reply(ctx.t('jodoh.fail', { message: err.message }))
    }
  }
  const participants = meta?.participants ?? []
  const pair = pickPair(participants, { botJid: ctx.botJid })
  if (!pair) return ctx.reply(ctx.t('jodoh.tooFew'))
  const [jid1, jid2] = pair

  const labelFor = async (jid) => {
    const digits = digitsOf(jid)
    let name = ''
    try {
      const profile = await getProfile(ctx.storage, digits)
      name = profile.name || profile.regName || ''
    } catch {
      name = ''
    }
    return name ? `*${name}* (@${digits})` : `@${digits}`
  }
  const [label1, label2] = [await labelFor(jid1), await labelFor(jid2)]
  const percent = 1 + Math.floor(Math.random() * 100)
  const pack = i18n[ctx.lang]?.jodoh ?? i18n.id.jodoh
  const quote = pack.quotes[Math.floor(Math.random() * pack.quotes.length)]
  const text = formatMatch(ctx.t, pack, { label1, label2, percent, quote })
  return ctx.sock.sendMessage(ctx.chat, { text, mentions: [jid1, jid2] }, { quoted: ctx.raw })
}

export { participantJid }
