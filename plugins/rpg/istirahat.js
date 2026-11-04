import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { energyOf, restoreEnergy } from '../../src/rpg/energy.js'

export const config = {
  name: 'istirahat',
  alias: ['rest', 'tidur'],
  category: 'rpg',
  description: { id: 'Istirahat gratis: pulihkan 40 energi, bisa dipakai tiap 2 jam', en: 'Free rest: restore 40 energy, usable every 2 hours' },
  usage: '.istirahat',
  example: '.istirahat',
  cooldown: 10,
}

export const i18n = {
  id: {
    istirahat: {
      done: '╭─❏ 😴 「 *ISTIRAHAT* 」\n┊ 😴 Kamu tidur siang sebentar di bawah pohon. Energi sekarang {energy}/100. {mood}\n╰━━━━━━━',
      wait: '╭─❏ ✨ 「 *ISTIRAHAT* 」\n┊ Kamu baru istirahat barusan. Bisa istirahat gratis lagi dalam {minutes} menit, atau pulih penuh lewat .heal yaa~ {mood}\n╰━━━━━━━',
    },
  },
  en: {
    istirahat: {
      done: '╭─❏ 😴 「 *ISTIRAHAT* 」\n┊ 😴 You napped under a tree. Energy is now {energy}/100. {mood}\n╰━━━━━━━',
      wait: '╭─❏ ✨ 「 *ISTIRAHAT* 」\n┊ You just rested. Free rest is available again in {minutes} minutes, or restore fully with .heal~ {mood}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.istirahat', expect: /energi|energy/i }

const WAIT_MS = 2 * 3600_000

export async function handler(ctx) {
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  const now = Date.now()
  if (profile.lastRest && now - profile.lastRest < WAIT_MS) {
    const minutes = Math.ceil((WAIT_MS - (now - profile.lastRest)) / 60000)
    return ctx.reply(ctx.t('istirahat.wait', { minutes, mood: ctx.say('ngantuk') }))
  }
  await updateProfile(ctx.storage, ctx.senderDigits, { lastRest: now })
  const next = await restoreEnergy(ctx.storage, ctx.senderDigits, 40)
  return ctx.reply(ctx.t('istirahat.done', { energy: next || energyOf(profile), mood: ctx.say('sukses') }))
}
