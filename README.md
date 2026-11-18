# Marine Supply

A Next.js, Tailwind CSS and Supabase website for marine equipment order requests and seller administration.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and enter your Supabase and Resend credentials.
3. In Supabase SQL Editor, run the migration in `supabase/migrations/202611180001_initial_schema.sql`.
4. Create the `product-images` Storage bucket if it was not created by the migration.
5. Start locally:
   ```bash
   npm run dev
   ```

The public site includes demonstration products when Supabase is not configured. Production catalog and order operations use the configured Supabase database.

## Supabase configuration

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Never expose the service-role key to browser code.

Create an admin in Supabase Authentication, then authorize that user by inserting its UUID and email:

```sql
insert into public.admin_users (user_id, email)
values ('AUTH_USER_UUID', 'admin@example.com');
```

Only users in `admin_users` receive admin access. Public sign-up does not add them automatically.

## Email

Set `RESEND_API_KEY`, `EMAIL_FROM` and `SELLER_EMAIL`. Verify the sender domain in Resend. Orders are saved before email delivery; missing credentials are reported honestly and the order remains saved.

## Storage

Use the public `product-images` Supabase bucket. Uploading is restricted to authorized admins by migration policies. Confirm allowed MIME types and file size limits in the Storage dashboard before production use.

## Deployment

Deploy the Next.js application to Vercel or another Node host. Configure all environment variables from `.env.example`, apply the Supabase migration, configure Auth redirect URLs, and verify the production site URL.
