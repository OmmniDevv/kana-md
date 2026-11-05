// EduBrain AI: tutor chat dan pembantu PR via GraphQL wrtools-api.es-tech.co.
// Diadaptasi dari snippet "edubrain.ai" by FruatreMaou (kiriman user 2026-11-05),
// ditulis ulang gaya KANA (ESM, i18n, tanpa dependensi snippet asli selain endpoint).
import axios from 'axios'

export const config = {
  name: "edubrain",
  alias: [],
  category: "ai",
  description: { id: "Tutor AI EduBrain buat bantu PR dan belajar, jawaban langsung plus penjelasan", en: "EduBrain AI tutor for homework help and studying, direct answers with explanations" },
  usage: ".edubrain <pertanyaan>",
  example: ".edubrain jelaskan fotosintesis",
  cooldown: 5,
  premium: true,
}

export const i18n = {
  id: {
    "edubrain": {
      hint: "╭─❏ 🎓 「 *EDUBRAIN* 」\n┊ Tulis soal atau pertanyaan belajarmu dulu yaa~\n┊ ᴄᴏɴᴛᴏʜ: *.edubrain tentukan x dari 2x + 4 = 10*\n╰━━━━━━━",
      thinking: "╭─❏ 🎓 「 *LAGI MIKIR* 」\n┊ Sebentar, EduBrain lagi ngerjain soalmu dulu yaa... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *EDUBRAIN GAGAL MENJAWAB* 」\n┊ Mouu, EduBrain gagal jawab: *{message}*\n┊ Coba lagi sebentar lagi ya~\n╰━━━━━━━",
    },
  },
  en: {
    "edubrain": {
      hint: "╭─❏ 🎓 「 *EDUBRAIN* 」\n┊ Write your homework question first~\n┊ ᴇxᴀᴍᴘʟᴇ: *.edubrain solve for x in 2x + 4 = 10*\n╰━━━━━━━",
      thinking: "╭─❏ 🎓 「 *THINKING* 」\n┊ One sec, EduBrain is working on your question... {mood}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *EDUBRAIN FAILED TO ANSWER* 」\n┊ Mouu, EduBrain failed to answer: *{message}*\n┊ Please try again in a bit~\n╰━━━━━━━",
    },
  },
}

const ENDPOINT = 'https://wrtools-api.es-tech.co/graphql/ai_call'
const MUTATION = `mutation BrainToolsHomeworkHelperFirst($clientHash: String!, $clientUserId: String!, $sessionSourceUrl: String!, $gaCid: String!, $requestType: String!, $subject: String, $instructions: String!, $instructionsFromFiles: [String]) {
  brainToolsHomeworkHelperFirst(
    clientHash: $clientHash
    clientUserId: $clientUserId
    sessionSourceUrl: $sessionSourceUrl
    gaCid: $gaCid
    requestType: $requestType
    subject: $subject
    instructions: $instructions
    instructionsFromFiles: $instructionsFromFiles
  ) {
    status { code message }
    generatedText
    responseGenIdHash
    chatIdHash
    textSubjectGroup
  }
}`

function formatText(text) {
  if (!text) return ''
  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .trim()
}

export async function askEduBrain(query) {
  const payload = {
    query: MUTATION,
    variables: {
      clientHash: '9c8d4c3959694ca',
      clientUserId: '',
      sessionSourceUrl: 'https://edubrain.ai/',
      gaCid: 'GA1.1.1373185759.1784942259',
      requestType: 'simple',
      subject: '-Any Subject-',
      instructions: query,
      instructionsFromFiles: [],
    },
    operationName: 'BrainToolsHomeworkHelperFirst',
  }
  const headers = {
    accept: 'application/graphql-response+json, application/json',
    'accept-language': 'id-ID',
    'content-type': 'application/json',
    origin: 'https://my.edubrain.ai',
    referer: 'https://my.edubrain.ai/',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
  }
  const res = await axios.post(ENDPOINT, payload, { headers, timeout: 90000 })
  const data = res.data?.data?.brainToolsHomeworkHelperFirst
  if (!data || (data.status?.code !== 200 && data.status?.message !== 'OK' && data.status?.message !== 'Success')) {
    throw new Error('API: ' + (data?.status?.message || 'respons kosong'))
  }
  return formatText(data.generatedText || '')
}

export const test = { input: '.edubrain halo', expect: /edubrain|mikir|thinking/i }
export async function handler(ctx) {
  const text = (ctx.text || '').trim()
  if (!text) return ctx.reply(ctx.t('edubrain.hint'))
  await ctx.reply(ctx.t('edubrain.thinking', { mood: ctx.say('mikir') }))
  try {
    const out = await askEduBrain(text)
    if (!out) return ctx.reply(ctx.t('edubrain.fail', { message: 'empty' }))
    return ctx.reply(out.slice(0, 3500))
  } catch (err) {
    return ctx.reply(ctx.t('edubrain.fail', { message: err.message }))
  }
}
