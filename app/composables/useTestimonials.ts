import { testimonials } from '~/data/testimonials'

export function useTestimonials() {
  const featured = computed(() => testimonials.filter((testimonial) => testimonial.featured))

  return { testimonials, featured }
}
