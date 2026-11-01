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
  about:
    'https://assets.crosslovemovement.org/2024_Cross%20Sessions%206_Dr.%20SAM%20music%20session_%40CLM.jpg',
  contact: 'https://assets.crosslovemovement.org/TIU%20Alpha%20Array%20T_Shirt%20Branding.jpg',
  donate: 'https://assets.crosslovemovement.org/TIU%20Official%20T-Shirt%20copy.png',
  events: 'https://assets.crosslovemovement.org/Salvation%20Anthem%20(25).jpg',
  news: 'https://assets.crosslovemovement.org/2025_Cross%20Sessions%207_Academie%20De%20Musique%20CLassique%20Symphony_%40CLM.JPG',
  partnership:
    'https://assets.crosslovemovement.org/2025_Youth%20Leaders%20Community%20Engagment_Training%20on%20Positive%20Peace%20Organised%20by%20Isaac%20Nkrumah-Dadzie_%40CLM.jpg',
  portfolio: undefined,
  projects: 'https://assets.crosslovemovement.org/TIU%20Project%20Visuals%20Akorfa%20Poster.png',
  volunteer:
    'https://assets.crosslovemovement.org/2024_Cross%20Sessions%205%20_Youthful%20Communities%20Reaction_%40CLM.JPG',
}
