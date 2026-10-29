/**
 * Background photographs for the page heroes.
 *
 * Paste an absolute URL per page — for example a file in the R2 bucket served
 * from `https://assets.crosslovemovement.org/...`. Leave a key as `undefined`
 * and that page keeps the decorative charcoal hero it has today.
 *
 * Shoot for 2400 × 1350 (16:9), WebP, under ~350 KB. The copy sits on the left,
 * so keep the subject right of centre and avoid busy detail behind the text.
 */
export type HeroKey =
  | 'about'
  | 'contact'
  | 'donate'
  | 'events'
  | 'news'
  | 'partnership'
  | 'portfolio'
  | 'projects'
  | 'volunteer'

export const heroImages: Record<HeroKey, string | undefined> = {
  about: undefined,
  contact: undefined,
  donate: undefined,
  events: undefined,
  news: undefined,
  partnership: undefined,
  portfolio: undefined,
  projects: undefined,
  volunteer: 'https://assets.crosslovemovement.org/volunteers.JPG',
}
