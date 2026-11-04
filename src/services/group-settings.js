// Settings teks per grup yang bisa diatur pemakai: namespace kv
// 'group_settings', key = JID grup, value = objek { welcome, goodbye }.
// Hanya teks custom yang disimpan. Teks yang belum diatur jatuh ke
// template default dari src/config/templates.js.
import { USER_TEXT_DEFAULTS } from '../config/templates.js'

export const GROUP_SETTINGS_NAMESPACE = 'group_settings'

const KINDS = ['welcome', 'goodbye']

function assertKind(kind) {
  if (!KINDS.includes(kind)) throw new RangeError(`kind tidak dikenal: ${kind}`)
}

async function readAll(storage, groupJid) {
  try {
    const saved = await storage?.get(GROUP_SETTINGS_NAMESPACE, groupJid)
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

async function writeAll(storage, groupJid, value) {
  await storage.set(GROUP_SETTINGS_NAMESPACE, groupJid, value)
  return value
}

// Teks efektif grup untuk kind tertentu: custom bila ada dan tidak kosong,
// selain itu default dari template pusat. Aman bila storage error, kosong,
// atau tidak tersedia.
export async function getGroupText(storage, groupJid, kind) {
  assertKind(kind)
  const fallback = USER_TEXT_DEFAULTS[kind]
  if (!storage || !groupJid) return fallback
  const saved = await readAll(storage, groupJid)
  const custom = saved[kind]
  return typeof custom === 'string' && custom.trim() ? custom : fallback
}

// Simpan teks custom grup. Mengembalikan teks yang tersimpan.
export async function setGroupText(storage, groupJid, kind, text) {
  assertKind(kind)
  const current = await readAll(storage, groupJid)
  current[kind] = String(text ?? '')
  await writeAll(storage, groupJid, current)
  return current[kind]
}

// Kembalikan teks grup ke default template pusat dengan menghapus custom.
// Mengembalikan teks default yang kini berlaku.
export async function resetGroupText(storage, groupJid, kind) {
  assertKind(kind)
  const fallback = USER_TEXT_DEFAULTS[kind]
  if (!storage || !groupJid) return fallback
  try {
    const current = await readAll(storage, groupJid)
    delete current[kind]
    await writeAll(storage, groupJid, current)
  } catch {}
  return fallback
}
