// Penyusun prompt coding siap pakai: topik pengguna dibungkus dalam
// templat prompt terstruktur (peran, tugas, batasan, format keluaran,
// kriteria selesai) agar hasil AI lain lebih terarah. Lokal.
export const config = {
  name: 'promptcode',
  alias: ['promptcoding', 'buatprompt'],
  category: 'tools',
  description: { id: 'Susun prompt coding terstruktur dari sebuah topik', en: 'Build a structured coding prompt from a topic' },
  usage: '.promptcode <topik>',
  example: '.promptcode fungsi login dengan JWT di Node.js',
  cooldown: 3,
}

export const i18n = {
  id: {
    promptcode: {
      needTopic: '╭─❏ 📝 「 *KETIK TOPIK CODINGNYA* 」\n┊ ᴄᴏɴᴛᴏʜ: *.promptcode fungsi login dengan JWT di Node.js*\n╰━━━━━━━',
      body: '╭─❏ 📝 「 *PROMPT CODING SIAP PAKAI* 」\n┊ ꜱᴀʟɪɴ ᴛᴇᴋꜱ ᴅɪ ʙᴀᴡᴀʜ ɪɴɪ ᴋᴇ ᴀɪ ꜰᴀᴠᴏʀɪᴛᴍᴜ:\n┊ ─────\nBertindaklah sebagai senior software engineer. Tugasmu: {topic}.\n\nSyarat:\n1. Tulis kode yang bersih, aman, dan siap produksi, lengkap dengan penanganan error.\n2. Jelaskan singkat keputusan penting sebelum kode, tanpa bertele-tele.\n3. Sertakan contoh pemakaian dan kasus uji sederhana.\n4. Hindari dependensi baru kecuali benar-benar perlu, dan sebutkan alasannya bila memakai.\n5. Akhiri dengan daftar langkah verifikasi bahwa kode benar-benar jalan.\n┊ ─────\n╰━━━━━━━',
    },
  },
  en: {
    promptcode: {
      needTopic: '╭─❏ 📝 「 *TYPE THE CODING TOPIC* 」\n┊ ᴇxᴀᴍᴘʟᴇ: *.promptcode a JWT login function in Node.js*\n╰━━━━━━━',
      body: '╭─❏ 📝 「 *READY CODING PROMPT* 」\n┊ ᴄᴏᴘʏ ᴛʜᴇ ᴛᴇxᴛ ʙᴇʟᴏᴡ ɪɴᴛᴏ ʏᴏᴜʀ ꜰᴀᴠᴏʀɪᴛᴇ ᴀɪ:\n┊ ─────\nAct as a senior software engineer. Your task: {topic}.\n\nRequirements:\n1. Write clean, safe, production-ready code with proper error handling.\n2. Briefly explain key decisions before the code, no rambling.\n3. Include a usage example and simple test cases.\n4. Avoid new dependencies unless truly needed, and justify any you add.\n5. End with verification steps proving the code actually works.\n┊ ─────\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.promptcode fungsi login JWT', expect: /PROMPT CODING|READY CODING/ }

export async function handler(ctx) {
  const topic = (ctx.text || '').trim()
  if (!topic) return ctx.reply(ctx.t('promptcode.needTopic'))
  return ctx.reply(ctx.t('promptcode.body', { topic }))
}
