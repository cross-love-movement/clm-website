import type { PortfolioCategory } from '#shared/types/content'

import { portfolioCategories, portfolioCategoryLabels, portfolioItems } from '~/data/portfolio'

export function usePortfolio() {
  function byCategory(category: 'all' | PortfolioCategory) {
    return category === 'all'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === category)
  }

  function bySlug(slug: string) {
    return portfolioItems.find((item) => item.slug === slug) ?? null
  }

  return {
    items: portfolioItems,
    byCategory,
    bySlug,
    categories: portfolioCategories,
    categoryLabels: portfolioCategoryLabels,
  }
}
