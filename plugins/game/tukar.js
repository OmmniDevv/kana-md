// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama mesin duel
// angka generik. Sekarang tukar item inventaris RPG beneran antar dua
// pemain: tawaran dibuat di chat, target membalas pesan tawaran dengan
// kata terima untuk mengeksekusi pertukaran, atau tolak untuk menolak.
// Inventaris kedua pihak berubah sungguhan dan terbaca lagi.
import { getProfile, updateProfile } from '../../src/services/user-service.js'
import { ITEMS, ITEM_MAP } from '../../src/rpg/data.js'
import { bindReply, clearReply, registerReplyKind } from '../../src/ui/reply-router.js'
import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'tukar',
  alias: ['barter'],
  category: 'game',
  description: { id: 'Tukar item inventaris RPG dengan pemain lain: buat tawaran, target membalas terima untuk menukar sungguhan', en: 'Trade RPG inventory items with another player: make an offer, the target replies accept to really swap' },
  usage: '.tukar <nomor target> <id item kamu> <id item yang diminta>',
  example: '.tukar 6281234567890 batu besi',
  cooldown: 5,
}

export function findItem(token) {
  const q = String(token ?? '').trim().toLowerCase()
  if (!q) return null
  if (ITEM_MAP[q]) return ITEM_MAP[q]
  return ITEMS.find((i) => (i.name?.id ?? '').toLowerCase() === q || (i.name?.en ?? '').toLowerCase() === q) ?? null
}

// Inventaris profil berbentuk peta { idItem: jumlah } (warisan lama bisa
// berbentuk array id; dinormalisasi di sini).
export function invMap(profile) {
  const inv = profile?.inventory
  if (Array.isArray(inv)) {
    const map = {}
    for (const id of inv) map[id] = (map[id] ?? 0) + 1
    return map
  }
  return inv && typeof inv === 'object' ? { ...inv } : {}
}

export function invCount(profile, itemId) {
  return Number(invMap(profile)[itemId]) || 0
}

export const i18n = {
  id: {
    tukar: {
      title: 'Tukar Item',
      usage: '╭─❏ 🔄 「 *TUKAR ITEM* 」\n┊ Format: *.tukar <nomor target> <id item kamu> <id item yang diminta>*\n┊ Contoh: *.tukar 6281234567890 batu besi*\n┊ Id item sesuai *.inventory* kamu yaa~\n╰━━━━━━━',
      badItem: '╭─❏ 🔄 「 *TUKAR ITEM* 」\n┊ Item *{token}* tidak dikenal. Id item contoh: batu, batubara, besi, emas, berlian\n╰━━━━━━━',
      self: '╭─❏ 🔄 「 *TUKAR ITEM* 」\n┊ Tidak bisa tukar item dengan diri sendiri~\n╰━━━━━━━',
      notOwned: '╭─❏ 🔄 「 *TUKAR ITEM* 」\n┊ Kamu belum punya *{item}* di inventaris, jadi belum bisa ditawarkan~\n╰━━━━━━━',
      offer: '╭─❏ 🔄 「 *TAWARAN TUKAR ITEM* 」\n┊ {from} menawari {to}:\n┊ ᴋᴀᴍᴜ ᴋᴀꜱɪʜ: *{give}* x1\n┊ ᴋᴀᴍᴜ ᴛᴇʀɪᴍᴀ: *{want}* x1\n┊ Buat {to}: balas (reply) pesan ini dengan kata *terima* buat menukar, atau *tolak* buat menolak. Berlaku 5 menit yaa~\n╰━━━━━━━',
      done: '╭─❏ 🔄 「 *TUKARAN SELESAI* 」\n┊ {from} menyerahkan *{give}* dan menerima *{want}*\n┊ {to} menyerahkan *{want}* dan menerima *{give}*\n┊ Inventaris kedua pihak sudah diperbarui~\n╰━━━━━━━',
      declined: '╭─❏ 🔄 「 *TAWARAN DITOLAK* 」\n┊ Tawaran tukar *{give}* dengan *{want}* ditolak. Tidak ada item yang berpindah~\n╰━━━━━━━',
      targetLacks: '╭─❏ 🔄 「 *TUKARAN GAGAL* 」\n┊ {to} ternyata tidak punya *{want}* lagi, jadi tukaran batal dan tidak ada item yang berpindah~\n╰━━━━━━━',
      giverLacks: '╭─❏ 🔄 「 *TUKARAN GAGAL* 」\n┊ {from} ternyata tidak punya *{give}* lagi, jadi tukaran batal dan tidak ada item yang berpindah~\n╰━━━━━━━',
      notYours: 'Tawaran ini bukan buat kamu, jadi tidak bisa kamu putuskan~',
    },
  },
  en: {
    tukar: {
      title: 'Item Trade',
      usage: '╭─❏ 🔄 「 *ITEM TRADE* 」\n┊ Format: *.tukar <target number> <your item id> <wanted item id>*\n┊ Example: *.tukar 6281234567890 batu besi*\n┊ Item ids follow your *.inventory*~\n╰━━━━━━━',
      badItem: '╭─❏ 🔄 「 *ITEM TRADE* 」\n┊ Item *{token}* is unknown. Example item ids: batu, batubara, besi, emas, berlian\n╰━━━━━━━',
      self: '╭─❏ 🔄 「 *ITEM TRADE* 」\n┊ You cannot trade items with yourself~\n╰━━━━━━━',
      notOwned: '╭─❏ 🔄 「 *ITEM TRADE* 」\n┊ You do not have *{item}* in your inventory yet, so it cannot be offered~\n╰━━━━━━━',
      offer: '╭─❏ 🔄 「 *ITEM TRADE OFFER* 」\n┊ {from} offers {to}:\n┊ ʏᴏᴜ ɢɪᴠᴇ: *{give}* x1\n┊ ʏᴏᴜ ʀᴇᴄᴇɪᴠᴇ: *{want}* x1\n┊ For {to}: reply to this message with *terima* to swap, or *tolak* to decline. Valid for 5 minutes~\n╰━━━━━━━',
      done: '╭─❏ 🔄 「 *TRADE DONE* 」\n┊ {from} gave *{give}* and received *{want}*\n┊ {to} gave *{want}* and received *{give}*\n┊ Both inventories are updated~\n╰━━━━━━━',
      declined: '╭─❏ 🔄 「 *OFFER DECLINED* 」\n┊ The offer to trade *{give}* for *{want}* was declined. No items moved~\n╰━━━━━━━',
      targetLacks: '╭─❏ 🔄 「 *TRADE FAILED* 」\n┊ {to} no longer has *{want}*, so the trade is cancelled and no items moved~\n╰━━━━━━━',
      giverLacks: '╭─❏ 🔄 「 *TRADE FAILED* 」\n┊ {from} no longer has *{give}*, so the trade is cancelled and no items moved~\n╰━━━━━━━',
      notYours: 'This offer is not for you, so you cannot decide it~',
    },
  },
}

