import { translateText } from '../../src/scrapers/search/terjemah.js'

export const config = {
  name: 'terjemah',
  alias: ['tr', 'translate'],
  category: 'search',
  description: { id: 'Terjemahkan teks ke bahasa lain', en: 'Translate text to another language' },
  usage: '.tr <kode bahasa> <teks>',
  example: '.tr en selamat pagi dunia',
  cooldown: 5,
  limit: 5,
}

export const i18n = {
  id: {
    terjemah: {
      usage: 'Formatnya: .tr <kode bahasa> <teks>. Kode umum: id (Indonesia), en (Inggris), ja (Jepang), ko (Korea), ar (Arab), zh (Mandarin), es (Spanyol), fr (Prancis), de (Jerman), ru (Rusia). Contoh: .tr en selamat pagi~',
      failed: 'Mouu, terjemahannya gagal: {message}. Layanan Google kadang memblokir sebentar, coba lagi nanti ya~',
      detected: 'Bahasa asal terdeteksi: {lang}',
      result: '{text}',
    },
  },
  en: {
    terjemah: {
      usage: 'Format: .tr <language code> <text>. Common codes: id (Indonesian), en (English), ja (Japanese), ko (Korean), ar (Arabic), zh (Chinese), es (Spanish), fr (French), de (German), ru (Russian). Example: .tr id good morning~',
      failed: 'Mouu, translation failed: {message}. The Google service blocks briefly sometimes, try again later~',
      detected: 'Detected source language: {lang}',
      result: '{text}',
    },
  },
}

const COMMON_CODES = new Set(['id', 'en', 'ja', 'ko', 'ar', 'zh', 'es', 'fr', 'de', 'ru', 'pt', 'it', 'nl', 'th', 'vi', 'ms', 'hi', 'tr'])

export const test = { input: '.tr', expect: /kode bahasa/i }

export async function handler(ctx) {
  const target = (ctx.args[0] || '').toLowerCase()
  const text = ctx.args.slice(1).join(' ').trim()
  if (!COMMON_CODES.has(target) || !text) return ctx.reply(ctx.t('terjemah.usage'))
  let result
  try {
    result = await translateText(text, target)
  } catch (err) {
    return ctx.reply(ctx.t('terjemah.failed', { message: err.message }))
  }
  const lines = [ctx.t('terjemah.result', { text: result.text })]
  if (result.detectedLang && result.detectedLang !== target) {
    lines.push(ctx.t('terjemah.detected', { lang: result.detectedLang }))
  }
  await ctx.reply(lines.join('\n'))
}
