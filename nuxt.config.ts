import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  devServer: { port: 3000 },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/content', 'nuxt-studio', 'nuxt-auth-utils'],

  content: {
    // Node 24 ships node:sqlite, so no native SQLite dependency is needed.
    experimental: { sqliteConnector: 'native' },
  },

  /**
   * Visual CMS for non-technical editors.
   * In development it writes straight to the local files in `content/`.
   * In production it commits to GitHub and the host rebuilds the site.
   */
  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'cross-love-movement',
      repo: 'clm-website',
      branch: 'main',
      // The repository is public, so editors never need private-repo scope.
      private: false,
    },
    git: {
      commit: { messagePrefix: 'content:' },
    },
  },

  components: [
    // Flat namespace: `ui/BaseButton.vue` is used as <BaseButton>, not <UiBaseButton>.
    { path: '~/components', pathPrefix: false },
    // Feature-owned components keep their own folder but the same flat names.
    { path: '~/features/events/components', pathPrefix: false },
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Cross-Love Movement',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Cross-Love Movement is a Ghanaian NGO using music and community engagement to share the Gospel, support gospel artistes, and care for people and the planet.',
        },
        { name: 'theme-color', content: '#17120f' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Cross-Love Movement' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Plus+Jakarta+Sans:wght@400..800&display=swap',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  runtimeConfig: {
    // Private: server-only. NUXT_RESEND_API_KEY also overrides this at runtime.
    resendApiKey: process.env.NUXT_RESEND_API_KEY ?? '',
    mailFrom: process.env.NUXT_MAIL_FROM ?? 'Cross-Love Movement <info@crosslovemovement.org>',
    mailTo: process.env.NUXT_MAIL_TO ?? 'info@crosslovemovement.org',
    public: {
      siteUrl: process.env.NUXT_SITE_URL ?? 'https://www.crosslovemovement.org',
    },
  },

  nitro: {
    compressPublicAssets: true,
  },
})
