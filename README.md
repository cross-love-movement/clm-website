# Cross-Love Movement — website

Website for **Cross-Love Movement, Limited By Guarantee** — a Ghanaian NGO of musicians and
patriots using music and community engagement to share the Gospel, support gospel artistes, and
care for people and the planet.

Built as a single Nuxt application: server-rendered pages for search and social visibility, plus a
Nitro API layer for forms, so there is no separate backend to deploy.

- **Nuxt 4** (Vue 3, Nitro) with the `app/` source directory
- **Nuxt Content 3** — a git-based CMS for projects, news, events, and portfolio content
  (Markdown and YAML), indexed into SQLite at build time with the native `node:sqlite` connector
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
│  │  ├─ ui/                   # BaseButton, PageHero, SectionHeading, ProjectCard, PostCard,
│  │  │                        # TestimonialsSection, PartnersCarousel, StatGrid, FaqList, fields…
│  │  ├─ home/                 # HeroSection, EventsSection, NewsSection
│  │  └─ forms/                # Contact, Volunteer, Partnership, Donate, Newsletter,
│  │                           # EventRegistration
│  ├─ composables/             # useSite, useProjects, useProject, useEvents, useNews,
│  │                           # usePortfolio, useTestimonials, useForm, useSeo
│  ├─ data/                    # Code-managed content: site, about, involve, faqs, testimonials,
│  │                           # partners (plus category labels for content collections)
│  ├─ layouts/default.vue      # Header + main + footer, skip link
│  ├─ pages/                   # File-based routes, including /events, /news, /portfolio
│  ├─ utils/                   # form.ts (control styles), dates.ts, events.ts
│  ├─ app.vue
│  └─ error.vue                # 404 / error screen
├─ content/                    # Editorial content (Nuxt Content)
│  ├─ projects/*.md            # Project pages with frontmatter + Markdown body
│  ├─ news/*.md                # Articles with frontmatter + Markdown/MDC body
│  ├─ events/*.yml             # Event records (one file per event)
│  └─ portfolio/*.yml          # Portfolio pieces (one file per piece)
├─ server/
│  ├─ api/                     # contact, volunteer, partnership, newsletter, donate,
│  │                           # events/register
│  └─ utils/                   # schemas (Zod), validation, mailer, rate-limit
├─ shared/types/content.ts     # Types used by both app and server
├─ tests/                      # Vitest: content integrity + server schema tests
├─ public/                     # logo mark, favicon, abstract SVG artwork
├─ content.config.ts           # Nuxt Content collections, schemas, Studio form metadata
├─ nuxt.config.ts              # Nuxt, Tailwind, Nuxt Content, Nuxt Studio (`studio.route`)
├─ vite.config.ts              # Vite+ format/lint/test config (not Nuxt's build config)
└─ .env.example
```

Components are registered with `pathPrefix: false`, so `ui/BaseButton.vue` is used as
`<BaseButton>` rather than `<UiBaseButton>`.

---

## Routes

| Route              | Page           | Server route                |
| ------------------ | -------------- | --------------------------- |
| `/`                | Home           | —                           |
| `/about`           | About          | —                           |
| `/projects`        | Projects index | —                           |
| `/projects/[slug]` | Project detail | —                           |
| `/events`          | Events         | `POST /api/events/register` |
| `/news`            | News index     | —                           |
| `/news/[slug]`     | Article        | —                           |
| `/portfolio`       | Portfolio      | —                           |
| `/volunteer`       | Volunteer      | `POST /api/volunteer`       |
| `/partnership`     | Partnership    | `POST /api/partnership`     |
| `/contact`         | Contact        | `POST /api/contact`         |
| `/donate`          | Donate         | `POST /api/donate`          |
| footer newsletter  | —              | `POST /api/newsletter`      |
| `/_studio`         | —              | Nuxt Studio (GitHub OAuth)  |

Each page sets its own title, description, Open Graph tags, and canonical URL via `useSeo()`.

---

## Content model

Content is split by how often it changes.

**Editorial content (Nuxt Content)** lives in `content/` and is validated by `content.config.ts`:

- `content/projects/*.md` — project pages with structured frontmatter and a Markdown body
- `content/news/*.md` — articles with frontmatter and a Markdown/MDC body
- `content/events/*.yml` — one file per event
- `content/portfolio/*.yml` — one file per portfolio piece

Each is declared as a collection with a Zod schema, so missing or malformed fields fail
`nuxt build`. Pages query through async composables (`useProjects()`, `useNews()`, `useEvents()`,
`usePortfolio()`), and Markdown bodies render with `<ContentRenderer>` into the `.article-body`
prose styles. The content database is generated at build time with Node's native SQLite connector
and is read-only at runtime.

**Code-managed content** stays in `app/data/` as typed modules:

```ts
// app/data/testimonials.ts
export const testimonials: Testimonial[] = [{ name, role, location, quote, … }]
```

That covers site settings, about, donate/partnership options, FAQs, testimonials, and partners —
content that changes rarely or depends on deeply nested structures. Pages access it through
`useSite()`, `useTestimonials()`, and friends.

To publish a project, article, event, or portfolio piece, edit a file under `content/`, commit it,
and the site rebuilds — from GitHub's web editor, a local editor, or Nuxt Studio. No separate CMS
is hosted, and the public pages keep the same layout, components, and theme.

Each schema field also carries `property(...).editor(...)` metadata — labels, helper text, media
pickers, textareas. That metadata is invisible to the site and only shapes the Nuxt Studio form, so
an editor sees “Cover image” with a picture picker instead of a raw `image: /images/…` string path.

### Editing content with Nuxt Studio

The [`nuxt-studio`](https://nuxt.studio) module is installed and mounted at `/_studio`.

**Local development** — run `npm run dev` and click the floating pencil in the bottom-left corner.
Studio writes straight to files in `content/` and `public/`, so your normal Git workflow still
applies. No OAuth is needed, and publishing is disabled in dev.

**Production** — editors sign in with GitHub and Studio commits to `main` through the GitHub API.
A commit triggers the host's rebuild, and the change goes live with the rest of the deploy. To
enable it:

1. Create a GitHub OAuth app at <https://github.com/settings/developers> → **New OAuth App**.
   - Homepage URL: `https://www.clmnative.com`
   - Authorization callback URL: `https://www.clmnative.com/__nuxt_studio/auth/github`
   - For local production-mode testing, add `http://localhost:3000/__nuxt_studio/auth/github`
2. Set `NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID` and `NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET` in the
   deployment environment (and in `.env` if testing locally).
3. Optionally set `NUXT_STUDIO_AUTH_GITHUB_MODERATORS` to a comma-separated list of GitHub account
   emails. Without it, **anyone who can authorise the OAuth app can edit** — set it before launch.

Studio needs a server-side route for the OAuth callback, so the site must be deployed with
`npm run build` on a Node-capable host. Static-only hosting is not enough.

Testimonials live in `app/data/testimonials.ts` and appear on the home page (three featured) and the
about page (all of them). They are attributed with a name, role, location, and the programme they
relate to — no anonymous floating quotes.

Partner strip data lives in `app/data/partners.ts` and drives the infinite logo carousel on the home
page. Entries render as typographic wordmarks (monogram + name + detail) until an authorised logo
file is supplied — set `logo` to an image path to use the real mark. Dashed tiles are open slots for
new partners, not existing relationships.

> Event registration currently **emails the team**; it does not persist a booking or increment
> `capacity`/`registered`. Connect a database or sheet before relying on it for headcounts.

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
- **Project copy** — the entries in `content/projects/` include illustrative impact figures and
  programme details; confirm each against actual delivery before launch
- **Event calendar** — the events in `content/events/` are dummy data, including dates, venues,
  capacities, and registration deadlines; "free to attend" and the confirmation-reminder promise are
  editorial assumptions
- **News posts** — the articles in `content/news/` are illustrative composites; names and details
  are changed or invented, and they should be replaced with real reporting before launch
- **Portfolio pieces** — the entries in `content/portfolio/` are illustrative, and the images are
  abstract artwork rather than photographs of the actual work
- **Testimonials** — the six quotes are illustrative composites attributed to invented names. They
  are not statements from real people and must be replaced with consented, attributable quotes
- **Partner logos** — only the three named churches/ministries are documented; the dashed entries
  are invitations, not partners. Do not add a logo without written permission from that organisation

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

| Variable                                | Default                                    | Purpose                                |
| --------------------------------------- | ------------------------------------------ | -------------------------------------- |
| `NUXT_PUBLIC_SITE_URL`                  | `https://www.clmnative.com`                | Canonical + OG URLs                    |
| `NUXT_RESEND_API_KEY`                   | _(empty — logs to console)_                | Mail delivery                          |
| `NUXT_MAIL_FROM`                        | `Cross-Love Movement <info@clmnative.com>` | Sender                                 |
| `NUXT_MAIL_TO`                          | `info@clmnative.com`                       | Inbox receiving submissions            |
| `NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID`     | _(empty — Studio login disabled)_          | GitHub OAuth app for Studio editors    |
| `NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET` | _(empty)_                                  | GitHub OAuth secret                    |
| `NUXT_STUDIO_AUTH_GITHUB_MODERATORS`    | _(empty — anyone with access can edit)_    | Comma-separated editor email allowlist |

---

## Validation performed

- `npm run typecheck` — passes (Nuxt-aware `vue-tsc`)
- `npm run check` — passes (format, lint, type-aware checks across 81 files)
- `npm test` — 37 tests passing (content files, testimonials, partners, server validation)
- `npm run build` — passes, including Nuxt Content database generation with `node:sqlite`
- All routes render server-side with `200`; unknown route returns `404` via `app/error.vue`
- Nuxt Content verified end to end: 6 project pages, 6 Markdown articles, 6 event YAML files, and 9
  portfolio YAML files are indexed and served through `/projects`, `/news`, `/events`, and
  `/portfolio`
- Project listing, project detail (Markdown body, goals, impact, needs), and related projects verified
- News index, article pages, and the home news strip verified; article pages include `BlogPosting`
  JSON-LD, and unknown slugs return `404`
- Portfolio page, filters markup, and detail dialog verified server-side; artwork assets return `200`
- Home page verified to include the partner strip, repeated marquee groups, and pause control
- API routes verified with valid payloads (`200`), invalid payloads (`400` with field errors),
  honeypot submissions (silent `200`), and rate limiting (`429`)
- Event registration verified against the content collection: valid event (`200`), unknown slug
  (`404`), and invalid attendee count (`400`), with the confirmation email in the development log
- Contact and donation submissions confirmed in the development mail log (GH₵ formatting included)
- Nuxt Studio verified: client plugin registers in dev, `/_studio` in a production build returns
  `404 No authentication provider found` without credentials, and with credentials set it returns
  `302 → /__nuxt_studio/auth/github`, which in turn redirects to GitHub with
  `scope=user:email public_repo` and the callback `…/__nuxt_studio/auth/github`

---

## Before launch

1. **Sign off the placeholder content** listed under “Not yet confirmed” above.
2. **Add real photography** at 16:10 for programme cards and portfolio pieces, plus a portrait hero
   image, replacing the SVGs in `public/images/`. Add a 1200×630 OG image and reference it in
   `nuxt.config.ts`.
3. **Legal pages** — privacy policy, safeguarding policy, and the latest report. Only link to real
   documents.
4. **Mail** — verify the Resend domain and set `NUXT_MAIL_TO`; test one submission per form.
5. **Payments** — connect a gateway if online giving is required (see above).
6. **Event registrations** — replace the dummy calendar and connect registration to a real store
   (database, Google Sheet, or event platform) so capacities and headcounts stay accurate.
7. **News** — replace the illustrative posts, agree an editorial cadence, and add an RSS feed
   (`/rss.xml`) if people want to subscribe outside email.
8. **Rate limiting** — move to a shared store (Redis/Upstash) if you run more than one instance.
9. **Analytics and consent** — add only what is needed, with a consent gate if required.
10. **SEO** — add `@nuxtjs/sitemap` + `robots.txt` once the final domain is live.
11. **Accessibility** — run axe/Lighthouse and a keyboard pass, especially the mobile menu.
12. **CI** — run `npm run check`, `npm run typecheck`, `npm test`, and `npm run build` on every push.
13. **Testimonial consent** — collect written permission for every quote, name, role, and location
    before publishing. If consent is withdrawn, remove the quote and its attribution together.
14. **Partner logos** — replace wordmarks with authorised logo files (`logo` field), and keep the
    dashed open slots only while you are actively recruiting partners.
15. **Studio access** — create the GitHub OAuth app, set the client ID/secret, and set
    `NUXT_STUDIO_AUTH_GITHUB_MODERATORS` before sharing `/_studio` with anyone. Without the
    allowlist, anyone who can authorise the OAuth app can commit to `main`.

## Deployment

```bash
npm run build
node .output/server/index.mjs    # PORT defaults to 3000
```

Nitro presets (`vercel`, `netlify`, `cloudflare-pages`) can be set in `nuxt.config.ts` if you
prefer a platform-managed runtime. Keep the server target — the form endpoints and the Studio OAuth
route both need it. Publishing from Studio creates a Git commit, so connect the host to the
repository (Vercel, Netlify, or a GitHub Actions deploy) or editors will write to GitHub and see
nothing change on the live site.
