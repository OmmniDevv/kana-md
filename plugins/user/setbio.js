import { getProfile, updateProfile } from '../../src/services/user-service.js'

export const config = {
  name: 'setbio',
  alias: ['bio'],
  category: 'user',
  description: { id: 'Pasang atau lihat bio singkat profilmu (tersimpan persisten)', en: 'Set or view your short profile bio (stored persistently)' },
  usage: '.setbio [teks bio]',
  example: '.setbio Suka kopi dan kode',
  cooldown: 3,
}

export const i18n = {
  id: {
    setbio: {
      empty: 'Biomu masih kosong. Pasang dengan: .setbio Suka kopi dan kode {mood}',
      current: '📝 BIO KAMU\n\n{bio}\n\nGanti dengan .setbio <teks baru> yaa~',
      saved: '✅ Bio tersimpan!\n\n{bio}\n\nProfilmu makin hidup sekarang~ {mood}',
      tooLong: 'Bionya kepanjangan, maksimal 120 karakter yaa~ {mood}',
    },
  },
  en: {
    setbio: {
      empty: 'Your bio is still empty. Set it with: .setbio Coffee and code lover {mood}',
      current: '📝 YOUR BIO\n\n{bio}\n\nChange it with .setbio <new text>~',
      saved: '✅ Bio saved!\n\n{bio}\n\nYour profile feels more alive now~ {mood}',
      tooLong: 'That bio is too long, maximum 120 characters~ {mood}',
    },
  },
}

export const test = { input: '.setbio Halo dunia', expect: /bio/i }

export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (!text) {
    if (!profile.bio) return ctx.reply(ctx.t('setbio.empty', { mood: ctx.say('mikir') }))
    return ctx.reply(ctx.t('setbio.current', { bio: profile.bio }))
  }
  if (text.length > 120) return ctx.reply(ctx.t('setbio.tooLong', { mood: ctx.say('gagal') }))
  await updateProfile(ctx.storage, ctx.senderDigits, { bio: text })
  return ctx.reply(ctx.t('setbio.saved', { bio: text, mood: ctx.say('sukses') }))
}
