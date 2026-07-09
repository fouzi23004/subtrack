# Changelog

## 2026-07-09

- Fixed the dashboard "Prochains renouvellements" list: it now shows each subscription's real end date and drops expired subscriptions, instead of rolling past dates forward to next year.
- Reworked both renewal modals (Entreprises page and calendar day view): instead of picking a date, you now enter a duration (years + months, default 1 year / 0 months) added to the current end date, with a live preview of the new expiration date. Renewal is blocked at 0 years + 0 months.
- Configured Serena and Context7 MCP servers for this project (tooling for code navigation and up-to-date library docs).
- Onboarded Serena project memory: core architecture, tech stack, commands, conventions, task-completion checklist and email-notification domain notes (stored machine-locally under `.serena/`, not committed).
- Added `CLAUDE.md` at the project root with standing instructions for AI-assisted work (Context7 for library docs, frontend-design plugin for UI work).
- Replaced the leftover AI Studio README with real project documentation (features, stack, local setup, scripts, deployment notes).
- Documented `APP_URL` in `.env.example` and started this changelog.
- Bumped version to 0.1.0 (first tagged release).
