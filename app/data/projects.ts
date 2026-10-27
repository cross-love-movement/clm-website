import type { ProjectCategory, ProjectStatus } from '#shared/types/content'

export const projectCategories: { value: 'all' | ProjectCategory; label: string }[] = [
  { value: 'all', label: 'All programmes' },
  { value: 'gospel', label: 'Gospel outreach' },
  { value: 'artistes', label: 'Artistes' },
  { value: 'environment', label: 'Creation care' },
  { value: 'community', label: 'Community' },
]

export const categoryLabels: Record<ProjectCategory, string> = {
  gospel: 'Gospel outreach',
  artistes: 'Artistes',
  environment: 'Creation care',
  community: 'Community',
}

export const statusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  upcoming: 'In development',
}
