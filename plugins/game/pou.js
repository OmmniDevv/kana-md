// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka generik. Sekarang peliharaan virtual beneran: state Pou (kenyang,
// bahagia, energi) tersimpan di profil, membusuk seiring waktu, dan aksi
// makan/main/tidur mengubahnya secara nyata dan terbaca lagi.
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'pou',
  alias: [],
  category: 'game',
  description: { id: 'Peliharaan virtual Pou: beri makan, ajak main, dan tidurkan; statnya tersimpan di profilmu', en: 'Virtual pet Pou: feed, play, and put it to sleep; its stats persist in your profile' },
  usage: '.pou | .pou makan | .pou main | .pou tidur',
  example: '.pou makan',
  cooldown: 3,
}

export const FOOD_COST = 15

export function defaultPou(now = Date.now()) {
  return { name: 'Pou', kenyang: 80, bahagia: 80, energi: 90, updatedAt: now }
}

// Stat membusuk seiring jam berlalu sejak update terakhir.
export function decayPou(pou, now = Date.now()) {
  const state = { ...defaultPou(now), ...(pou ?? {}) }
  const hours = Math.max(0, (now - (state.updatedAt ?? now)) / 3600000)
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)))
  return {
    ...state,
    kenyang: clamp(state.kenyang - hours * 4),
    bahagia: clamp(state.bahagia - hours * 3),
    energi: clamp(state.energi - hours * 2),
    updatedAt: now,
  }
}

// Aksi murni: kembalikan state baru atau { error } bila syarat tidak cukup.
export function applyPouAction(state, action) {
  const s = { ...state }
  if (action === 'makan') {
    if (s.kenyang >= 100) return { error: 'full' }
    s.kenyang = Math.min(100, s.kenyang + 35)
    s.bahagia = Math.min(100, s.bahagia + 3)
    return { state: s }
  }
  if (action === 'main') {
    if (s.energi < 12) return { error: 'tired' }
    s.energi -= 12
    s.bahagia = Math.min(100, s.bahagia + 30)
    s.kenyang = Math.max(0, s.kenyang - 6)
    return { state: s }
  }
  if (action === 'tidur') {
    s.energi = Math.min(100, s.energi + 45)
    s.kenyang = Math.max(0, s.kenyang - 8)
    s.bahagia = Math.min(100, s.bahagia + 2)
    return { state: s }
  }
  return { error: 'unknown' }
}

