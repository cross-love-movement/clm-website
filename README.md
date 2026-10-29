# Cross-Love Movement — website

Website for **Cross-Love Movement Limited By Guarantee** — a Ghanaian NGO of musicians and
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
│  │     ├─ components/        # EventCarousel, EventRegistrationForm, EventForm (admin)
│  │     └─ composables/       # useEventAvailability
│  ├─ composables/             # useSite, useProjects, useProject, useEvents, useNews,
│  │                           # usePortfolio, useTestimonials, useForm, useSeo
│  ├─ data/                    # Code-managed content: site, about, involve, faqs, testimonials,
│  │                           # partners, home slides (plus category labels)
│  ├─ layouts/default.vue      # Header + main + footer, skip link
│  ├─ middleware/              # guest, admin (staff), manager (people), volunteer (portal)
│  ├─ pages/                   # File-based routes, including /events, /news, /portfolio,
│  │                           # /login, /portal, /admin, /admin/events (CRUD + registrations)
│  ├─ utils/                   # form.ts (control styles), dates.ts, events.ts, admin.ts
│  ├─ app.vue
│  └─ error.vue                # 404 / error screen
├─ content/                    # Editorial content (Nuxt Content)
│  ├─ projects/*.md            # Project pages with frontmatter + Markdown body
│  ├─ news/*.md                # Articles with frontmatter + Markdown/MDC body
│  └─ portfolio/*.yml          # Portfolio pieces (one file per piece)
├─ server/
│  ├─ api/                     # public, auth, and admin routes
│  │  ├─ auth/                 # login, logout, session, reset-request, reset-confirm
│  │  ├─ admin/users/          # list, invite, role/status changes
│  │  ├─ admin/events/         # event CRUD + registrations: list, CSV, cancel, check-in
│  │  ├─ events/               # public list + register
│  │  └─ health.get.ts
│  ├─ database/                # Postgres: client, schema, migrations, seeds
│  ├─ features/
│  │  ├─ auth/                 # password hashing, tokens, service, guards, mail
│  │  ├─ events/               # repository, reference codes, email templates
│  │  └─ mail/                 # outbox drain (background sender)
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

| Route               | Page             | Server route                  |
| ------------------- | ---------------- | ----------------------------- |
| `/`                 | Home             | —                             |
| `/about`            | About            | —                             |
| `/projects`         | Projects index   | —                             |
| `/projects/[slug]`  | Project detail   | —                             |
| `/events`           | Events           | `POST /api/events/register`   |
| `/news`             | News index       | —                             |
| `/news/[slug]`      | Article          | —                             |
| `/portfolio`        | Portfolio        | —                             |
| `/volunteer`        | Volunteer        | `POST /api/volunteer`         |
| `/partnership`      | Partnership      | `POST /api/partnership`       |
| `/contact`          | Contact          | `POST /api/contact`           |
| `/donate`           | Donate           | `POST /api/donate`            |
| footer newsletter   | —                | `POST /api/newsletter`        |
| `/portal`           | Volunteer portal | `GET /api/portal/assignments` |
| `/login`            | Sign in          | `POST /api/auth/login`        |
| `/admin`            | Staff overview   | —                             |
| `/admin/events`     | Event management | `/api/admin/events`           |
| `/admin/programmes` | Programmes       | `/api/admin/programmes`       |
| `/admin/volunteers` | Volunteers       | `/api/admin/volunteers`       |
| `/admin/users`      | People           | `/api/admin/users`            |
| `/_studio`          | —                | Nuxt Studio (GitHub OAuth)    |

Each page sets its own title, description, Open Graph tags, and canonical URL via `useSeo()`.

---

## Content model

Content is split by how often it changes.

**Editorial content (Nuxt Content)** lives in `content/` and is validated by `content.config.ts`:

- `content/projects/*.md` — project pages with structured frontmatter and a Markdown body
- `content/news/*.md` — articles with frontmatter and a Markdown/MDC body
- `content/portfolio/*.yml` — one file per portfolio piece

Events and volunteer records are no longer content: they live in Postgres and are managed by the event and volunteer apps (see below).

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

### Event app

Events are an application inside the site, and that is how the code is arranged:

```
app/features/events/       carousel, registration form, admin event form
app/pages/admin/events/    list, create, detail + registrations, edit
server/features/events/    repository (SQL + transactions), mail templates, references
server/features/mail/      outbox drain (background sender)
server/api/events/         public list + register
server/api/admin/events/   CRUD, registrations list, CSV, cancel, check-in
shared/utils/events.ts     availability maths used by both sides
```

**Events live in Postgres**, not in `content/`. A public request returns published events with live
capacity:

```json
{
  "slug": "people-like-you-2027",
  "capacity": 1000,
  "availability": { "registered": 3, "remaining": 997, "open": true }
}
```

`GET /api/events` is the single source for the listing, the registration form, the home strip, and
the homepage carousel — so “places left” cannot disagree between them.

**No overbooking.** `registerForEvent()` locks the event row (`SELECT … FOR UPDATE`), re-counts
confirmed attendees, and inserts in the same transaction. Two simultaneous group bookings cannot
both pass the check.

**Waitlist.** If the requested places do not fit, the booking is stored as `waitlisted` instead of
failing — it still gets a reference and an email. Cancelling a confirmed booking promotes waitlisted
bookings first-come-first-served inside the same transaction, and emails each promoted registrant.

**Reference codes.** `PEO-7K4M2Q` — event prefix plus Crockford base32 (no `I`, `L`, `O`, `U`).
Emailed only: the confirmation screen tells the registrant to check their inbox.

**Email outbox.** The booking commits first and writes a `mail_outbox` row; a background worker
sends it and retries up to five times. A mail outage cannot lose a booking, and a retry cannot send
twice.

**Admin screens** live under `/admin/events` and use the same endpoints, guarded by the staff
session. `/admin/events` lists every event with live counts, `/admin/events/new` creates one,
`/admin/events/:id` shows the registration table (search, check-in, cancel, CSV), the guest-message
composer, and the event-level cancel action, and `/admin/events/:id/edit` edits the record. Reading
needs staff access; writing needs the `canEdit` permission and registrations need
`canManageRegistrations`.

**Cancelling an event is not archiving.** Archiving hides an event from the calendar and sends
nothing. `POST /api/admin/events/:id/cancel` sets the status to `cancelled`, takes the event off the
public calendar, releases every confirmed and waitlisted booking in one transaction, and queues the
`event-called-off` mail to each distinct address. A single guest cancelling their own booking still
uses the `event-cancelled` mail, which carries their reference code; the event-level notice does not.
Setting `cancelled` from the edit form does **not** email anyone, so the UI labels it.

**Messaging guests.** `POST /api/admin/events/:id/message` queues a staff-written subject and body to
the event's guests: `audience=confirmed` (the default) or `audience=all` to include the waitlist.
Cancelled bookings are never written to, and one address receives one email even if it booked twice.
The message is plain text; a blank line becomes a new paragraph, and links are left as text. Sends
are limited to the event's own bookings — there is no site-wide broadcast list. Delivery runs through
the outbox worker at ten messages every 20 seconds, so a large list spreads over time rather than
hitting Resend's rate limit (1,000 guests is roughly 33 minutes).

**Admin endpoints** (staff session required — see Accounts and portals):

| Route                                               | Purpose                             |
| --------------------------------------------------- | ----------------------------------- |
| `GET/POST /api/admin/events`                        | list every event, create one        |
| `GET/PATCH /api/admin/events/:id`                   | read or edit one event              |
| `POST /api/admin/events/:id/cancel`                 | cancel the event + email all guests |
| `POST /api/admin/events/:id/message`                | message the event's guests          |
| `GET /api/admin/events/registrations?event=slug`    | list bookings                       |
| `GET …?format=csv`                                  | spreadsheet download                |
| `POST /api/admin/events/registrations/:id/check-in` | mark a booking as arrived           |
| `DELETE /api/admin/events/registrations/:id`        | cancel + promote the waitlist       |

**Bootstrap data.** On a fresh database one published event is seeded (`SEED_EVENTS=false`
disables it) so the site has something to show.

**Not built yet:** per-email duplicate prevention, a public event detail page, reminder emails,
and an audit log. Registrations store name, email, and phone, so agree a retention period before
collecting them in earnest.

### Volunteer app

Volunteers are the second operational entity. The code mirrors events:

```
app/pages/admin/programmes/   programme list, create, edit, roles
app/pages/admin/volunteers/   applications, safeguarding, placements
app/features/volunteers/      programme form and future shared components
server/features/volunteers/   repository, schemas, application mail
server/api/volunteer/         public opportunities
server/api/admin/             programmes, opportunities, volunteers, assignments
server/api/portal/            a volunteer's own placements
```

The model separates the person, the work, and the placement:

| Entity                    | Purpose                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `programmes`              | The work volunteers can join, with an optional link to a content story     |
| `volunteer_opportunities` | Roles inside a programme, with slots and requirements                      |
| `volunteers`              | The person, including safeguarding fields and an optional linked `user_id` |
| `volunteer_applications`  | Every public submission, kept for history                                  |
| `volunteer_assignments`   | Who is placed in which programme/role                                      |

**Roles are data, not code.** Admins create and close them under `/admin/programmes`; the public
`/volunteer` page and the application form read the open ones from
`/api/volunteer/opportunities`. Adding or changing a role does not require a deploy. If no roles
are open, the page still accepts a general application.

**Flow.** The public `/volunteer` form stores an application, queues a notification to
`apply@crosslovemovement.org` in `mail_outbox`, and drains the queue immediately. If delivery
fails, the row is retried by the background worker. Staff do not need to be signed in to learn
that someone applied.
Staff review at `/admin/volunteers`, invite the volunteer (creating a `volunteer` account), then
place them into a programme at `/admin/programmes`. Volunteers see their placements at `/portal`.
Assigning to an opportunity with slots locks the row and refuses to overfill.

**Safeguarding** lives on the volunteer row: date of birth, emergency contact, consent timestamp,
briefing date, background-check status, and internal notes. It is only visible with
`canManageVolunteers`.

**Bootstrap data.** On a fresh database one programme (People Like You 2027) and five roles are
seeded (`SEED_VOLUNTEER_PROGRAMMES=false` disables it) so the public form is not empty.

**Not built yet:** approval/decline emails, shifts and hours logging, reports, and volunteer content
grants. Content editing stays with developers/GitHub or Nuxt Studio for now; if scoped editors are
added later, draft/publish approval belongs with that work.

### Mail routing

| Trigger                                    | Inbox                                         |
| ------------------------------------------ | --------------------------------------------- |
| Volunteer application                      | `apply@crosslovemovement.org`                 |
| Contact form — volunteering                | `apply@crosslovemovement.org`                 |
| Donation form                              | `donate@crosslovemovement.org`                |
| Contact form — donation                    | `donate@crosslovemovement.org`                |
| Contact form — complaint                   | `admin@crosslovemovement.org`                 |
| Contact form — general, media, partnership | `info@crosslovemovement.org`                  |
| Partnership form                           | `info@crosslovemovement.org`                  |
| Newsletter signup                          | `info@crosslovemovement.org`                  |
| Invite and password-reset replies          | `support@crosslovemovement.org` (Reply-To)    |
| Unrouted fallback                          | `info@crosslovemovement.org` (`NUXT_MAIL_TO`) |

The mailboxes are defined once in `server/utils/mailboxes.ts`. These are recipients; the sending
address still has to live on the domain verified in Resend. All inboxes must be routed in Cloudflare
Email Routing or they will accept mail into a void.

To publish a project, article, or portfolio piece, edit a file under `content/`, commit it, and the
site rebuilds — from GitHub's web editor, a local editor, or Nuxt Studio. No separate CMS is hosted,
and the public pages keep the same layout, components, and theme. Events and volunteers are the
exception: they are records in Postgres, edited at `/admin/events` and `/admin/volunteers`.

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
   - Homepage URL: `https://www.crosslovemovement.org`
   - Authorization callback URL: `https://www.crosslovemovement.org/__nuxt_studio/auth/github`
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
- Contact details: `info@crosslovemovement.org`, `+233 53 050 2774`, WhatsApp
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

**Brand lockup.** `BrandLockup.vue` is the official signature: the heart-and-cross mark beside
`CROSS-LOVE MOVEMENT` over `LIMITED BY GUARANTEE`, both in the logo red. It sizes from one `size`
prop and is used in `SiteHeader`, `PortalHeader`, `SiteFooter` (with `tile` and `on-dark`), the error
page, and the email header in `server/emails/templates/*.html`. Change it there once rather than editing
individual headers; if the organisation supplies the lockup as a single SVG, swap the component
body for that image.

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

`server/utils/mailer.ts` sends through the [Resend](https://resend.com) HTTP API. The markup lives in
`server/emails/templates` as standalone HTML files — the **single source** for each mail — and is used
two ways:

- **In this app** for previews and as the fallback, rendered with `escapeHtml`.
- **In Resend** by pasting the same file into a template; `{{{VARIABLE}}}` is the syntax both sides use.

With no `NUXT_RESEND_API_KEY` the message is printed to the server console, so local testing works
without an account.

| File                             | Covers                                                              |
| -------------------------------- | ------------------------------------------------------------------- |
| `server/emails/templates/*.html` | One branded file per kind, ready to paste into Resend               |
| `server/emails/catalog.ts`       | Kind → file/env map, renderer, escaping, subject and length helpers |
| `server/emails/notifications.ts` | Variable builders for the four staff notifications                  |
| `server/emails/types.ts`         | `ComposedMail`, `TemplateVariables` — what `mail_outbox` stores     |
| `server/features/*/mail.ts`      | Subject lines, plain-text bodies, and variables per workflow        |
| `server/emails/layout.ts`        | _Removed_ — there is no second copy of the markup in TypeScript     |

The shell is a 600px table card with a white header carrying the official lockup, the clay rule, the
reference code block, and a footer with the legal name, RGD number, address, and reply address.
`tests/email.test.ts` checks that every kind has a file, that each file carries the brand, that the
app supplies every placeholder the file uses, and that rendering escapes interpolated values.

**Preview them in development.** `/api/email-preview` lists every kind;
`/api/email-preview?kind=confirmation` renders one with sample data. It returns `404` outside
development.

**Event mail is queued first.** The message row is written inside the booking transaction, so a mail
outage can never lose a booking. `mail_outbox.variables` holds the values; the worker renders the
template (or sends the Resend template) immediately and retries up to five times. Rows queued without
variables send as plain text.

**Using Resend-hosted templates.** Create the template in Resend, paste the matching file from
`server/emails/templates`, publish it, then set the kind's environment variable to the template **id
or alias**. Leave it blank to keep rendering the file in the app. Sending still supplies `from`,
`to`, `subject`, and `Reply-To`, so routing and subject lines stay in the repository.

| Kind                    | Environment variable                    | Variables                                                                                                                                                  |
| ----------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event-registration`    | `RESEND_TEMPLATE_EVENT_REGISTRATION`    | `NAME`, `EVENT_TITLE`, `REFERENCE`, `WHEN`, `WHERE`, `PLACES`, `EVENT_URL`                                                                                 |
| `event-waitlist`        | `RESEND_TEMPLATE_EVENT_WAITLIST`        | same as registration                                                                                                                                       |
| `event-promoted`        | `RESEND_TEMPLATE_EVENT_PROMOTED`        | same as registration                                                                                                                                       |
| `event-cancelled`       | `RESEND_TEMPLATE_EVENT_CANCELLED`       | `NAME`, `EVENT_TITLE`, `REFERENCE`, `WHEN`, `WHERE`, `PLACES`                                                                                              |
| `event-called-off`      | `RESEND_TEMPLATE_EVENT_CALLED_OFF`      | `NAME`, `EVENT_TITLE`, `WHEN`, `WHERE`                                                                                                                     |
| `event-message`         | `RESEND_TEMPLATE_EVENT_MESSAGE`         | `NAME`, `EVENT_TITLE`, `WHEN`, `WHERE`, `MESSAGE_HTML`                                                                                                     |
| `auth-invite`           | `RESEND_TEMPLATE_AUTH_INVITE`           | `NAME`, `PORTAL`, `ACTION_URL`, `EXPIRES`                                                                                                                  |
| `auth-reset`            | `RESEND_TEMPLATE_AUTH_RESET`            | `NAME`, `ACTION_URL`, `EXPIRES`                                                                                                                            |
| `volunteer-application` | `RESEND_TEMPLATE_VOLUNTEER_APPLICATION` | `APPLICANT_NAME`, `APPLICANT_EMAIL`, `PHONE`, `CITY`, `AVAILABILITY`, `PROGRAMME`, `ROLE`, `INTEREST`, `EXPERIENCE`, `MESSAGE`, `CONSENT_AT`, `REVIEW_URL` |
| `contact`               | `RESEND_TEMPLATE_CONTACT`               | `NAME`, `SENDER_EMAIL`, `PHONE`, `TOPIC`, `MESSAGE`                                                                                                        |
| `donation`              | `RESEND_TEMPLATE_DONATION`              | `NAME`, `DONOR_EMAIL`, `AMOUNT`, `FREQUENCY`, `NOTE`                                                                                                       |
| `partnership`           | `RESEND_TEMPLATE_PARTNERSHIP`           | `ORGANISATION`, `CONTACT_NAME`, `PARTNER_EMAIL`, `PHONE`, `TYPE`, `MESSAGE`                                                                                |
| `newsletter`            | `RESEND_TEMPLATE_NEWSLETTER`            | `SUBSCRIBER_EMAIL`                                                                                                                                         |

