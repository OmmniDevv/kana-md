import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'cekpacar',
  alias: ['pacarku'],
  category: 'fun',
  description: { id: 'Cek sifat pacar dari namanya: setia, romantis, dan cemburuannya (hiburan)', en: 'Check a partner traits from their name: loyalty, romance, and jealousy (fun)' },
  usage: '.cekpacar <nama pacar>',
  example: '.cekpacar Dimas',
  cooldown: 3,
}

export function hashPercent(seed) {
  let h = 2166136261
  const s = String(seed)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 101 + 101) % 101
}

export const i18n = {
  id: {
    cekpacar: {
      title: 'Cek Sifat Pacar',
      ask: '╭─❏ 💘 「 *CEK SIFAT PACAR* 」\n┊ Sebut nama pacarnya dulu yaa~\n┊ Contoh: *.cekpacar Dimas*\n╰━━━━━━━ {mood}',
      body: '╭─❏ 💘 「 *CEK SIFAT PACAR* 」\n┊ ɴᴀᴍᴀ: *{name}*\n┊ ᴋᴇꜱᴇᴛɪᴀᴀɴ: *{setia}%*\n┊ ʀᴏᴍᴀɴᴛɪꜱ: *{romantis}%*\n┊ ᴄᴇᴍʙᴜʀᴜᴀɴ: *{cemburu}%*\n┊\n┊ {verdict}\n╰━━━━━━━ {mood}',
      verdictHigh: 'Paket lengkap, jaga baik-baik orang seperti ini.',
      verdictMix: 'Campuran yang seru, kuncinya komunikasi yang jujur.',
      verdictWild: 'Dinamis sekali, hubungan kalian tidak akan membosankan.',
      btnAgain: '💘 Cek Lagi',
    },
  },
  en: {
    cekpacar: {
      title: 'Partner Traits Check',
      ask: '╭─❏ 💘 「 *PARTNER TRAITS CHECK* 」\n┊ Tell me the partner name first~\n┊ Example: *.cekpacar Dimas*\n╰━━━━━━━ {mood}',
      body: '╭─❏ 💘 「 *PARTNER TRAITS CHECK* 」\n┊ ɴᴀᴍᴇ: *{name}*\n┊ ʟᴏʏᴀʟᴛʏ: *{setia}%*\n┊ ʀᴏᴍᴀɴᴄᴇ: *{romantis}%*\n┊ ᴊᴇᴀʟᴏᴜꜱʏ: *{cemburu}%*\n┊\n┊ {verdict}\n╰━━━━━━━ {mood}',
      verdictHigh: 'The full package, take good care of someone like this.',
      verdictMix: 'A fun mix, the key is honest communication.',
      verdictWild: 'Very dynamic, your relationship will never be boring.',
      btnAgain: '💘 Check Again',
    },
  },
}

export const test = { input: '.cekpacar Dimas', expect: /sifat pacar|traits/i }

export async function handler(ctx) {
  const mentioned = ctx.mentionedJids?.[0]
  const mentionedName = mentioned ? `@${mentioned.split('@')[0]}` : null
  const name = mentionedName || (ctx.text || '').replace(/@\d+/g, '').trim().slice(0, 40)
  if (!name) return ctx.reply(ctx.t('cekpacar.ask', { mood: ctx.say('mikir') }))
  const seed = name.toLowerCase()
  const setia = hashPercent(`pacar:setia:${seed}`)
  const romantis = hashPercent(`pacar:romantis:${seed}`)
  const cemburu = hashPercent(`pacar:cemburu:${seed}`)
  const avg = Math.round((setia + romantis + (100 - cemburu)) / 3)
  const verdict = avg >= 70 ? ctx.t('cekpacar.verdictHigh') : avg >= 45 ? ctx.t('cekpacar.verdictMix') : ctx.t('cekpacar.verdictWild')
  const body = ctx.t('cekpacar.body', { name, setia, romantis, cemburu, verdict, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('cekpacar.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('cekpacar.btnAgain'), id: `.cekpacar ${name}` },
    ],
    textFallback: body,
  })
}
