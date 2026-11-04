// Kalkulator ekspresi aman: tokenizer + parser rekursif murni.
// TIDAK memakai eval atau Function sama sekali. Hanya angka, operator
// + - * / % ^, kurung, dan desimal yang diterima; sisanya ditolak.
const MAX_LENGTH = 200
const MAX_DEPTH = 32

export function tokenize(expr) {
  const tokens = []
  const s = String(expr ?? '')
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch === ' ' || ch === '\t') {
      i += 1
      continue
    }
    if (/[0-9.]/.test(ch)) {
      let j = i
      let dots = 0
      while (j < s.length && /[0-9.]/.test(s[j])) {
        if (s[j] === '.') dots += 1
        j += 1
      }
      const raw = s.slice(i, j)
      if (dots > 1 || raw === '.') return { ok: false, reason: 'bad-number' }
      const value = Number(raw)
      if (!Number.isFinite(value)) return { ok: false, reason: 'bad-number' }
      tokens.push({ type: 'num', value })
      i = j
      continue
    }
    if ('+-*/%^()'.includes(ch)) {
      tokens.push({ type: ch })
      i += 1
      continue
    }
    return { ok: false, reason: 'invalid-char' }
  }
  return { ok: true, tokens }
}

// Grammar:
// expr    := term (('+'|'-') term)*
// term    := factor (('*'|'/'|'%') factor)*
// factor  := unary ('^' factor)?        (asosiatif kanan)
// unary   := ('-'|'+') unary | primary
// primary := number | '(' expr ')'
export function evaluateExpression(expr) {
  const input = String(expr ?? '').trim()
  if (!input) return { ok: false, reason: 'empty' }
  if (input.length > MAX_LENGTH) return { ok: false, reason: 'too-long' }
  const lexed = tokenize(input)
  if (!lexed.ok) return { ok: false, reason: lexed.reason }
  const tokens = lexed.tokens
  if (!tokens.length) return { ok: false, reason: 'empty' }
  let pos = 0
  let depth = 0
  const peek = () => tokens[pos]
  const next = () => tokens[pos++]

  function parsePrimary() {
    const tok = next()
    if (!tok) throw new Error('syntax')
    if (tok.type === 'num') return tok.value
    if (tok.type === '(') {
      depth += 1
      if (depth > MAX_DEPTH) throw new Error('too-deep')
      const val = parseExpr()
      depth -= 1
      if (next()?.type !== ')') throw new Error('syntax')
      return val
    }
    throw new Error('syntax')
  }

  function parseUnary() {
    const tok = peek()
    if (tok?.type === '-') {
      next()
      return -parseUnary()
    }
    if (tok?.type === '+') {
      next()
      return parseUnary()
    }
    return parsePrimary()
  }

  function parseFactor() {
    const base = parseUnary()
    if (peek()?.type === '^') {
      next()
      const exp = parseFactor()
      return Math.pow(base, exp)
    }
    return base
  }

  function parseTerm() {
    let val = parseFactor()
    while (peek() && (peek().type === '*' || peek().type === '/' || peek().type === '%')) {
      const op = next().type
      const rhs = parseFactor()
      if ((op === '/' || op === '%') && rhs === 0) throw new Error('div-zero')
      if (op === '*') val *= rhs
      else if (op === '/') val /= rhs
      else val %= rhs
    }
    return val
  }

  function parseExpr() {
    let val = parseTerm()
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const op = next().type
      const rhs = parseTerm()
      val = op === '+' ? val + rhs : val - rhs
    }
    return val
  }

  try {
    const value = parseExpr()
    if (pos !== tokens.length) return { ok: false, reason: 'syntax' }
    if (typeof value !== 'number' || !Number.isFinite(value)) return { ok: false, reason: 'not-finite' }
    return { ok: true, value }
  } catch (err) {
    if (err.message === 'div-zero') return { ok: false, reason: 'div-zero' }
    if (err.message === 'too-deep') return { ok: false, reason: 'too-deep' }
    return { ok: false, reason: 'syntax' }
  }
}

// Format hasil: bilangan bulat tanpa desimal, pecahan dibuang nol berlebihnya.
export function formatValue(value) {
  if (Number.isInteger(value)) return String(value)
  const rounded = Math.round(value * 1e10) / 1e10
  return String(rounded)
}