Every variable a template uses must be supplied — Resend rejects the send otherwise — and only
**published** templates can be sent to. `tests/email.test.ts` asserts each composer supplies every
placeholder its file uses, so drift shows up in CI rather than in a customer's inbox. Aliases
(`clm-event-registration`) are worth using over raw ids: staging and production can share one value.

Variables ending in `_HTML` are inserted as markup by the local renderer; everything else is
escaped. The only one today is `MESSAGE_HTML`, which `broadcastMail()` builds itself from staff text
(escape, then split into paragraphs). Never name a variable `_HTML` for anything a member of the
public typed — the suffix is a trust boundary.

To seed a dashboard template, run `npm run emails:sync` (below) or paste the file into the editor
manually and publish it.

**Syncing the files to Resend.** The files are the source of truth, but a deploy does not push them:
while an alias is set, Resend renders its own stored copy. After changing a template, run:

```bash
npm run emails:sync -- --dry-run   # list what would be pushed
npm run emails:sync                # update or create, then publish
```

It reads every file, extracts the `{{{VARIABLE}}}` placeholders, sends them as the template's variable
list, patches the template whose alias matches `RESEND_TEMPLATE_*` (creating it with that alias if it
does not exist), and publishes it. Failures are reported per kind and the command exits non-zero.

