// Baca ayat Al-Quran dari Equran.id (sumber yang sama dengan murottal,
// pengecualian tercatat di DECISIONS.md). Argumen: nomor surah, atau
// surah:ayat untuk satu ayat (misal .alquran 2:255 = Ayat Kursi).
const API = 'https://equran.id/api/v2'

export const config = {
  name: 'alquran',
  alias: ['quranayat', 'ayatquran'],
  category: 'search',
  description: { id: 'Baca ayat Al-Quran per surah atau per ayat (Equran.id)', en: 'Read Quran verses per surah or a single verse (Equran.id)' },
  usage: '.alquran <surah[:ayat]>',
  example: '.alquran 2:255',
  cooldown: 10,
}

export const i18n = {
  id: {
    alquran: {
      hint: '╭─❏ 📖 「 *AL-QURAN* 」\n┊ Tulis nomor surahnya yaa~\n┊ Contoh: *.alquran 2:255* untuk Ayat Kursi, atau *.alquran 1* untuk Al-Fatihah.\n╰━━━━━━━',
      head: '╭─❏ 📖 「 *QS {latin} ({arti})* 」\n┊ ᴀʏᴀᴛ: *{range}*',
      verse: '{n}. {arab}\n{trans}',
      badInput: '╭─❏ 🙈 「 *FORMAT SALAH* 」\n┊ Formatnya surah atau surah:ayat yaa, surah *1* sampai *114*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *GAGAL AMBIL AYAT* 」\n┊ {error}\n╰━━━━━━━',
      truncated: '┊ Surahnya panjang, KANA tampilkan *10 ayat pertama* dulu yaa~',
    },
  },
  en: {
    alquran: {
      hint: '╭─❏ 📖 「 *AL-QURAN* 」\n┊ Write the surah number please~\n┊ Example: *.alquran 2:255* for Ayat Kursi, or *.alquran 1* for Al-Fatihah.\n╰━━━━━━━',
      head: '╭─❏ 📖 「 *QS {latin} ({arti})* 」\n┊ ᴠᴇʀꜱᴇꜱ: *{range}*',
      verse: '{n}. {arab}\n{trans}',
      badInput: '╭─❏ 🙈 「 *WRONG FORMAT* 」\n┊ The format is surah or surah:verse, surah *1* to *114*. {mood}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *FAILED TO FETCH VERSES* 」\n┊ {error}\n╰━━━━━━━',
      truncated: '┊ The surah is long, showing the *first 10 verses*~',
    },
  },
}

export const test = { input: '.alquran', expect: /surah/i }

const MAX_VERSES = 10

export async function handler(ctx) {
  const raw = (ctx.text || '').trim()
  const match = raw.match(/^(\d{1,3})(?::(\d{1,3}))?$/)
  if (!raw) return ctx.reply(ctx.t('alquran.hint'))
  if (!match) return ctx.reply(ctx.t('alquran.badInput', { mood: ctx.say('gagal') }))
  const surahNo = Number(match[1])
  const verseNo = match[2] ? Number(match[2]) : null
  if (surahNo < 1 || surahNo > 114) return ctx.reply(ctx.t('alquran.badInput', { mood: ctx.say('gagal') }))
  try {
    const res = await fetch(`${API}/surat/${surahNo}`, { signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { data } = await res.json()
    let verses = data.ayat ?? []
    if (verseNo) verses = verses.filter((v) => v.nomorAyat === verseNo)
    if (!verses.length) return ctx.reply(ctx.t('alquran.badInput', { mood: ctx.say('gagal') }))
    const shown = verses.slice(0, MAX_VERSES)
    const range = verseNo ? String(verseNo) : `1-${shown[shown.length - 1].nomorAyat}`
    const body = shown.map((v) => ctx.t('alquran.verse', { n: v.nomorAyat, arab: v.teksArab, trans: v.teksIndonesia })).join('\n\n')
    let out = `${ctx.t('alquran.head', { latin: data.namaLatin, arti: data.arti, range })}\n\n${body}`
    if (!verseNo && verses.length > MAX_VERSES) out += `\n\n${ctx.t('alquran.truncated')}`
    out += '\n╰━━━━━━━'
    return ctx.reply(out)
  } catch (err) {
    return ctx.reply(ctx.t('alquran.fail', { error: err.message }))
  }
}
