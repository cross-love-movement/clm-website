import { defineConfig } from 'vite-plus'

// The linter checks this file without Nuxt's node tsconfig, so the two Node
// globals used below are declared locally.
declare const process: {
  env: Record<string, string | undefined>
  exit: (code?: number) => never
}

/**
 * `vp dev` starts a bare Vite server. In a Nuxt project there is no
 * `index.html` and no Nuxt pipeline behind it, so the browser would get a
 * blank 404 on port 5173/5174. Fail immediately with the right instruction.
 */
const nuxtDevGuard = {
  name: 'cross-love:nuxt-dev-guard',
  apply: 'serve' as const,
  configureServer() {
    // Vitest also runs Vite in serve mode — never block tests.
    if (process.env.VITEST) return

    console.error(
      [
        '',
        '  This project is a Nuxt app — `vp dev` cannot serve it.',
        '  Run `npm run dev` (nuxt dev) and open http://localhost:3000',
        '  `vp` is used here for check / lint / fmt / test only.',
        '',
      ].join('\n'),
    )

    process.exit(1)
  },
}

/**
 * This config drives the Vite+ toolchain only (format, lint, tests).
 *
 * Nuxt owns the application dev/build pipeline and builds its own inline Vite
 * config, so use `npm run dev` / `npm run build` rather than `vp dev` /
 * `vp build`. The `vite` package is aliased to `@voidzero-dev/vite-plus-core`
 * via `overrides` in package.json, which is what puts Nuxt's bundler on Vite+.
 */
export default defineConfig({
  plugins: [nuxtDevGuard],
  fmt: {
    singleQuote: true,
    semi: false,
    // These are pasted into Resend verbatim; formatting them into one attribute
    // per line makes that unreadable.
    ignorePatterns: ['server/emails/templates/**'],
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
})
