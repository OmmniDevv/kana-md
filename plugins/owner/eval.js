
import { execFile } from 'node:child_process'
export const config = {
  name: "eval",
  alias: [],
  category: "owner",
  description: { id: "Jalankan kode JavaScript (Owner Only)", en: "KANA version of the Elaina-MD eval feature, rewritten in KANA style" },
  usage: ".eval",
  example: ".eval",
  cooldown: 5,
  isOwner: true,
  isPrivate: true,
}

export const i18n = {
  id: {
    "eval": {
      usage: "╭─❏ 👑 「 *EVAL* 」\n┊ Khusus owner. Format: *.eval <kode>*\n╰━━━━━━━",
      body: "╭─❏ 👑 「 *EVAL* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *ERROR* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
  en: {
    "eval": {
      usage: "╭─❏ 👑 「 *EVAL* 」\n┊ Owner only. Format: *.eval <code>*\n╰━━━━━━━",
      body: "╭─❏ 👑 「 *EVAL* 」\n┊ {text}\n╰━━━━━━━",
      fail: "╭─❏ 💦 「 *ERROR* 」\n┊ {error}\n╰━━━━━━━",
    },
  },
}

export const test = { input: '.eval', expect: /owner/i }
export async function handler(ctx) {
  if (!ctx.isOwner) return ctx.reply(ctx.t('common.ownerOnly'))
  const code = (ctx.text || '').trim()
  if (!code) return ctx.reply(ctx.t('eval.usage'))
  try {
    if ('eval' === 'exec') {
      const out = await new Promise((resolve, reject) => {
        execFile('bash', ['-c', code], { timeout: 15000, maxBuffer: 1024 * 64 }, (err, stdout, stderr) => {
          if (err && !stdout && !stderr) reject(err)
          else resolve(String(stdout || '') + String(stderr || ''))
        })
      })
      return ctx.reply(ctx.t('eval.body', { text: '```\n' + String(out).slice(0, 3000) + '\n```' }))
    }
    const fn = new Function('ctx', 'return (async () => { return (' + code + ') })()')
    let result
    try { result = await fn(ctx) } catch { const fn2 = new Function('ctx', 'return (async () => { ' + code + ' })()'); result = await fn2(ctx) }
    const text = typeof result === 'string' ? result : JSON.stringify(result, null, 1) ?? String(result)
    return ctx.reply(ctx.t('eval.body', { text: '```\n' + String(text).slice(0, 3000) + '\n```' }))
  } catch (err) {
    return ctx.reply(ctx.t('eval.fail', { error: String(err.message || err).slice(0, 500) }))
  }
}
