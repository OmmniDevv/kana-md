
import { getProfile, updateProfile, addXp } from '../../src/services/user-service.js'
export const config = {
  name: "claninfo",
  alias: [],
  category: "clan",
  description: { id: "Lihat info clan", en: "KANA version of the Elaina-MD claninfo feature, rewritten in KANA style" },
  usage: ".claninfo",
  example: ".claninfo",
  cooldown: 5,
}

export const i18n = {
  id: {
    "claninfo": {
      body: "╭─❏ 🛡️ 「 *CLANINFO* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🛡️ 「 *CLANINFO* 」\n┊ {text}\n╰━━━━━━━",
    },
  },
  en: {
    "claninfo": {
      body: "╭─❏ 🛡️ 「 *CLANINFO* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🛡️ 「 *CLANINFO* 」\n┊ {text}\n╰━━━━━━━",
    },
  },
}

const ACTION = "info"
export const test = { input: '.claninfo', expect: /clan|🛡️/i }
function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) }
async function myClan(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.clanId) return { profile, clan: null }
  const clan = await ctx.storage.get('kv', 'clan:' + profile.clanId)
  return { profile, clan: clan ?? null }
}
async function saveClan(ctx, clan) { await ctx.storage.set('kv', 'clan:' + clan.id, clan); return clan }
export async function handler(ctx) {
  const arg = (ctx.text || '').trim()
  const { profile, clan } = await myClan(ctx)
  const say = (text) => ctx.reply(ctx.t('claninfo.body', { text }))
  if (ACTION === 'create') {
    if (clan) return say('Kamu sudah punya clan *' + clan.name + '*. Keluar dulu dengan .clanleave yaa~')
    if (!arg) return say('Tulis nama clannya yaa, contoh: .clancreate Naga Sakti')
    const id = slug(arg)
    const exists = await ctx.storage.get('kv', 'clan:' + id)
    if (exists) return say('Nama clan itu sudah dipakai, coba nama lain yaa~')
    const fresh = { id, name: arg.slice(0, 40), leader: ctx.senderDigits, members: { [ctx.senderDigits]: 'leader' }, xp: 0, bank: 0, desc: '', createdAt: Date.now(), warWins: 0, warLosses: 0, warHistory: [] }
    await saveClan(ctx, fresh)
    await updateProfile(ctx.storage, ctx.senderDigits, { clanId: id })
    return say('Clan *' + fresh.name + '* berhasil dibuat! ID clan: *' + id + '*\n┊ Ajak temanmu gabung dengan .clanjoin ' + id)
  }
  if (ACTION === 'join') {
    if (clan) return say('Kamu sudah di clan *' + clan.name + '*~')
    if (!arg) return say('Tulis ID clannya yaa, contoh: .clanjoin naga-sakti')
    const target = await ctx.storage.get('kv', 'clan:' + slug(arg))
    if (!target) return say('Clan itu tidak ditemukan~')
    target.members[ctx.senderDigits] = 'member'
    await saveClan(ctx, target)
    await updateProfile(ctx.storage, ctx.senderDigits, { clanId: target.id })
    return say('Selamat datang di clan *' + target.name + '*!')
  }
  if (!clan) return say('Kamu belum punya clan. Buat dengan .clancreate <nama> atau gabung dengan .clanjoin <id> yaa~')
  const isLeader = clan.leader === ctx.senderDigits
  const myRole = clan.members[ctx.senderDigits] || 'member'
  if (ACTION === 'leave') {
    if (isLeader) return say('Kamu leader clan ini. Serahkan clan atau bubarkan lewat persetujuan member dulu yaa, leader tidak bisa keluar begitu saja~')
    delete clan.members[ctx.senderDigits]
    await saveClan(ctx, clan)
    await updateProfile(ctx.storage, ctx.senderDigits, { clanId: '' })
    return say('Kamu keluar dari clan *' + clan.name + '*. Sampai jumpa~')
  }
  if (ACTION === 'info' || ACTION === 'rank' || ACTION === 'level' || ACTION === 'xp' || ACTION === 'bank' || ACTION === 'report') {
    const level = Math.floor(Math.sqrt((clan.xp || 0) / 100)) + 1
    const lines = ['Clan: *' + clan.name + '* (' + clan.id + ')', 'Leader: *' + clan.leader + '*', 'Member: *' + Object.keys(clan.members).length + '*', 'Level clan: *' + level + '* (XP ' + (clan.xp || 0) + ')', 'Kas clan: *' + (clan.bank || 0) + ' koin*', 'War: menang *' + (clan.warWins || 0) + '* / kalah *' + (clan.warLosses || 0) + '*', clan.desc ? 'Deskripsi: ' + clan.desc : 'Deskripsi: -'].join('\n┊ ')
    return say(lines)
  }
  if (ACTION === 'members') {
    const lines = Object.entries(clan.members).map(([d, r], i) => (i + 1) + '. *' + d + '* (' + r + ')').join('\n┊ ')
    return say('Member clan *' + clan.name + '*:\n┊ ' + lines)
  }
  if (ACTION === 'rename' || ACTION === 'desc') {
    if (!isLeader && myRole !== 'co-leader') return say('Cuma leader/co-leader yang bisa mengubah clan~')
    if (!arg) return say('Tulis teks barunya yaa~')
    if (ACTION === 'rename') clan.name = arg.slice(0, 40); else clan.desc = arg.slice(0, 200)
    await saveClan(ctx, clan)
    return say('Siap, clan diperbarui jadi: *' + arg.slice(0, 60) + '*')
  }
  if (ACTION === 'invite' || ACTION === 'kick' || ACTION === 'promote' || ACTION === 'demote') {
    const target = (arg.replace(/\D/g, '') || (ctx.mentionedJids?.[0] || '').replace(/\D/g, ''))
    if (!target) return say('Sebut nomor targetnya yaa, contoh: .claninfo 62812xxxx')
    if (ACTION === 'invite') {
      const tp = await getProfile(ctx.storage, target)
      if (tp.clanId) return say('User itu sudah punya clan lain~')
      clan.members[target] = 'member'
      await saveClan(ctx, clan)
      await updateProfile(ctx.storage, target, { clanId: clan.id })
      return say('User *' + target + '* ditambahkan ke clan *' + clan.name + '*')
    }
    if (!isLeader && myRole !== 'co-leader') return say('Cuma leader/co-leader yang bisa ini~')
    if (ACTION === 'kick') {
      if (target === clan.leader) return say('Leader tidak bisa dikeluarkan~')
      delete clan.members[target]
      await saveClan(ctx, clan)
      await updateProfile(ctx.storage, target, { clanId: '' })
      return say('User *' + target + '* dikeluarkan dari clan.')
    }
    if (!clan.members[target]) return say('User itu bukan member clan ini~')
    clan.members[target] = ACTION === 'promote' ? 'co-leader' : 'member'
    await saveClan(ctx, clan)
    return say('Jabatan *' + target + '* sekarang *' + clan.members[target] + '*')
  }
  if (ACTION === 'checkin') {
    const today = new Date().toISOString().slice(0, 10)
    const key = 'clancheckin:' + ctx.senderDigits + ':' + today
    if (await ctx.storage.get('kv', key)) return say('Kamu sudah check-in clan hari ini~')
    await ctx.storage.set('kv', key, { at: Date.now() })
    clan.xp = (clan.xp || 0) + 20
    await saveClan(ctx, clan)
    await addXp(ctx.storage, ctx.senderDigits, 10)
    return say('Check-in clan berhasil! Clan +20 XP, kamu +10 XP~')
  }
  if (ACTION === 'boss' || ACTION === 'raid' || ACTION === 'announce') {
    if (ACTION === 'announce') {
      if (!isLeader && myRole !== 'co-leader') return say('Cuma leader/co-leader yang bisa kirim pengumuman clan~')
      if (!arg) return say('Tulis isi pengumumannya yaa~')
      const mentions = Object.keys(clan.members).map((d) => d + '@s.whatsapp.net')
      await ctx.sock.sendMessage(ctx.chat, { text: '📣 Pengumuman clan *' + clan.name + '*:\n' + arg, mentions }, { quoted: ctx.raw })
      return say('Pengumuman terkirim ke member yang ada di chat ini~')
    }
    const gain = ACTION === 'boss' ? 50 + Math.floor(Math.random() * 80) : 30 + Math.floor(Math.random() * 50)
    clan.xp = (clan.xp || 0) + gain
    clan.bank = (clan.bank || 0) + Math.floor(gain / 2)
    await saveClan(ctx, clan)
    await addXp(ctx.storage, ctx.senderDigits, 15)
    return say('Serangan clan berhasil! Clan +' + gain + ' XP dan kas +' + Math.floor(gain / 2) + ' koin. Kamu +15 XP~')
  }
  if (ACTION === 'upgrade') {
    const level = Math.floor(Math.sqrt((clan.xp || 0) / 100)) + 1
    const cost = level * 500
    if (!isLeader) return say('Cuma leader yang bisa upgrade clan~')
    if ((clan.bank || 0) < cost) return say('Kas clan kurang. Butuh *' + cost + ' koin*, kas sekarang *' + (clan.bank || 0) + '*')
    clan.bank -= cost
    clan.xp = (clan.xp || 0) + 100 * level
    await saveClan(ctx, clan)
    return say('Clan di-upgrade! XP clan naik, level sekarang *' + (Math.floor(Math.sqrt(clan.xp / 100)) + 1) + '*')
  }
  if (ACTION === 'war') {
    if (!arg) return say('Tulis ID clan lawan yaa, contoh: .clanwar naga-sakti')
    const enemy = await ctx.storage.get('kv', 'clan:' + slug(arg))
    if (!enemy) return say('Clan lawan tidak ditemukan~')
    if (enemy.id === clan.id) return say('Tidak bisa war lawan clan sendiri~')
    await ctx.storage.set('kv', 'clanwar:' + enemy.id, { from: clan.id, at: Date.now() })
    return say('Tantangan war dikirim ke clan *' + enemy.name + '*. Leader mereka bisa menerima dengan .clanwaraccept')
  }
  if (ACTION === 'waraccept') {
    const pending = await ctx.storage.get('kv', 'clanwar:' + clan.id)
    if (!pending) return say('Tidak ada tantangan war yang menunggu~')
    const enemy = await ctx.storage.get('kv', 'clan:' + pending.from)
    await ctx.storage.delete('kv', 'clanwar:' + clan.id)
    const myScore = Object.keys(clan.members).length * 10 + (clan.xp || 0) % 97 + Math.floor(Math.random() * 50)
    const enScore = enemy ? Object.keys(enemy.members).length * 10 + (enemy.xp || 0) % 97 + Math.floor(Math.random() * 50) : 0
    const win = myScore >= enScore
    if (win) { clan.warWins = (clan.warWins || 0) + 1; if (enemy) enemy.warLosses = (enemy.warLosses || 0) + 1 } else { clan.warLosses = (clan.warLosses || 0) + 1; if (enemy) enemy.warWins = (enemy.warWins || 0) + 1 }
    clan.warHistory = [...(clan.warHistory || []), { vs: pending.from, win, at: Date.now() }].slice(-10)
    await saveClan(ctx, clan)
    if (enemy) { enemy.warHistory = [...(enemy.warHistory || []), { vs: clan.id, win: !win, at: Date.now() }].slice(-10); await saveClan(ctx, enemy) }
    return say('Clan war selesai! Skor clanmu *' + myScore + '* vs *' + enScore + '*. ' + (win ? 'MENANG! 🎉' : 'Kalah kali ini, coba lagi yaa~'))
  }
  if (ACTION === 'warhistory' || ACTION === 'warscore') {
    const hist = (clan.warHistory || []).slice(-5).map((h) => '- vs *' + h.vs + '*: ' + (h.win ? 'menang' : 'kalah')).join('\n┊ ') || 'belum ada riwayat war'
    return say('Rekor war: menang *' + (clan.warWins || 0) + '* / kalah *' + (clan.warLosses || 0) + '*\n┊ ' + hist)
  }
  if (ACTION === 'leaderboard') {
    const keys = await ctx.storage.keys('kv')
    const rows = []
    for (const k of keys) { if (k.startsWith('clan:')) { const c = await ctx.storage.get('kv', k); if (c) rows.push(c) } }
    rows.sort((a, b) => (b.xp || 0) - (a.xp || 0))
    const lines = rows.slice(0, 10).map((c, i) => (i + 1) + '. *' + c.name + '* - XP ' + (c.xp || 0)).join('\n┊ ') || 'belum ada clan'
    return say('Leaderboard clan:\n┊ ' + lines)
  }
  return say('Aksi clan ini tercatat. Pakai .claninfo buat lihat status clanmu~')
}
