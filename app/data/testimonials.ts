import type { Testimonial, TestimonialAudience } from '#shared/types/content'

/**
 * No consented quotes yet.
 *
 * The earlier entries here were illustrative composites attributed to invented
 * people. They have been removed rather than shipped as if they were real.
 * Add a testimonial only with the speaker's written consent, their real name,
 * role, and location — and remove the quote and attribution together if consent
 * is withdrawn.
 */
export const testimonials: Testimonial[] = []

export const testimonialAudiences: TestimonialAudience[] = [
  'church',
  'artiste',
  'volunteer',
  'partner',
  'participant',
]
