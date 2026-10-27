import type { PortfolioCategory } from '#shared/types/content'

export const portfolioCategoryLabels: Record<PortfolioCategory, string> = {
  performances: 'Performances',
  recordings: 'Recordings',
  outreach: 'Outreach',
  empowerment: 'Youth empowerment',
  church: 'Church support',
}

export const portfolioCategories: { value: 'all' | PortfolioCategory; label: string }[] = [
  { value: 'all', label: 'All work' },
  { value: 'performances', label: 'Performances' },
  { value: 'recordings', label: 'Recordings' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'empowerment', label: 'Youth empowerment' },
  { value: 'church', label: 'Church support' },
]
