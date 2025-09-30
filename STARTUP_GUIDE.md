# 🚀 OpenDB - Startup Guide

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- A **Supabase** account ([Sign up free](https://supabase.com))
- **Git** installed
- A code editor (VS Code recommended)

## Step 1: Set Up Supabase Project

### 1.1 Create a New Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `opendb` (or anything you like)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes for setup to complete

### 1.2 Run Database Migrations

Once your project is ready:

1. Go to **SQL Editor** in the left sidebar
2. Run each migration file **in order** (001 → 010):

```bash
# Copy contents from each file and run in SQL Editor:
supabase/migrations/001_profiles.sql
supabase/migrations/002_skills.sql
supabase/migrations/003_skill_relations.sql
supabase/migrations/004_places.sql
supabase/migrations/005_place_upvotes.sql
supabase/migrations/006_submissions.sql
supabase/migrations/007_audit_logs.sql
supabase/migrations/008_rls_policies.sql
supabase/migrations/009_audit_triggers.sql
supabase/migrations/010_submission_functions.sql
```

**Tip**: Click **"New Query"** → Paste file contents → Click **"Run"** → Repeat for each file

### 1.3 Get API Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **"API"** tab
3. Copy these values (you'll need them next):
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (long string)

## Step 2: Set Up the Web App

### 2.1 Navigate to Web Folder

```bash
cd /Users/karelbusta/Dev/projects/opendb/web
```

### 2.2 Install Dependencies

```bash
npm install
```

This will take ~1-2 minutes.

### 2.3 Configure Environment Variables

1. Create `.env.local` file:

```bash
touch .env.local
```

2. Open `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

**Replace** with your actual values from Step 1.3!

### 2.4 Start the Development Server

```bash
npm run dev
```

You should see:

```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Ready in 2.3s
```

## Step 3: Create Your First User

### 3.1 Sign Up

1. Open **http://localhost:3000** in your browser
2. Click **"Sign Up"**
3. Enter:
   - **Email**: your email
   - **Password**: secure password
4. Click **"Sign Up"**
5. You'll be redirected to the login page

### 3.2 Verify Email (if needed)

Check your email for a verification link from Supabase. Click it to verify.

### 3.3 Make Yourself Admin

1. Go back to **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace with your email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

3. Click **"Run"**
4. You should see: `Success. Rows affected: 1`

## Step 4: Test the Application

### 4.1 Login

1. Go to **http://localhost:3000**
2. Click **"Login"**
3. Enter your email and password
4. Click **"Sign In"**

### 4.2 Verify Admin Status

You should see in the navbar:

- Your email with a dropdown
- Click it → Should show **"Admin"** label

### 4.3 Test Creating a Skill

1. Click **"Dashboard"** in navbar
2. Click **"Skills"** tab
3. Click **"Add Skill"** button (you're admin!)
4. Fill in the form:
   - **Title**: "Pull Up"
   - **Description**: "Hang from a bar and pull yourself up"
   - **Level**: Beginner
   - **Difficulty**: 5
   - **Muscle Groups**: Select "back", "biceps", "core"
   - **Equipment**: Select "pull_up_bar"
   - **Video URLs**: (optional) Add YouTube link
5. Click **"Create"**
6. ✅ You should see a toast: "Skill created"
7. ✅ Skill appears in the table immediately

### 4.4 Test Creating a Place

1. Click **"Places"** tab
2. Click **"Add Place"** button
3. Fill in the form:
   - **Name**: "Central Park Workout Area"
   - **Description**: "Great outdoor spot with bars and rings"
   - **Location**: "New York, NY"
   - **Address**: "Central Park, New York, NY 10024"
   - **Latitude**: 40.7829
   - **Longitude**: -73.9654
   - **Amenities**: Select "outdoor", "free"
   - **Equipment**: Select "pull_up_bar", "dip_bars"
4. Click **"Create"**
5. ✅ Place appears in the table

### 4.5 Test Search & Filters

**Skills Tab:**

- Try typing in the search bar
- Change level filter
- Adjust difficulty range

**Places Tab:**

- Search for places
- Filter by location

### 4.6 Test Audit Logs

1. Click **"Audit Logs"** tab
2. ✅ You should see your create actions logged
3. Try filtering by entity type and action

## Step 5: Test User Workflow (Optional)

### 5.1 Create a Regular User

1. Open an **incognito/private window**
2. Go to **http://localhost:3000**
3. Sign up with a different email
4. Login with that account

### 5.2 Submit a Skill

1. Go to **Dashboard** → **Skills**
2. Click **"Submit Skill"** (not "Add" - you're not admin)
3. Fill the form
4. Click **"Submit"**
5. ✅ See toast: "Submission created"

### 5.3 View Your Submission

1. Click **"Submissions"** tab
2. ✅ See your submission with **"pending"** status
3. You can only see YOUR submissions

### 5.4 Approve as Admin

1. Switch back to your admin window
2. Go to **Dashboard** → **Submissions**
3. ✅ See ALL submissions (including user's)
4. Click **"Review"** on the pending submission
5. Click **"Approve"**
6. ✅ See toast: "Submission approved"
7. Go to **Skills** tab
8. ✅ See the new skill in the table

## 🎯 Quick Reference Commands

```bash
# Navigate to project
cd /Users/karelbusta/Dev/projects/opendb/web

# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Check for linting errors
npm run lint

# Run type checking
npm run type-check
```

## 🔧 Troubleshooting

### "Invalid JWT" or "Unauthorized" errors

**Fix**: Check your `.env.local` file:

- Make sure URL and key are correct
- No extra spaces
- Restart dev server after changing env vars

### "Relation does not exist" error

**Fix**: Run all migrations in Supabase SQL Editor

### Can't login after signup

**Fix**: Check if email verification is required:

1. Supabase Dashboard → **Authentication** → **Providers**
2. Scroll to **Email**
3. Disable **"Confirm email"** for development
4. Try signing up again

### "Failed to fetch" errors

**Fix**:

1. Check if dev server is running (`npm run dev`)
2. Check if Supabase project is online
3. Check browser console for CORS errors

### Styles not loading

**Fix**: Clear Next.js cache:

```bash
rm -rf .next
npm run dev
```

## 🌐 Deploy to Production

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"Import Project"**
4. Select your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**
7. Done! You'll get a URL like `opendb.vercel.app`

### Option 2: Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your repository
5. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Add environment variables (same as Vercel)
7. Click **"Deploy"**

## 📱 Access URLs

- **Local**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard
- **API Docs**: Your Supabase Project → **API Docs**

## 🎓 Next Steps

Now that your app is running:

1. **Add more content**: Create skills and places
2. **Invite users**: Share the URL
3. **Monitor submissions**: Check the Submissions tab regularly
4. **Review logs**: Use Audit Logs to track changes
5. **Customize**: Modify styles, add features

## 📚 Key Files to Know

```
/opendb/
├── supabase/migrations/     # Database schema
├── web/
│   ├── .env.local          # Your API keys (DON'T commit!)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── dashboard/         # Main dashboard
│   │   │   └── api/               # API routes
│   │   ├── components/
│   │   │   ├── forms/             # Create/edit forms
│   │   │   └── dashboard/         # Tab components
│   │   └── lib/
│   │       ├── supabase/          # Supabase clients
│   │       └── constants.ts       # Enums & constants
│   └── package.json
├── README.md
└── STARTUP_GUIDE.md        # This file
```

## 💡 Pro Tips

1. **Use Chrome DevTools**: Open with F12 to see network requests and errors
2. **Check Supabase Logs**: Dashboard → **Logs** to debug API issues
3. **Hot reload**: Save any file to see changes instantly
4. **ESLint**: VS Code will show errors in real-time
5. **Supabase Studio**: Browse data directly in Supabase Dashboard → **Table Editor**

## ✅ Checklist

Before you start developing:

- [ ] Supabase project created
- [ ] All 10 migrations run successfully
- [ ] `.env.local` file created with correct values
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Signed up and logged in
- [ ] Admin role set for your user
- [ ] Created at least one skill
- [ ] Created at least one place
- [ ] Checked audit logs

## 🆘 Need Help?

- **Database issues**: Check Supabase Dashboard → **Logs**
- **API errors**: Check browser console (F12)
- **Build errors**: Read terminal output carefully
- **General questions**: Check README.md and FEATURES.md

---

**You're all set!** Enjoy building with OpenDB 🎉
