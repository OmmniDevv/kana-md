import { CRIME_I18N, crimeHandler } from '../../src/rpg/crime-handler.js'

export const config = {
  name: 'merampok',
  alias: ['rampok'],
  category: 'rpg',
  description: { id: 'Merampok target besar: untung besar tapi risiko penjara lebih tinggi', en: 'Big robbery: bigger loot but higher jail risk' },
  usage: '.merampok',
  example: '.merampok',
  cooldown: 10,
}

export const i18n = {
  id: { merampok: CRIME_I18N.id },
  en: { merampok: CRIME_I18N.en },
}

export const test = { input: '.merampok', expect: /koin|penjara|energi|coin|jail|energy/i }

export const handler = crimeHandler('merampok')