function bar(v) {
  const filled = Math.round(v / 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

export const i18n = {
  id: {
    pou: {
      title: 'Pou KANA',
      status: '╭─❏ 🟤 「 *POU KAMU* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ KENYANG: {barK} *{kenyang}%*\n┊ BAHAGIA: {barB} *{bahagia}%*\n┊ ENERGI: {barE} *{energi}%*\n┊ Rawat pakai *.pou makan* (15 koin), *.pou main*, *.pou tidur*\n╰━━━━━━━',
      done: '╭─❏ 🟤 「 *POU KAMU* 」\n┊ {note}\n┊ KENYANG: *{kenyang}%* | BAHAGIA: *{bahagia}%* | ENERGI: *{energi}%*\n╰━━━━━━━',
      noteMakan: 'Nyam nyam! Pou makan dengan lahap 🍔',
      noteMain: 'Pou main lompat-lompatan dengan gembira 🎈',
      noteTidur: 'Pou tidur nyenyak, energinya pulih 😴',
      full: '╭─❏ 🟤 「 *POU KAMU* 」\n┊ Pou sudah kenyang banget, tidak bisa makan lagi~\n╰━━━━━━━',
      tired: '╭─❏ 🟤 「 *POU KAMU* 」\n┊ Pou kelelahan, energinya kurang buat main. Tidurkan dulu yaa~\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *SALDO KURANG* 」\n┊ Makanan Pou harganya *{cost} koin*, saldo kamu *{balance} koin*~\n╰━━━━━━━',
      btnFeed: '🍔 Kasih Makan',
      btnPlay: '🎈 Ajak Main',
      btnSleep: '😴 Tidurkan',
    },
  },
  en: {
    pou: {
      title: 'KANA Pou',
      status: '╭─❏ 🟤 「 *YOUR POU* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ FULLNESS: {barK} *{kenyang}%*\n┊ HAPPINESS: {barB} *{bahagia}%*\n┊ ENERGY: {barE} *{energi}%*\n┊ Care with *.pou makan* (15 coins), *.pou main*, *.pou tidur*\n╰━━━━━━━',
      done: '╭─❏ 🟤 「 *YOUR POU* 」\n┊ {note}\n┊ FULLNESS: *{kenyang}%* | HAPPINESS: *{bahagia}%* | ENERGY: *{energi}%*\n╰━━━━━━━',
      noteMakan: 'Nom nom! Pou eats happily 🍔',
      noteMain: 'Pou plays and jumps around joyfully 🎈',
      noteTidur: 'Pou sleeps soundly, energy restored 😴',
      full: '╭─❏ 🟤 「 *YOUR POU* 」\n┊ Pou is completely full, it cannot eat more~\n╰━━━━━━━',
      tired: '╭─❏ 🟤 「 *YOUR POU* 」\n┊ Pou is exhausted, not enough energy to play. Put it to sleep first~\n╰━━━━━━━',
      poor: '╭─❏ 💸 「 *NOT ENOUGH COINS* 」\n┊ Pou food costs *{cost} coins*, your balance is *{balance} coins*~\n╰━━━━━━━',
      btnFeed: '🍔 Feed',
      btnPlay: '🎈 Play',
      btnSleep: '😴 Sleep',
    },
  },
}

export const test = { input: '.pou', expect: /kenyang|fullness/i }

export async function handler(ctx) {
  const action = (ctx.args?.[0] ?? '').toLowerCase()
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const state = decayPou(profile.pou)
  const buttons = [
    { text: ctx.t('pou.btnFeed'), id: '.pou makan' },
    { text: ctx.t('pou.btnPlay'), id: '.pou main' },
    { text: ctx.t('pou.btnSleep'), id: '.pou tidur' },
  ]
  if (!['makan', 'main', 'tidur'].includes(action)) {
    await updateProfile(ctx.storage, ctx.senderDigits, { pou: state })
    const body = ctx.t('pou.status', {
      name: state.name, kenyang: state.kenyang, bahagia: state.bahagia, energi: state.energi,
      barK: bar(state.kenyang), barB: bar(state.bahagia), barE: bar(state.energi),
    })
    return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('pou.title'), body, footer: ctx.t('menu.footer'), replies: buttons, textFallback: body })
  }
  if (action === 'makan' && (profile.balance ?? 0) < FOOD_COST) {
    return ctx.reply(ctx.t('pou.poor', { cost: FOOD_COST, balance: profile.balance ?? 0 }))
  }
  const result = applyPouAction(state, action)
  if (result.error === 'full') return ctx.reply(ctx.t('pou.full'))
  if (result.error === 'tired') return ctx.reply(ctx.t('pou.tired'))
  const patch = { pou: result.state }
  if (action === 'makan') patch.balance = (profile.balance ?? 0) - FOOD_COST
  await updateProfile(ctx.storage, ctx.senderDigits, patch)
  const noteKey = action === 'makan' ? 'pou.noteMakan' : action === 'main' ? 'pou.noteMain' : 'pou.noteTidur'
  const body = ctx.t('pou.done', { note: ctx.t(noteKey), kenyang: result.state.kenyang, bahagia: result.state.bahagia, energi: result.state.energi })
  return sendButtons(ctx.sock, ctx.chat, { title: ctx.t('pou.title'), body, footer: ctx.t('menu.footer'), replies: buttons, textFallback: body })
}
