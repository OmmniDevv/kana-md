import { crimeHandler } from '../../src/rpg/crime-handler.js'

export const config = {
  name: 'merampok',
  alias: ['rampok', 'korupsi'],
  category: 'rpg',
  description: { id: 'Merampok target besar: untung besar tapi risiko penjara lebih tinggi', en: 'Big robbery: bigger loot but higher jail risk' },
  usage: '.merampok',
  example: '.merampok',
  cooldown: 10,
}

export const i18n = {
  id: {
    merampok: {
      success: '╭─❏ 😏 「 *RAMPOK BERHASIL* 」\n┊ Kamu dapat *{gain} koin* dari {crime}\n┊ ꜱᴀʟᴅᴏ: *{balance} koin*\n┊ ᴇɴᴇʀɢɪ ꜱɪꜱᴀ: *{energy}*\n╰━━━━━━━',
      caught: '╭─❏ 🚨 「 *KETANGKAP* 」\n┊ Aksi {crime} kamu gagal dan kamu masuk penjara *{minutes} menit*\n┊ Cek pakai *.penjara*, bayar denda pakai *.bebaskan*\n╰━━━━━━━',
      jailed: '╭─❏ 🔒 「 *MASIH DIPENJARA* 」\n┊ Sisa hukumanmu *{minutes} menit* lagi\n┊ Kriminal ditahan dulu yaa~\n╰━━━━━━━',
      lowEnergy: '╭─❏ 🔋 「 *ENERGI KURANG* 」\n┊ Energimu tinggal *{energy}*, tidak cukup buat {crime} (perlu {need})\n┊ Istirahat atau makan dulu yaa~\n╰━━━━━━━',
    },
  },
  en: {
    merampok: {
      success: '╭─❏ 😏 「 *ROBBERY SUCCESS* 」\n┊ You got *{gain} coins* from {crime}\n┊ ʙᴀʟᴀɴᴄᴇ: *{balance} coins*\n┊ ᴇɴᴇʀɢʏ ʟᴇꜰᴛ: *{energy}*\n╰━━━━━━━',
      caught: '╭─❏ 🚨 「 *BUSTED* 」\n┊ Your {crime} attempt failed and you are jailed for *{minutes} minutes*\n┊ Check with *.penjara*, pay the fine with *.bebaskan*\n╰━━━━━━━',
      jailed: '╭─❏ 🔒 「 *STILL IN JAIL* 」\n┊ *{minutes} minutes* left on your sentence\n┊ Crime is on hold~\n╰━━━━━━━',
      lowEnergy: '╭─❏ 🔋 「 *LOW ENERGY* 」\n┊ Your energy is *{energy}*, not enough for {crime} (needs {need})\n┊ Rest or eat first~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.merampok', expect: /koin|penjara|energi|coin|jail|energy/i }

export const handler = crimeHandler('merampok')
