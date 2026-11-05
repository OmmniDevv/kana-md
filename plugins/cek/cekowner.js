// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama klon
// persen hashPercent, membalas persen acak untuk pertanyaan boolean.
// Sekarang cek owner NYATA: nomor dibandingkan dengan OWNER_NUMBER dan
// status isOwner pemanggil dari pipeline, hasilnya boolean jujur.
export const config = {
  name: 'cekowner',
  alias: [],
  category: 'cek',
  description: { id: 'Cek apakah kamu atau nomor tertentu adalah owner bot, hasilnya boolean nyata', en: 'Check whether you or a given number is the bot owner, a real boolean result' },
  usage: '.cekowner | .cekowner <nomor>',
  example: '.cekowner',
  cooldown: 5,
}

export const i18n = {
  id: {
    cekowner: {
      result: '╭─❏ 👑 「 *CEK OWNER* 」\n┊ ɴᴏᴍᴏʀ: *{target}*\n┊ OWNER: *{verdict}*\n┊ {note}\n╰━━━━━━━',
      yesNote: 'Nomor ini terdaftar sebagai owner bot KANA~',
      noNote: 'Nomor ini bukan owner bot KANA, cuma pengguna biasa~',
    },
  },
  en: {
    cekowner: {
      result: '╭─❏ 👑 「 *OWNER CHECK* 」\n┊ ɴᴜᴍʙᴇʀ: *{target}*\n┊ OWNER: *{verdict}*\n┊ {note}\n╰━━━━━━━',
      yesNote: 'This number is registered as the KANA bot owner~',
      noNote: 'This number is not the KANA bot owner, just a regular user~',
    },
  },
}

export const test = { input: '.cekowner 6285869074622', expect: /OWNER: (YA|BUKAN|YES|NO)/ }

// Keputusan murni: target adalah owner bila sama dengan nomor owner di
// env, atau bila target adalah pemanggil dan pipeline menandainya owner.
export function decideOwner({ targetDigits, senderDigits, isOwnerFlag, ownerEnvDigits }) {
  if (ownerEnvDigits && targetDigits === ownerEnvDigits) return true
  if (targetDigits === senderDigits && isOwnerFlag) return true
  return false
}

export async function handler(ctx) {
  const argDigits = (ctx.args?.[0] ?? '').replace(/\D/g, '')
  const target = argDigits || ctx.senderDigits
  const ownerEnvDigits = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  const isOwner = decideOwner({
    targetDigits: target,
    senderDigits: ctx.senderDigits,
    isOwnerFlag: Boolean(ctx.isOwner),
    ownerEnvDigits,
  })
  const verdict = ctx.lang === 'en' ? (isOwner ? 'YES' : 'NO') : (isOwner ? 'YA' : 'BUKAN')
  return ctx.reply(ctx.t('cekowner.result', {
    target,
    verdict,
    note: ctx.t(isOwner ? 'cekowner.yesNote' : 'cekowner.noNote'),
  }))
}
