import type { HomeSlide } from '#shared/types/content'

/**
 * The three general homepage slides, always shown before any featured event.
 * They introduce the organisation, then invite volunteers and partners.
 *
 * The images are listed here with the copy so a swap is one edit. Shoot for
 * 2400 × 1350, 16:9, WebP, under ~350 KB; keep the subject right of centre
 * because the copy sits on the left.
 */
export const generalHeroes: HomeSlide[] = [
  {
    eyebrow: 'Since 2018',
    title: 'A movement of young creatives.',
    caption:
      'A Christian, non-denominational network in Ghana, using faith, creativity, and inclusion to serve communities.',
    image: 'https://assets.crosslovemovement.org/2021_Cross%20Sessions%20IV-%20Project%20Hope.webp',
    imageAlt:
      'Seven young people wearing HOPE t-shirts in front of large HOPE letters at Cross Sessions IV',
    to: '/about',
    cta: 'Read our story',
  },
  {
    eyebrow: 'Volunteer',
    title: 'Give a few hours. Change what is possible.',
    caption:
      'Mentor a young person, help run Cross Sessions, or film the work — there is room for what you already know.',
    image:
      'https://assets.crosslovemovement.org/2024_Cross%20Sessions%205%20_Youthful%20Communities%20Reaction_%40CLM.JPG',
    imageAlt: 'Young people dancing and cheering together at Cross Sessions 5',
    to: '/volunteer',
    cta: 'Join the team',
  },
  {
    eyebrow: 'Partnership',
    title: 'Build something that outlasts the announcement.',
    caption:
      'Bring your church, company, school, or foundation alongside work that needs steady support.',
    image:
      'https://assets.crosslovemovement.org/2025_Youth%20Leaders%20Community%20Engagment_Training%20on%20Positive%20Peace%20Organised%20by%20Isaac%20Nkrumah-Dadzie_%40CLM.jpg',
    imageAlt:
      'A facilitator leading a youth leaders’ training on positive peace, with participants at a table and a projector screen behind',
    to: '/partnership',
    cta: 'Start a partnership',
  },
]
