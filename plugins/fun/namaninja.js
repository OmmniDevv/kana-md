export const config = {
  name: 'namaninja',
  alias: [],
  category: 'fun',
  description: { id: 'Ubah namamu jadi nama ninja dengan peta suku kata', en: 'Turn your name into a ninja name with a syllable map' },
  usage: '.namaninja <nama>',
  example: '.namaninja malik',
  cooldown: 3,
}

export const i18n = {
  id: { namaninja: { hint: 'Tulis namanya yaa~ Contoh: .namaninja malik', body: '🥷 Nama ninja buat *{name}* adalah...\n*{result}* {mood}' } },
  en: { namaninja: { hint: 'Write the name please~ Example: .namaninja malik', body: '🥷 The ninja name for *{name}* is...\n*{result}* {mood}' } },
}

export const test = { input: '.namaninja', expect: /nama|name/i }

const MAP = {
  a: 'ka', b: 'zu', c: 'mi', d: 'te', e: 'ku', f: 'lu', g: 'ji', h: 'ri', i: 'ki', j: 'zu',
  k: 'me', l: 'ta', m: 'rin', n: 'to', o: 'mo', p: 'no', q: 'ke', r: 'shi', s: 'ari', t: 'chi',
  u: 'do', v: 'ru', w: 'mei', x: 'na', y: 'fu', z: 'zi',
}

export function toNinja(name) {
  return String(name).toLowerCase().split('').map((ch) => MAP[ch] ?? ch).join('').replace(/(^|\s)\S/g, (s) => s.toUpperCase())
}

export async function handler(ctx) {
  const name = (ctx.text || '').trim()
  if (!name) return ctx.reply(ctx.t('namaninja.hint'))
  return ctx.reply(ctx.t('namaninja.body', { name, result: toNinja(name.slice(0, 30)), mood: ctx.say('senang') }))
}
