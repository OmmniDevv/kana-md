
import { getGroupSettings, updateGroupSettings } from '../../src/services/group-service.js'
import { getGroupText, resetGroupText } from '../../src/services/group-settings.js'
export const config = {
  name: "totalpesan",
  alias: [],
  category: "group",
  description: { id: "Fitur totalpesan versi KANA, ditulis ulang gaya KANA dari referensi Elaina-MD owner", en: "KANA version of the Elaina-MD totalpesan feature, rewritten in KANA style" },
  usage: ".totalpesan",
  example: ".totalpesan",
  cooldown: 5,
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
}

export const i18n = {
  id: {
    "totalpesan": {
      body: "╭─❏ 👥 「 *TOTALPESAN* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 👥 「 *TOTALPESAN* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *GAGAL* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "totalpesan": {
      body: "╭─❏ 👥 「 *TOTALPESAN* 」\n┊ {text}\n╰━━━━━━━",
      hint: "╭─❏ 👥 「 *TOTALPESAN* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *FAILED* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

const ACTION = "members"
export const test = { input: '.totalpesan', expect: /totalpesan|grup|group/i }
export async function handler(ctx) {
  const say = (text) => ctx.reply(ctx.t('totalpesan.body', { text }))
  const arg = (ctx.text || '').trim()
  try {
    const meta = ctx.groupMetadata ?? (await ctx.getGroupMetadata())
    if (ACTION === 'id') return say('ID grup ini: *' + ctx.chat + '*\n┊ Nama: *' + (meta?.subject || '-') + '*\n┊ Member: *' + (meta?.participants?.length ?? 0) + '*')
    if (ACTION === 'members') {
      const lines = (meta?.participants || []).slice(0, 40).map((x, i) => (i + 1) + '. *' + (x.id || '').split('@')[0] + '*' + (x.admin ? ' (admin)' : '')).join('\n┊ ')
      return say('Member grup *' + (meta?.subject || '') + '*:\n┊ ' + (lines || '-'))
    }
    if (ACTION === 'warns') {
      const s = await getGroupSettings(ctx.storage, ctx.chat)
      const rows = Object.entries(s.warns || {})
      if (!rows.length) return say('Belum ada warn di grup ini.')
      return say('Daftar warn:\n┊ ' + rows.map(([d, c]) => '* ' + d + ': ' + c + '/' + (s.warnLimit || 3)).join('\n┊ '))
    }
    if (ACTION === 'link') {
      const code = await ctx.sock.groupInviteCode(ctx.chat)
      return say('Link grup: https://chat.whatsapp.com/' + code)
    }
    if (ACTION === 'resetlink') {
      const code = await ctx.sock.groupRevokeInvite(ctx.chat)
      return say('Link grup di-reset. Link baru: https://chat.whatsapp.com/' + code)
    }
    if (ACTION === 'open') { await ctx.sock.groupSettingUpdate(ctx.chat, 'not_announcement'); return say('Grup dibuka, semua member bisa kirim pesan~') }
    if (ACTION === 'close') { await ctx.sock.groupSettingUpdate(ctx.chat, 'announcement'); return say('Grup ditutup, cuma admin yang bisa kirim pesan~') }
    if (ACTION === 'delete') {
      if (!ctx.quoted?.key) return say('Balas pesan yang mau dihapus dulu yaa~')
      await ctx.sock.sendMessage(ctx.chat, { delete: ctx.quoted.key })
      return say('Pesan dihapus~')
    }
    if (ACTION === 'resetwelcome') { await resetGroupText(ctx.storage, ctx.chat, 'welcome'); return say('Teks welcome grup dikembalikan ke bawaan KANA~') }
    if (ACTION === 'resetgoodbye') { await resetGroupText(ctx.storage, ctx.chat, 'goodbye'); return say('Teks goodbye grup dikembalikan ke bawaan KANA~') }
    if (ACTION === 'resetintro') { await updateGroupSettings(ctx.storage, ctx.chat, { introTemplate: '' }); return say('Intro grup dikembalikan ke bawaan~') }
    if (ACTION === 'resetrules') { await updateGroupSettings(ctx.storage, ctx.chat, { rules: '' }); return say('Rules grup dikosongkan, kembali ke bawaan~') }
    if (ACTION === 'rules') {
      const s = await getGroupSettings(ctx.storage, ctx.chat)
      return say('Rules grup:\n┊ ' + (s.rules || 'Belum ada rules kustom. Admin bisa atur dengan .setrules'))
    }
    if (ACTION === 'setrules') {
      if (!arg) return say('Tulis rules barunya yaa~')
      await updateGroupSettings(ctx.storage, ctx.chat, { rules: arg.slice(0, 1000) })
      return say('Rules grup diperbarui~')
    }
    if (ACTION === 'toxiclist' || ACTION === 'toxicadd' || ACTION === 'toxicdel') {
      const s = await getGroupSettings(ctx.storage, ctx.chat)
      const words = [...(s.toxicWords || [])]
      if (ACTION === 'toxiclist') return say('Kata toxic kustom grup ini: ' + (words.length ? words.map((w) => '*' + w + '*').join(', ') : 'belum ada'))
      const word = arg.toLowerCase().trim()
      if (!word) return say('Tulis katanya yaa~')
      if (ACTION === 'toxicadd') { if (!words.includes(word)) words.push(word) } else { const i = words.indexOf(word); if (i >= 0) words.splice(i, 1) }
      await updateGroupSettings(ctx.storage, ctx.chat, { toxicWords: words })
      return say('Daftar kata toxic diperbarui (' + words.length + ' kata).')
    }
    if (ACTION === 'absenstart' || ACTION === 'absencheck' || ACTION === 'absenclear') {
      const s = await getGroupSettings(ctx.storage, ctx.chat)
      const session = s.absen ?? null
      if (ACTION === 'absenclear') { await updateGroupSettings(ctx.storage, ctx.chat, { absen: null }); return say('Sesi absen grup dibersihkan~') }
      if (ACTION === 'absenstart') {
        if (session) return say('Absen lagi berjalan, dimulai oleh *' + session.startedBy + '*')
        await updateGroupSettings(ctx.storage, ctx.chat, { absen: { startedBy: ctx.senderDigits, startedAt: Date.now(), present: {} } })
        return say('Absen dimulai! Ketik *.absen check* buat hadir yaa~')
      }
      if (!session) return say('Belum ada sesi absen. Admin bisa mulai dengan *.mulaiabsen*')
      const rows = Object.entries(session.present || {})
      if (!rows.length) return say('Belum ada yang check in di sesi absen ini.')
      return say('Hadir *' + rows.length + ' orang*:\n┊ ' + rows.map(([d, nm], i) => (i + 1) + '. *' + d + '* (' + nm + ')').join('\n┊ '))
    }
    if (ACTION === 'opentime' || ACTION === 'bukajam' || ACTION === 'tutupjam') {
      const [open, close] = arg.split(/\s+/)
      const s = await getGroupSettings(ctx.storage, ctx.chat)
      if (ACTION === 'opentime' || !open) {
        const oc = s.openClose
        return say(oc ? 'Jam buka grup: *' + (oc.open || '-') + '*, jam tutup: *' + (oc.close || '-') + '* WIB (diatur scheduler KANA)' : 'Jadwal buka tutup grup belum diatur. Atur dengan *.bukajam <HH:mm>* dan *.tutupjam <HH:mm>*')
      }
      const oc = { ...(s.openClose || {}), state: (s.openClose || {}).state || 'open' }
      if (ACTION === 'bukajam') oc.open = open; else oc.close = open
      await updateGroupSettings(ctx.storage, ctx.chat, { openClose: oc })
      return say('Jadwal grup diperbarui: buka *' + (oc.open || '-') + '*, tutup *' + (oc.close || '-') + '* WIB')
    }
    if (ACTION === 'acc') {
      const list = await ctx.sock.groupRequestParticipantsList(ctx.chat)
      if (!list || !list.length) return say('Tidak ada permintaan gabung yang menunggu~')
      if ((ctx.args[0] || '').toLowerCase() === 'setuju') {
        const jids = list.map((x) => x.jid || x.id).filter(Boolean)
        await ctx.sock.groupRequestParticipantsUpdate(ctx.chat, jids, 'approve')
        return say('Semua permintaan gabung disetujui (' + jids.length + ' orang)~')
      }
      return say('Ada *' + list.length + '* permintaan gabung menunggu. Setujui semua dengan *.totalpesan setuju*')
    }
    if (ACTION === 'announce') {
      if (!arg) return say('Tulis isi pengumumannya yaa~')
      const mentions = (meta?.participants || []).map((x) => x.id).filter(Boolean)
      await ctx.sock.sendMessage(ctx.chat, { text: '📣 *PENGUMUMAN GRUP*\n\n' + arg, mentions }, { quoted: ctx.raw })
      return say('Pengumuman terkirim~')
    }
    if (ACTION === 'leave') { await ctx.sock.groupLeave(ctx.chat); return undefined }
    if (ACTION === 'kickall') {
      if ((ctx.args[0] || '').toLowerCase() !== 'ya') return say('Ini akan mengeluarkan SEMUA member non-admin. Kalau yakin, ketik *.totalpesan ya*')
      const targets = (meta?.participants || []).filter((x) => !x.admin).map((x) => x.id).filter(Boolean)
      if (targets.length) await ctx.sock.groupParticipantsUpdate(ctx.chat, targets, 'remove')
      return say('Selesai, ' + targets.length + ' member dikeluarkan.')
    }
    if (ACTION === 'sholatnotif') {
      const city = arg || 'Jakarta'
      await updateGroupSettings(ctx.storage, ctx.chat, { prayerReminder: true, prayerCity: city })
      return say('Pengingat sholat grup aktif untuk kota *' + city + '* (scheduler KANA yang mengirimnya)')
    }
    return say('Aksi grup ini siap~')
  } catch (err) {
    return ctx.reply(ctx.t('totalpesan.fail', { error: err.message }))
  }
}
