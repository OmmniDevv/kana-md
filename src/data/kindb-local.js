// Dataset lokal faktual untuk keluarga KIND-B: kode telepon negara
// (.callingcode) dan daftar ekspedisi Indonesia (.ekspedisilist).
// Data statis yang memang stabil (kode ITU dan nama layanan kurir
// publik), dikurasi manual; deskripsi plugin menyebut jujur bahwa ini
// dataset lokal, bukan lookup daring.

export const CALLING_CODES = [
  ['Indonesia', '62'], ['Malaysia', '60'], ['Singapura', '65'], ['Thailand', '66'],
  ['Vietnam', '84'], ['Filipina', '63'], ['Brunei', '673'], ['Kamboja', '855'],
  ['Laos', '856'], ['Myanmar', '95'], ['Timor Leste', '670'], ['Jepang', '81'],
  ['Korea Selatan', '82'], ['Tiongkok', '86'], ['Hong Kong', '852'], ['Taiwan', '886'],
  ['India', '91'], ['Pakistan', '92'], ['Bangladesh', '880'], ['Sri Lanka', '94'],
  ['Nepal', '977'], ['Arab Saudi', '966'], ['Uni Emirat Arab', '971'], ['Qatar', '974'],
  ['Kuwait', '965'], ['Oman', '968'], ['Bahrain', '973'], ['Irak', '964'],
  ['Iran', '98'], ['Turki', '90'], ['Israel', '972'], ['Yordania', '962'],
  ['Lebanon', '961'], ['Yaman', '967'], ['Mesir', '20'], ['Afrika Selatan', '27'],
  ['Nigeria', '234'], ['Kenya', '254'], ['Maroko', '212'], ['Amerika Serikat', '1'],
  ['Kanada', '1'], ['Meksiko', '52'], ['Brasil', '55'], ['Argentina', '54'],
  ['Chile', '56'], ['Kolombia', '57'], ['Peru', '51'], ['Inggris', '44'],
  ['Jerman', '49'], ['Prancis', '33'], ['Italia', '39'], ['Spanyol', '34'],
  ['Portugal', '351'], ['Belanda', '31'], ['Belgia', '32'], ['Swiss', '41'],
  ['Austria', '43'], ['Swedia', '46'], ['Norwegia', '47'], ['Denmark', '45'],
  ['Finlandia', '358'], ['Polandia', '48'], ['Yunani', '30'], ['Rusia', '7'],
  ['Ukraina', '380'], ['Australia', '61'], ['Selandia Baru', '64'],
  ['Papua Nugini', '675'], ['Fiji', '679'],
]

export function findCallingCode(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  if (/^\d+$/.test(q)) {
    return CALLING_CODES.filter(([, code]) => code === q).map(([name, code]) => ({ name, code }))
  }
  return CALLING_CODES
    .filter(([name]) => name.toLowerCase().includes(q))
    .map(([name, code]) => ({ name, code }))
}

export const EXPEDITIONS = [
  { name: 'JNE', services: 'YES (1 hari), REG (2-3 hari), OKE (hemat)', note: 'Jaringan terluas, ada agen di hampir semua kota.' },
  { name: 'J&T Express', services: 'EZ/REG, ECO (hemat)', note: 'Pickup gratis dan operasional setiap hari termasuk libur.' },
  { name: 'SiCepat', services: 'REG, BEST (besok tiba), HALU (harga lucu), SIUNTUNG', note: 'Kuat di paket marketplace.' },
  { name: 'AnterAja', services: 'Reguler, Next Day, Same Day', note: 'Berbasis aplikasi, kurir disebut SATRIA.' },
  { name: 'Pos Indonesia', services: 'Kilat Khusus, Express Next Day, Pos Reguler', note: 'Menjangkau daerah terpencil lewat kantor pos.' },
  { name: 'TIKI', services: 'ONS (1 hari), TDS, REG, ECO', note: 'Salah satu ekspedisi tertua di Indonesia.' },
  { name: 'Wahana Express', services: 'Normal, Premium', note: 'Ongkir ekonomis untuk paket ringan.' },
  { name: 'Lion Parcel', services: 'REGPACK, JAGOPACK, BIGPACK (paket besar)', note: 'Didukung jaringan kargo udara Lion Air.' },
  { name: 'Ninja Xpress', services: 'Standard, Same Day (kota tertentu)', note: 'Banyak dipakai seller e-commerce.' },
  { name: 'Shopee Express', services: 'Standard, Sameday, Instant, Hemat', note: 'Ekspedisi resmi Shopee, terintegrasi di aplikasi.' },
  { name: 'GoSend', services: 'Same Day, Instant, Intercity', note: 'Layanan kurir Gojek, pelacakan real time.' },
  { name: 'GrabExpress', services: 'Same Day, Instant, Intercity', note: 'Layanan kurir Grab, pelacakan real time.' },
  { name: 'Paxel', services: 'Same Day, Next Day, Regular antarkota', note: 'Fokus same day antarkota Jawa dan Bali.' },
  { name: 'ID Express', services: 'Reguler, IDTruck (kargo)', note: 'Opsi ekonomis untuk paket marketplace.' },
  { name: 'SAP Express', services: 'Reguler, Same Day, COD', note: 'Melayani pengiriman COD untuk seller online.' },
]
