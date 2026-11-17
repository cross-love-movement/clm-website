# Privacy and data retention — working draft

**Status: engineering draft, not legal advice.** This document records what the
website collects, where it goes, and the retention schedule the code is ready to
enforce. The public privacy notice should only be published after the
organisation and its legal adviser approve the wording and the retention
periods. Nothing here creates a legal commitment on its own.

Cross-Love Movement Limited By Guarantee is the data controller for the records
described below. Contact: `info@crosslovemovement.org`.

## What is collected

| Data                                                                                                                                                                                    | Where it is stored                                | Why                                                                    | Proposed retention                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Event registrations: name, email, phone, party size, notes, consent time, check-in time                                                                                                 | Postgres (`event_registrations`)                  | Run the event, manage capacity and the waitlist, safety and attendance | 24 months after the event, then delete or anonymise                 |
| Volunteer profile: name, email, phone, city, skills, availability, experience, date of birth, emergency contact, safeguarding consent/briefing, background-check status, internal notes | Postgres (`volunteers`, `volunteer_applications`) | Volunteer management and safeguarding                                  | 24 months after last activity; safeguarding records may need longer |
| Placements: programme/event, role, dates, notes                                                                                                                                         | Postgres (`volunteer_assignments`)                | Coordinate service and keep a history                                  | With the volunteer record                                           |
| Newsletter: email, source, status, per-subscriber unsubscribe token                                                                                                                     | Postgres (`newsletter_subscribers`)               | Send the list and honour opt-outs                                      | Until unsubscribe + 30 days, then delete or anonymise               |
| Donations: name, email, phone, amount, note, Paystack reference and response payload, receipt timestamps                                                                                | Postgres (`donations`); Paystack                  | Process gifts, issue receipts, reconcile and account for funds         | 7 years (financial records)                                         |
| Chart of monthly plan codes                                                                                                                                                             | Postgres (`donation_plans`)                       | Reuse a Paystack plan per amount                                       | While the plan is in use                                            |
| Staff and volunteer accounts: email, name, role, permissions, password hash, login timestamps                                                                                           | Postgres (`users`)                                | Access control and accountability                                      | Life of the account + 30 days                                       |
| Invite/reset tokens: hashed token, expiry, use time                                                                                                                                     | Postgres (`auth_tokens`)                          | Set a password or reset one                                            | 30 days after use or expiry                                         |
| Mail outbox: recipient, reply-to, subject, body, template variables, attempts, last error                                                                                               | Postgres (`mail_outbox`)                          | Deliver and retry transactional mail                                   | 90 days after sent/failed                                           |
| Contact and partnership messages                                                                                                                                                        | The receiving mailbox and Resend                  | Answer the enquiry                                                     | Per mailbox policy; not stored in Postgres                          |
| Server logs                                                                                                                                                                             | Coolify/host, Resend, Paystack                    | Operate and secure the service                                         | 30 days where configurable                                          |

The site does **not** store card or mobile-money credentials. Paystack hosts the
checkout and handles those details. There is currently no analytics or
advertising tracker on the site.

## Processors and third parties

| Provider                   | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| Paystack                   | Payment checkout, verification, plans, settlement |
| Resend                     | Transactional email delivery                      |
| Cloudflare                 | DNS, R2 asset storage, Email Routing, CDN         |
| Coolify / hosting provider | Application runtime and Postgres                  |
| GitHub                     | Source code and Nuxt Studio content commits       |

Each processor has its own retention and security terms. Review them before
publishing the public notice.

## Retention tool

`npm run privacy:prune` is a dry run by default. It reports counts for the
schedule above and deletes only two unambiguous internal sets when run with
`--confirm`:

- auth tokens that are used or expired and older than 30 days;
- `mail_outbox` rows that are sent or failed and older than 90 days.

Registrations, volunteers, donations, and subscribers are **reported but never
deleted automatically**. Deleting financial or safeguarding records needs a
signed-off schedule; donations in particular may need to be retained for
accounting.

Suggested cadence: run the dry run monthly, review the report, and run
`--confirm` only when the schedule has been approved.

## Subject requests

People may ask for a copy, correction, or deletion of their data, or withdraw
consent, by emailing `info@crosslovemovement.org`. Verify the requester's
identity before acting. Some records may need to be kept for financial,
safeguarding, or legal reasons even after a deletion request; explain that in
the response.

## Security measures in the app

- Passwords hashed with scrypt; tokens stored as SHA-256 hashes and single-use.
- Sealed, signed session cookies; accounts re-read from Postgres on each request
  so suspension takes effect immediately.
- Role- and permission-based access to the staff portal, enforced in middleware
  and again in every admin API route.
- Payment amounts and references are server-owned; Paystack signatures are
  verified with HMAC-SHA512.
- Public forms validate input, use a honeypot, and are rate-limited.
- Admin pages are `noindex`.

## Decisions still needed before a public notice

1. Approve the retention periods above, especially for safeguarding and donor
   records.
2. Confirm the legal basis for each purpose and the wording of the public
   notice.
3. Decide whether deletions should remove rows or anonymise them.
4. Confirm the mailbox and Resend log retention.
5. Add the public privacy page and link it in the footer once approved.

Until then, keep this file internal and do not link a public privacy page to it.
