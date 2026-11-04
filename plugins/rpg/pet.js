import { sendButtons } from '../../src/ui/buttons.js'
import { petAdopt, petFeed } from '../../src/rpg/engine.js'
import { PETS, PET_MAP } from '../../src/rpg/data.js'
import { getProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'pet',
  alias: ['petshop', 'feed', 'kandang', 'battlepet', 'rpgcat'],
  category: 'rpg',
  description: { id: 'Peliharaan RPG: adopsi, kasih makan, dan naikkan levelnya', en: 'RPG pet: adopt, feed, and level it up' },
  usage: '.pet | .pet adopsi <kucing|anjing|burung|naga> | .pet makan',
  example: '.pet adopsi kucing',
  cooldown: 3,
}

export const i18n = {
  id: {
    pet: {
      noPet: '╭─❏ ✨ 「 *PET* 」\n┊ Kamu belum punya pet nih 🥺\n┊ Adopsi yuk: .pet adopsi <jenis>\n┊ Pilihan: {list}\n╰━━━━━━━',
      listLine: '{emoji} {name} ({id})',
      status: '╭─❏ 🐾 「 *PET* 」\n┊ 🐾 PET KAMU 🐾\n┊ {emoji} {name}\n┊ ʟᴇᴠᴇʟ: {level}\n┊ XP pet: {xp}\n┊ Terakhir makan: {fed}\n\n┊ Kasih makan: .pet makan (butuh 1 Makanan Pet, beli di .shop)\n╰━━━━━━━',
      neverFed: 'belum pernah',
      adopted: '╭─❏ 🐾 「 *PET* 」\n┊ 🐾 Yayy, kamu adopsi {emoji} {name}! Rawat baik baik yaa, kasih makan pakai .pet makan~\n┊ {mood}\n╰━━━━━━━',
      hasPet: '╭─❏ ✨ 「 *PET* 」\n┊ Ehh, kamu udah punya pet lho~ satu dulu yaa, rawat dia baik baik 💕\n╰━━━━━━━',
      unknownKind: '╭─❏ ✨ 「 *PET* 」\n┊ Jenis {kind} nggak ada nih... pilihannya: {list}\n╰━━━━━━━',
      fed: '╭─❏ 🦴 「 *PET* 」\n┊ 🦴 Nom nom! {name} makan dengan lahap~\n┊ XP pet +25, level sekarang {level} 🎉\n┊ {mood}\n╰━━━━━━━',
      noFood: '╭─❏ ✨ 「 *PET* 」\n┊ Mouu, Makanan Pet kamu habis... beli dulu di .shop yaa 🥺\n╰━━━━━━━',
      btnFeed: 'Kasih Makan',
      btnShop: 'Toko',
      btnProfile: 'Profil RPG',
    },
  },
  en: {
    pet: {
      noPet: '╭─❏ ✨ 「 *PET* 」\n┊ You do not have a pet yet 🥺\n┊ Adopt one: .pet adopsi <kind>\n┊ Options: {list}\n╰━━━━━━━',
      listLine: '{emoji} {name} ({id})',
      status: '╭─❏ 🐾 「 *PET* 」\n┊ 🐾 YOUR PET 🐾\n┊ {emoji} {name}\n┊ ʟᴇᴠᴇʟ: {level}\n┊ Pet XP: {xp}\n┊ Last fed: {fed}\n\n┊ Feed it: .pet makan (needs 1 Pet Food, buy in .shop)\n╰━━━━━━━',
      neverFed: 'never yet',
      adopted: '╭─❏ 🐾 「 *PET* 」\n┊ 🐾 Yayy, you adopted {emoji} {name}! Take good care of it, feed it with .pet makan~\n┊ {mood}\n╰━━━━━━━',
      hasPet: '╭─❏ ✨ 「 *PET* 」\n┊ Eh, you already have a pet~ one for now, take good care of it 💕\n╰━━━━━━━',
      unknownKind: '╭─❏ ✨ 「 *PET* 」\n┊ Kind {kind} does not exist... options: {list}\n╰━━━━━━━',
      fed: '╭─❏ 🦴 「 *PET* 」\n┊ 🦴 Nom nom! {name} ate happily~\n┊ Pet XP +25, level now {level} 🎉\n┊ {mood}\n╰━━━━━━━',
      noFood: '╭─❏ ✨ 「 *PET* 」\n┊ Mouu, you are out of Pet Food... buy some in .shop first 🥺\n╰━━━━━━━',
      btnFeed: 'Feed Pet',
      btnShop: 'Shop',
      btnProfile: 'RPG Profile',
    },
  },
}

function petList(ctx) {
  return PETS.map((p) => ctx.t('pet.listLine', { emoji: p.emoji, name: p.name[ctx.lang] ?? p.name.id, id: p.id })).join(', ')
}

export const test = { input: '.pet', expect: /pet/i }

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
