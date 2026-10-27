import type { ProjectCategory, ProjectStatus } from '#shared/types/content'

export const projectCategories: { value: 'all' | ProjectCategory; label: string }[] = [
  { value: 'all', label: 'All programmes' },
  { value: 'cmp', label: 'Christian Mission Projects' },
  { value: 'yep', label: 'Youth Empowerment Programmes' },
]

export const categoryLabels: Record<ProjectCategory, string> = {
  cmp: 'Christian Mission Project',
  yep: 'Youth Empowerment Programme',
}

export const categoryShortLabels: Record<ProjectCategory, string> = {
  cmp: 'CMP',
  yep: 'YEP',
}

export const statusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  upcoming: 'In development',
}