export const test = { input: '.tukar 6281234567890 batu besi', expect: /tukar|tawaran|belum punya|trade/i }

function itemName(item, lang) {
  return item?.name?.[lang] ?? item?.name?.id ?? item?.id ?? '-'
}

registerReplyKind('tukar', async (ctx, binding) => {
  const data = binding.data
  const word = (ctx.text || '').trim().toLowerCase()
  const isAccept = ['terima', 'ya', 'accept', 'ok'].includes(word)
  const isDecline = ['tolak', 'decline', 'batal'].includes(word)
  if (!isAccept && !isDecline) return true
  if (ctx.senderDigits !== data.to) {
    await ctx.reply(ctx.t('tukar.notYours'))
    return true
  }
  if (isDecline) {
    await clearReply(ctx.storage, ctx.chat)
    await ctx.reply(ctx.t('tukar.declined', { give: data.giveName, want: data.wantName }))
    return true
  }
  const fromProfile = await getProfile(ctx.storage, data.from)
  const toProfile = await getProfile(ctx.storage, data.to)
  const fromInv = invMap(fromProfile)
  const toInv = invMap(toProfile)
  if ((fromInv[data.give] ?? 0) < 1) {
    await clearReply(ctx.storage, ctx.chat)
    await ctx.reply(ctx.t('tukar.giverLacks', { from: data.from, give: data.giveName }))
    return true
  }
  if ((toInv[data.want] ?? 0) < 1) {
    await clearReply(ctx.storage, ctx.chat)
    await ctx.reply(ctx.t('tukar.targetLacks', { to: data.to, want: data.wantName }))
    return true
  }
  fromInv[data.give] -= 1
  fromInv[data.want] = (fromInv[data.want] ?? 0) + 1
  toInv[data.want] -= 1
  toInv[data.give] = (toInv[data.give] ?? 0) + 1
  await updateProfile(ctx.storage, data.from, { inventory: fromInv })
  await updateProfile(ctx.storage, data.to, { inventory: toInv })
  await clearReply(ctx.storage, ctx.chat)
  await ctx.reply(ctx.t('tukar.done', { from: data.from, to: data.to, give: data.giveName, want: data.wantName }))
  return true
})

export async function handler(ctx) {
  const [targetRaw, giveRaw, wantRaw] = ctx.args ?? []
  const target = String(targetRaw ?? '').replace(/\D/g, '')
  if (!target || !giveRaw || !wantRaw) return ctx.reply(ctx.t('tukar.usage'))
  if (target === ctx.senderDigits) return ctx.reply(ctx.t('tukar.self'))
  const give = findItem(giveRaw)
  if (!give) return ctx.reply(ctx.t('tukar.badItem', { token: giveRaw }))
  const want = findItem(wantRaw)
  if (!want) return ctx.reply(ctx.t('tukar.badItem', { token: wantRaw }))
  const profile = await getProfile(ctx.storage, ctx.senderDigits)
  if (invCount(profile, give.id) < 1) return ctx.reply(ctx.t('tukar.notOwned', { item: itemName(give, ctx.lang) }))
  const body = ctx.t('tukar.offer', {
    from: ctx.senderDigits, to: target, give: itemName(give, ctx.lang), want: itemName(want, ctx.lang),
  })
  const sent = await sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('tukar.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [{ text: '🔄 Tukar Item', id: `.tukar ${target} ${give.id} ${want.id}` }],
    textFallback: body,
  })
  await bindReply(ctx.storage, ctx.chat, {
    kind: 'tukar',
    messageId: sent?.key?.id,
    ownerDigits: '',
    ttlMs: 300000,
    data: { from: ctx.senderDigits, to: target, give: give.id, want: want.id, giveName: itemName(give, ctx.lang), wantName: itemName(want, ctx.lang) },
  })
  return sent
}
