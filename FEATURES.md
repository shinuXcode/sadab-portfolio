# 29-feature checklist

1. Dashboard — CMS KPIs, storage status, publishing state, health and performance.
2. Draft/Publish — save draft, publish live, discard draft, schedule publish.
3. Revision history — automatic draft snapshots with restore-to-draft.
4. Project manager — rich project fields, tags, links, status, images and featured flag.
5. Lab manager — unfinished-project status, reason, next step, links and featured flag.
6. Gallery — Google Drive file IDs, alt text, captions, visibility and lazy-loaded lightbox.
7. Homepage editor — hero, CTAs, availability and announcement.
8. SEO editor — title, description, keywords, canonical base and OG image.
9. Preview mode — draft preview route opened from Control Room.
10. Backup/restore — automatic pre-publish backups plus manual backups and live/draft restore.
11. Site health — CMS connection state, runtime mode and basic performance readout.
12. AI guide — local intent-based portfolio guide; no paid AI API required.
13. Command palette — Ctrl/Cmd + K navigation/search.
14. GitHub integration — public profile stats from GitHub API.
15. Loading/skeleton — lightweight boot screen and lazy route skeletons.
16. Interactive terminal — Ctrl/Cmd + ` with safe navigation commands.
17. Now page — editable current learning/building/exploring status.
18. GitHub activity signal — repositories/followers/following card.
19. Contact system — messages saved to the Drive CMS inbox; no database required.
20. Global site settings — feature toggles, maintenance mode, profile, theme-related settings.
21. Image manager — Drive-backed gallery metadata and secure production proxy.
22. Accessibility — semantic labels, keyboard controls, focus styles and reduced-motion handling.
23. Anonymous analytics — route + timestamp only, stored in Drive CMS.
24. Scheduled publishing — Vercel Cron triggers due draft publication.
25. Easter eggs — terminal commands and hidden interaction hooks.
26. Guestbook — public entries stored in Drive CMS with a honeypot.
27. Secret terminal commands — `sudo`, `clear`, navigation commands and more.
28. Experimental themes — multiple existing visual themes plus reduced-motion compatibility.
29. Hidden Lab — Lab is a separate experimental area and supports unfinished/abandoned builds.

## Added in this update

30. Login brute-force lockout — 5 failed Control Room login attempts locks access for 5 minutes, doubling on repeat lockouts (capped at 1 hour). Visible live in Security tab.
31. Contact form rate limiting — per-IP throttle (3/min) layered on top of the existing honeypot, plus real email format validation.
32. Hardened HTTP headers — Content-Security-Policy, X-Frame-Options, and Strict-Transport-Security added in `vercel.json`.
33. RSS feed — `/api/feed` now actually exists (index.html was already linking to it) and generates a live feed from published projects + lab items.
34. Immutable gallery image caching — Drive-proxied images now cache for up to a year since each file id is content-stable, cutting repeat load time.
35. Vendor chunk splitting — React/React-DOM/Router are bundled into a separate cached chunk so page updates don't force a full re-download.
36. 3 new themes — Blueprint Draft (light, technical), Deep Nebula (dark violet), Paper Mono (minimal print-style) — 14 themes total.
37. 7-day visit trend chart — Analytics tab in Control Room now shows a small daily bar chart, not just totals.
38. Security tab lockout readout — shows live lock state, failed attempt count, and last password-change time.
