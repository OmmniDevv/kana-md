import { handler as grammarHandler } from './grammarcheck.js'

// Nama beken untuk pemeriksa grammar yang sama: Grammarly diperlakukan
// sebagai pintu kedua ke mesin grammarcheck sehat (Originality.ai),
// supaya perilaku dan batasannya identik.
export const config = {
  name: 'grammarly',
  alias: ['grammarlycheck'],
  category: 'tools',
  description: { id: 'Cek grammar kalimat Inggris (mesin sama dengan .grammarcheck)', en: 'Check English sentence grammar (same engine as .grammarcheck)' },
  usage: '.grammarly <kalimat inggris>',
  example: '.grammarly my name are kana',
  cooldown: 15,
}

export const i18n = {
  id: {
    grammarly: {
      note: 'Pintu alternatif pemeriksa grammar.',
    },
  },
  en: {
    grammarly: {
      note: 'Alternative entry to the grammar checker.',
    },
  },
}

export const test = { input: '.grammarly my name are kana', expect: /GRAMMAR|Originality/i }

export async function handler(ctx) {
  return grammarHandler(ctx)
}
