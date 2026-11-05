// Nama acak dari BehindTheName (halaman random names, terverifikasi
// hidup dari VM ini: balas HTML dan nama-namanya ada di elemen
// .random-results a). Argumen mengikuti pola Elaina:
// gender|jumlah|surname|kategori, kategori adalah kode usage seperti
// eng, spa, jap, ind.
import * as cheerio from 'cheerio'
import { randomUserAgent, retry, withBreaker } from '../runner.js'

export const BEHINDTHENAME_URL = 'https://www.behindthename.com/random/random.php'

// Daftar kode kategori (usage) persis dari referensi Elaina-MD.
export const NAME_CATEGORIES = [
  'afr','alb','ara','arm','aze','bas','bel','ben','bos','bre','bul','cat','chi','cro','cze','dan','dut','eng','est','fin','fre',
  'fri','gal','geo','ger','gre','hau','haw','heb','hun','ice','igb','ind','ins','iri','ita','jap','kaz','khm','kor','lat','lim',
  'lth','mac','mly','mao','ame','nep','nor','per','pol','por','rmn','rus','sco','ser','slk','sln','spa','swa','swe','tha','tur',
  'ukr','urd','vie','wel','yor','zul','myth','celm','egym','grem','neam','scam','romm','anci','enga','cela','gmca','grea','scaa',
  'roma','litk','bibl','indm','hist','lite','popu','theo','whim','fairy','goth','hb','hippy','kk','rap','trans','witch','wrest',
  'fntsy','fntsg','fntsm','fntso','fntsr','fntss','fntst','fntsx'
]

// Urai HTML BehindTheName menjadi daftar nama dari .random-results a.
export function parseRandomNames(html) {
  if (typeof html !== 'string' || !html) return []
  const $ = cheerio.load(html)
  const names = $('.random-results a')
    .map((i, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
  return [...new Set(names)]
}

// Normalisasi gender ala Elaina: cowok/m/male jadi m, cewek/f/female
// jadi f, sisanya both.
export function normalizeGender(raw) {
  const g = String(raw || '').trim().toLowerCase()
  if (['cowok', 'm', 'male', 'laki', 'laki-laki'].includes(g)) return 'm'
  if (['cewek', 'f', 'female', 'perempuan', 'wanita'].includes(g)) return 'f'
  return 'both'
}

// Jumlah kata nama: bilangan bulat 1 sampai 4, bawaan 2 (pola Elaina).
export function normalizeCount(raw) {
  const n = parseInt(raw, 10)
  if (Number.isNaN(n) || n < 1 || n > 4) return 2
  return n
}

// Saring kode kategori mentah (koma) ke daftar kode yang dikenal.
export function parseCategories(raw) {
  if (!raw) return []
  return String(raw)
    .toLowerCase()
    .split(',')
    .map((k) => k.trim())
    .filter((k) => NAME_CATEGORIES.includes(k))
}

export async function getRandomNames(
  { gender = 'both', number = 2, surnameType = 'none', customSurname = '', usage = [] } = {},
  { fetchImpl = fetch } = {}
) {
  const params = new URLSearchParams({
    gender,
    number: String(number),
    sets: '1',
    showextra: 'yes',
    norare: 'yes',
    nodiminutives: 'yes',
    all: usage.length === 0 ? 'yes' : '',
  })
  if (surnameType === 'random') params.set('randomsurname', 'yes')
  else if (surnameType === 'custom' && customSurname) params.set('surname', customSurname)
  for (const cat of usage) {
    if (NAME_CATEGORIES.includes(cat)) params.append(`usage_${cat}`, '1')
  }
  return withBreaker('behindthename-random', () =>
    retry(async () => {
      const res = await fetchImpl(`${BEHINDTHENAME_URL}?${params}`, {
        signal: AbortSignal.timeout(30000),
        headers: { 'User-Agent': randomUserAgent(), Accept: 'text/html' },
      })
      if (!res.ok) throw new Error(`BehindTheName balas HTTP ${res.status}`)
      const names = parseRandomNames(await res.text())
      if (!names.length) throw new Error('BehindTheName tidak mengembalikan nama')
      return names
    })
  )
}
