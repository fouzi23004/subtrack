# Changelog

## 2026-07-10

- New feature: puce plans ("forfaits") — new `puce_plans` table (seeded with simple / gold / 2025), a Forfaits page for CRUD, and a required Forfait select on licence+puce subscriptions. Renaming a plan cascades to existing subscriptions; deleting one keeps the historical label.
- Phone numbers on licence+puce subscriptions: dynamic list in the subscription modal capped at the puce quantity, count badge on the entreprise card, plan shown in the calendar day view. Server-side validation (plan required and must exist, phone numbers capped) returns proper 400s; renewals copy plan and phone numbers.
- Navigation redesign: replaced the horizontal top nav and mobile bottom tab bar with a fixed vertical sidebar (collapsible to icon-only, state persisted) plus a mobile top bar with a slide-in drawer.
- Dashboard: replaced the "Aujourd'hui" panel with a mini month calendar (renewal-day dots, today highlight, month count badge, click-through to the calendar day/month views).
- UI polish: swapped the editorial type colors (licence = green, puce orange = orange) across the dashboard, entreprise cards and mini calendar; subscription modal now scrolls internally so the save button stays reachable; fixed the Entreprises page panel height after the header removal.
- Cleanup: removed the dead AI Studio scaffold (`firebase.json`, `metadata.json`, unused `@google/genai` dependency).
- Bumped version to 0.2.0.

## 2026-07-09

- Fixed the dashboard "Prochains renouvellements" list: it now shows each subscription's real end date and drops expired subscriptions, instead of rolling past dates forward to next year.
- Reworked both renewal modals (Entreprises page and calendar day view): instead of picking a date, you now enter a duration (years + months, default 1 year / 0 months) added to the current end date, with a live preview of the new expiration date. Renewal is blocked at 0 years + 0 months.
- Configured Serena and Context7 MCP servers for this project (tooling for code navigation and up-to-date library docs).
- Onboarded Serena project memory: core architecture, tech stack, commands, conventions, task-completion checklist and email-notification domain notes (stored machine-locally under `.serena/`, not committed).
- Added `CLAUDE.md` at the project root with standing instructions for AI-assisted work (Context7 for library docs, frontend-design plugin for UI work).
- Replaced the leftover AI Studio README with real project documentation (features, stack, local setup, scripts, deployment notes).
- Documented `APP_URL` in `.env.example` and started this changelog.
- Bumped version to 0.1.0 (first tagged release).
