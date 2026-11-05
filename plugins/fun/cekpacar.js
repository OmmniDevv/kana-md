// Cek pacar: baca status pasangan dari namespace 'couples' yang ditulis
// sistem tembak (.nembak/.tembak dan jawaban terima), seperti cekpacar
// Elaina-MD yang membaca database pasangan. Bukan ramalan sifat nama.
export const config = {
  name: 'cekpacar',
  alias: ['pacarku', 'pacar', 'pasangan'],
  category: 'fun',
  description: { id: 'Cek status pasangan dari data sistem tembak', en: 'Check partner status from the confess system data' },
  usage: '.cekpacar [@tag]',
  example: '.cekpacar',
  cooldown: 3,
}

export const i18n = {
  id: {
    cekpacar: {
      singleSelf: '╭─❏ 💔 「 *STATUS HUBUNGAN* 」\n┊ Kamu belum punya pasangan nih~\n┊ Cari pasangan dulu pakai *.nembak @user* yaa~\n╰━━━━━━━ {mood}',
      singleOther: '╭─❏ 💔 「 *STATUS HUBUNGAN* 」\n┊ *@{target}* belum punya pasangan.\n┊ Dia bisa cari pasangan pakai *.nembak @user*~\n╰━━━━━━━',
      coupleSelf: '╭─❏ 💕 「 *STATUS HUBUNGAN* 」\n┊ Kamu sedang pacaran dengan *@{partner}*!\n┊ ꜱᴇᴊᴀᴋ: *{date}* (sudah *{days} hari*)\n╰━━━━━━━ {mood}',
      coupleOther: '╭─❏ 💕 「 *STATUS HUBUNGAN* 」\n┊ *@{target}* sedang pacaran dengan *@{partner}*!\n┊ ꜱᴇᴊᴀᴋ: *{date}* (sudah *{days} hari*)\n╰━━━━━━━',
      pendingSelf: '╭─❏ 💭 「 *STATUS HUBUNGAN* 」\n┊ Kamu tercatat lagi dekat dengan *@{partner}*, tapi statusnya belum timbal balik.\n┊ Status: *menunggu jawaban*\n╰━━━━━━━',
      pendingOther: '╭─❏ 💭 「 *STATUS HUBUNGAN* 」\n┊ *@{target}* tercatat lagi dekat dengan *@{partner}*, tapi statusnya belum timbal balik.\n┊ Status: *menunggu jawaban*\n╰━━━━━━━',
    },
  },
  en: {
    cekpacar: {
      singleSelf: '╭─❏ 💔 「 *RELATIONSHIP STATUS* 」\n┊ You do not have a partner yet~\n┊ Find one first with *.nembak @user*~\n╰━━━━━━━ {mood}',
      singleOther: '╭─❏ 💔 「 *RELATIONSHIP STATUS* 」\n┊ *@{target}* does not have a partner yet.\n┊ They can find one with *.nembak @user*~\n╰━━━━━━━',
      coupleSelf: '╭─❏ 💕 「 *RELATIONSHIP STATUS* 」\n┊ You are dating *@{partner}*!\n┊ ꜱɪɴᴄᴇ: *{date}* (already *{days} days*)\n╰━━━━━━━ {mood}',
      coupleOther: '╭─❏ 💕 「 *RELATIONSHIP STATUS* 」\n┊ *@{target}* is dating *@{partner}*!\n┊ ꜱɪɴᴄᴇ: *{date}* (already *{days} days*)\n╰━━━━━━━',
      pendingSelf: '╭─❏ 💭 「 *RELATIONSHIP STATUS* 」\n┊ You are recorded close to *@{partner}*, but the status is not mutual yet.\n┊ Status: *waiting for an answer*\n╰━━━━━━━',
      pendingOther: '╭─❏ 💭 「 *RELATIONSHIP STATUS* 」\n┊ *@{target}* is recorded close to *@{partner}*, but the status is not mutual yet.\n┊ Status: *waiting for an answer*\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.cekpacar', expect: /belum punya pasangan|do not have a partner/i }

const COUPLES_NS = 'couples'

function digitsOf(value) {
  return String(value ?? '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

// Target cek, urutan ala Elaina: pengirim pesan yang dikutip, mention
// pertama, argumen nomor, terakhir diri sendiri.
export function resolvePartnerTarget(ctx) {
  if (ctx.quoted?.sender) return { jid: ctx.quoted.sender, isOther: true }
  const mentioned = ctx.mentionedJids?.[0]
  if (mentioned) return { jid: mentioned, isOther: true }
  const raw = String(ctx.args?.[0] ?? '').replace(/\D/g, '')
  if (raw.length > 5 && raw.length < 20) return { jid: `${raw}@s.whatsapp.net`, isOther: true }
  return { jid: ctx.sender, isOther: false }
}

export async function handler(ctx) {
  const { jid, isOther } = resolvePartnerTarget(ctx)
  const targetDigits = digitsOf(jid)
  const rel = await ctx.storage.get(COUPLES_NS, targetDigits)
  const partnerDigits = digitsOf(rel?.partner)
  if (!partnerDigits) {
    if (!isOther) return ctx.reply(ctx.t('cekpacar.singleSelf', { mood: ctx.say('mikir') }))
    return ctx.sock.sendMessage(
      ctx.chat,
      { text: ctx.t('cekpacar.singleOther', { target: targetDigits }), mentions: [`${targetDigits}@s.whatsapp.net`] },
      { quoted: ctx.raw }
    )
  }

  const partnerRel = await ctx.storage.get(COUPLES_NS, partnerDigits)
  const mutual = digitsOf(partnerRel?.partner) === targetDigits
  const mentions = [...new Set([targetDigits, partnerDigits])].map((d) => `${d}@s.whatsapp.net`)
  if (mutual) {
    const since = Number(rel.since) || Number(partnerRel?.since) || Date.now()
    const date = new Date(since).toLocaleDateString(ctx.lang === 'en' ? 'en-GB' : 'id-ID')
    const days = Math.max(0, Math.floor((Date.now() - since) / 86400000))
    const key = isOther ? 'cekpacar.coupleOther' : 'cekpacar.coupleSelf'
    return ctx.sock.sendMessage(
      ctx.chat,
      { text: ctx.t(key, { target: targetDigits, partner: partnerDigits, date, days, mood: ctx.say('senang') }), mentions },
      { quoted: ctx.raw }
    )
  }

  const key = isOther ? 'cekpacar.pendingOther' : 'cekpacar.pendingSelf'
  return ctx.sock.sendMessage(
    ctx.chat,
    { text: ctx.t(key, { target: targetDigits, partner: partnerDigits }), mentions },
    { quoted: ctx.raw }
  )
}