Run it locally or in CI with `RESEND_API_KEY` (or `NUXT_RESEND_API_KEY`) and the aliases in `.env` —
the deployed container only carries the built assets, not the script or the source files.

**Renaming an alias.** The alias lives in Resend, not in the template file, and Resend renames it in
place (same template id). Use the helper rather than creating a second template:

```bash
npm run emails:rename -- --dry-run event-registration=clm-event-registration
npm run emails:rename -- --write-env event-registration=clm-event-registration
```

The old alias is read from the kind's `RESEND_TEMPLATE_*` variable, so rename **before** changing the
environment. `--write-env` rewrites those lines in `.env` after every rename succeeds; without it the
command prints the lines to apply yourself. Then run `emails:sync` to republish under the new alias.
Remember the deployment environment: an alias that exists in `.env` but not in Coolify leaves sends
failing against a template that no longer exists.

The naming scheme is `clm-<kind>`, so the environment variable, the log line, and the dashboard
template all read the same: `RESEND_TEMPLATE_AUTH_INVITE` → `clm-auth-invite`.

**Checking the Resend side without changing it.** `npm run emails:status` prints, per kind, the
alias, whether it resolves, whether the template is published, and whether the record carries the
alias named in `.env`. It exits non-zero if a send would fail, so it can gate a deploy:

