import { handler as confessHandler, i18n as confessI18n } from './nembak.js'

// Tembak adalah pintu masuk alur pacaran yang sama dengan .nembak
// (nama perintah di Elaina-MD owner memang "tembak", aliasnya "nembak").
// Handler, sesi tawaran, dan state pasangan 'couples' dibagi penuh dari
// nembak.js: target menjawab dengan membalas pesan tembakan ("terima"
// atau "tolak"), atau memakai perintah .terima / .tolak.
export const config = {
  name: 'tembak',
  alias: ['propose'],
  category: 'fun',
  description: { id: 'Menembak seseorang untuk pacaran; target membalas terima atau tolak', en: 'Confess to someone; they answer accept or reject' },
  usage: '.tembak @user',
  example: '.tembak @6281234567890',
  cooldown: 10,
}

export const i18n = confessI18n

export const test = { input: '.tembak', expect: /tag|tembak/i }

export const handler = confessHandler
