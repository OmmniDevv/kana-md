// Ayat Kursi (QS Al-Baqarah 2:255) dari Equran.id.
export const config = {
  name: 'ayatkursi',
  alias: ['kursi'],
  category: 'search',
  description: { id: 'Ayat Kursi (QS Al-Baqarah ayat 255) lengkap dengan artinya', en: 'Ayat Kursi (QS Al-Baqarah verse 255) with its translation' },
  usage: '.ayatkursi',
  example: '.ayatkursi',
  cooldown: 10,
}

export const i18n = {
  id: {
    ayatkursi: {
      body: '╭─❏ 📖 「 *AYAT KURSI* 」\n┊ ǫꜱ ᴀʟ-ʙᴀǫᴀʀᴀʜ: *255*\n\n{arab}\n\n{trans}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *GAGAL AMBIL AYAT KURSI* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
  en: {
    ayatkursi: {
      body: '╭─❏ 📖 「 *AYAT KURSI* 」\n┊ ǫꜱ ᴀʟ-ʙᴀǫᴀʀᴀʜ: *255*\n\n{arab}\n\n{trans}\n╰━━━━━━━',
      fail: '╭─❏ 😖 「 *FAILED TO FETCH AYAT KURSI* 」\n┊ {error}\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.ayatkursi', expect: /ayat kursi/i }

export async function handler(ctx) {
  try {
    const res = await fetch('https://equran.id/api/v2/surat/2', { signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { data } = await res.json()
    const verse = (data.ayat ?? []).find((v) => v.nomorAyat === 255)
    if (!verse) throw new Error('ayat 255 tidak ditemukan')
    return ctx.reply(ctx.t('ayatkursi.body', { arab: verse.teksArab, trans: verse.teksIndonesia }))
  } catch (err) {
    return ctx.reply(ctx.t('ayatkursi.fail', { error: err.message }))
  }
}
