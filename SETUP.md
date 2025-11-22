# 🎓 Forex Education Web App - Setup Guide

Complete step-by-step guide to get your education platform running.

## 📋 Prerequisites

Before you begin, make sure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **npm** or **yarn** package manager
- [ ] A **Supabase** account ([Sign up free](https://supabase.com))
- [ ] A code editor (VS Code recommended)
- [ ] Basic knowledge of React/Next.js

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

Wait for all dependencies to install. This may take a few minutes.

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: forex-education-app
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait for project to be provisioned (1-2 minutes)

### Step 3: Get Supabase Credentials

1. In your Supabase dashboard, click **Settings** (gear icon)
2. Go to **API** section
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 4: Setup Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `frontend/supabase/schema.sql` in your code editor
4. Copy all the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
7. You should see "Success. No rows returned"

This creates:

- ✅ categories table
- ✅ videos table
- ✅ Row Level Security policies
- ✅ 3 seed categories (SMC, Price Action, Trendline)
- ✅ 6 seed videos (2 per category)

### Step 5: Setup Storage Bucket

1. Still in Supabase, open a new SQL query
2. Open `frontend/supabase/storage.sql`
3. Copy and paste the SQL
4. Click **Run**

This creates:

- ✅ "videos" storage bucket
- ✅ Storage policies for uploads

Alternatively, you can create the bucket manually:

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `videos`
4. Make it **Public**
5. Click **Create bucket**

### Step 6: Configure Environment Variables

1. In your project's `frontend/` directory, copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in your editor

3. Replace the placeholders with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. Save the file

⚠️ **Important**: Never commit `.env.local` to version control!

### Step 7: Run the Development Server

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
```

### Step 8: Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see:

   - ✅ Homepage with "Master Forex Trading" heading
   - ✅ 3 category cards (SMC, Price Action, Trendline)
   - ✅ Navigation bar with search and auth buttons

3. Click on a category:

   - ✅ Should see 2 videos in that category

4. Click on a video:

   - ✅ Video player page should load
   - ✅ Video details displayed

5. Try the search:
   - ✅ Type "trendline" in search bar
   - ✅ Should see relevant videos

### Step 9: Test Authentication

1. Click **Sign Up** in navbar
2. Create a test account:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. Click **Sign up**

**Note**: By default, Supabase requires email confirmation. To disable for development:

1. Go to **Authentication** → **Settings** in Supabase
2. Turn OFF "Enable email confirmations"
3. Click **Save**

4. Now login with your test account
5. You should see **Upload** and **Logout** buttons in navbar

### Step 10: Test Video Upload

1. While logged in, click **Upload** in navbar
2. You'll be on `/admin/upload` page
3. Fill in the form:
   - **Title**: My Test Video
   - **Description**: Testing upload functionality
   - **Category**: Select one from dropdown
   - **Video File**: Choose a video file (or skip for now)
   - **Thumbnail**: Choose an image file (or skip for now)

**Alternative for testing without files:**
You can manually insert a video using YouTube:

1. Go to Supabase **SQL Editor**
2. Run:
   ```sql
   INSERT INTO videos (title, description, category_id, video_url, thumbnail_url)
   SELECT
     'My Test Video',
     'A test video from YouTube',
     (SELECT id FROM categories WHERE name = 'SMC'),
     'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
     'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';
   ```

## ✅ Verification Checklist

Check off each item as you verify it works:

- [ ] Homepage loads without errors
- [ ] All 3 categories are displayed
- [ ] Clicking a category shows its videos
- [ ] Clicking a video opens the player page
- [ ] Search functionality works
- [ ] Sign up page loads
- [ ] Login page loads
- [ ] Can create an account
- [ ] Can login successfully
- [ ] Upload page is accessible when logged in
- [ ] Can logout

## 🎯 Next Steps

### Add Your Own Content

1. **Create more categories:**

   ```sql
   INSERT INTO categories (name, description)
   VALUES ('Risk Management', 'Learn how to manage trading risk');
   ```

2. **Upload real videos:**

   - Use the `/admin/upload` page
   - Or upload to Supabase Storage manually

3. **Customize the design:**
   - Edit `frontend/tailwind.config.ts` for colors
   - Modify components in `frontend/src/components/`

### Deploy to Production

See the **Deployment** section in `README.md`

## 🐛 Troubleshooting

### Issue: Categories not showing

**Solution:**

- Check browser console for errors
- Verify `.env.local` has correct Supabase URL
- Run schema.sql again in Supabase

### Issue: "Failed to fetch categories"

**Solution:**

- Check Supabase project is running
- Verify API keys are correct
- Check RLS policies are set (run schema.sql)

### Issue: Videos not playing

**Solution:**

- If using YouTube: URL must be valid YouTube link
- If using Supabase Storage: File must be in `videos` bucket
- Check storage bucket is public

### Issue: Can't login after signup

**Solution:**

- Check email confirmation is disabled (see Step 9)
- Check spam folder for confirmation email
- Verify user exists in Supabase **Authentication** tab

### Issue: Upload fails

**Solution:**

- Verify you're logged in
- Check storage bucket exists and is public
- Check file size (default limit is 50MB)
- Run storage.sql to set up policies

### Issue: "Cannot find module" errors

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
```

## 🆘 Still Having Issues?

1. Check the error message in browser console (F12)
2. Check Supabase logs in dashboard
3. Review the full README.md
4. Search for similar issues online

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Player Docs](https://github.com/CookPete/react-player)

---

**Congratulations!** 🎉 Your education platform is now set up and running!
