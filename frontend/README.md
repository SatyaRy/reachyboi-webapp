# Forex Education Web App

A modern full-stack education platform built with **Next.js 14** (App Router) and **Supabase** for learning forex trading concepts through video content.

## 🔐 Custom Authentication System

This platform features a **custom authentication system** with admin-controlled access:

- **Admin Users**: Sign in with email + password (Supabase Auth)
- **Regular Users**: Sign in with email + Exness Account ID (no password)
- **Excel Upload**: Admins upload Excel files to manage authorized users
- **Secure Access**: No public signup - all access controlled by admin

**Default Admin Credentials:**

- Email: `admin@example.com`
- Password: `admin123`

📖 **See detailed setup guide:** [CUSTOM_AUTH_SETUP.md](./CUSTOM_AUTH_SETUP.md)

## 🎯 Features

- **Video Categories**: Browse educational videos organized by SMC (Smart Money Concepts), Price Action, and Trendlines
- **Video Player**: Watch videos with a clean, responsive player interface
- **Search Functionality**: Find videos by title or description
- **Custom Authentication**: Admin-managed user authorization with Excel uploads
- **Admin Dashboard**: Upload videos and manage authorized users
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## 🧱 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Video Player**: React Player
- **State Management**: Zustand (optional)

## 📦 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── categories/         # Category endpoints
│   │   │   ├── videos/             # Video endpoints
│   │   │   └── upload/             # File upload endpoint
│   │   ├── admin/
│   │   │   └── upload/             # Admin upload page
│   │   ├── category/[slug]/        # Category videos page
│   │   ├── video/[id]/             # Video player page
│   │   ├── search/                 # Search results page
│   │   ├── login/                  # Login page
│   │   ├── signup/                 # Signup page
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Homepage
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── CategoryGrid.tsx        # Category listing
│   │   ├── VideoGrid.tsx           # Video listing
│   │   ├── VideoPlayer.tsx         # Video player component
│   │   ├── SearchResults.tsx       # Search results
│   │   └── Navbar.tsx              # Navigation bar
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client (browser)
│   │   ├── supabase-server.ts      # Supabase client (server)
│   │   ├── supabase-middleware.ts  # Auth middleware
│   │   └── api.ts                  # API utility functions
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   └── middleware.ts               # Next.js middleware
├── supabase/
│   ├── schema.sql                  # Database schema
│   └── storage.sql                 # Storage bucket setup
├── public/                         # Static assets
├── .env.example                    # Environment variables template
├── next.config.mjs                 # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
└── package.json                    # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))
- npm or yarn package manager

### 1. Clone the Repository

```bash
cd /Users/user/Documents/side-project/forex-webapp/frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - `anon` public key

### 4. Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the schema file located at `supabase/schema.sql`
4. Run the storage setup file at `supabase/storage.sql`

This will create:

- `categories` table
- `videos` table
- Storage bucket for videos
- Row Level Security policies
- Seed data (3 categories + 6 example videos)

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### Categories Table

| Column      | Type      | Description            |
| ----------- | --------- | ---------------------- |
| id          | UUID      | Primary key            |
| name        | TEXT      | Category name (unique) |
| description | TEXT      | Category description   |
| created_at  | TIMESTAMP | Creation timestamp     |

### Videos Table

| Column        | Type      | Description                    |
| ------------- | --------- | ------------------------------ |
| id            | UUID      | Primary key                    |
| title         | TEXT      | Video title                    |
| description   | TEXT      | Video description              |
| category_id   | UUID      | Foreign key to categories      |
| video_url     | TEXT      | Video URL (Storage or YouTube) |
| thumbnail_url | TEXT      | Thumbnail URL                  |
| created_at    | TIMESTAMP | Creation timestamp             |

## 🔐 Authentication

The app uses **Supabase Auth** for user authentication:

- **Sign Up**: Create a new account at `/signup`
- **Login**: Sign in at `/login`
- **Protected Routes**: Admin upload page requires authentication
- **Session Management**: Handled automatically by Supabase

## 📤 Uploading Videos

### For Authenticated Users:

1. Login to your account
2. Navigate to `/admin/upload`
3. Fill in video details:
   - Title
   - Description
   - Category
   - Video file (uploads to Supabase Storage)
   - Thumbnail image
4. Click "Upload Video"

### Using YouTube Links:

You can also use YouTube video URLs instead of uploading files:

- Set `video_url` to the YouTube URL
- Set `thumbnail_url` to the YouTube thumbnail URL

## 🎨 Customization

### Tailwind Theme

Edit `tailwind.config.ts` to customize colors:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      },
    },
  },
},
```

### Adding New Categories

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO categories (name, description)
VALUES ('Your Category', 'Category description');
```

## 📝 API Endpoints

### Categories

- `GET /api/categories` - List all categories
- `GET /api/categories/[id]` - Get single category

### Videos

- `GET /api/videos` - List all videos
- `GET /api/videos?category=[id]` - Filter by category
- `GET /api/videos?q=[query]` - Search videos
- `GET /api/videos/[id]` - Get single video
- `POST /api/videos` - Create video (auth required)
- `DELETE /api/videos/[id]` - Delete video (auth required)

### Upload

- `POST /api/upload` - Upload file to Supabase Storage (auth required)

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- Public read access for categories and videos
- Authenticated users can create/update/delete content
- Storage bucket has appropriate access policies

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Production

Make sure to add these in your hosting platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🧪 Seed Data

The project includes seed data for:

- **3 Categories**: SMC, Price Action, Trendline
- **6 Sample Videos**: 2 videos per category

To use your own videos:

1. Upload videos through the admin dashboard, or
2. Update the seed data in `supabase/schema.sql`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🆘 Troubleshooting

### Videos not loading?

- Check that your Supabase URL and keys are correct
- Verify the storage bucket is public
- Check browser console for errors

### Authentication not working?

- Ensure email confirmation is disabled in Supabase (for development)
- Check that RLS policies are correctly set up

### Upload failing?

- Verify storage bucket exists and has correct policies
- Check file size limits in Supabase dashboard
- Ensure user is authenticated

## 📧 Support

For issues or questions:

- Check the [Supabase documentation](https://supabase.com/docs)
- Review [Next.js documentation](https://nextjs.org/docs)
- Open an issue in the repository

---

Built with ❤️ using Next.js and Supabase
