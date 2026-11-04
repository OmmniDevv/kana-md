// Cari sumber anime dari gambar: trace.moe (API publik pengenal adegan
// anime, pengecualian setara API game di DECISIONS.md). Balas gambar
// anime, bot menjawab judul, episode, dan menit adegannya.
export const config = {
  name: 'animeimgsearch',
  alias: ['tracemoe', 'animesearchimg', 'caranime'],
  category: 'anime',
  description: { id: 'Kenali anime dari potongan gambar adegan (trace.moe)', en: 'Identify an anime from a scene screenshot (trace.moe)' },
  usage: '.animeimgsearch (balas gambar adegan anime)',
  example: '.animeimgsearch',
  cooldown: 15,
}

export const i18n = {
  id: {
    animeimgsearch: {
      need: 'Balas gambar adegan animenya yaa~ {mood}',
      body: '🔍 HASIL PENCARIAN ANIME\n\nKemiripan: {similarity}%\nEpisode: {episode}\nWaktu adegan: {time}\nAniList: {url}',
      notFound: 'Gambarnya tidak dikenali sebagai adegan anime. {mood}',
      fail: 'Gagal cari animenya: {error}',
    },
  },
  en: {
    animeimgsearch: {
      need: 'Reply to the anime scene image please~ {mood}',
      body: '🔍 ANIME SEARCH RESULT\n\nSimilarity: {similarity}%\nEpisode: {episode}\nScene time: {time}\nAniList: {url}',
      notFound: 'The image was not recognized as an anime scene. {mood}',
      fail: 'Failed to search the anime: {error}',
    },
  },
}

export const test = { input: '.animeimgsearch', expect: /balas|reply/i }

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export async function searchAnimeImage(buffer) {
  const form = new FormData()
  form.append('image', new Blob([buffer]), 'scene.jpg')
  const res = await fetch('https://api.trace.moe/search', {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`trace.moe HTTP ${res.status}`)
  const data = await res.json()
  return data.result?.[0] ?? null
}

export async function handler(ctx) {
  const media = await ctx.downloadQuoted().catch(() => null)
  if (!media?.buffer || media.kind !== 'image') return ctx.reply(ctx.t('animeimgsearch.need', { mood: ctx.say('mikir') }))
  try {
    const hit = await searchAnimeImage(media.buffer)
    if (!hit) return ctx.reply(ctx.t('animeimgsearch.notFound', { mood: ctx.say('gagal') }))
    return ctx.reply(ctx.t('animeimgsearch.body', {
      similarity: (hit.similarity * 100).toFixed(1),
      episode: hit.episode ?? '-',
      time: formatTime(hit.at ?? hit.from ?? 0),
      url: `https://anilist.co/anime/${hit.anilist}`,
    }))
  } catch (err) {
    return ctx.reply(ctx.t('animeimgsearch.fail', { error: err.message }))
  }
}
