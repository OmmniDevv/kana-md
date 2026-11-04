import { CRIME_I18N, crimeHandler } from '../../src/rpg/crime-handler.js'

export const config = {
  name: 'maling',
  alias: ['curi'],
  category: 'rpg',
  description: { id: 'Aksi maling: curi koin diam-diam, berisiko masuk penjara', en: 'Theft: steal coins quietly, with a risk of jail' },
  usage: '.maling',
  example: '.maling',
  cooldown: 10,
}

export const i18n = {
  id: { maling: CRIME_I18N.id },
  en: { maling: CRIME_I18N.en },
}

export const test = { input: '.maling', expect: /koin|penjara|energi|coin|jail|energy/i }

export const handler = crimeHandler('maling')
