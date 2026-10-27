import type { PortfolioCategory } from '#shared/types/content'

export const portfolioCategoryLabels: Record<PortfolioCategory, string> = {
  performances: 'Performances',
  recordings: 'Recordings',
  outreach: 'Outreach',
  creation: 'Creation care',
  church: 'Church support',
}

export const portfolioCategories: { value: 'all' | PortfolioCategory; label: string }[] = [
  { value: 'all', label: 'All work' },
  { value: 'performances', label: 'Performances' },
  { value: 'recordings', label: 'Recordings' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'creation', label: 'Creation care' },
  { value: 'church', label: 'Church support' },
]
