# WeDating

WeDating is a responsive dating application built with Next.js App Router and Supabase. It includes email and Google sign-in flows, member profiles, private photo storage, discovery, likes, text-only conversations, notifications, blocking, reports, and staff tools.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable/anon key.
3. Apply the SQL files in `supabase/migrations/` in filename order, or run the Supabase CLI migrations.
4. Configure Supabase Auth email confirmation, the Google provider, the local site URL (`http://localhost:3000`), and the `/auth/callback` redirect URL.
5. Start the app with `npm run dev`.

For local development only, set `SUPABASE_ENV=local`, `SUPABASE_SERVICE_ROLE_KEY`, and a unique `DEMO_USER_PASSWORD` in `.env.local`, then run `npm run seed:demo` against a local Supabase stack. The seeder refuses Vercel/production and non-local hosts; these accounts use reserved `.invalid` email addresses and are not intended for deployment.

Set `NEXT_PUBLIC_SITE_URL` to the canonical production URL in Vercel. Add `SUPABASE_SERVICE_ROLE_KEY` as a server-only Vercel environment variable only when enabling permanent account deletion from the admin panel. Never expose this key in browser code or a `NEXT_PUBLIC_` variable.

## Vercel deployment

Keep the current Vercel project connected to this repository and add the environment variables under that project's settings for each deployment environment. Add the production domain and preview URLs to Supabase Auth redirect allowlists. The Google OAuth callback registered with Google is `https://<project-ref>.supabase.co/auth/v1/callback`.

To bootstrap the first administrator, use the Supabase SQL Editor as the project owner and promote a verified account by its known user ID:

```sql
update public.profiles
set role = 'admin'
where id = '<verified-auth-user-uuid>';
```

## Checks

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Current limitations

The language selector contains all 61 languages in the supplied list (the request says 60, but enumerates 61). Arabic and English interface strings are translated; the remaining locales currently fall back to English. Complete human-reviewed translations are still needed before claiming full multilingual support. The legal pages are starter copy and need review for the operator's jurisdictions and contact details. Production authentication, Google OAuth, storage, and persistence require a configured Supabase project; this repository does not contain project credentials.