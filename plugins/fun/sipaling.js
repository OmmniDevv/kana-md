// Julukan "si paling" acak buat bercanda (dataset lokal).
const TITLES = {
  id: [
    'Si Paling Sibuk (padahal cuma scroll HP)',
    'Si Paling Bisa Diandalkan Jam 3 Pagi',
    'Si Paling Telat Tapi Selalu Selamat',
    'Si Paling Jago Alasan',
    'Si Paling Dulu Bilang "Otw" Padahal Baru Bangun',
    'Si Paling Hafal Lirik Lagu Tapi Lupa Materi Ujian',
    'Si Paling Diet Mulai Besok',
    'Si Paling Kang Ghosting Tapi Nanya Kabar Duluan',
    'Si Paling Sok Sibuk di Grup',
    'Si Paling "Gas" Tapi Tidak Pernah Datang',
    'Si Paling Paham Teknologi di Keluarga',
    'Si Paling Sering Bilang "Terakhir Nih" Pas Jajan',
  ],
  en: [
    'The Most Busy (actually just scrolling their phone)',
    'The Most Reliable at 3 AM',
    'The Most Late but Always Lucky',
    'The Master of Excuses',
    'The One Who Says "On My Way" Right After Waking Up',
    'The One Who Memorizes Lyrics but Forgets the Exam Material',
    'The Diet Starts Tomorrow Champion',
    'The Ghoster Who Asks How You Are First',
    'The Most Pretend-Busy in the Group Chat',
    'The One Who Says "Let Us Go" but Never Shows Up',
    'The Family Tech Support',
    'The "This Is the Last Snack" Record Holder',
  ],
}

export const config = {
  name: 'sipaling',
  alias: ['palings'],
  category: 'fun',
  description: { id: 'Julukan "si paling" acak buat kamu atau orang yang ditag', en: 'A random "the most" nickname for you or the tagged person' },
  usage: '.sipaling [@user]',
  example: '.sipaling',
  cooldown: 3,
}

export const i18n = {
  id: { sipaling: { body: '╭─❏ 🏆 「 *SI PALING* 」\n┊ 🏆 @{who} adalah... {title}!\n╰━━━━━━━' } },
  en: { sipaling: { body: '╭─❏ 🏆 「 *THE MOST* 」\n┊ 🏆 @{who} is... {title}!\n╰━━━━━━━' } },
}

export const test = { input: '.sipaling', expect: /paling|most/i }

export async function handler(ctx) {
  const pool = TITLES[ctx.lang] ?? TITLES.id
  const title = pool[Math.floor(Math.random() * pool.length)]
  const target = ctx.mentionedJids?.[0]
  const who = target ? target.split('@')[0] : ctx.senderDigits
  return ctx.sock.sendMessage(ctx.chat, {
    text: ctx.t('sipaling.body', { who, title }),
    mentions: [`${who}@s.whatsapp.net`],
  }, { quoted: ctx.raw })
}
