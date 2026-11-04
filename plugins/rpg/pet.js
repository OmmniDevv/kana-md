import { sendButtons } from '../../src/ui/buttons.js'
import { petAdopt, petFeed } from '../../src/rpg/engine.js'
import { PETS, PET_MAP } from '../../src/rpg/data.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'pet',
  alias: [],
  category: 'rpg',
  description: { id: 'Peliharaan RPG: adopsi, kasih makan, dan naikkan levelnya', en: 'RPG pet: adopt, feed, and level it up' },
  usage: '.pet | .pet adopsi <kucing|anjing|burung|naga> | .pet makan',
  example: '.pet adopsi kucing',
  cooldown: 3,
}

export const i18n = {
  id: {
    pet: {
      noPet: 'Kamu belum punya pet nih 🥺\nAdopsi yuk: .pet adopsi <jenis>\nPilihan: {list}',
      listLine: '{emoji} {name} ({id})',
      status: '🐾 PET KAMU 🐾\n{emoji} {name}\nLevel: {level}\nXP pet: {xp}\nTerakhir makan: {fed}\n\nKasih makan: .pet makan (butuh 1 Makanan Pet, beli di .shop)',
      neverFed: 'belum pernah',
      adopted: '🐾 Yayy, kamu adopsi {emoji} {name}! Rawat baik baik yaa, kasih makan pakai .pet makan~\n{mood}',
      hasPet: 'Ehh, kamu udah punya pet lho~ satu dulu yaa, rawat dia baik baik 💕',
      unknownKind: 'Jenis {kind} nggak ada nih... pilihannya: {list}',
      fed: '🦴 Nom nom! {name} makan dengan lahap~\nXP pet +25, level sekarang {level} 🎉\n{mood}',
      noFood: 'Mouu, Makanan Pet kamu habis... beli dulu di .shop yaa 🥺',
      btnFeed: 'Kasih Makan',
      btnShop: 'Toko',
      btnProfile: 'Profil RPG',
    },
  },
  en: {
    pet: {
      noPet: 'You do not have a pet yet 🥺\nAdopt one: .pet adopsi <kind>\nOptions: {list}',
      listLine: '{emoji} {name} ({id})',
      status: '🐾 YOUR PET 🐾\n{emoji} {name}\nLevel: {level}\nPet XP: {xp}\nLast fed: {fed}\n\nFeed it: .pet makan (needs 1 Pet Food, buy in .shop)',
      neverFed: 'never yet',
      adopted: '🐾 Yayy, you adopted {emoji} {name}! Take good care of it, feed it with .pet makan~\n{mood}',
      hasPet: 'Eh, you already have a pet~ one for now, take good care of it 💕',
      unknownKind: 'Kind {kind} does not exist... options: {list}',
      fed: '🦴 Nom nom! {name} ate happily~\nPet XP +25, level now {level} 🎉\n{mood}',
      noFood: 'Mouu, you are out of Pet Food... buy some in .shop first 🥺',
      btnFeed: 'Feed Pet',
      btnShop: 'Shop',
      btnProfile: 'RPG Profile',
    },
  },
}

function petList(ctx) {
  return PETS.map((p) => ctx.t('pet.listLine', { emoji: p.emoji, name: p.name[ctx.lang] ?? p.name.id, id: p.id })).join(', ')
}

export async function handler(ctx) {
  const replies = [
    { text: ctx.t('pet.btnFeed'), id: '.pet makan' },
    { text: ctx.t('pet.btnShop'), id: '.shop' },
    { text: ctx.t('pet.btnProfile'), id: '.rpg' },
  ]
  const send = (body) =>
    sendButtons(ctx.sock, ctx.chat, { title: 'KANA RPG', body, footer: ctx.t('menu.footer'), replies, textFallback: body })
  const action = (ctx.args?.[0] || '').toLowerCase()
  if (['adopsi', 'adopt'].includes(action)) {
    const kind = (ctx.args?.[1] || '').toLowerCase()
    const res = await petAdopt(ctx.storage, ctx.senderDigits, kind)
    if (res.ok) {
      const def = PET_MAP[kind]
      return send(ctx.t('pet.adopted', { emoji: def.emoji, name: def.name[ctx.lang] ?? def.name.id, mood: ctx.say('senang') }))
    }
    if (res.reason === 'has_pet') return send(ctx.t('pet.hasPet'))
    return send(ctx.t('pet.unknownKind', { kind, list: petList(ctx) }))
  }
  if (['makan', 'feed'].includes(action)) {
    const res = await petFeed(ctx.storage, ctx.senderDigits)
    if (res.ok) {
      const def = PET_MAP[res.pet.kind]
      return send(ctx.t('pet.fed', { name: def ? def.name[ctx.lang] ?? def.name.id : res.pet.kind, level: res.pet.level, mood: ctx.say('senang') }))
    }
    if (res.reason === 'no_food') return send(ctx.t('pet.noFood'))
    return send(ctx.t('pet.noPet', { list: petList(ctx) }))
  }
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!profile.pet) return send(ctx.t('pet.noPet', { list: petList(ctx) }))
  const def = PET_MAP[profile.pet.kind]
  return send(
    ctx.t('pet.status', {
      emoji: def?.emoji ?? '🐾',
      name: def ? def.name[ctx.lang] ?? def.name.id : profile.pet.kind,
      level: profile.pet.level ?? 1,
      xp: profile.pet.xp ?? 0,
      fed: profile.pet.fedAt ? String(profile.pet.fedAt).slice(0, 10) : ctx.t('pet.neverFed'),
    })
  )
}