```bash
npm run emails:status
```

Resend keeps an old alias resolving for a while after a rename, so the alias check catches an
environment that was never updated even though the old sends still succeed.

**Which path is used?** A kind uses Resend only when its env var is non-empty **and** the composer
supplies variables. At boot the server prints one line, e.g.

```
[mail] 7/11 kinds use a Resend template: event-registration → clm-event-registration, …
```

Every send then logs the path it took:

```
[mail] event-registration delivered via Resend template "clm-event-registration"
[mail] newsletter delivered via server/emails/templates/newsletter.html
```

A configured alias that is wrong, unpublished, or missing a variable makes Resend reject the send —
the row stays in `mail_outbox` and `last_error` names the cause. It deliberately does **not** fall
back to the local file, so a misconfiguration is visible rather than silently sending different copy.

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

Accounts are **invite-only** — there is no public signup. A superadmin or an admin with
`canManagePeople` invites an address; the invitee sets a password from the emailed link (7-day
expiry). Password resets use the same mechanism (1-hour expiry).

| Route                                 | Who                          |
| ------------------------------------- | ---------------------------- |
| `/login`                              | Everyone                     |
| `/forgot-password`, `/reset-password` | Everyone with a link         |
| `/portal`                             | `volunteer`                  |
| `/admin`                              | `superadmin`, `admin`        |
| `/admin/users`                        | `canManagePeople` permission |

