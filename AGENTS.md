# Repository Guidance

## Project
- WeDating is a Next.js App Router application intended for deployment on Vercel.
- Supabase provides authentication, PostgreSQL, and private photo storage. Schema and row-level access policies live in `supabase/migrations/`.

## Working in this repository
- Keep changes focused on the user's request and preserve existing behavior and public interfaces.
- Keep Supabase service-role credentials server-only; never prefix them with `NEXT_PUBLIC_` or expose them to client components.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` after meaningful changes.
- Do not add media or file attachments to direct messages; messages are text and emoji only.