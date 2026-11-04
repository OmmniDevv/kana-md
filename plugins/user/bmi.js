export const config = {
  name: 'bmi',
  alias: ['hitungbmi', 'cekberat', 'berat'],
  category: 'user',
  description: { id: 'Hitung Indeks Massa Tubuh (BMI) dari berat dan tinggi badan', en: 'Calculate Body Mass Index (BMI) from weight and height' },
  usage: '.bmi <berat kg> <tinggi cm>',
  example: '.bmi 60 165',
  cooldown: 3,
}

export const i18n = {
  id: {
    bmi: {
      ask: 'Tulis berat (kg) dan tinggi (cm) yaa. Contoh: .bmi 60 165 {mood}',
      invalid: 'Angkanya kurang masuk akal. Berat 20-400 kg dan tinggi 80-250 cm yaa~ {mood}',
      body: '⚖️ HITUNG BMI\n\nBerat: {weight} kg | Tinggi: {height} cm\nBMI kamu: *{bmi}*\nKategori: *{category}*\nRentang berat sehat untuk tinggimu: {min}-{max} kg\n\nAngka ini perkiraan umum yaa, bukan diagnosis medis. {mood}',
      under: 'Kurus (di bawah normal)',
      normal: 'Normal (sehat)',
      over: 'Berlebih (overweight)',
      obese: 'Obesitas',
    },
  },
  en: {
    bmi: {
      ask: 'Write weight (kg) and height (cm). Example: .bmi 60 165 {mood}',
      invalid: 'Those numbers look off. Weight 20-400 kg and height 80-250 cm please~ {mood}',
      body: '⚖️ BMI CALCULATOR\n\nWeight: {weight} kg | Height: {height} cm\nYour BMI: *{bmi}*\nCategory: *{category}*\nHealthy weight range for your height: {min}-{max} kg\n\nThis number is a general estimate, not a medical diagnosis. {mood}',
      under: 'Underweight',
      normal: 'Normal (healthy)',
      over: 'Overweight',
      obese: 'Obese',
    },
  },
}

export const test = { input: '.bmi 60 165', expect: /bmi/i }

export function calcBmi(weightKg, heightCm) {
  const m = heightCm / 100
  return weightKg / (m * m)
}

export async function handler(ctx) {
  const parts = (ctx.text || '').trim().split(/\s+/).map(Number)
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) return ctx.reply(ctx.t('bmi.ask', { mood: ctx.say('mikir') }))
  const [weight, height] = parts
  if (weight < 20 || weight > 400 || height < 80 || height > 250) return ctx.reply(ctx.t('bmi.invalid', { mood: ctx.say('gagal') }))
  const bmi = calcBmi(weight, height)
  const category = bmi < 18.5 ? ctx.t('bmi.under') : bmi < 25 ? ctx.t('bmi.normal') : bmi < 30 ? ctx.t('bmi.over') : ctx.t('bmi.obese')
  const m = height / 100
  return ctx.reply(ctx.t('bmi.body', {
    weight, height, bmi: bmi.toFixed(1), category,
    min: (18.5 * m * m).toFixed(1), max: (24.9 * m * m).toFixed(1),
    mood: ctx.say('sukses'),
  }))
}
