import type { ProjectCategory, ProjectSummary } from '#shared/types/content'

import { categoryLabels, projectCategories, statusLabels } from '~/data/projects'

export async function useProjects() {
  const { data } = await useAsyncData('projects', () =>
    queryCollection('projects')
      .select(
        'path',
        'title',
        'category',
        'summary',
        'location',
        'status',
        'timeframe',
        'image',
        'imageAlt',
        'accent',
        'featured',
        'order',
      )
      .order('order', 'ASC')
      .all(),
  )

  const projects = computed(() => (data.value ?? []) as unknown as ProjectSummary[])

  const featured = computed(() => projects.value.filter((project) => project.featured))

  function byCategory(category: 'all' | ProjectCategory) {
    return category === 'all'
      ? projects.value
      : projects.value.filter((project) => project.category === category)
  }

  return {
    projects,
    featured,
    byCategory,
    categories: projectCategories,
    categoryLabels,
    statusLabels,
  }
}
