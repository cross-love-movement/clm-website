const RISKY_PREFIX = /^[=+\-@\t\r]/

/**
 * One CSV field. Spreadsheet apps treat a leading =, +, -, or @ as a formula, so
 * a leading apostrophe forces text; Excel hides it, so the value still reads
 * normally. Values come from the public, so every field goes through this.
 */
export function csvCell(value: string | number) {
  const text = String(value)
  const safe = RISKY_PREFIX.test(text) ? `'${text}` : text

  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function csvLine(values: (string | number)[]) {
  return values.map(csvCell).join(',')
}
