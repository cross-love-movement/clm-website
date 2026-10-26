import type { MaybeRefOrGetter } from 'vue'

interface SeoInput {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Path of the page, used to build a canonical URL. Defaults to the current route. */
  path?: MaybeRefOrGetter<string>
  type?: 'website' | 'article'
}

export function useSeo({ title, description, path, type = 'website' }: SeoInput) {
  const { public: config } = useRuntimeConfig()
  const route = useRoute()

  const url = computed(() => `${config.siteUrl}${toValue(path) ?? route.path}`)

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogType: type,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
  })

  useHead({
    link: [
      {
        rel: 'canonical',
        get href() {
          return url.value
        },
      },
    ],
  })
}
