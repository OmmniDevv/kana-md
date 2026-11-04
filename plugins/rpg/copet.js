import { CRIME_I18N, crimeHandler } from '../../src/rpg/crime-handler.js'

export const config = {
  name: 'copet',
  alias: ['nyopet'],
  category: 'rpg',
  description: { id: 'Copet: ambil koin kecil dengan risiko lebih rendah', en: 'Petty theft: small coins with lower risk' },
  usage: '.copet',
  example: '.copet',
  cooldown: 10,
}

export const i18n = {
  id: { copet: CRIME_I18N.id },
  en: { copet: CRIME_I18N.en },
}

export const test = { input: '.copet', expect: /koin|penjara|energi|coin|jail|energy/i }

export const handler = crimeHandler('copet')