Roles: `superadmin`, `admin`, `volunteer`. Operational permissions are assigned per account at
invite time: `canEdit` (events), `canManageRegistrations` (bookings, check-in, CSV),
`canManagePeople` (people screen, invite volunteers), `canManageVolunteers` (applications,
safeguarding, placements), and `canManageProgrammes` (programmes and roles). An admin starts with
all five; a superadmin implicitly has everything, plus changing roles, editing permissions, and
suspending accounts. Volunteers have no staff access. Guards run in route middleware (`admin`,
`manager`, `programme-manager`, `volunteer-manager`, `volunteer`) and again in the API, so a
volunteer hitting `/api/admin/*` gets `403`.

**Volunteer portal.** `/portal` shows a volunteer their profile, status, and current placements. It is only reachable by `volunteer` accounts; staff are redirected to `/admin`. Volunteers are invited after an application is approved, so an account without a linked volunteer profile sees a prompt to apply.

**First sign-in.** The seeded superadmin has no password: open `/forgot-password`, enter the seeded email, and follow the link from the server log (or the inbox once Resend is configured).

**Sessions** are sealed cookies signed by `NUXT_SESSION_PASSWORD` — set it to 32+ random characters in production (`openssl rand -base64 32`). Without it, sign-in logs an error and sessions will not persist.

