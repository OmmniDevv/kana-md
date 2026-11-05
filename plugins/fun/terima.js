import { acceptOffer } from './nembak.js'
import { clearReply, getReplyBinding } from '../../src/ui/reply-router.js'

// Terima: jawaban perintah untuk tawaran tembakan yang sedang menunggu.
// Hanya target yang ditembak yang bisa menerima; tawaran dibaca dari
// binding reply yang dibuat .tembak / .nembak di chat ini, lalu sesi
// ditutup dan pasangan disimpan lewat resolver bersama nembak.js.
// Membalas pesan tembakan langsung dengan kata "terima" juga bisa
// (ditangani router reply), perintah ini jalur eksplisitnya.
export const config = {
  name: 'terima',
  alias: ['accept'],
  category: 'fun',
  description: { id: 'Menerima tembakan dari seseorang', en: 'Accept a confession from someone' },
  usage: '.terima',
  example: '.terima',
  cooldown: 5,
}

export const i18n = {
  id: {
    terima: {
      noOffer: '╭─❏ 💌 「 *BELUM ADA TEMBAKAN* 」\n┊ Belum ada yang nembak kamu di chat ini.\n┊ Jawaban cuma berlaku buat orang yang lagi ditembak yaa~\n╰━━━━━━━',
      notYours: '╭─❏ 💌 「 *BUKAN BUAT KAMU* 」\n┊ Tembakan yang lagi menunggu di chat ini bukan buat kamu.\n┊ Yang ditembak yang berhak jawab yaa~\n╰━━━━━━━',
      wrongShooter: '╭─❏ 💌 「 *BUKAN DIA* 」\n┊ Yang lagi nembak kamu itu *@{from}*, bukan yang kamu tag~\n╰━━━━━━━',
    },
  },
  en: {
    terima: {
      noOffer: '╭─❏ 💌 「 *NO CONFESSION YET* 」\n┊ No one has confessed to you in this chat.\n┊ Only the person being confessed to can answer~\n╰━━━━━━━',
      notYours: '╭─❏ 💌 「 *NOT FOR YOU* 」\n┊ The pending confession in this chat is not aimed at you.\n┊ Only its target may answer~\n╰━━━━━━━',
      wrongShooter: '╭─❏ 💌 「 *NOT THEM* 」\n┊ The one confessing to you is *@{from}*, not the person you tagged~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.terima', expect: /belum ada tembakan|no confession/i }

export async function handler(ctx) {
  const binding = await getReplyBinding(ctx.storage, ctx.chat)
  if (!binding || binding.kind !== 'nembak') return ctx.reply(ctx.t('terima.noOffer'))
  if (binding.ownerDigits !== ctx.senderDigits) return ctx.reply(ctx.t('terima.notYours'))
  const tagged = ctx.mentionedJids?.[0]?.split('@')[0].split(':')[0]
  if (tagged && tagged !== binding.data?.fromDigits) {
    return ctx.sock.sendMessage(ctx.chat, {
      text: ctx.t('terima.wrongShooter', { from: binding.data.fromDigits }),
      mentions: [`${binding.data.fromDigits}@s.whatsapp.net`],
    }, { quoted: ctx.raw })
  }
  await clearReply(ctx.storage, ctx.chat)
  await acceptOffer(ctx, binding.data)
  return undefined
}
