import type { HomeSlide } from '#shared/types/content'

/**
 * Homepage carousel slides.
 *
 * Placeholder artwork for now — replace `image` with landscape photographs
 * (2400×1350 or wider) as they arrive. Each slide is legible without its
 * image, so the caption carries the message if it fails to load.
 */
export const homeSlides: HomeSlide[] = [
  {
    eyebrow: '12 June 2027 · Tema',
    title: 'People Like You',
    caption:
      'A one-day symposium bringing 700–1,000 young people together with mentors for practical guidance on career, faith, and life.',
    image: '/images/portfolio-stage.svg',
    imageAlt: 'Abstract artwork of a stage lit for a performance',
    to: '/events',
    cta: 'See the event',
  },
  {
    eyebrow: 'Easter · nine editions',
    title: 'Cross Sessions',
    caption:
      'A cross-denominational night where young creatives share one stage — and raise the funds that carry every project.',
    image: '/images/portfolio-studio.svg',
    imageAlt: 'Abstract artwork of a microphone and studio light',
    to: '/portfolio',
    cta: 'See the work',
  },
  {
    eyebrow: '2024 · peace campaign',
    title: 'Today Is Us',
    caption:
      'A peace anthem written with musicians from five cultural backgrounds, a youth Muslim leader, and a children’s orchestra.',
    image: '/images/project-community.svg',
    imageAlt: 'Abstract artwork of overlapping circles and a small group of people',
    to: '/projects/today-is-us',
    cta: 'Read the project',
  },
]