| Endpoint                       | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `POST /api/auth/login`         | Email + password → session, returns the landing portal       |
| `POST /api/auth/logout`        | Clear the session                                            |
| `GET /api/auth/session`        | Current user                                                 |
| `POST /api/auth/reset-request` | Always generic; emails a link if the account exists          |
| `POST /api/auth/reset-confirm` | Accept invite or reset token, set password, sign in          |
| `GET /api/admin/users`         | List accounts (`canManagePeople`)                            |
| `POST /api/admin/users/invite` | Invite a volunteer (`canManagePeople`) or staff (superadmin) |
| `PATCH /api/admin/users/:id`   | Change role/permissions or suspend (superadmin)              |

Passwords are hashed with scrypt from `node:crypto`; tokens are stored as SHA-256 hashes and are single-use. Login and reset responses are deliberately generic so the endpoints cannot be used to discover who has an account.

---

## Environment variables

| Variable                                | Default                                            | Purpose                                |
| --------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| `NUXT_PUBLIC_SITE_URL`                  | `https://www.crosslovemovement.org`                | Canonical + OG URLs                    |
| `NUXT_RESEND_API_KEY`                   | _(empty — logs to console)_                        | Mail delivery                          |
| `NUXT_MAIL_FROM`                        | `Cross-Love Movement <info@crosslovemovement.org>` | Sender                                 |
| `NUXT_MAIL_TO`                          | `info@crosslovemovement.org`                       | General fallback inbox                 |
| `NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID`     | _(empty — Studio login disabled)_                  | GitHub OAuth app for Studio editors    |
| `NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET` | _(empty)_                                          | GitHub OAuth secret                    |
| `NUXT_STUDIO_AUTH_GITHUB_MODERATORS`    | _(empty — anyone with access can edit)_            | Comma-separated editor email allowlist |
| `SEED_EVENTS`                           | `true`                                             | Seed one event on an empty database    |
| `SEED_VOLUNTEER_PROGRAMMES`             | `true`                                             | Seed one programme + roles on empty DB |
| `DATABASE_URL`                          | _(empty — database features off)_                  | Postgres connection string             |
| `DATABASE_SSL`                          | `false`                                            | Enable TLS to the database             |
| `DATABASE_POOL_SIZE`                    | `10`                                               | Postgres pool size                     |
| `DB_MIGRATE_ON_START`                   | `true`                                             | Apply migrations at boot               |
| `MIGRATIONS_DIR`                        | `server/database/migrations`                       | `/app/migrations` in the image         |
| `SEED_SUPERADMIN_EMAIL`                 | _(empty — no seeding)_                             | First superadmin's email               |
| `SEED_SUPERADMIN_NAME`                  | `Super Admin`                                      | First superadmin's name                |
| `NUXT_SESSION_PASSWORD`                 | _(required in production)_                         | Signs the session cookie (32+ chars)   |

