
export const config = {
  name: "editstok",
  alias: [],
  category: "store",
  description: { id: "✏️ Edit stok item produk (hanya di private chat)", en: "KANA version of the Elaina-MD editstok feature, rewritten in KANA style" },
  usage: ".editstok",
  example: ".editstok",
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    "editstok": {
      body: "╭─❏ 🛒 「 *TOKO KANA* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🛒 「 *TOKO KANA* 」\n┊ {text}\n╰━━━━━━━",
    },
  },
  en: {
    "editstok": {
      body: "╭─❏ 🛒 「 *KANA STORE* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 🛒 「 *KANA STORE* 」\n┊ {text}\n╰━━━━━━━",
    },
  },
}

const ACTION = "editstok"
export const test = { input: '.editstok 1|9', expect: /.+/ }
async function load(ctx, key, fallback) { const v = await ctx.storage.get('kv', key); return v ?? fallback }
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('editstok.body', { text }))
  const products = await load(ctx, 'store:products', [])
  const orders = await load(ctx, 'store:orders', [])
  const arg = (ctx.text || '').trim()
  const ownerNum = (process.env.OWNER_NUMBER || '').replace(/\D/g, '')
  if (ACTION === 'listproduk' || ACTION === 'list') {
    if (!products.length) return say('Etalase masih kosong. Owner bisa tambah produk dengan .addproduk <nama>|<harga>|<stok>')
    const lines = products.map((x, i) => (i + 1) + '. *' + x.name + '* - Rp' + x.price + ' (stok ' + x.stock + ', id: ' + x.id + ')').join('\n┊ ')
    return say('Etalase toko (order manual via chat, pembayaran diatur owner langsung):\n┊ ' + lines + '\n┊ Beli dengan *.beli <id>* yaa~')
  }
  if (ACTION === 'addproduk') {
    const parts = arg.split('|').map((s) => s.trim())
    if (parts.length < 3) return say('Format: .addproduk <nama>|<harga>|<stok>')
    const item = { id: 'p' + Date.now().toString(36), name: parts[0].slice(0, 60), price: Math.max(0, parseInt(parts[1]) || 0), stock: Math.max(0, parseInt(parts[2]) || 0) }
    products.push(item)
    await ctx.storage.set('kv', 'store:products', products)
    return say('Produk *' + item.name + '* ditambahkan dengan id *' + item.id + '*')
  }
  if (ACTION === 'editproduk') {
    const parts = arg.split('|').map((s) => s.trim())
    const item = products.find((x) => x.id === parts[0])
    if (!item || parts.length < 4) return say('Format: .editproduk <id>|<nama>|<harga>|<stok>')
    item.name = parts[1].slice(0, 60); item.price = Math.max(0, parseInt(parts[2]) || 0); item.stock = Math.max(0, parseInt(parts[3]) || 0)
    await ctx.storage.set('kv', 'store:products', products)
    return say('Produk *' + item.id + '* diperbarui.')
  }
  if (ACTION === 'hapusproduk') {
    const next = products.filter((x) => x.id !== arg)
    if (next.length === products.length) return say('Produk tidak ditemukan~')
    await ctx.storage.set('kv', 'store:products', next)
    return say('Produk *' + arg + '* dihapus dari etalase.')
  }
  if (ACTION === 'addstok' || ACTION === 'editstok' || ACTION === 'hapusstok' || ACTION === 'liststok' || ACTION === 'autocekstok') {
    if (ACTION === 'liststok' || ACTION === 'autocekstok') {
      if (!products.length) return say('Belum ada produk.')
      return say('Stok saat ini:\n┊ ' + products.map((x) => '* ' + x.name + ': ' + x.stock).join('\n┊ '))
    }
    const [id, amountRaw] = arg.split(/\s+/)
    const item = products.find((x) => x.id === id)
    const amount = parseInt(amountRaw) || 0
    if (!item || amount <= 0) return say('Format: .editstok <id produk> <jumlah>')
    item.stock = ACTION === 'addstok' ? item.stock + amount : ACTION === 'editstok' ? amount : Math.max(0, item.stock - amount)
    await ctx.storage.set('kv', 'store:products', products)
    return say('Stok *' + item.name + '* sekarang *' + item.stock + '*')
  }
  if (ACTION === 'addlist' || ACTION === 'editlist' || ACTION === 'hapuslist') {
    const list = await load(ctx, 'store:list', [])
    if (ACTION === 'addlist') {
      if (!arg) return say('Tulis baris etalasenya yaa~')
      list.push(arg.slice(0, 120))
      await ctx.storage.set('kv', 'store:list', list)
      return say('Baris etalase ditambahkan di posisi *' + list.length + '*')
    }
    const idx = parseInt(arg.split(/\s+/)[0]) - 1
    if (!(idx >= 0 && idx < list.length)) return say('Nomor baris tidak valid~')
    if (ACTION === 'hapuslist') { list.splice(idx, 1); await ctx.storage.set('kv', 'store:list', list); return say('Baris etalase dihapus.') }
    const text = arg.split(/\s+/).slice(1).join(' ')
    if (!text) return say('Format: .editlist <nomor> <teks baru>')
    list[idx] = text.slice(0, 120)
    await ctx.storage.set('kv', 'store:list', list)
    return say('Baris etalase diperbarui.')
  }
  if (ACTION === 'showlist') {
    const list = await load(ctx, 'store:list', [])
    if (!list.length) return say('Daftar etalase masih kosong.')
    return say(list.map((x, i) => (i + 1) + '. ' + x).join('\n┊ '))
  }
  if (ACTION === 'beli') {
    const [id, qtyRaw] = arg.split(/\s+/)
    const item = products.find((x) => x.id === id)
    if (!item) return say('Produk tidak ditemukan. Lihat .listproduk dulu yaa~')
    const qty = Math.max(1, parseInt(qtyRaw) || 1)
    if (item.stock < qty) return say('Stok *' + item.name + '* kurang, sisa ' + item.stock)
    item.stock -= qty
    const order = { id: 'o' + Date.now().toString(36), buyer: ctx.senderDigits, productId: item.id, name: item.name, qty, total: item.price * qty, status: 'baru', at: Date.now() }
    orders.push(order)
    await ctx.storage.set('kv', 'store:products', products)
    await ctx.storage.set('kv', 'store:orders', orders)
    if (ownerNum) { try { await ctx.sock.sendMessage(ownerNum + '@s.whatsapp.net', { text: '🛒 Order baru *' + order.id + '*: ' + item.name + ' x' + qty + ' dari ' + ctx.senderDigits + ' (total Rp' + order.total + '). Proses dengan .proses ' + order.id }) } catch {} }
    return say('Order *' + order.id + '* dibuat: *' + item.name + '* x' + qty + ', total *Rp' + order.total + '*.\n┊ Pembayaran manual ke owner yaa, ordermu diteruskan ke owner~')
  }
  if (ACTION === 'myorder') {
    const mine = orders.filter((o) => o.buyer === ctx.senderDigits).slice(-8)
    if (!mine.length) return say('Kamu belum punya order.')
    return say('Order kamu:\n┊ ' + mine.map((o) => '* ' + o.id + ' - ' + o.name + ' x' + o.qty + ' (' + o.status + ')').join('\n┊ '))
  }
  if (ACTION === 'productinfo') {
    const item = products.find((x) => x.id === arg || x.name.toLowerCase().includes(arg.toLowerCase()))
    if (!item) return say('Produk tidak ditemukan~')
    return say('Produk *' + item.name + '*\n┊ Harga: *Rp' + item.price + '*\n┊ Stok: *' + item.stock + '*\n┊ ID: *' + item.id + '*\n┊ Beli dengan *.beli ' + item.id + '*')
  }
  if (ACTION === 'setstatus') {
    const order = orders.find((o) => o.id === arg)
    if (!order) return say('Order tidak ditemukan~')
    order.status = ''
    await ctx.storage.set('kv', 'store:orders', orders)
    try { await ctx.sock.sendMessage(order.buyer + '@s.whatsapp.net', { text: '🛒 Status order *' + order.id + '* (' + order.name + ') sekarang: *' + order.status + '*' }) } catch {}
    return say('Order *' + order.id + '* sekarang berstatus *' + order.status + '*')
  }
  if (ACTION === 'cancelorder') {
    const order = orders.find((o) => o.id === arg)
    if (!order) return say('Order tidak ditemukan~')
    if (!ctx.isOwner && order.buyer !== ctx.senderDigits) return say('Itu bukan order kamu~')
    if (order.status === 'baru') {
      const item = products.find((x) => x.id === order.productId)
      if (item) { item.stock += order.qty; await ctx.storage.set('kv', 'store:products', products) }
    }
    order.status = 'batal'
    await ctx.storage.set('kv', 'store:orders', orders)
    return say('Order *' + order.id + '* dibatalkan, stok dikembalikan.')
  }
  if (ACTION === 'delorder') {
    const next = orders.filter((o) => o.id !== arg)
    if (next.length === orders.length) return say('Order tidak ditemukan~')
    await ctx.storage.set('kv', 'store:orders', next)
    return say('Order *' + arg + '* dihapus.')
  }
  return say('Perintah toko ini siap. Lihat .listproduk buat etalase yaa~')
}
