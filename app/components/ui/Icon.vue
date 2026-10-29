<script setup lang="ts">
import type { IconName } from '#shared/types/content'

withDefaults(
  defineProps<{
    name: IconName
    size?: number | string
    strokeWidth?: number
  }>(),
  { size: 20, strokeWidth: 1.75 },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'arrow-right'">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </template>
    <template v-else-if="name === 'arrow-up-right'">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="m5 13 4 4L19 7" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7.2 7.4 5.3a1.4 1.4 0 0 0 1.6 0l7.4-5.3" />
    </template>
    <template v-else-if="name === 'phone'">
      <path
        d="M6.4 3h3l1.4 4-2 1.4a12.4 12.4 0 0 0 6.8 6.8L17 13.2l4 1.4v3A2.4 2.4 0 0 1 18.6 20C10.6 19.4 4.6 13.4 4 5.4A2.4 2.4 0 0 1 6.4 3Z"
      />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.8" />
    </template>
    <template v-else-if="name === 'heart'">
      <path
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      />
    </template>
    <template v-else-if="name === 'book'">
      <path
        d="M12 6.5C10.5 5 8.6 4.5 6 4.5H3v14h3c2.6 0 4.5.5 6 2 1.5-1.5 3.4-2 6-2h3v-14h-3c-2.6 0-4.5.5-6 2Z"
      />
      <path d="M12 6.5v14" />
    </template>
    <template v-else-if="name === 'music'">
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </template>
    <template v-else-if="name === 'activity'">
      <path d="M3 12h4l2.5-7 5 14L17 12h4" />
    </template>
    <template v-else-if="name === 'users'">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
      <path d="M17.6 14.8c2 .7 3.4 2.4 3.4 5.2" />
    </template>
    <template v-else-if="name === 'link'">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 7l1.4-1.4a3.5 3.5 0 0 1 5 5L16 12" />
      <path d="M13 17l-1.4 1.4a3.5 3.5 0 0 1-5-5L8 12" />
    </template>
    <template v-else-if="name === 'gift'">
      <rect x="3.5" y="8.5" width="17" height="12" rx="2.2" />
      <path d="M3.5 13h17M12 8.5v12" />
      <path d="M12 8.5S10.6 4 8 4a2.2 2.2 0 0 0 0 4.5h4Zm0 0S13.4 4 16 4a2.2 2.2 0 0 1 0 4.5h-4Z" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 3l7 2.6v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9v-6L12 3Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </template>
    <template v-else-if="name === 'sprout'">
      <path d="M12 21v-8" />
      <path d="M12 13C12 9.5 9.5 7 6 7c0 3.5 2.5 6 6 6Z" />
      <path d="M12 15.2c0-2.9 2.1-5.2 5.2-5.2 0 2.9-2.1 5.2-5.2 5.2Z" />
    </template>
    <template v-else-if="name === 'sparkles'">
      <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="M18.5 15.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </template>
    <template v-else-if="name === 'globe'">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.4 9h17.2M3.4 15h17.2" />
      <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="3.5" y="5" width="17" height="15" rx="2.2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </template>
    <template v-else-if="name === 'quote'">
      <path
        fill="currentColor"
        stroke="none"
        d="M9.4 6.5C6 7.6 4.2 10 4.2 13.4V18h5.6v-5.2H6.9c0-2 1-3.3 3-4.2V6.5Zm10.4 0c-3.4 1.1-5.2 3.5-5.2 6.9V18H20v-5.2h-2.9c0-2 1-3.3 3-4.2V6.5Z"
      />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9 6 6 6-6" />
    </template>
    <template v-else-if="name === 'pause'">
      <path d="M9 5v14M15 5v14" />
    </template>
    <template v-else-if="name === 'play'">
      <path d="m8 5 11 7-11 7V5Z" />
    </template>
    <template v-else-if="name === 'copy'">
      <rect x="9" y="9" width="12" height="12" rx="2.4" />
      <path d="M15 5.6A2.6 2.6 0 0 0 12.4 3H5.6A2.6 2.6 0 0 0 3 5.6v6.8A2.6 2.6 0 0 0 5.6 15" />
    </template>
    <template v-else-if="name === 'download'">
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </template>
    <template v-else-if="name === 'instagram'">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'x'">
      <path
        fill="currentColor"
        stroke="none"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
      />
    </template>
    <template v-else-if="name === 'youtube'">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'linkedin'">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M7.6 10.6V17" />
      <path d="M7.6 7.4v.01" />
      <path d="M11.6 17v-6.4" />
      <path d="M11.6 13.6c0-1.5 1-2.6 2.4-2.6s2.4 1.1 2.4 2.6V17" />
    </template>
    <template v-else-if="name === 'whatsapp'">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z" />
      <path
        d="M8.8 7.7h1.5l.9 2.2-1.1.9a7 7 0 0 0 3.1 3.1l.9-1.1 2.2.9v1.5a1.4 1.4 0 0 1-1.5 1.4A10.4 10.4 0 0 1 7.4 9.2a1.4 1.4 0 0 1 1.4-1.5Z"
      />
    </template>
  </svg>
</template>
