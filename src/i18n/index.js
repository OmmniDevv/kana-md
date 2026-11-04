import id from './locales/id.js'
import en from './locales/en.js'

const store = { id: structuredClone(id), en: structuredClone(en) }
const warned = new Set()

function lookup(dict, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict)
}

function interpolate(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? String(vars[name]) : m))
}

// Fallback: bahasa diminta -> en -> id -> kunci itu sendiri.
export function t(lang, key, vars = {}) {
  const order = [...new Set([lang, 'en', 'id'])]
  for (const l of order) {
    const val = lookup(store[l], key)
    if (typeof val === 'string') return interpolate(val, vars)
  }
  if (!warned.has(key)) {
    warned.add(key)
    console.warn(`[i18n] kunci hilang: ${key}`)
  }
  return key
}

export function addMessages(lang, messages) {
  const merge = (target, src) => {
    for (const [k, v] of Object.entries(src)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        target[k] = merge(target[k] && typeof target[k] === 'object' ? target[k] : {}, v)
      } else {
        target[k] = v
      }
    }
    return target
  }
  merge(store[lang], messages)
}

export function getLocale(lang) {
  return store[lang]
}

export const SUPPORTED_LANGS = ['id', 'en']
