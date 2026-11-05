
import { execFile } from 'node:child_process'
export const config = {
  name: "exec",
  alias: [],
  category: "owner",
  description: { id: "Jalankan kode JS dari pesan yang di-reply (Owner Only)", en: "KANA version of the Elaina-MD exec feature, rewritten in KANA style" },
  usage: ".exec",
  example: ".exec",
  cooldown: 5,
  isOwner: true,
  isPrivate: true,
}

export const i18n = {
  id: {
    "exec": {
      usage: "╭─❏ 👑 「 *EXEC* 」\n┊ Khusus owner. Format: *.exec <kode>*\n╰━━━━━━━",
      body: "╭─❏ 👑 「 *EXEC* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *ERROR* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "exec": {
      usage: "╭─❏ 👑 「 *EXEC* 」\n┊ Owner only. Format: *.exec <code>*\n╰━━━━━━━",
      body: "╭─❏ 👑 「 *EXEC* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *ERROR* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

export const test = { input: '.exec', expect: /owner/i }
export async function handler(ctx) {
  if (!ctx.isOwner) return ctx.reply(ctx.t('common.ownerOnly'))
  const code = (ctx.text || '').trim()
  if (!code) return ctx.reply(ctx.t('exec.usage'))
  try {
    if ('exec' === 'exec') {
      const out = await new Promise((resolve, reject) => {
        execFile('bash', ['-c', code], { timeout: 15000, maxBuffer: 1024 * 64 }, (err, stdout, stderr) => {
          if (err && !stdout && !stderr) reject(err)
          else resolve(String(stdout || '') + String(stderr || ''))
        })
      })
      return ctx.reply(ctx.t('exec.body', { text: '```\n' + String(out).slice(0, 3000) + '\n```' }))
    }
    const fn = new Function('ctx', 'return (async () => { return (' + code + ') })()')
    let result
    try { result = await fn(ctx) } catch { const fn2 = new Function('ctx', 'return (async () => { ' + code + ' })()'); result = await fn2(ctx) }
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 1) ?? String(result)
    return ctx.reply(ctx.t('exec.body', { text: '```\n' + String(text).slice(0, 3000) + '\n```' }))
  } catch (err) {
    return ctx.reply(ctx.t('exec.fail', { error: String(err.message || err).slice(0, 500) }))
  }
}
