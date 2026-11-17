<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    width?: number | string
    height?: number | string
    sizes?: string
    /** Pre-generated variants, if you have them. Takes precedence over the flag. */
    srcset?: string
    eager?: boolean
    priority?: 'high' | 'low' | 'auto'
  }>(),
  {
    width: undefined,
    height: undefined,
    sizes: '100vw',
    srcset: undefined,
    eager: false,
    priority: undefined,
  },
)

const config = useRuntimeConfig()

const RESIZABLE_HOST = 'assets.crosslovemovement.org'
const WIDTHS = [640, 960, 1280, 1920, 2400]

/**
 * Cloudflare Image Resizing can only be used once it is enabled on the
 * assets zone. The flag stays off by default so the site keeps serving the
 * originals; turn it on with NUXT_PUBLIC_IMAGE_RESIZING=true.
 */
const generatedSrcset = computed(() => {
  if (props.srcset) return props.srcset
  if (!config.public.imageResizing) return undefined
  if (!/^https?:\/\//.test(props.src)) return undefined

  let url: URL

  try {
    url = new URL(props.src)
  } catch {
    return undefined
  }

  if (url.hostname !== RESIZABLE_HOST) return undefined

  return WIDTHS.map((width) => {
    const resized = `${url.origin}/cdn-cgi/image/width=${width},quality=80,format=auto${url.pathname}${url.search}`

    return `${resized} ${width}w`
  }).join(', ')
})

const effectiveSizes = computed(() => (generatedSrcset.value ? props.sizes : undefined))
const effectivePriority = computed(() => props.priority ?? (props.eager ? 'high' : 'auto'))
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :srcset="generatedSrcset"
    :sizes="effectiveSizes"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    :fetchpriority="effectivePriority"
  />
</template>
