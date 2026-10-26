# Cross-Love Movement — website

Website for **Cross-Love Movement, Limited By Guarantee** — a Ghanaian NGO of musicians and
patriots using music and community engagement to share the Gospel, support gospel artistes, and
care for people and the planet.

Built as a single Nuxt application: server-rendered pages for search and social visibility, plus a
Nitro API layer for forms, so there is no separate backend to deploy.

- **Nuxt 4** (Vue 3, Nitro) with the `app/` source directory
- **Vite+ 1.4** — Nuxt's bundler runs on `@voidzero-dev/vite-plus-core`, and the `vp` CLI
  provides formatting (Oxfmt), linting (Oxlint), and tests (Vitest 5)
- **Tailwind CSS v4** via `@tailwindcss/vite` — design tokens live in CSS, no `tailwind.config.js`
- **TypeScript** strict, checked with `vue-tsc`
- **Zod** for server-side validation

---

## Quick start

```bash
cp .env.example .env     # optional locally — forms log to the console without a mail key
npm install
npm run dev              # http://localhost:3000
```

| Script              | What it does                                           |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Dev server with HMR                                    |
| `npm run build`     | Production build (`.output/`)                          |
| `npm run preview`   | Preview the production build                           |
| `npm run typecheck` | `vue-tsc` over app, shared, and server TypeScript      |
| `npm test`          | Vitest via `vp test` (`tests/*.test.ts`)               |
| `npm run check`     | Oxfmt + Oxlint + type-aware checks (`vp check`)        |
| `npm run fmt`       | Format the codebase (`vp fmt`)                         |
| `npm run lint`      | Lint only (`vp lint`)                                  |
| `npm run generate`  | Static export — **not** suitable on its own, see below |

> `nuxt generate` only emits static HTML and would drop the `/api/*` routes. This site should be
> deployed as a Node server (or on a platform preset such as Netlify/Vercel that hosts Nitro).

---

## Toolchain: Vite+