---

## Validation performed

- `npm run typecheck` — passes (Nuxt-aware `vue-tsc`)
- `npm run check` — passes (format, lint, type-aware checks across 178 files)
- `npm test` — 60 tests passing (content files, event availability and references, permissions, template contract, email rendering, and Resend payload shape)
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
- Event flow verified end to end on Postgres: booking returns the new availability, a booking beyond
  capacity is stored as `waitlisted` with its own reference, cancelling a confirmed booking promotes
  the waitlist inside the same transaction and emails the promoted registrant, CSV export and
  check-in work, and staff-only endpoints return `401` without a session
- Contact and donation submissions confirmed in the development mail log (GH₵ formatting included)
- Branded mail verified end to end: a registration stores its variables in `mail_outbox`, the worker
  renders the template file (8.2 KB) and sends it, cancellation queues and sends the cancellation
  template, the Resend-template path is selected when its env var is set, and `/api/email-preview`
  returns `200` in development and `404` in the production build
- Nuxt Studio verified: client plugin registers in dev, `/_studio` in a production build returns
  `404 No authentication provider found` without credentials, and with credentials set it returns
  `302 → /__nuxt_studio/auth/github`, which in turn redirects to GitHub with
  `scope=user:email public_repo` and the callback `…/__nuxt_studio/auth/github`
- Container verified: `docker build` succeeds on `node:24-alpine`, the image runs healthy as uid
  1000, every route returns `200`, `/_studio` returns `404` without OAuth env vars, a valid
  `POST /api/contact` returns `200`, and with OAuth credentials plus a proxy-style `Host` header the
  authorize redirect carries `redirect_uri=https://<deployment-domain>/__nuxt_studio/auth/github`

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
6. **Event data** — events and registrations live in `DATABASE_URL`. Keep one replica, schedule
   nightly Postgres backups, and agree a retention period for registrant names, emails, and phone
   numbers. The admin CRUD screens are the next phase; until then, events are created with SQL.
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
2. **Database** — add a **PostgreSQL 18** resource to the same project, then copy its _internal_
   connection URL into `DATABASE_URL` on the application. The app applies migrations and seeds the
   first superadmin on boot (`DB_MIGRATE_ON_START=true`).
