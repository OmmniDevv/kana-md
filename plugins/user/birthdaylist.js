
import { getProfile, updateProfile, limitState } from '../../src/services/user-service.js'
import { energyOf, restoreEnergy, MAX_ENERGY } from '../../src/rpg/energy.js'
const ownerNumber = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
export const config = {
  name: "birthdaylist",
  alias: [],
  category: "user",
  description: { id: "Lihat daftar ulang tahun member", en: "KANA version of the Elaina-MD birthdaylist feature, rewritten in KANA style" },
  usage: ".birthdaylist",
  example: ".birthdaylist",
  cooldown: 5,
}

export const i18n = {
  id: {
    "birthdaylist": {
      body: "╭─❏ 👤 「 *BIRTHDAYLIST* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 👤 「 *BIRTHDAYLIST* 」\n┊ {text}\n╰━━━━━━━",
    },
  },
  en: {
    "birthdaylist": {
      body: "╭─❏ 👤 「 *BIRTHDAYLIST* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 👤 「 *BIRTHDAYLIST* 」\n┊ {text}\n╰━━━━━━━",
    },
  },
}

const ACTION = "birthdaylist"
export const test = { input: '.birthdaylist', expect: /birthdaylist/i }
function todayKey() { return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10) }
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('birthdaylist.body', { text }))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const arg = (ctx.text || '').trim()
  if (ACTION === 'coins') return say('Koin kamu: *' + (profile.balance ?? 0) + '* koin 🪙')
  if (ACTION === 'energy') {
    const e = { energy: energyOf(profile) }
    return say('Energi kamu: *' + e.energy + '/' + MAX_ENERGY + '* ⚡ (pulih 1 per 5 menit)')
  }
  if (ACTION === 'buyenergy') {
    const cost = 100
    if ((profile.balance ?? 0) < cost) return say('Koinmu kurang, butuh *' + cost + '* koin buat isi energi penuh~')
    const before = { energy: energyOf(profile) }
    if (before.energy >= MAX_ENERGY) return say('Energimu sudah penuh~')
    await updateProfile(ctx.storage, ctx.senderDigits, { balance: profile.balance - cost })
    const r = { energy: await restoreEnergy(ctx.storage, ctx.senderDigits, MAX_ENERGY) }
    return say('Energi diisi penuh (*' + r.energy + '/' + MAX_ENERGY + '*) dengan *' + cost + '* koin. Sisa koin: *' + (profile.balance - cost) + '*')
  }
  if (ACTION === 'levelup') {
    const { levelFromXp, xpForLevel } = await import('../../src/services/user-service.js')
    const lvl = levelFromXp(profile.xp ?? 0)
    const need = xpForLevel(lvl + 1) - (profile.xp ?? 0)
    return say('Level kamu *' + lvl + '* (XP ' + (profile.xp ?? 0) + '). Butuh *' + Math.max(0, need) + ' XP* lagi buat level ' + (lvl + 1) + '. XP naik otomatis tiap kamu aktif memakai KANA~')
  }
  if (ACTION === 'tomoney') {
    const amount = Math.max(0, Math.floor(Number(ctx.args[0]) || 0))
    if (amount <= 0) return say('Format: .tomoney <jumlah xp> (100 XP = 10 koin)')
    if ((profile.xp ?? 0) < amount) return say('XP kamu kurang~')
    const coins = Math.floor(amount / 100) * 10
    await updateProfile(ctx.storage, ctx.senderDigits, { xp: profile.xp - amount, balance: (profile.balance ?? 0) + coins })
    return say('Menukar *' + amount + ' XP* jadi *' + coins + ' koin*. Saldo sekarang *' + (profile.balance + coins) + '*')
  }
  if (ACTION === 'unreg') {
    const serial = ctx.args[0] || ''
    if (!profile.registered) return say('Kamu memang belum terdaftar~')
    if (serial && serial !== (profile.serial || '')) return say('Serial number tidak cocok, batal hapus akunnya~')
    await ctx.storage.delete('users', ctx.senderDigits)
    return say('Akun kamu sudah dihapus dari KANA. Daftar lagi kapan pun dengan .daftar yaa~')
  }
  if (ACTION === 'listdaftar') {
    const owner = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
    try {
      const me = await ctx.sock.onWhatsApp(ctx.senderDigits + '@s.whatsapp.net')
      void me
    } catch {}
    const keys = (await ctx.storage.keys('users')).filter((k) => /^\d+$/.test(k))
    const rows = []
    for (const k of keys.slice(0, 200)) { const pr = await getProfile(ctx.storage, k); if (pr.registered) rows.push('* ' + (pr.regName || k) + ' (' + k + ')') }
    return say('User terdaftar (' + rows.length + '):\n┊ ' + (rows.slice(0, 40).join('\n┊ ') || '-'))
  }
  if (ACTION === 'setbirthday' || ACTION === 'birthdaylist') {
    const map = (await ctx.storage.get('kv', 'birthdays')) || {}
    if (ACTION === 'birthdaylist') {
      const rows = Object.entries(map)
      return say(rows.length ? 'Ulang tahun tersimpan:\n┊ ' + rows.map(([d, v]) => '* ' + d + ': ' + v).join('\n┊ ') : 'Belum ada ulang tahun tersimpan.')
    }
    const m = arg.match(/(\d{1,2})[-/](\d{1,2})/)
    if (!m) return say('Format: .setultah <tanggal-bulan>, contoh *.setultah 17-08*')
    map[ctx.senderDigits] = m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0')
    await ctx.storage.set('kv', 'birthdays', map)
    return say('Ulang tahun kamu disimpan: *' + map[ctx.senderDigits] + '* 🎂')
  }
  if (ACTION === 'owner') {
    return say('Owner KANA: wa.me/' + ownerNumber + '\n┊ Sapa dengan sopan yaa~')
  }
  return say('Siap~')
}
