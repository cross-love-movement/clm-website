import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  devServer: { port: 3000 },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/content', 'nuxt-studio'],

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
    // Private: server-only. Override with NUXT_RESEND_API_KEY etc.
    resendApiKey: '',
    mailFrom: 'Cross-Love Movement <info@clmnative.com>',
    mailTo: 'info@clmnative.com',
    // Protects the event registrations list/export. Empty disables the endpoint.
    registrationsToken: '',
    public: {
      siteUrl: 'https://www.clmnative.ovahol.com',
    },
  },

  nitro: {
    compressPublicAssets: true,
  },
})