3. **Build pack** — choose **Dockerfile**. Nothing else to fill in: it builds `npm ci` +
   `npm run build` and runs `node .output/server/index.mjs`.
4. **Ports** — set _Ports Exposes_ to `3000`. The container already sets `HOST=0.0.0.0`.
5. **Domain** — add `https://www.crosslovemovement.org`, enable HTTPS. Coolify's Traefik forwards
   `X-Forwarded-Proto`, which Studio uses to build the OAuth callback URL.
6. **Environment variables** — see the table below.
7. **Auto deploy** — enable the GitHub webhook. This is not optional: Studio publishes by
   committing to `main`, and that commit is what triggers the rebuild that makes the edit public.
8. **Healthcheck** — the image defines a `HEALTHCHECK` against `/api/health`, which returns `503`
   when Postgres is unreachable. Point Coolify's own healthcheck at the same path.

**No persistent volume is needed.** The content database is generated during the build and shipped
read-only inside the image. Studio's drafts live in the editor's browser and are published to Git,
not to the container's disk. Postgres holds every operational record; back that up instead. Add a
volume only if you later switch media storage to a local disk driver.

**Environment variables** (Coolify → Configuration → Environment Variables):

| Variable                                | Required   | Value                                              |
| --------------------------------------- | ---------- | -------------------------------------------------- |
| `NUXT_PUBLIC_SITE_URL`                  | yes        | `https://www.crosslovemovement.org`                |
| `DATABASE_URL`                          | yes        | Internal Postgres URL from the Coolify service     |
| `NUXT_SESSION_PASSWORD`                 | yes        | 32+ random chars (`openssl rand -base64 32`)       |
| `SEED_SUPERADMIN_EMAIL`                 | first boot | Address that becomes the first superadmin          |
| `SEED_SUPERADMIN_NAME`                  | no         | Display name for that account                      |
| `NUXT_MAIL_TO`                          | yes        | Inbox that receives form submissions               |
| `NUXT_MAIL_FROM`                        | no         | `Cross-Love Movement <info@crosslovemovement.org>` |
| `NUXT_RESEND_API_KEY`                   | for mail   | Resend API key (omit to log to container)          |
| `NUXT_STUDIO_AUTH_GITHUB_CLIENT_ID`     | for CMS    | GitHub OAuth app client ID                         |
| `NUXT_STUDIO_AUTH_GITHUB_CLIENT_SECRET` | for CMS    | GitHub OAuth app secret                            |
| `NUXT_STUDIO_AUTH_GITHUB_MODERATORS`    | for CMS    | Comma-separated editor emails (allowlist)          |

Mark every secret as **Build Variable: no** — they are only read at runtime.

**Before the first deploy:** verify `crosslovemovement.org` in Resend. `NUXT_MAIL_FROM` must use a
verified domain or every transactional email (form notifications, event confirmations, invites,
password resets) is rejected. Set `NUXT_STUDIO_AUTH_GITHUB_MODERATORS` too — without it any GitHub
account that authorises the OAuth app can commit to `main`.

Set the GitHub OAuth app's callback URL to `https://www.crosslovemovement.org/__nuxt_studio/auth/github`.
If the domain ever changes, or if Coolify sits behind another proxy that rewrites `Host`, set
`NUXT_STUDIO_AUTH_GITHUB_REDIRECT_URL` to the same URL explicitly.

**Building without Docker** — if you prefer Coolify's Nixpacks build pack: build command
`npm ci && npm run build`, start command `node .output/server/index.mjs`, port `3000`. Pin the
Node version with `NIXPACKS_NODE_VERSION=24` so the `node:sqlite` import resolves.
