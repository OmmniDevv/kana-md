
import { getProfile } from '../../src/services/user-service.js'
import { cleanKanaTmp } from '../../src/services/tmp-cleaner.js'
export const config = {
  name: "sitagrup",
  alias: [],
  category: "owner",
  description: { id: "Sistem pengambilalihan grup (Kudeta)", en: "KANA version of the Elaina-MD sitagrup feature, rewritten in KANA style" },
  usage: ".sitagrup",
  example: ".sitagrup",
  cooldown: 5,
  isOwner: true,
}

export const i18n = {
  id: {
    "sitagrup": {
      body: "╭─❏ 👑 「 *SITAGRUP* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
      usage: "╭─❏ 👑 「 *SITAGRUP* 」\n┊ {text}\n╰━━━━━━━",
    },
  },
  en: {
    "sitagrup": {
      body: "╭─❏ 👑 「 *SITAGRUP* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
      usage: "╭─❏ 👑 「 *SITAGRUP* 」\n┊ {text}\n╰━━━━━━━",
    },
  },
}

const ACTION = "searchplugin"
export const test = { input: '.sitagrup', expect: /sitagrup/i }
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('sitagrup.body', { text }))
  const arg = (ctx.text || '').trim()
  try {
    if (ACTION === 'listban') {
      const keys = await ctx.storage.keys('users')
      const rows = []
      for (const k of keys) { if (/^\d+$/.test(k)) { const pr = await getProfile(ctx.storage, k); if (pr.banned) rows.push(k) } }
      return say(rows.length ? 'User terbanned:\n┊ ' + rows.map((d) => '* ' + d).join('\n┊ ') : 'Tidak ada user yang terbanned.')
    }
    if (ACTION === 'listgc') {
      const groups = await ctx.sock.groupFetchAllParticipating()
      const rows = Object.values(groups || {})
      if (!rows.length) return say('Bot belum masuk grup mana pun.')
      return say('Grup bot (' + rows.length + '):\n┊ ' + rows.slice(0, 30).map((g, i) => (i + 1) + '. *' + (g.subject || g.id) + '* (' + (g.participants?.length ?? 0) + ')').join('\n┊ '))
    }
    if (ACTION === 'listjadibot') {
      let keys = []
      try { keys = await ctx.storage.keys('jadibot') } catch { keys = [] }
      return say(keys.length ? 'Sesi jadibot tersimpan:\n┊ ' + keys.map((k) => '* ' + k).join('\n┊ ') : 'Tidak ada sesi jadibot tersimpan.')
    }
    if (ACTION === 'checkban') {
      const target = (arg.replace(/\D/g, '') || ctx.senderDigits)
      const pr = await getProfile(ctx.storage, target)
      return say('User *' + target + '*: banned = *' + (pr.banned ? 'YA' : 'tidak') + '*, terdaftar = *' + (pr.registered ? 'ya' : 'belum') + '*')
    }
    if (ACTION === 'searchplugin') {
      const all = ctx.registry.list().map((x) => x.config.name)
      const hits = arg ? all.filter((x) => x.includes(arg.toLowerCase())) : all
      return say('Plugin (' + hits.length + '/' + all.length + '):\n┊ ' + hits.slice(0, 60).join(', '))
    }
    if (ACTION === 'listcmd') {
      const all = ctx.registry.list()
      return say('Total *' + all.length + ' plugin utama* dan *' + all.reduce((s, x) => s + 1 + (x.config.alias?.length || 0), 0) + ' nama perintah* (dengan alias).')
    }
    if (ACTION === 'sampah') {
      const r = await cleanKanaTmp()
      return say('Pembersihan tmp selesai: ' + JSON.stringify(r).slice(0, 300))
    }
    if (ACTION === 'backup') {
      const dump = {}
      for (const ns of ['users', 'kv', 'groups']) {
        dump[ns] = {}
        let keys = []
        try { keys = await ctx.storage.keys(ns) } catch { keys = [] }
        for (const k of keys.slice(0, 500)) { try { dump[ns][k] = await ctx.storage.get(ns, k) } catch {} }
      }
      const buf = Buffer.from(JSON.stringify(dump, null, 1))
      await ctx.sock.sendMessage(ctx.chat, { document: buf, fileName: 'kana-backup-' + Date.now() + '.json', mimetype: 'application/json', caption: 'Backup data bot (users, kv, groups)' }, { quoted: ctx.raw })
      return say('Backup terkirim sebagai dokumen di atas.')
    }
    if (ACTION === 'banchat' || ACTION === 'unbanchat') {
      const target = (ctx.mentionedJids?.[0] || (arg.replace(/\D/g, '') ? arg.replace(/\D/g, '') + '@s.whatsapp.net' : ''))
      if (!target) return say('Sebut nomor targetnya yaa~')
      await ctx.sock.updateBlockStatus(target, ACTION === 'banchat' ? 'block' : 'unblock')
      return say('Status blokir *' + target + '* diperbarui.')
    }
    if (ACTION === 'leave') {
      const jid = arg.includes('@g.us') ? arg : ctx.chat
      await ctx.sock.groupLeave(jid)
      return undefined
    }
    if (ACTION === 'groupact') {
      const target = ctx.mentionedJids?.[0] || (arg.replace(/\D/g, '') ? arg.replace(/\D/g, '') + '@s.whatsapp.net' : '')
      if (!target) return say('Tag atau sebut nomor targetnya yaa~')
      const mode = 'sitagrup'.includes('kick') ? 'remove' : 'sitagrup'.includes('promote') ? 'promote' : 'sitagrup'.includes('demote') ? 'demote' : 'add'
      await ctx.sock.groupParticipantsUpdate(ctx.chat, [target], mode)
      return say('Aksi grup *' + mode + '* untuk *' + target + '* selesai.')
    }
    if (ACTION === 'hapususer') {
      const target = arg.replace(/\D/g, '')
      if (!target) return say('Sebut nomor targetnya yaa~')
      await ctx.storage.delete('users', target)
      return say('Data user *' + target + '* dihapus dari storage bot.')
    }
    if (ACTION === 'similarity') {
      const [a, b] = arg.split('|').map((s) => (s || '').trim().toLowerCase())
      if (!a || !b) return say('Format: .similarity <teks a>|<teks b>')
      const grams = (s) => { const m = new Map(); for (let i = 0; i < s.length - 1; i++) m.set(s.slice(i, i + 2), (m.get(s.slice(i, i + 2)) || 0) + 1); return m }
      const ga = grams(a); const gb = grams(b)
      let same = 0; for (const [k, v] of ga) same += Math.min(v, gb.get(k) || 0)
      const score = Math.round((2 * same / Math.max(1, (a.length - 1) + (b.length - 1))) * 100)
      return say('Kemiripan dua teks itu: *' + score + '%*')
    }
    return say('Aksi owner ini siap~')
  } catch (err) {
    return ctx.reply(ctx.t('sitagrup.fail', { error: err.message }))
  }
}
