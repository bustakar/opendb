# OpenDB - Calisthenics Database

A community-driven, open-source database of calisthenics skills and training places with moderation tools.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

This is the **web** folder of the OpenDB monorepo. The database migrations are in `../supabase/`.

```
web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Auth pages
│   │   ├── api/          # API routes
│   │   └── dashboard/    # Main dashboard
│   ├── components/       # React components
│   └── lib/              # Utilities
└── public/               # Static assets
```

## Features

### For All Users

- **Browse Skills** - View all calisthenics skills with filters
- **Browse Places** - Find training locations near you
- **Submit Changes** - Propose new skills/places or edits
- **Track Submissions** - See status of your submissions
- **Upvote Places** - Vote for your favorite spots
- **View Audit Logs** - See complete change history

### For Admins

- **Direct Edit** - Modify skills/places without approval
- **Review Submissions** - Approve or reject user submissions
- **Manage Database** - Full CRUD access to all data

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run migrations in the Supabase SQL Editor (in order):

```
../supabase/migrations/
├── 001_profiles.sql
├── 002_skills.sql
├── 003_skill_relations.sql
├── 004_places.sql
├── 005_place_upvotes.sql
├── 006_submissions.sql
├── 007_audit_logs.sql
├── 008_rls_policies.sql
├── 009_audit_triggers.sql
└── 010_submission_functions.sql
```

3. Create an admin user:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Supabase Dashboard → Project Settings → API

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run type-check
```

## API Routes

All API routes are in `src/app/api/`:

- `/api/skills` - List/create skills
- `/api/skills/[id]` - Get/update/delete skill
- `/api/places` - List/create places
- `/api/places/[id]` - Get/update/delete place
- `/api/places/[id]/upvote` - Toggle upvote
- `/api/submissions` - List/create submissions
- `/api/submissions/[id]` - Update own pending submission
- `/api/admin/submissions/[id]/approve` - Approve submission
- `/api/admin/submissions/[id]/reject` - Reject submission
- `/api/admin/audit-logs` - View audit logs

## Dashboard

Single unified dashboard at `/dashboard` with 4 tabs:

1. **Skills** - Browse and view skills (admins can add)
2. **Places** - Browse and upvote places (admins can add)
3. **Submissions** - Track your submissions (admins see all)
4. **Audit Logs** - View complete change history

Content and permissions adapt based on user role.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Any platform that supports Next.js:

- Build command: `npm run build`
- Output directory: `.next`
- Node version: 18+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
