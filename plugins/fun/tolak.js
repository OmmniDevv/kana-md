import { rejectOffer } from './nembak.js'
import { clearReply, getReplyBinding } from '../../src/ui/reply-router.js'

// Tolak: jawaban perintah untuk tawaran tembakan yang sedang menunggu.
// Hanya target yang ditembak yang bisa menolak; tawaran dibaca dari
// binding reply yang dibuat .tembak / .nembak di chat ini, lalu sesi
// ditutup tanpa menyimpan pasangan, lewat resolver bersama nembak.js.
// Membalas pesan tembakan langsung dengan kata "tolak" juga bisa
// (ditangani router reply), perintah ini jalur eksplisitnya.
export const config = {
  name: 'tolak',
  alias: ['reject'],
  category: 'fun',
  description: { id: 'Menolak tembakan dari seseorang', en: 'Reject a confession from someone' },
  usage: '.tolak',
  example: '.tolak',
  cooldown: 5,
}

export const i18n = {
  id: {
    tolak: {
      noOffer: '╭─❏ 💔 「 *BELUM ADA TEMBAKAN* 」\n┊ Belum ada yang nembak kamu di chat ini, jadi tidak ada yang perlu ditolak.\n┊ Jawaban cuma berlaku buat orang yang lagi ditembak yaa~\n╰━━━━━━━',
      notYours: '╭─❏ 💔 「 *BUKAN BUAT KAMU* 」\n┊ Tembakan yang lagi menunggu di chat ini bukan buat kamu.\n┊ Yang ditembak yang berhak jawab yaa~\n╰━━━━━━━',
      wrongShooter: '╭─❏ 💔 「 *BUKAN DIA* 」\n┊ Yang lagi nembak kamu itu *@{from}*, bukan yang kamu tag~\n╰━━━━━━━',
    },
  },
  en: {
    tolak: {
      noOffer: '╭─❏ 💔 「 *NO CONFESSION YET* 」\n┊ No one has confessed to you in this chat, so there is nothing to reject.\n┊ Only the person being confessed to can answer~\n╰━━━━━━━',
      notYours: '╭─❏ 💔 「 *NOT FOR YOU* 」\n┊ The pending confession in this chat is not aimed at you.\n┊ Only its target may answer~\n╰━━━━━━━',
      wrongShooter: '╭─❏ 💔 「 *NOT THEM* 」\n┊ The one confessing to you is *@{from}*, not the person you tagged~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.tolak', expect: /belum ada tembakan|no confession/i }

export async function handler(ctx) {
  const binding = await getReplyBinding(ctx.storage, ctx.chat)
  if (!binding || binding.kind !== 'nembak') return ctx.reply(ctx.t('tolak.noOffer'))
  if (binding.ownerDigits !== ctx.senderDigits) return ctx.reply(ctx.t('tolak.notYours'))
  const tagged = ctx.mentionedJids?.[0]?.split('@')[0].split(':')[0]
  if (tagged && tagged !== binding.data?.fromDigits) {
    return ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t('tolak.wrongShooter', { from: binding.data.fromDigits }),
      mentions: [`${binding.data.fromDigits}@s.whatsapp.net`],
    }, { quoted: ctx.raw })
  }
  await clearReply(ctx.storage, ctx.chat)
  await rejectOffer(ctx, binding.data)
  return undefined
}
