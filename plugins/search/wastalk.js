import { downloadBuffer } from '../../src/scrapers/runner.js'
import { sendImage } from '../../src/ui/media.js'
import { fetchWaProfile, normalizeWaDigits } from '../../src/services/wa-profile.js'

export const config = {
  name: 'wastalk',
  alias: ['whatsappstalk'],
  category: 'search',
  description: {
    id: 'Lihat profil publik WhatsApp sebuah nomor: foto profil, bio, dan info bisnis publiknya',
    en: 'View the public WhatsApp profile of a number: profile picture, about text, and its public business info',
  },
  usage: '.wastalk <nomor>',
  example: '.wastalk 6285869074622',
  cooldown: 5,
}

export const i18n = {
  id: {
    wastalk: {
      hint: '╭─❏ 📱 「 *WASTALK* 」\n┊ Kasih nomornya yaa, bisa nomor langsung, @tag, atau balas pesan orangnya~\n┊ ᴄᴏɴᴛᴏʜ: *.wastalk 6285869074622*\n╰━━━━━━━',
      notfound: '╭─❏ 📱 「 *TIDAK TERDAFTAR* 」\n┊ Nomor *{number}* tidak terdaftar di WhatsApp~\n╰━━━━━━━',
      body: '╭─❏ 📱 「 *WHATSAPP* 」\n┊ {text}\n╰━━━━━━━ {mood}',
      number: 'Nomor: *+{digits}*',
      country: 'Negara: {name}',
      link: 'Tautan: wa.me/{digits}',
      bio: 'Bio: {value}',
      bioDate: 'Bio sejak: {date}',
      bizTitle: '*INFO BISNIS*',
      bizDesc: 'Deskripsi: {value}',
      bizWebsite: 'Website: {value}',
      bizEmail: 'Email: {value}',
      bizCategory: 'Kategori: {value}',
      bizAddress: 'Alamat: {value}',
      standard: 'Akun WhatsApp standar (bukan bisnis)',
      fail: '╭─❏ 📱 「 *GAGAL* 」\n┊ Mouu, gagal memeriksa nomornya: *{message}*\n┊ Coba lagi nanti yaa~\n╰━━━━━━━',
    },
  },
  en: {
    wastalk: {
      hint: '╭─❏ 📱 「 *WASTALK* 」\n┊ Give me a number, an @tag, or reply to their message~\n┊ ᴇxᴀᴍᴘʟᴇ: *.wastalk 6285869074622*\n╰━━━━━━━',
      notfound: '╭─❏ 📱 「 *NOT REGISTERED* 」\n┊ The number *{number}* is not registered on WhatsApp~\n╰━━━━━━━',
      body: '╭─❏ 📱 「 *WHATSAPP* 」\n┊ {text}\n╰━━━━━━━ {mood}',
      number: 'Number: *+{digits}*',
      country: 'Country: {name}',
      link: 'Link: wa.me/{digits}',
      bio: 'About: {value}',
      bioDate: 'About since: {date}',
      bizTitle: '*BUSINESS INFO*',
      bizDesc: 'Description: {value}',
      bizWebsite: 'Website: {value}',
      bizEmail: 'Email: {value}',
      bizCategory: 'Category: {value}',
      bizAddress: 'Address: {value}',
      standard: 'Standard WhatsApp account (not a business)',
      fail: '╭─❏ 📱 「 *FAILED* 」\n┊ Mouu, failed to check that number: *{message}*\n┊ Please try again later~\n╰━━━━━━━',
    },
  },
}

export const test = { input: '.wastalk 6285869074622', expect: /wa\.me\/6285869074622/ }

function targetDigitsOf(ctx) {
  const fromQuoted = ctx.quoted?.sender ? normalizeWaDigits(ctx.quoted.sender) : null
  if (fromQuoted) return fromQuoted
  const fromMention = ctx.mentionedJids?.[0] ? normalizeWaDigits(ctx.mentionedJids[0]) : null
  if (fromMention) return fromMention
  return normalizeWaDigits(ctx.text || '')
}

function formatBioDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Merakit baris profil dari hasil fetchWaProfile. Murni, supaya bisa
// dites tanpa sock: masukan profil terstruktur, keluaran daftar baris.
export function profileLines(ctx, profile) {
  const lines = [ctx.t('wastalk.number', { digits: profile.digits })]
  if (profile.country) lines.push(ctx.t('wastalk.country', { name: profile.country.name }))
  lines.push(ctx.t('wastalk.link', { digits: profile.digits }))
  lines.push(ctx.t('wastalk.bio', { value: profile.bio?.text ? profile.bio.text : '-' }))
  if (profile.bio?.setAt) lines.push(ctx.t('wastalk.bioDate', { date: formatBioDate(profile.bio.setAt) }))
  const biz = profile.business
  if (biz) {
    lines.push(ctx.t('wastalk.bizTitle'))
    if (biz.description) lines.push(ctx.t('wastalk.bizDesc', { value: biz.description }))
    if (biz.website) lines.push(ctx.t('wastalk.bizWebsite', { value: biz.website }))
    if (biz.email) lines.push(ctx.t('wastalk.bizEmail', { value: biz.email }))
    if (biz.category) lines.push(ctx.t('wastalk.bizCategory', { value: biz.category }))
    if (biz.address) lines.push(ctx.t('wastalk.bizAddress', { value: biz.address }))
  } else {
    lines.push(ctx.t('wastalk.standard'))
  }
  return lines
}

export async function handler(ctx) {
  const digits = targetDigitsOf(ctx)
  if (!digits) return ctx.reply(ctx.t('wastalk.hint'))
  let profile
  try {
    profile = await fetchWaProfile(ctx.sock, digits)
  } catch (err) {
    return ctx.reply(ctx.t('wastalk.fail', { message: err.message }))
  }
  if (!profile.exists) return ctx.reply(ctx.t('wastalk.notfound', { number: `+${digits}` }))
  const caption = ctx.t('wastalk.body', {
    text: profileLines(ctx, profile).join('\n┊ '),
    mood: ctx.say('senang'),
  })
  if (profile.photoUrl) {
    try {
      const media = await downloadBuffer(profile.photoUrl, { maxBytes: 5 * 1024 * 1024 })
      if (media?.buffer?.length) return sendImage(ctx, media.buffer, { caption })
    } catch {}
  }
  return ctx.reply(caption)
}
