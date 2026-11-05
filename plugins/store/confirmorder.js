// Perbaikan audit templat 2026-11-05 (gelombang 2): versi lama ACTION
// listproduk, membalas etalase dan status order tidak pernah berubah.
// Sekarang .confirmorder (admin/owner) memindahkan order berstatus baru
// menjadi terkonfirmasi di kv store:orders yang sama dengan keluarga
// store sehat (.proses, .setdone, .myorder), dan buyer diberi tahu.
export const config = {
  name: 'confirmorder',
  alias: [],
  category: 'store',
  description: { id: 'Konfirmasi order toko (admin): ubah status order baru menjadi terkonfirmasi', en: 'Confirm a store order (admin): move a new order to confirmed status' },
  usage: '.confirmorder <id order>',
  example: '.confirmorder oabc123',
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    confirmorder: {
      usage: '╭─❏ 🛒 「 *KONFIRMASI ORDER* 」\n┊ Format: *.confirmorder <id order>*\n┊ Id order terlihat di notifikasi order baru dan daftar order buyer\n╰━━━━━━━',
      notFound: '╭─❏ 🛒 「 *KONFIRMASI ORDER* 」\n┊ Order *{id}* tidak ditemukan~\n╰━━━━━━━',
      done: '╭─❏ 🛒 「 *ORDER TERKONFIRMASI* 」\n┊ Order *{id}* ({name} x{qty}, Rp{total})\n┊ ꜱᴛᴀᴛᴜꜱ: *baru -> terkonfirmasi*\n┊ Buyer {buyer} sudah KANA kabari. Lanjut proses dengan *.proses {id}*\n╰━━━━━━━',
      already: '╭─❏ 🛒 「 *KONFIRMASI ORDER* 」\n┊ Order *{id}* sudah terkonfirmasi sebelumnya~\n╰━━━━━━━',
      otherStatus: '╭─❏ 🛒 「 *KONFIRMASI ORDER* 」\n┊ Order *{id}* tidak bisa dikonfirmasi karena statusnya sekarang *{status}*\n╰━━━━━━━',
      buyerNote: '🛒 Order kamu *{id}* ({name} x{qty}) sudah *terkonfirmasi* oleh toko. Pesananmu lanjut diproses yaa~',
    },
  },
  en: {
    confirmorder: {
      usage: '╭─❏ 🛒 「 *CONFIRM ORDER* 」\n┊ Format: *.confirmorder <order id>*\n┊ The order id appears in the new order notification and the buyer order list\n╰━━━━━━━',
      notFound: '╭─❏ 🛒 「 *CONFIRM ORDER* 」\n┊ Order *{id}* was not found~\n╰━━━━━━━',
      done: '╭─❏ 🛒 「 *ORDER CONFIRMED* 」\n┊ Order *{id}* ({name} x{qty}, Rp{total})\n┊ ꜱᴛᴀᴛᴜꜱ: *baru -> terkonfirmasi*\n┊ Buyer {buyer} has been notified. Continue with *.proses {id}*\n╰━━━━━━━',
      already: '╭─❏ 🛒 「 *CONFIRM ORDER* 」\n┊ Order *{id}* was already confirmed~\n╰━━━━━━━',
      otherStatus: '╭─❏ 🛒 「 *CONFIRM ORDER* 」\n┊ Order *{id}* cannot be confirmed because its status is now *{status}*\n╰━━━━━━━',
      buyerNote: '🛒 Your order *{id}* ({name} x{qty}) has been *confirmed* by the store. Your order is being processed~',
    },
  },
}

export const test = { input: '.confirmorder otest123', expect: /order/i }

export async function handler(ctx) {
  const id = (ctx.args?.[0] ?? '').trim()
  if (!id) return ctx.reply(ctx.t('confirmorder.usage'))
  const orders = (await ctx.storage.get('kv', 'store:orders')) ?? []
  const order = orders.find((o) => o.id === id)
  if (!order) return ctx.reply(ctx.t('confirmorder.notFound', { id }))
  if (order.status === 'terkonfirmasi') return ctx.reply(ctx.t('confirmorder.already', { id }))
  if (order.status !== 'baru') return ctx.reply(ctx.t('confirmorder.otherStatus', { id, status: order.status }))
  order.status = 'terkonfirmasi'
  order.confirmedAt = Date.now()
  await ctx.storage.set('kv', 'store:orders', orders)
  try {
    await ctx.sock.sendMessage(order.buyer + '@s.whatsapp.net', {
      text: ctx.t('confirmorder.buyerNote', { id, name: order.name, qty: order.qty }),
    })
  } catch {}
  return ctx.reply(ctx.t('confirmorder.done', { id, name: order.name, qty: order.qty, total: order.total, buyer: order.buyer }))
}
