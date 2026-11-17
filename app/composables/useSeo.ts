import type { MaybeRefOrGetter } from 'vue'

interface SeoInput {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Path of the page, used to build a canonical URL. Defaults to the current route. */
  path?: MaybeRefOrGetter<string>
  type?: 'website' | 'article'
  /** Absolute URL or a path on this site. Falls back to the shared OG image. */
  image?: MaybeRefOrGetter<string | undefined>
  /** Alt text for the social image. */
  imageAlt?: MaybeRefOrGetter<string | undefined>
}

export function useSeo({ title, description, path, type = 'website', image, imageAlt }: SeoInput) {
  const { public: config } = useRuntimeConfig()
  const route = useRoute()

  const url = computed(() => `${config.siteUrl}${toValue(path) ?? route.path}`)

  const socialImage = computed(() => {
    const value = toValue(image)

    if (!value) return `${config.siteUrl}/og-image.png`
    if (value.startsWith('http://') || value.startsWith('https://')) return value

    return `${config.siteUrl}${value.startsWith('/') ? '' : '/'}${value}`
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogType: type,
    ogImage: socialImage,
    ogImageAlt: imageAlt,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: socialImage,
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
