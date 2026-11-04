// Memori percakapan AI per pengguna.
// Namespace 'kv', key 'aimem:<digits>'. Isi: array [{ role, content }]
// dengan role 'user' atau 'assistant'. Maksimal 6 pasang terakhir
// (12 pesan) supaya prompt tidak membengkak dan biaya tetap nol.
// Modul ini murni memakai storage yang diteruskan (get/set/delete),
// jadi mudah dites dengan storage ingatan.
export const AI_MEMORY_NAMESPACE = 'kv'
export const AI_MEMORY_MAX_PAIRS = 6
export const AI_MEMORY_MAX_MESSAGES = AI_MEMORY_MAX_PAIRS * 2

export function aiMemoryKey(digits) {
  return `aimem:${String(digits ?? '').replace(/\D/g, '')}`
}

function sanitize(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }))
}

export async function getMemory(storage, digits) {
  if (!storage) return []
  const value = await storage.get(AI_MEMORY_NAMESPACE, aiMemoryKey(digits))
  return sanitize(value)
}

export async function appendTurn(storage, digits, userText, assistantText) {
  const user = String(userText ?? '')
  const assistant = String(assistantText ?? '')
  const current = await getMemory(storage, digits)
  if (user) current.push({ role: 'user', content: user })
  if (assistant) current.push({ role: 'assistant', content: assistant })
  const trimmed = current.slice(-AI_MEMORY_MAX_MESSAGES)
  await storage.set(AI_MEMORY_NAMESPACE, aiMemoryKey(digits), trimmed)
  return trimmed
}

export async function clearMemory(storage, digits) {
  if (!storage) return
  await storage.delete(AI_MEMORY_NAMESPACE, aiMemoryKey(digits))
}
