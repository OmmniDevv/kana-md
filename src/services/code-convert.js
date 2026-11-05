// Konversi lokal CommonJS ke ESM dan sebaliknya dengan aturan regex
// konservatif. Hanya pola umum yang disentuh; sisanya dibiarkan apa
// adanya supaya tidak merusak kode sumber.

// Ubah satu berkas CommonJS menjadi ESM.
export function cjsToEsm(source) {
  const lines = String(source || '').split('\n')
  const result = []
  for (const line of lines) {
    let m
    if ((m = line.match(/^(\s*)const\s+([A-Za-z_$][\w$]*)\s*=\s*require\(\s*(['"][^'"]+['"])\s*\)\s*;?\s*$/))) {
      result.push(m[1] + 'import ' + m[2] + ' from ' + m[3])
    } else if ((m = line.match(/^(\s*)const\s+(\{[^}]+\})\s*=\s*require\(\s*(['"][^'"]+['"])\s*\)\s*;?\s*$/))) {
      result.push(m[1] + 'import ' + m[2] + ' from ' + m[3])
    } else if ((m = line.match(/^(\s*)module\.exports\s*=\s*(.+?);?\s*$/))) {
      result.push(m[1] + 'export default ' + m[2])
    } else if ((m = line.match(/^(\s*)module\.exports\.([A-Za-z_$][\w$]*)\s*=\s*(.+?);?\s*$/))) {
      result.push(m[1] + 'export const ' + m[2] + ' = ' + m[3])
    } else if ((m = line.match(/^(\s*)exports\.([A-Za-z_$][\w$]*)\s*=\s*(.+?);?\s*$/))) {
      result.push(m[1] + 'export const ' + m[2] + ' = ' + m[3])
    } else {
      result.push(line)
    }
  }
  return result.join('\n')
}

// Ubah satu berkas ESM menjadi CommonJS.
export function esmToCjs(source) {
  const lines = String(source || '').split('\n')
  const result = []
  for (const line of lines) {
    let m
    if ((m = line.match(/^(\s*)import\s+([A-Za-z_$][\w$]*)\s+from\s+(['"][^'"]+['"])\s*;?\s*$/))) {
      result.push(m[1] + 'const ' + m[2] + ' = require(' + m[3] + ')')
    } else if ((m = line.match(/^(\s*)import\s+(\{[^}]+\})\s+from\s+(['"][^'"]+['"])\s*;?\s*$/))) {
      result.push(m[1] + 'const ' + m[2] + ' = require(' + m[3] + ')')
    } else if ((m = line.match(/^(\s*)import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+(['"][^'"]+['"])\s*;?\s*$/))) {
      result.push(m[1] + 'const ' + m[2] + ' = require(' + m[3] + ')')
    } else if ((m = line.match(/^(\s*)import\s+(['"][^'"]+['"])\s*;?\s*$/))) {
      result.push(m[1] + 'require(' + m[2] + ')')
    } else if ((m = line.match(/^(\s*)export\s+default\s+(.+?);?\s*$/))) {
      result.push(m[1] + 'module.exports = ' + m[2])
    } else if ((m = line.match(/^(\s*)export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/))) {
      result.push(line.replace(/^(\s*)export\s+/, '$1'))
      result.push(m[1] + 'module.exports.' + m[2] + ' = ' + m[2])
    } else if ((m = line.match(/^(\s*)export\s*\{([^}]+)\}\s*;?\s*$/))) {
      const names = m[2].split(',').map((s) => s.trim()).filter(Boolean)
      for (const name of names) {
        const alias = name.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/)
        if (alias) result.push(m[1] + 'module.exports.' + alias[2] + ' = ' + alias[1])
        else result.push(m[1] + 'module.exports.' + name + ' = ' + name)
      }
    } else {
      result.push(line)
    }
  }
  return result.join('\n')
}

// Tebak arah konversi dari isi kode.
export function detectDirection(source) {
  const src = String(source || '')
  if (/require\(|module\.exports|exports\./.test(src)) return 'esm'
  if (/^\s*import\s|^\s*export\s/m.test(src)) return 'cjs'
  return null
}
