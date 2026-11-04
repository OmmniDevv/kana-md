import { sendButtons } from '../../src/ui/buttons.js'

export const config = {
  name: 'gennama',
  alias: ['namarandom', 'buatnama'],
  category: 'fun',
  description: { id: 'Buat nama acak gaya Indonesia untuk karakter, akun, atau bayi (hiburan)', en: 'Generate random Indonesian style names for characters, accounts, or babies (fun)' },
  usage: '.gennama [cowo | cewe]',
  example: '.gennama cewe',
  cooldown: 3,
}

const MALE = ['Aditya', 'Bagas', 'Candra', 'Dimas', 'Eko', 'Fajar', 'Galih', 'Hendra', 'Ilham', 'Joko', 'Krisna', 'Lukman', 'Mahesa', 'Nugroho', 'Okta', 'Prasetyo', 'Raka', 'Surya', 'Teguh', 'Wahyu']
const FEMALE = ['Ayu', 'Bunga', 'Citra', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hana', 'Intan', 'Jelita', 'Kartika', 'Lestari', 'Maya', 'Nadia', 'Oktavia', 'Putri', 'Ratna', 'Sari', 'Tiara', 'Wulan']
const LAST = ['Pratama', 'Saputra', 'Wijaya', 'Kusuma', 'Nugraha', 'Hakim', 'Ramadhan', 'Firmansyah', 'Utama', 'Perdana', 'Sejati', 'Maulana', 'Hidayat', 'Rahman', 'Salim', 'Halim', 'Aziz', 'Bahri', 'Pambudi', 'Gunawan', 'Hartono', 'Santoso', 'Wibowo', 'Prakoso', 'Anggraini', 'Safitri', 'Handayani', 'Maharani', 'Puspita', 'Ningrum']

export const i18n = {
  id: {
    gennama: {
      title: 'Generator Nama',
      body: '╭─❏ ✨ 「 *NAMA BUATAN UNTUKMU* 」\n┊ *{name}*\n┊\n┊ Kurang cocok? Pencet tombol buat lagi yaa~\n╰━━━━━━━ {mood}',
      btnAgain: '🎲 Buat Lagi',
      btnMale: '👦 Versi Cowo',
      btnFemale: '👧 Versi Cewe',
    },
  },
  en: {
    gennama: {
      title: 'Name Generator',
      body: '╭─❏ ✨ 「 *A GENERATED NAME FOR YOU* 」\n┊ *{name}*\n┊\n┊ Not feeling it? Tap the button to roll again~\n╰━━━━━━━ {mood}',
      btnAgain: '🎲 Generate Again',
      btnMale: '👦 Male Version',
      btnFemale: '👧 Female Version',
    },
  },
}

export const test = { input: '.gennama', expect: /nama buatan|generated name/i }

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export async function handler(ctx) {
  const arg = (ctx.text || '').trim().toLowerCase()
  const female = ['cewe', 'cewek', 'perempuan', 'wanita', 'female'].includes(arg)
  const first = female ? pick(FEMALE) : pick(MALE)
  const name = `${first} ${pick(LAST)}`
  const body = ctx.t('gennama.body', { name, mood: ctx.say('senang') })
  return sendButtons(ctx.sock, ctx.chat, {
    title: ctx.t('gennama.title'),
    body,
    footer: ctx.t('menu.footer'),
    replies: [
      { text: ctx.t('gennama.btnAgain'), id: '.gennama' },
      { text: ctx.t('gennama.btnMale'), id: '.gennama cowo' },
      { text: ctx.t('gennama.btnFemale'), id: '.gennama cewe' },
    ],
    textFallback: body,
  })
}
