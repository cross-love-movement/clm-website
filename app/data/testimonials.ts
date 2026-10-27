import type { Testimonial, TestimonialAudience } from '#shared/types/content'

/**
 * Placeholder testimonials. These are illustrative composites written in the
 * voice of volunteers, artistes, and church partners — not quotes from real,
 * named people. Replace them only with statements given with consent.
 */
export const testimonials: Testimonial[] = [
  {
    name: 'Pastor Emmanuel Tetteh',
    role: 'Host pastor, The Church of Pentecost',
    location: 'Community 12 District, Tema',
    audience: 'church',
    programme: 'Cross Sessions',
    featured: true,
    quote:
      'Cross-Love did not arrive as performers who needed a crowd. They asked what our service needed, rehearsed with our young people, and left the room stronger than they found it. Our musicians still talk about that night.',
  },
  {
    name: 'Abena Owusu',
    role: 'Gospel artiste, clinic participant',
    location: 'Accra',
    audience: 'artiste',
    programme: 'Artiste Clinic',
    featured: true,
    quote:
      'I came with forty songs and no plan. Nobody told me I was already too late to start. They helped me finish one song properly, and that one song has opened more doors than the other thirty-nine.',
  },
  {
    name: 'Kwame Mensah',
    role: 'Creation care volunteer',
    location: 'Tema',
    audience: 'volunteer',
    programme: 'Creation Care',
    featured: true,
    quote:
      'I signed up expecting to sort plastic. What I actually learned was how to talk to my neighbour without sounding like a poster. That has been the useful part.',
  },
  {
    name: 'Naa Adjei',
    role: 'Community engagement lead, corporate partner',
    location: 'Accra',
    audience: 'partner',
    programme: 'Corporate partnership',
    quote:
      'Most partnerships end at the photograph. This one came with a budget line for training and a request for feedback we did not want to give. That is how we knew it was serious.',
  },
  {
    name: 'Akosua Frimpong',
    role: 'Street outreach volunteer',
    location: 'Accra',
    audience: 'volunteer',
    programme: 'Compassion in Action',
    quote:
      'The first time I served at Tudu, I spent more time listening than serving. That was the point, apparently. I have gone back every month since.',
  },
  {
    name: 'Pastor Daniel Awuni',
    role: 'Assembly leader, Bakanga Assembly',
    location: 'Bawku, Upper East',
    audience: 'church',
    programme: 'Church Support',
    quote:
      'They asked what we needed before they told us what they wanted to give. The list was chairs, a keyboard, and a roof. They have not pretended it is finished.',
  },
]

export const testimonialAudiences: TestimonialAudience[] = [
  'church',
  'artiste',
  'volunteer',
  'partner',
  'participant',
]
