// Uji kecepatan unduh dari server bot memakai endpoint resmi
// Cloudflare Speed Test (speed.cloudflare.com): unduh 5 MB terukur
// plus latensi dasar. Hasil adalah kecepatan koneksi SERVER bot.
export const config = {
  name: 'testspeed',
  alias: ['speedtest', 'cekkecepatan'],
  category: 'info',
  description: { id: 'Uji kecepatan internet server bot (Cloudflare)', en: 'Test the bot server internet speed (Cloudflare)' },
  usage: '.testspeed',
  example: '.testspeed',
  cooldown: 30,
  limit: 2,
}

export const i18n = {
  id: {
    testspeed: {
      working: '╭─❏ ⏳ 「 *SEBENTAR YAA* 」\n┊ KANA lagi ukur kecepatan servernya... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *TES GAGAL* 」\n┊ Mouu, tes kecepatannya gagal: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 🚀 「 *TES KECEPATAN (SERVER BOT)* 」\n┊ ⬇️ ᴜɴᴅᴜʜ: *{mbps} Mbps* ({size} ᴅᴀʟᴀᴍ {ms} ᴍꜱ)\n┊ 📶 ʟᴀᴛᴇɴꜱɪ ᴄʟᴏᴜᴅꜰʟᴀʀᴇ: *{ping} ms*\n┊ ᴄᴀᴛᴀᴛᴀɴ: ɪɴɪ ᴋᴇᴄᴇᴘᴀᴛᴀɴ ᴋᴏɴᴇᴋꜱɪ ꜱᴇʀᴠᴇʀ ʙᴏᴛ, ʙᴜᴋᴀɴ ʜᴘ ᴋᴀᴍᴜ~\n╰━━━━━━━',
    },
  },
  en: {
    testspeed: {
      working: '╭─❏ ⏳ 「 *ONE SEC* 」\n┊ KANA is measuring the server speed... {mood}\n╰━━━━━━━',
      failed: '╭─❏ 😿 「 *TEST FAILED* 」\n┊ Mouu, the speed test failed: *{message}*\n╰━━━━━━━',
      body: '╭─❏ 🚀 「 *SPEED TEST (BOT SERVER)* 」\n┊ ⬇️ ᴅᴏᴡɴʟᴏᴀᴅ: *{mbps} Mbps* ({size} ɪɴ {ms} ᴍꜱ)\n┊ 📶 ᴄʟᴏᴜᴅꜰʟᴀʀᴇ ʟᴀᴛᴇɴᴄʏ: *{ping} ms*\n┊ ɴᴏᴛᴇ: ᴛʜɪꜱ ɪꜱ ᴛʜᴇ ʙᴏᴛ ꜱᴇʀᴠᴇʀ ᴄᴏɴɴᴇᴄᴛɪᴏɴ, ɴᴏᴛ ʏᴏᴜʀ ᴘʜᴏɴᴇ~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.testspeed', expect: /Mbps|TES KECEPATAN|SPEED TEST/ }

const BYTES = 5_000_000

// Ukur ping dan kecepatan unduh ke Cloudflare.
export async function measureSpeed() {
  const pingStart = Date.now()
  const pingRes = await fetch('https://speed.cloudflare.com/__down?bytes=0', {
    signal: AbortSignal.timeout(15000),
    headers: { 'user-agent': 'KANA-Bot' },
  })
  if (!pingRes.ok) throw new Error(`Cloudflare HTTP ${pingRes.status}`)
  await pingRes.arrayBuffer()
  const ping = Date.now() - pingStart
  const start = Date.now()
  const res = await fetch(`https://speed.cloudflare.com/__down?bytes=${BYTES}`, {
    signal: AbortSignal.timeout(60000),
    headers: { 'user-agent': 'KANA-Bot' },
  })
  if (!res.ok) throw new Error(`Cloudflare HTTP ${res.status}`)
  const buffer = await res.arrayBuffer()
  const ms = Date.now() - start
  const mbps = (buffer.byteLength * 8) / (ms / 1000) / 1e6
  return { ping, ms, bytes: buffer.byteLength, mbps }
}

export async function handler(ctx, { measure = measureSpeed } = {}) {
  await ctx.reply(ctx.t('testspeed.working', { mood: ctx.say('mikir') }))
  try {
    const r = await measure()
    return ctx.reply(ctx.t('testspeed.body', {
      mbps: r.mbps.toFixed(2),
      size: (r.bytes / 1e6).toFixed(1) + ' MB',
      ms: r.ms,
      ping: r.ping,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('testspeed.failed', { message: err.message }))
  }
}
