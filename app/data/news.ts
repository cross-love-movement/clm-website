import type { PostCategory } from '#shared/types/content'

export const postCategoryLabels: Record<PostCategory, string> = {
  story: 'Story',
  update: 'Update',
  reflection: 'Reflection',
  event: 'Event',
}

export const postCategories: { value: 'all' | PostCategory; label: string }[] = [
  { value: 'all', label: 'All posts' },
  { value: 'story', label: 'Stories' },
  { value: 'update', label: 'Updates' },
  { value: 'reflection', label: 'Reflections' },
  { value: 'event', label: 'Events' },
]
