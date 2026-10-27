import type { PortfolioCategory, PortfolioItem } from '#shared/types/content'

import { portfolioCategories, portfolioCategoryLabels } from '~/data/portfolio'

export async function usePortfolio() {
  const { data } = await useAsyncData('portfolio', () =>
    queryCollection('portfolio').order('order', 'ASC').all(),
  )

  const items = computed(() => (data.value ?? []) as unknown as PortfolioItem[])

  function byCategory(category: 'all' | PortfolioCategory) {
    return category === 'all'
      ? items.value
      : items.value.filter((item) => item.category === category)
  }

  function bySlug(slug: string) {
    return items.value.find((item) => item.slug === slug) ?? null
  }

  return {
    items,
    byCategory,
    bySlug,
    categories: portfolioCategories,
    categoryLabels: portfolioCategoryLabels,
  }
}