[Vite+](https://viteplus.dev) is the unified toolchain (Vite core, Rolldown, Vitest, Oxlint, Oxfmt)
exposed through the `vp` CLI. Two things make it work in a Nuxt project:

```jsonc
// package.json
"devDependencies": { "vite-plus": "1.4.0" },
"overrides": { "vite": "npm:@voidzero-dev/vite-plus-core@1.4.0" }
```

The `overrides` entry is what matters for the app itself: Nuxt's Vite builder imports `vite`, and
the alias resolves that to Vite+'s core, so `npm run dev` / `npm run build` already compile through
Vite+ (Rolldown powered).

**Do not use `vp dev` or `vp build` here.** Nuxt owns the application pipeline and generates its
own Vite config; `vp` only reads `vite.config.ts`, which in this project configures formatting,
linting, and tests. Keep using the npm scripts above. Running `vp dev` exits immediately with that
instruction (a guard plugin in `vite.config.ts`) rather than serving an empty Vite app on port 5173.

`vite.config.ts` pins the house format style (`singleQuote`, no semicolons) so the formatter does
not churn the codebase. Running `npm run check` is the fastest pre-commit gate.

When upgrading Vite+, bump **both** the `vite-plus` version and the override version — they must
match.

---

## Structure

```
clm-website/
├─ app/
│  ├─ assets/css/main.css      # Tailwind import + @theme design tokens + base layer
│  ├─ components/
│  │  ├─ layout/               # SiteHeader, SiteFooter
│  │  ├─ ui/                   # BaseButton, PageHero, SectionHeading, ProjectCard,
│  │  │                        # StatGrid, FaqList, AlertBox, Icon, BrandMark, fields…
│  │  ├─ home/                 # HeroSection
│  │  └─ forms/                # Contact, Volunteer, Partnership, Donate, Newsletter
│  ├─ composables/             # useSite, useProjects, useProject, useForm, useSeo
│  ├─ data/                    # Typed content: site, projects, about, involve, faqs
│  ├─ layouts/default.vue      # Header + main + footer, skip link
│  ├─ pages/                   # File-based routes
│  ├─ utils/form.ts            # Shared form control classes
│  ├─ app.vue
│  └─ error.vue                # 404 / error screen
├─ server/
│  ├─ api/                     # contact, volunteer, partnership, newsletter, donate
│  └─ utils/                   # schemas (Zod), validation, mailer, rate-limit
├─ shared/types/content.ts     # Types used by both app and server
├─ tests/                      # Vitest: content integrity + server schema tests
├─ public/                     # logo mark, favicon, abstract SVG artwork
├─ nuxt.config.ts
├─ vite.config.ts              # Vite+ format/lint/test config (not Nuxt's build config)
└─ .env.example
```

Components are registered with `pathPrefix: false`, so `ui/BaseButton.vue` is used as
`<BaseButton>` rather than `<UiBaseButton>`.

---

## Routes

| Route              | Page           | Server route            |
| ------------------ | -------------- | ----------------------- |
| `/`                | Home           | —                       |
| `/about`           | About          | —                       |
| `/projects`        | Projects index | —                       |
| `/projects/[slug]` | Project detail | —                       |
| `/volunteer`       | Volunteer      | `POST /api/volunteer`   |
| `/partnership`     | Partnership    | `POST /api/partnership` |
| `/contact`         | Contact        | `POST /api/contact`     |
| `/donate`          | Donate         | `POST /api/donate`      |
| footer newsletter  | —              | `POST /api/newsletter`  |

Each page sets its own title, description, Open Graph tags, and canonical URL via `useSeo()`.

---

## Content model

All copy lives in `app/data/` as typed modules:

```ts
// app/data/projects.ts
export const projects: Project[] = [{ slug, title, category, story, impact, needs, … }]
```

Pages never import content directly from components; they go through `useProjects()`,
`useSite()`, etc. When the organisation outgrows flat files, only those composables need to change
— swap the implementation for Nuxt Content (`.md` + MDC) or a headless CMS and the page templates
keep working. That is the intended upgrade path.

### Content provenance

The site is built from **Cross-Love Movement's organisational profile** (2023). Everything below
came directly from that document:

- Legal name and form, registration date (18 May 2023), Registrar General's Department number
  `CG041650523`, TIN `C0062926586`
- Office address, phone numbers, email, and website
- Vision, mission, goal, and the twelve constitutional objectives
- Named beneficiary activities: Cross Sessions (The Church of Pentecost, Community 12 District,
  Paradise Assembly; Bawku District, Bakanga Assembly), Awake With God Devotion
- Founding year (2023) and the three target groups: Bible-believing communities, gospel musicians,
  and the environment

The **logo mark** (`public/images/clm-mark.png`, `public/favicon.png`) was extracted from the profile
PDF, and the palette is derived from it: logo red `#B81828`, warm charcoal, gold, and cream.

### Not yet confirmed — replace before launch

The profile leaves several fields blank (staff table, area of operation, metrics), so nothing was
invented to fill them. These items are **editorial placeholders** and need sign-off:

- Donation amounts and the impact sentence attached to each one
- Monthly-giving examples and the programme allocation wording
- Partner tier amount (`From GH₵5,000 a year`) and benefits
- Response-time commitments (two working days), 18+ volunteering policy, complaint handling
- Bank / mobile-money details and international giving routes
- Officer list beyond the Executive Director
- Photography, social media links, and any impact figures

Programme statuses are honest: `active` is used only for activities the profile documents, and
stated constitutional aims are marked **In development**.

---

## Design system

Tokens are declared once in `app/assets/css/main.css`:

- **Brand** — warm charcoal scale (`brand-50` → `brand-950`), headings, dark sections, primary buttons
- **Accent** — logo red (`clay-50` → `clay-900`), actions, eyebrows, emphasis
- **Gold** — secondary warmth (`gold-*`) for accents on dark sections
- **Neutrals** — warm cream (`sand-50` → `sand-400`) plus `ink` / `ink-soft` text colours
- **Type** — `Fraunces` (display headings) and `Plus Jakarta Sans` (body), loaded from Google Fonts
- **Radii/shadow** — `rounded-4xl`, `shadow-soft`, `shadow-lift`

Add a colour by extending `@theme`; it immediately becomes available as `bg-*`, `text-*`, etc.
Global reduced-motion handling and focus-visible styling are in the base layer.

---

## Forms and backend

Every form posts JSON to a Nuxt server route and follows one contract:

```jsonc
// success
{ "message": "Thank you — we have your message." }

// validation failure (HTTP 400)
{
  "statusCode": 400,
  "data": { "message": "Please check the highlighted fields.", "errors": { "email": "…" } }
}
```

`useForm()` normalises that into `values`, `errors`, `status`, and `message`, which the form
components render inline.

Server protections:

- **Zod schemas** in `server/utils/schemas.ts`, including length limits and enums
- **Honeypot** field (`company`) rejected silently
- **Rate limiting** — 5 submissions/minute per IP per endpoint (`server/utils/rate-limit.ts`)

### Mail

`server/utils/mailer.ts` sends through the [Resend](https://resend.com) HTTP API. With no
`NUXT_RESEND_API_KEY` the message is printed to the server console, so local testing works without
an account. In production, verify the sending domain in Resend and set the env vars below.

### Donations

The donate form records a **giving pledge**; the team follows up with verified bank or mobile-money
details and a receipt. No card data touches the site, and no account numbers are published.

To take payments online, add a gateway route (for Ghana: Paystack or Flutterwave in GHS; Stripe for
international cards) that creates a transaction and returns a checkout URL, then redirect from
`DonateForm` on success. The amount/frequency schema already matches that shape.

---

## Environment variables

| Variable               | Default                                    | Purpose                     |
| ---------------------- | ------------------------------------------ | --------------------------- |
| `NUXT_PUBLIC_SITE_URL` | `https://www.clmnative.com`                | Canonical + OG URLs         |
| `NUXT_RESEND_API_KEY`  | _(empty — logs to console)_                | Mail delivery               |
| `NUXT_MAIL_FROM`       | `Cross-Love Movement <info@clmnative.com>` | Sender                      |
| `NUXT_MAIL_TO`         | `info@clmnative.com`                       | Inbox receiving submissions |

---

## Validation performed

- `npm run typecheck` — passes (Nuxt-aware `vue-tsc`)
- `npm run check` — passes (format, lint, type-aware checks across 56 files)
- `npm test` — 14 tests passing (content integrity + server validation schemas)
- `npm run build` — passes through Vite+ core
- All routes render server-side with `200`; unknown route returns `404` via `app/error.vue`
- API routes verified with valid payloads (`200`), invalid payloads (`400` with field errors),
  honeypot submissions (silent `200`), and rate limiting (`429`)
- Contact and donation submissions confirmed in the development mail log (GH₵ formatting included)

---

## Before launch

1. **Sign off the placeholder content** listed under “Not yet confirmed” above.
2. **Add real photography** at 16:10 for programme cards and a portrait hero image, replacing the
   SVGs in `public/images/`. Add a 1200×630 OG image and reference it in `nuxt.config.ts`.
3. **Legal pages** — privacy policy, safeguarding policy, and the latest report. Only link to real
   documents.
4. **Mail** — verify the Resend domain and set `NUXT_MAIL_TO`; test one submission per form.
5. **Payments** — connect a gateway if online giving is required (see above).
6. **Rate limiting** — move to a shared store (Redis/Upstash) if you run more than one instance.
7. **Analytics and consent** — add only what is needed, with a consent gate if required.
8. **SEO** — add `@nuxtjs/sitemap` + `robots.txt` once the final domain is live.
9. **Accessibility** — run axe/Lighthouse and a keyboard pass, especially the mobile menu.
10. **CI** — run `npm run check`, `npm run typecheck`, `npm test`, and `npm run build` on every push.

## Deployment

```bash
npm run build
node .output/server/index.mjs    # PORT defaults to 3000
```

Nitro presets (`vercel`, `netlify`, `cloudflare-pages`) can be set in `nuxt.config.ts` if you
prefer a platform-managed runtime. Keep the server target — the form endpoints need it.
