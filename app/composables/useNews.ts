import type { Post, PostCategory } from '#shared/types/content'

import { postCategories, postCategoryLabels } from '~/data/news'

export async function useNews() {
  const { data } = await useAsyncData('news', () =>
    queryCollection('news')
      .select(
        'path',
        'title',
        'category',
        'summary',
        'publishedAt',
        'author',
        'readingMinutes',
        'image',
        'imageAlt',
        'featured',
      )
      .order('publishedAt', 'DESC')
      .all(),
  )

  const latest = computed(() => (data.value ?? []) as unknown as Post[])

  const featured = computed(
    () => latest.value.find((post) => post.featured) ?? latest.value[0] ?? null,
  )

  const rest = computed(() => latest.value.filter((post) => post.path !== featured.value?.path))

  function byCategory(category: 'all' | PostCategory) {
    return category === 'all'
      ? latest.value
      : latest.value.filter((post) => post.category === category)
  }

  function byPath(path: string) {
    return latest.value.find((post) => post.path === path) ?? null
  }

  const related = (path: string, limit = 3) =>
    latest.value.filter((post) => post.path !== path).slice(0, limit)

  return {
    latest,
    featured,
    rest,
    byCategory,
    byPath,
    related,
    categories: postCategories,
    categoryLabels: postCategoryLabels,
  }
}
