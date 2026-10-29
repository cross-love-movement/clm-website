import { escapeHtml } from './catalog'

/**
 * Turns staff-written plain text into the small amount of HTML an email needs.
 *
 * Escaped first, then split on blank lines and newlines. The result is placed
 * in a `_HTML` variable, which `renderEmail()` inserts as markup because the
 * app — not a member of the public — built this string.
 */
export function messageHtml(message: string) {
  return message
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin: 0 0 14px;">${escapeHtml(block.trim()).replace(/\n/g, '<br />')}</p>`,
    )
    .join('')
}
