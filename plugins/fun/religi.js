import { ayat, hadits } from '../../src/data/religi.js'
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { isValidTime } from '../../src/services/guard-rules.js'
import { wibDateString } from '../../src/services/user-service.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'religi',
  alias: [],
  category: 'fun',
  description: { id: 'Atur ayat dan hadits harian grup, atau lihat religi hari ini di chat pribadi', en: 'Set the group daily verse and hadith time, or view today religion pick in private chat' },
  usage: '.religi [HH:mm|off] di grup, .religi di chat pribadi',
  example: '.religi 05:30',
  cooldown: 3,
  needsAdminInfo: true,
}

export const i18n = {
  id: {
    religi: {
      title: 'Religi Harian',
      statusOn: '╭─❏ 🕌 「 *RELIGI HARIAN* 」\n┊ 🕌 Religi harian grup ini AKTIF, KANA kirim ayat atau hadits tiap hari jam {time} WIB. Admin bisa mengubahnya dengan .religi <HH:mm> atau mematikannya dengan .religi off yaa~\n╰━━━━━━━',
      statusOff: '╭─❏ 🕌 「 *RELIGI HARIAN* 」\n┊ 🕌 Religi harian grup ini masih MATI. Admin bisa mengaktifkannya dengan .religi <HH:mm>, contoh .religi 05:30 yaa~\n╰━━━━━━━',
      adminOnly: '╭─❏ 🕌 「 *RELIGI HARIAN* 」\n┊ Ehh, mengubah jadwal religi hanya boleh admin grup yaa~\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ 🕌 「 *RELIGI HARIAN* 」\n┊ Format jam "{time}" nggak valid. Pakai HH:mm yaa, contoh 05:30~\n╰━━━━━━━',
      set: '╭─❏ 🕌 「 *RELIGI HARIAN* 」\n┊ Siap~ religi harian diatur jam {time} WIB. KANA kirim ayat atau hadits tiap hari di jam itu.\n╰━━━━━━━ {mood}',
      off: '╭─❏ 🕌 「 *RELIGI HARIAN* 」\n┊ Siap~ religi harian grup dimatikan. Kapan-kapan aktifkan lagi yaa~\n╰━━━━━━━ {mood}',
      daily: '╭─❏ 🕌 「 *RELIGI HARI INI* 」\n┊ "{text}"\n┊ ({source})\n┊ Ini pilihan hari ini dari KANA, sama seperti yang dikirim scheduler ke grup.\n╰━━━━━━━ {mood}',
      ayatBtn: '📖 Ayat',
      haditsBtn: '🌙 Hadits',
      footer: 'Religi KANA',
    },
  },
  en: {
    religi: {
      title: 'Daily Religion',
      statusOn: '╭─❏ 🕌 「 *DAILY RELIGION* 」\n┊ 🕌 Daily religion for this group is ON, KANA sends a verse or hadith every day at {time} WIB. Admins can change it with .religi <HH:mm> or turn it off with .religi off~\n╰━━━━━━━',
      statusOff: '╭─❏ 🕌 「 *DAILY RELIGION* 」\n┊ 🕌 Daily religion for this group is still OFF. An admin can enable it with .religi <HH:mm>, for example .religi 05:30~\n╰━━━━━━━',
      adminOnly: '╭─❏ 🕌 「 *DAILY RELIGION* 」\n┊ Eh, only group admins may change the religion schedule~\n╰━━━━━━━ {mood}',
      invalid: '╭─❏ 🕌 「 *DAILY RELIGION* 」\n┊ Time format "{time}" is not valid. Use HH:mm, for example 05:30~\n╰━━━━━━━',
      set: '╭─❏ 🕌 「 *DAILY RELIGION* 」\n┊ Got it~ daily religion is set to {time} WIB. KANA will send a verse or hadith every day at that time.\n╰━━━━━━━ {mood}',
      off: '╭─❏ 🕌 「 *DAILY RELIGION* 」\n┊ Got it~ group daily religion is turned off. Enable it again anytime~\n╰━━━━━━━ {mood}',
      daily: '╭─❏ 🕌 「 *TODAY RELIGION PICK* 」\n┊ "{text}"\n┊ ({source})\n┊ This is today pick from KANA, the same one the scheduler sends to groups.\n╰━━━━━━━ {mood}',
      ayatBtn: '📖 Verse',
      haditsBtn: '🌙 Hadith',
      footer: 'KANA Religion',
    },
  },
}

// Indeks hari yang sama dengan scheduler: gabungan ayat + hadits dipilih
// berdasarkan jumlah hari sejak epoch dari tanggal WIB hari ini.
export function dailyReligiItem(date = new Date()) {
  const items = [...ayat, ...hadits]
  const dayIndex = Math.floor(Date.parse(wibDateString(date)) / 86400000)
  return items[Math.abs(dayIndex) % items.length]
}

export const test = { input: '.religi', expect: /religi/i }

export async function handler(ctx) {
  const arg = (ctx.args?.[0] || '').trim()

  if (!ctx.isGroup) {
    const item = dailyReligiItem()
    const body = ctx.t('religi.daily', { text: item.text, source: item.source, mood: ctx.say('sayang') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('religi.title'),
      body,
      footer: ctx.t('religi.footer'),
      replies: [
        { text: ctx.t('religi.ayatBtn'), id: '.ayat' },
        { text: ctx.t('religi.haditsBtn'), id: '.hadits' },
      ],
      textFallback: body,
    })
  }

  if (!arg) {
    const settings = await getGroupSettings(ctx.storage, ctx.chat)
    const body = settings.religiTime
      ? ctx.t('religi.statusOn', { time: settings.religiTime })
      : ctx.t('religi.statusOff')
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('religi.title'),
      body,
      footer: ctx.t('religi.footer'),
      replies: [
        { text: ctx.t('religi.ayatBtn'), id: '.ayat' },
        { text: ctx.t('religi.haditsBtn'), id: '.hadits' },
      ],
      textFallback: body,
    })
  }

  if (!ctx.isAdmin) return ctx.reply(ctx.t('religi.adminOnly', { mood: ctx.say('malu') }))

  if (arg.toLowerCase() === 'off') {
    await updateGroupSettings(ctx.storage, ctx.chat, { religiTime: '' })
    const body = ctx.t('religi.off', { mood: ctx.say('senang') })
    return sendButtons(ctx.sock, ctx.chat, {
      title: ctx.t('religi.title'),
      body,
      footer: ctx.t('religi.footer'),
      replies: [
        { text: ctx.t('religi.ayatBtn'), id: '.ayat' },
        { text: ctx.t('religi.haditsBtn'), id: '.hadits' },
      ],
      textFallback: body,
    })
  }

  if (!isValidTime(arg)) return ctx.reply(ctx.t('religi.invalid', { time: arg }))
  await updateGroupSettings(ctx.storage, ctx.chat, { religiTime: arg })
  const body = ctx.t('religi.set', { time: arg, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('religi.title'),
    body,
    footer: ctx.t('religi.footer'),
    replies: [
      { text: ctx.t('religi.ayatBtn'), id: '.ayat' },
      { text: ctx.t('religi.haditsBtn'), id: '.hadits' },
    ],
    textFallback: body,
  })
}
