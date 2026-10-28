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
│  │  ├─ home/                 # EventsSection, NewsSection
│  │  └─ forms/                # Contact, Volunteer, Partnership, Donate, Newsletter
│  ├─ features/
│  │  └─ events/               # The event app: components + composables (see below)
│  │     ├─ components/        # EventCarousel, EventRegistrationForm
│  │     └─ composables/       # useEventAvailability
│  ├─ composables/             # useSite, useProjects, useProject, useEvents, useNews,
│  │                           # usePortfolio, useTestimonials, useForm, useSeo
│  ├─ data/                    # Code-managed content: site, about, involve, faqs, testimonials,
│  │                           # partners, home slides (plus category labels)
│  ├─ layouts/default.vue      # Header + main + footer, skip link
│  ├─ middleware/              # auth (any session), admin (staff roles only)
│  ├─ pages/                   # File-based routes, including /events, /news, /portfolio,
│  │                           # /login, /forgot-password, /reset-password, /portal, /admin
│  ├─ utils/                   # form.ts (control styles), dates.ts, events.ts
│  ├─ app.vue
│  └─ error.vue                # 404 / error screen
├─ content/                    # Editorial content (Nuxt Content)
│  ├─ projects/*.md            # Project pages with frontmatter + Markdown body
│  ├─ news/*.md                # Articles with frontmatter + Markdown/MDC body
│  ├─ events/*.yml             # Event records (one file per event)
│  └─ portfolio/*.yml          # Portfolio pieces (one file per piece)
├─ server/
│  ├─ api/                     # public + auth + admin routes
│  │  ├─ auth/                 # login, logout, session, reset-request, reset-confirm
│  │  ├─ admin/users/          # list, invite, role/status changes
│  │  └─ events/               # availability, register, registrations, health
│  ├─ database/                # Postgres: client, schema, generated SQL migrations
│  ├─ features/
│  │  ├─ auth/                 # password hashing, tokens, service, guards, mail
│  │  └─ events/               # Registrations app: db, repository, admin guard
│  ├─ plugins/database.ts      # Boot: apply migrations, seed the first superadmin
│  └─ utils/                   # schemas (Zod), validation, mailer, rate-limit
├─ shared/
│  ├─ types/content.ts         # Types used by both app and server
│  └─ utils/events.ts          # Availability maths shared by both sides
├─ docs/architecture.md        # Content vs operations planes, roles, portals, phases
├─ tests/                      # Vitest: content integrity, schemas, registrations
├─ public/                     # logo mark, favicon, abstract SVG artwork
├─ content.config.ts           # Nuxt Content collections, schemas, Studio form metadata
├─ nuxt.config.ts              # Nuxt, Tailwind, Nuxt Content, Nuxt Studio (`studio.route`)
├─ drizzle.config.ts           # Drizzle schema + migration output paths
├─ Dockerfile                  # Multi-stage build for Coolify / any container host
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

### Homepage carousel

The top of the homepage is a landscape carousel (`EventCarousel.vue`) driven by
`app/data/slides.ts`. Each slide needs `eyebrow` (date or context), `title`, `caption` (the message
the slide carries), `image` (landscape, 2400×1350 or wider), `imageAlt`, and an internal `to` with a
`cta` label.

It auto-advances every 7 seconds, pauses on hover, focus, or the pause button, supports arrow keys
and dot navigation, and stops auto-advancing entirely under `prefers-reduced-motion`. The current
images are the abstract SVG artwork — replace them with photographs when they arrive; the caption is
written to stand on its own if an image fails to load.

### Event app (registrations)

Events are a small application inside the site, kept together rather than spread across the generic
folders:

```
app/features/events/     components + composables (carousel, form, live availability)
server/features/events/  db.ts (connection + schema), repository.ts (SQL), admin.ts (token guard)
server/api/events/       availability.get, register.post, registrations.get, [id].delete
shared/utils/events.ts   availability maths used by both sides
```

**Where capacity comes from.** `content/events/*.yml` holds `capacity` (editorial) and
`registeredOffline` — places taken by phone, walk-in, or a partner. Website bookings live in a
separate SQLite file and are counted at request time:

```
remaining = capacity − registeredOffline − SUM(confirmed website attendees)
```

Both an event's offline figure and every website booking are combined in `GET /api/events/availability`.
The events page and the form read from that endpoint, so “places left” updates after every
registration without a rebuild.

**No overbooking.** `reserveSeats()` opens a `BEGIN IMMEDIATE` transaction, re-reads the confirmed
count, and only inserts if the requested places still fit. Two simultaneous group bookings cannot
both pass the check. A rejection returns `409` with the exact number left, which the form shows
against the number input.

**Storage.** `NUXT_EVENTS_DB_PATH` decides where the SQLite file lives (default `.data/events.sqlite`).
In production it **must** point at a persistent volume, otherwise a redeploy recreates the container
and takes the registrations with it. Keep one replica: SQLite on a shared volume across replicas is
not safe.

**Admin access.** `GET /api/events/registrations` lists bookings; add `?event=slug` to narrow or
`?format=csv` for a spreadsheet. `DELETE /api/events/registrations/:id` cancels a booking and frees
its seats. All three require `NUXT_REGISTRATIONS_TOKEN` as `Authorization: Bearer <token>` (or
`x-admin-token`); with the variable unset the endpoints return `503`.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://www.clmnative.com/api/events/registrations?format=csv" -o registrations.csv
```

**Not built yet:** a waitlist, per-email duplicate prevention, and any admin UI. Registrations store
name, email, and phone, so agree a retention period before collecting them in earnest.

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
   deployment environment (and in `.env` if testing locally). GitHub generates the secret — 40 hex
   characters — and displays it **once**, on the page where you click _Generate a new client secret_.
   Nothing to invent or hash yourself. If it is lost, generate a new one; rotating it also ends every
   current Studio session, because the cookie-signing key is derived from the credentials.
3. Optionally set `NUXT_STUDIO_AUTH_GITHUB_MODERATORS` to a comma-separated list of GitHub account
   emails. Without it, **anyone who can authorise the OAuth app can edit** — set it before launch.

Studio needs a server-side route for the OAuth callback, so the site must be deployed with
`npm run build` on a Node-capable host. Static-only hosting is not enough.

**Keep YAML timestamps quoted.** Studio reads YAML with the `timestamp` tag applied, so an unquoted
ISO value parses as a `Date` object while the content database holds a string. Those two can never
compare equal, and every edit of that file reports **Conflict Detected** — with no content actually
differing. Write:

```yaml
startsAt: '2026-11-14T18:00:00+00:00'
```

not `startsAt: 2026-11-14T18:00:00+00:00`. `tests/content.test.ts` enforces this for event files.

**Never name a frontmatter field `excerpt`.** Nuxt Content reserves it: its Markdown transformer replaces the
author's value with an auto-generated excerpt (or `undefined`), so the field silently lands in the
database as `NULL` — the article page renders a blank summary and Studio reports every news file as
conflicted. News posts use `summary` instead. `tests/content.test.ts` blocks the reserved keys from
coming back.

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

The site is built from **Cross-Love Movement's 2026 profile** (_CROSS-LOVE MOVEMENT PORTFOLIO_),
with the 2023 registration profile still the source for legal details. Everything below came from
those documents:

- Legal name and form, registration date (18 May 2023), Registrar General's Department number
  `CG041650523`, TIN `C0062926586`
- Founding year (**2018**), mission, vision, and the five values: faith, creativity, inclusion,
  service, impact
- The origin story (a trained mechanical engineer asking what to do with his musical gift) and the
  two mandates behind the name — vertical (faith in action) and horizontal (faith beyond boundaries)
- The two programme classes — Christian Mission Projects (CMPs) and Youth Empowerment Programmes
  (YEPs) — and every initiative now in `content/projects/`
- Cross Sessions (Easter Sundays, nine editions since 2018), Power-Point, Today Is Us, CSL
  Evangelism, People Like You (12 June 2027), and the church support work in Community 12 and Bawku
- Contact details: `crosslovemovement.lbg@gmail.com`, `+233 55 175 7842`, WhatsApp
  `+233 53 050 2774`, and the temporary site `cross-lovemovement.my.canva.site`

The **logo mark** (`public/images/clm-mark.png`, `public/favicon.png`) was extracted from the 2023
profile PDF, and the palette is derived from it: logo red `#B81828`, warm charcoal, gold, and cream.

### Not yet confirmed — replace before launch

Neither document supplies everything, so nothing was invented to fill the gaps. These items are
**editorial placeholders** and need sign-off:

- Donation amounts and the impact sentence attached to each one
- Monthly-giving examples and the programme allocation wording
- Partner tier amount (`From GH₵5,000 a year`) and benefits
- Response-time commitments (two working days), 18+ volunteering policy, complaint handling
- Bank / mobile-money details and international giving routes
- Leadership beyond the founder and secretary — the full officer and board list is not published
- Photography — every image is abstract SVG artwork, not a photograph of the actual work
- **Event calendar** — `People Like You` (12 June 2027) is dated in the profile. Cross Sessions is
  described as an Easter Sunday event but no 2027 date, venue, or capacity is published, so it is
  not listed as an event yet. Capacity, registration deadlines, and "free to attend" remain
  editorial assumptions
- **News posts** — the four articles summarise the profile's own facts; they were published in
  October 2026 rather than dated to the events they describe
- **Portfolio pieces** — derived from the profile. Where the profile gives an edition number rather
  than a year, `year` holds the edition (for example `5th edition`)
- **Testimonials** — none are published. The earlier set were illustrative composites attributed to
  invented people and have been removed. Add quotes only with written consent
- **Bawku region** — the profile says “Bawku-Upper West”; Bawku is in the Upper East Region, which is
  what the 2023 profile and this site use. Confirm before launch
- **Partner logos** — only the three named churches/ministries are documented; the dashed entries
  are invitations, not partners. Do not add a logo without written permission from that organisation

Programme statuses follow the profile: `completed` for the church support work and Today Is Us,
`active` for Power-Point and CSL Evangelism, `upcoming` for People Like You.

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

## Database

The operations side of the app runs on **Postgres** (Drizzle ORM). The content site is unaffected: Nuxt Content still builds its own read-only SQLite at deploy time.

```bash
npm run db:generate   # after changing server/database/schema
npm run db:migrate    # apply pending migrations (needs DATABASE_URL)
```

Migrations are generated into `server/database/migrations` and committed. The server also applies them at boot (`DB_MIGRATE_ON_START`, default on), which is safe with the single replica this deployment runs.

The first superadmin is seeded from `SEED_SUPERADMIN_EMAIL` / `SEED_SUPERADMIN_NAME`. Seeding is idempotent and never overwrites an existing account.

**Local development** against a throwaway database:

```bash
docker run -d --name clm-pg \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=clm -p 5433:5432 postgres:18-alpine

export DATABASE_URL=postgres://postgres:postgres@localhost:5433/clm
export SEED_SUPERADMIN_EMAIL=you@example.com
npm run dev
```

`GET /api/health` reports `database: up`, `not-configured`, or `503`. Without `DATABASE_URL` the site still runs — database features are logged as disabled rather than breaking the marketing pages.

See `docs/architecture.md` for the content/operations split, roles, portals, and the phase plan.

---

## Accounts and portals

Accounts are **invite-only** — there is no public signup. A superadmin or admin invites an address; the invitee sets a password from the emailed link (7-day expiry). Password resets use the same mechanism (1-hour expiry).

| Route                                 | Who                                       |
| ------------------------------------- | ----------------------------------------- |
| `/login`                              | Everyone                                  |
| `/forgot-password`, `/reset-password` | Everyone with a link                      |
| `/portal`                             | Any signed-in account                     |
| `/admin`                              | `viewer`, `editor`, `admin`, `superadmin` |

Roles: `superadmin` (everything, plus user management), `admin` (records + inviting members), `editor`, `viewer`, `member`. Guards run in route middleware (`auth`, `admin`) and again in the API — a member hitting `/api/admin/*` gets `403`.

**First sign-in.** The seeded superadmin has no password: open `/forgot-password`, enter the seeded email, and follow the link from the server log (or the inbox once Resend is configured).

**Sessions** are sealed cookies signed by `NUXT_SESSION_PASSWORD` — set it to 32+ random characters in production (`openssl rand -base64 32`). Without it, sign-in logs an error and sessions will not persist.

| Endpoint                       | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `POST /api/auth/login`         | Email + password → session, returns the landing portal |
| `POST /api/auth/logout`        | Clear the session                                      |
| `GET /api/auth/session`        | Current user                                           |
| `POST /api/auth/reset-request` | Always generic; emails a link if the account exists    |
| `POST /api/auth/reset-confirm` | Accept invite or reset token, set password, sign in    |
| `GET /api/admin/users`         | List accounts (admin+)                                 |
| `POST /api/admin/users/invite` | Invite a member (admin) or staff (superadmin)          |
| `PATCH /api/admin/users/:id`   | Change role or suspend (superadmin)                    |

Passwords are hashed with scrypt from `node:crypto`; tokens are stored as SHA-256 hashes and are single-use. Login and reset responses are deliberately generic so the endpoints cannot be used to discover who has an account.

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
| `NUXT_EVENTS_DB_PATH`                   | `.data/events.sqlite`                      | SQLite file for event registrations    |
| `NUXT_REGISTRATIONS_TOKEN`              | _(empty — export endpoints disabled)_      | Bearer token for the registrant list   |
| `DATABASE_URL`                          | _(empty — database features off)_          | Postgres connection string             |
| `DATABASE_SSL`                          | `false`                                    | Enable TLS to the database             |
| `DATABASE_POOL_SIZE`                    | `10`                                       | Postgres pool size                     |
| `DB_MIGRATE_ON_START`                   | `true`                                     | Apply migrations at boot               |
| `MIGRATIONS_DIR`                        | `server/database/migrations`               | `/app/migrations` in the image         |
| `SEED_SUPERADMIN_EMAIL`                 | _(empty — no seeding)_                     | First superadmin's email               |
| `SEED_SUPERADMIN_NAME`                  | `Super Admin`                              | First superadmin's name                |
| `NUXT_SESSION_PASSWORD`                 | _(required in production)_                 | Signs the session cookie (32+ chars)   |

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
- Event registration verified end to end against SQLite: a booking returns the new availability,
  `GET /api/events/availability` reflects it, cancelling returns the seats, the list and CSV export
  return `401` without the token and data with it, and over-capacity bookings are rejected (`409`)
  by a `BEGIN IMMEDIATE` transaction
- Contact and donation submissions confirmed in the development mail log (GH₵ formatting included)
- Nuxt Studio verified: client plugin registers in dev, `/_studio` in a production build returns
  `404 No authentication provider found` without credentials, and with credentials set it returns
  `302 → /__nuxt_studio/auth/github`, which in turn redirects to GitHub with
  `scope=user:email public_repo` and the callback `…/__nuxt_studio/auth/github`
- Container verified: `docker build` succeeds on `node:24-alpine`, the image runs healthy as uid
  1000, every route returns `200`, `/_studio` returns `404` without OAuth env vars, a valid
  `POST /api/contact` returns `200`, and with OAuth credentials plus a proxy-style `Host` header the
  authorize redirect carries `redirect_uri=https://www.clmnative.com/__nuxt_studio/auth/github`

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
6. **Event storage** — mount a persistent volume, set `NUXT_EVENTS_DB_PATH` to a file on it, set
   `NUXT_REGISTRATIONS_TOKEN`, keep a single replica, and schedule a nightly copy of the SQLite file.
   Agree a retention period for registrant names, emails, and phone numbers.
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

### Any Node host

```bash
npm run build
node .output/server/index.mjs    # PORT defaults to 3000
```

`.output` is self-contained — traced dependencies, the generated content database, and the client
assets are all inside it, so nothing else needs to ship. **Node 24 is required**; `@nuxt/content`
uses the built-in `node:sqlite` module.

Nitro presets (`vercel`, `netlify`, `cloudflare-pages`) can be set in `nuxt.config.ts` if you
prefer a platform-managed runtime. Keep the server target — the form endpoints and the Studio OAuth
route both need it. Publishing from Studio creates a Git commit, so connect the host to the
repository or editors will write to GitHub and see nothing change on the live site.

### Coolify (Docker)

The repository ships a multi-stage `Dockerfile` that builds with Node 24 and runs the Nitro server
as an unprivileged user.

1. **Create the resource** — Coolify → your project → **+ New** → **Application** → **Private
   repository (with GitHub App)** → `cross-love-movement/clm-website`, branch `main`. The GitHub App
   must be installed on the `cross-love-movement` organization, not just your personal account.
2. **Build pack** — choose **Dockerfile**. Nothing else to fill in: it builds `npm ci` +
   `npm run build` and runs `node .output/server/index.mjs`.
3. **Ports** — set _Ports Exposes_ to `3000`. The container already sets `HOST=0.0.0.0`.
4. **Domain** — add `https://www.clmnative.com`, enable HTTPS. Coolify's Traefik forwards
   `X-Forwarded-Proto`, which Studio uses to build the OAuth callback URL.
5. **Environment variables** — see the table below.
6. **Auto deploy** — enable the GitHub webhook. This is not optional: Studio publishes by
   committing to `main`, and that commit is what triggers the rebuild that makes the edit public.
7. **Healthcheck** — the image defines a `HEALTHCHECK` hitting `/`. Coolify's own setting can be
   left at its default, or set to GET `/`.

**No persistent volume is needed.** The content database is generated during the build and shipped
read-only inside the image at `server/contents.sqlite`. Studio's drafts live in the editor's browser
and are published to Git, not to the container's disk. Add a volume only if you later switch media
storage to a local disk driver.

**Environment variables** (Coolify → Configuration → Environment Variables):

| Variable                                | Required | Value                                      |
| --------------------------------------- | -------- | ------------------------------------------ |
| `NUXT_PUBLIC_SITE_URL`                  | yes      | `https://www.clmnative.com`                |
| `NUXT_MAIL_TO`                          | yes      | Inbox that receives form submissions       |
| `NUXT_MAIL_FROM`                        | no       | `Cross-Love Movement <info@clmnative.com>` |
| `NUXT_RESEND_API_KEY`                   | for mail | Resend API key (omit to log to container)  |
| `NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID`     | for CMS  | GitHub OAuth app client ID                 |
| `NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET` | for CMS  | GitHub OAuth app secret                    |
| `NUXT_STUDIO_AUTH_GITHUB_MODERATORS`    | for CMS  | Comma-separated editor emails (allowlist)  |

Mark the Studio secrets as **Build Variable: no** — they are only read at runtime.

Set the GitHub OAuth app's callback URL to `https://www.clmnative.com/__nuxt_studio/auth/github`.
If the domain ever changes, or if Coolify sits behind another proxy that rewrites `Host`, set
`NUXT_STUDIO_AUTH_GITHUB_REDIRECT_URL` to the same URL explicitly.

**Building without Docker** — if you prefer Coolify's Nixpacks build pack: build command
`npm ci && npm run build`, start command `node .output/server/index.mjs`, port `3000`. Pin the
Node version with `NIXPACKS_NODE_VERSION=24` so the `node:sqlite` import resolves.
