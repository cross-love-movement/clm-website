import type { MaybeRefOrGetter } from 'vue'

import { projects, categoryLabels, statusLabels, projectCategories } from '~/data/projects'

/**
 * Single access point for project content. When the organisation moves to a
 * CMS, only this composable needs to change — pages keep their current shape.
 */
export function useProjects() {
  const featured = computed(() => projects.filter((project) => project.featured))

  function byCategory(category: 'all' | (typeof projects)[number]['category']) {
    return category === 'all'
      ? projects
      : projects.filter((project) => project.category === category)
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

export function useProject(slug: MaybeRefOrGetter<string>) {
  return computed(() => {
    const value = toValue(slug)
    return projects.find((project) => project.slug === value) ?? null
  })
}
