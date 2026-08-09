# Sadab.dev — Portfolio + Control Room

A performance-first React portfolio with a Google-Drive-backed CMS. No SQL database and no dedicated server are required. In production, Vercel serverless functions execute the secure API while Google Drive stores the CMS JSON and media.

## Included

- Fast boot screen + route skeletons + reduced-motion support
- Home, About, Projects, Skills, Lab, Now, Contact, Guestbook
- Lab gallery using Google Drive file IDs
- Project and lab managers
- Draft vs published content
- Preview-friendly CMS workflow, automatic pre-publish backups, revisions and restore
- Homepage, SEO, social, profile and global settings editors
- Anonymous analytics stored in the CMS JSON
- Private contact inbox and guestbook moderation data in the CMS JSON
- GitHub public-profile integration
- Command palette: Ctrl/Cmd + K
- Developer terminal: Ctrl/Cmd + `
- Easter eggs and safe demo commands
- Custom 404/runtime errors
- Maintenance mode
- Scheduled publishing through Vercel Cron
- Password hashing, sessions, password change/reset and audit logs
- No public Control Room link; /control-room is noindex/nofollow

## Storage model

Production storage is one Google Drive JSON file: `sadab-portfolio-cms.json`. Backups, drafts, published content, audit history, guestbook entries and contact inbox entries live in that file. Gallery images stay in Google Drive.

Vercel is only the execution layer for the API; it is not a separate server you have to maintain.

## Local development

The Vite config includes a local API adapter. You do NOT need Google Drive credentials to test the Control Room locally.

1. Create `.env.local` beside `package.json`:

```env
ADMIN_INITIAL_PASSWORD=your-test-password-10-chars
ADMIN_SESSION_SECRET=long-random-local-secret
ADMIN_EMAIL=mrsadabflight@gmail.com
CMS_STORAGE=local
```

2. Run:

```bash
npm install
npm run dev
```

3. Open:

`http://localhost:5173/control-room`

Local CMS data is created in `.local-cms/cms.json` and is ignored by Git.

## Production environment

Set these once in Vercel Environment Variables:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_DRIVE_FOLDER_ID` or `GOOGLE_DRIVE_FILE_ID`
- `ADMIN_INITIAL_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `ADMIN_EMAIL`
- `SITE_URL`
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for real email password recovery
- `CRON_SECRET` (recommended)

After the first successful login, change the admin password from Control Room. The initial password is then no longer used.

## Important

Google Drive is the CMS/media store. Email recovery still needs an email delivery provider; the included implementation uses Resend because Google Drive cannot send password-reset emails by itself.

Never commit `.env.local`, Google private keys, API keys or production passwords.

## Control Room visibility

The public navbar/footer do not expose `/control-room`. The route is marked `noindex,nofollow,noarchive`, and server endpoints still require an authenticated session. Security comes from authentication; hiding the link is only an additional layer.
