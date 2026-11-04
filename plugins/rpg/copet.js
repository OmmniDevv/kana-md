import { crimeHandler } from '../../src/rpg/crime-handler.js'

export const config = {
  name: 'copet',
  alias: ['nyopet'],
  category: 'rpg',
  description: { id: 'Copet: ambil koin kecil dengan risiko lebih rendah', en: 'Petty theft: small coins with lower risk' },
  usage: '.copet',
  example: '.copet',
  cooldown: 10,
}

export const i18n = {
  id: {
    copet: {
      success: '╭─❏ 😏 「 *COPET BERHASIL* 」\n┊ Kamu dapat *{gain} koin* dari {crime}\n┊ ꜱᴀʟᴅᴏ: *{balance} koin*\n┊ ᴇɴᴇʀɢɪ ꜱɪꜱᴀ: *{energy}*\n╰━━━━━━━',
      caught: '╭─❏ 🚨 「 *KETANGKAP* 」\n┊ Aksi {crime} kamu gagal dan kamu masuk penjara *{minutes} menit*\n┊ Cek pakai *.penjara*, bayar denda pakai *.bebaskan*\n╰━━━━━━━',
      jailed: '╭─❏ 🔒 「 *MASIH DIPENJARA* 」\n┊ Sisa hukumanmu *{minutes} menit* lagi\n┊ Kriminal ditahan dulu yaa~\n╰━━━━━━━',
      lowEnergy: '╭─❏ 🔋 「 *ENERGI KURANG* 」\n┊ Energimu tinggal *{energy}*, tidak cukup buat {crime} (perlu {need})\n┊ Istirahat atau makan dulu yaa~\n╰━━━━━━━',
    },
  },
  en: {
    copet: {
      success: '╭─❏ 😏 「 *PICKPOCKET SUCCESS* 」\n┊ You got *{gain} coins* from {crime}\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} coins*\n┊ ᴇɴᴇʀɢʏ ʟᴇꜰᴛ: *{energy}*\n╰━━━━━━━',
      caught: '╭─❏ 🚨 「 *BUSTED* 」\n┊ Your {crime} attempt failed and you are jailed for *{minutes} minutes*\n┊ Check with *.penjara*, pay the fine with *.bebaskan*\n╰━━━━━━━',
      jailed: '╭─❏ 🔒 「 *STILL IN JAIL* 」\n┊ *{minutes} minutes* left on your sentence\n┊ Crime is on hold~\n╰━━━━━━━',
      lowEnergy: '╭─❏ 🔋 「 *LOW ENERGY* 」\n┊ Your energy is *{energy}*, not enough for {crime} (needs {need})\n┊ Rest or eat first~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.copet', expect: /koin|penjara|energi|coin|jail|energy/i }

export const handler = crimeHandler('copet')
