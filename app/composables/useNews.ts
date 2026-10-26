import type { PostCategory } from '#shared/types/content'

import { postCategories, postCategoryLabels, posts } from '~/data/posts'

export function useNews() {
  const latest = computed(() =>
    [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
  )

  const featured = computed(
    () => latest.value.find((post) => post.featured) ?? latest.value[0] ?? null,
  )

  const rest = computed(() => latest.value.filter((post) => post.slug !== featured.value?.slug))

  function byCategory(category: 'all' | PostCategory) {
    return category === 'all'
      ? latest.value
      : latest.value.filter((post) => post.category === category)
  }

  function bySlug(slug: string) {
    return posts.find((post) => post.slug === slug) ?? null
  }

  const related = (slug: string, limit = 3) =>
    latest.value.filter((post) => post.slug !== slug).slice(0, limit)

  return {
    latest,
    featured,
    rest,
    byCategory,
    bySlug,
    related,
    categories: postCategories,
    categoryLabels: postCategoryLabels,
  }
}
