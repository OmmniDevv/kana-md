import { sendButtons } from '../../src/ui/buttons.js'
import { createClan, joinClan, getClan, clanPower } from '../../src/rpg/engine.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'clan',
  alias: ['guild', 'myguild', 'guildlist', 'createguild', 'joinguild'],
  category: 'rpg',
  description: { id: 'Clan RPG: buat clan, gabung clan, dan lihat info clan', en: 'RPG clan: create a clan, join a clan, and see clan info' },
  usage: '.clan | .clan buat <nama> | .clan gabung <id>',
  example: '.clan buat Naga Moe',
  cooldown: 5,
}

export const i18n = {
  id: {
    clan: {
      noClan: 'Kamu belum punya clan nih 🥺\nBuat baru: .clan buat <nama>\nGabung yang ada: .clan gabung <id clan>',
      info: '🛡️ CLAN {name} 🛡️\nID: {id}\nPemilik: {owner}\nAnggota: {members} orang\nPower total: {power}\nBank clan: {bank} koin 🏦\n\nAjak clan lain perang pakai .clanwar yaa~',
      created: '🛡️ Clan {name} berhasil dibuat! ID clan: {id}\nAjak teman gabung pakai .clan gabung {id} yaa~\n{mood}',
      joined: '🛡️ Selamat datang di clan {name}! Sekarang kita satu keluarga~\n{mood}',
      already: 'Ehh, kamu udah punya clan lho... satu clan aja yaa 💕',
      taken: 'Mouu, nama clan itu udah dipakai clan lain... coba nama lain yaa 🥺',
      notFound: 'Clan dengan ID {id} nggak ketemu nih... cek lagi ID nya yaa',
      invalidName: 'Nama clannya yang bener dong~ contoh .clan buat Naga Moe',
      needArg: 'Ketik nama atau ID nya juga dong~ contoh .clan buat Naga Moe atau .clan gabung naga-moe',
      btnWar: 'Perang Clan',
      btnProfile: 'Profil RPG',
      btnMenu: 'Menu RPG',
    },
  },
  en: {
    clan: {
      noClan: 'You do not have a clan yet 🥺\nCreate one: .clan buat <name>\nJoin an existing one: .clan gabung <clan id>',
      info: '🛡️ CLAN {name} 🛡️\nID: {id}\nOwner: {owner}\nMembers: {members} people\nTotal power: {power}\nClan bank: {bank} coins 🏦\n\nChallenge other clans with .clanwar~',
      created: '🛡️ Clan {name} created! Clan ID: {id}\nInvite friends with .clan gabung {id}~\n{mood}',
      joined: '🛡️ Welcome to clan {name}! We are one family now~\n{mood}',
      already: 'Eh, you already have a clan... one clan only please 💕',
      taken: 'Mouu, that clan name is taken by another clan... try another name 🥺',
      notFound: 'Clan with ID {id} was not found... check the ID again',
      invalidName: 'Give a proper clan name please~ e.g. .clan buat Naga Moe',
      needArg: 'Type the name or ID too~ e.g. .clan buat Naga Moe or .clan gabung naga-moe',
      btnWar: 'Clan War',
      btnProfile: 'RPG Profile',
      btnMenu: 'RPG Menu',
    },
  },
}

export const test = { input: '.clan', expect: /clan/i }

export async function handler(ctx) {
  const replies = [
    { text: ctx.t('clan.btnWar'), id: '.clanwar' },
    { text: ctx.t('clan.btnProfile'), id: '.rpg' },
    { text: ctx.t('clan.btnMenu'), id: '.menurpg' },
  ]
  const send = (body) =>
    sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
  const action = (ctx.args?.[0] || '').toLowerCase()
  if (['buat', 'create', 'bikin'].includes(action)) {
    const name = (ctx.args ?? []).slice(1).join(' ').trim()
    if (!name) return send(ctx.t('clan.invalidName'))
    const res = await createClan(ctx.storage, ctx.senderDigits, name)
    if (res.ok) return send(ctx.t('clan.created', { name: res.clan.name, id: res.clan.id, mood: ctx.say('senang') }))
    if (res.reason === 'already_in_clan') return send(ctx.t('clan.already'))
    if (res.reason === 'name_taken') return send(ctx.t('clan.taken'))
    return send(ctx.t('clan.invalidName'))
  }
  if (['gabung', 'join'].includes(action)) {
    const id = (ctx.args?.[1] || '').toLowerCase()
    if (!id) return send(ctx.t('clan.needArg'))
    const res = await joinClan(ctx.storage, ctx.senderDigits, id)
    if (res.ok) return send(ctx.t('clan.joined', { name: res.clan.name, mood: ctx.say('senang') }))
    if (res.reason === 'already_in_clan') return send(ctx.t('clan.already'))
    return send(ctx.t('clan.notFound', { id }))
  }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.clanId) return send(ctx.t('clan.noClan'))
  const clan = await getClan(ctx.storage, profile.clanId)
  if (!clan) return send(ctx.t('clan.noClan'))
  const power = await clanPower(ctx.storage, clan)
  return send(
    ctx.t('clan.info', {
      name: clan.name,
      id: clan.id,
      owner: clan.owner,
      members: (clan.members ?? []).length,
      power,
      bank: clan.bank ?? 0,
    })
  )
}
