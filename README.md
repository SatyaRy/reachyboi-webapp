# Forex Education Web App - Complete Project

A modern, full-stack educational platform for learning forex trading through video content. Built with Next.js 14 and Supabase.

## 🎯 Project Overview

This application allows users to:

- Browse educational videos organized by trading concepts (SMC, Price Action, Trendlines)
- Search for specific topics
- Watch videos with an embedded player
- Sign up and authenticate
- Upload new educational content (for authenticated users)

## 📁 Project Structure

```
forex-webapp/
├── frontend/              # Next.js 14 Application
│   ├── src/
│   │   ├── app/          # App Router pages & API routes
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & Supabase clients
│   │   └── types/        # TypeScript definitions
│   ├── supabase/         # Database schema & migrations
│   └── public/           # Static assets
│
└── backend/              # (Legacy NestJS - Not used in final version)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- npm or yarn

### Setup Instructions

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Supabase:**

   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL from `frontend/supabase/schema.sql`
   - Run the SQL from `frontend/supabase/storage.sql`

4. **Configure environment:**

   ```bash
   cp .env.example .env.local
   ```

   Add your Supabase credentials to `.env.local`

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧱 Technology Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Video Player**: React Player
- **State**: Zustand (optional)

### Backend (Supabase)

- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

## 📚 Features

### ✅ Implemented

- **Video Categories**: Browse by SMC, Price Action, Trendline
- **Video Playback**: Embedded video player with controls
- **Search**: Find videos by title or description
- **Authentication**: Sign up, login, session management
- **Admin Upload**: Upload videos and thumbnails
- **Responsive Design**: Mobile-friendly UI
- **API Routes**: RESTful endpoints for data
- **RLS Security**: Row-level security on database
- **File Upload**: Direct upload to Supabase Storage

### 🔮 Optional Enhancements

- **Dark Mode**: Light/dark theme toggle
- **Watch History**: Track viewed videos per user
- **Likes/Favorites**: Save favorite videos
- **Comments**: Discussion under videos
- **Video Analytics**: View counts and engagement
- **Admin Dashboard**: Full content management system

## 📖 Documentation

Complete setup instructions and API documentation available in:

- `frontend/README.md` - Detailed frontend documentation
- `frontend/supabase/schema.sql` - Database schema with comments

## 🎓 Learning Path

### For Students:

1. Start with the homepage to see categories
2. Click a category to view related videos
3. Watch videos and learn trading concepts
4. Use search to find specific topics

### For Administrators:

1. Sign up for an account
2. Login at `/login`
3. Navigate to `/admin/upload`
4. Upload new educational content

## 🔐 Security

- Row Level Security (RLS) enabled
- Public read access for content
- Authenticated write access
- Secure file uploads
- JWT-based authentication

## 🚢 Deployment

### Recommended: Vercel + Supabase

1. **Database**: Already on Supabase
2. **Frontend**: Deploy to Vercel
   ```bash
   npx vercel
   ```
3. **Environment Variables**: Add in Vercel dashboard

### Alternative: Any Node.js Host

- Works on: Railway, Render, DigitalOcean, etc.
- Requires Node.js 18+ runtime
- Set environment variables accordingly

## 📊 Database Schema

### Tables

- **categories**: Video categories (SMC, Price Action, etc.)
- **videos**: Video metadata and URLs
- **users**: Managed by Supabase Auth

### Storage Buckets

- **videos**: Video files and thumbnails

## 🎨 Customization

### Branding

- Edit logo and colors in `frontend/src/components/Navbar.tsx`
- Update Tailwind theme in `frontend/tailwind.config.ts`

### Categories

- Add new categories via SQL or admin interface
- Customize descriptions and icons

### Video Sources

- Support for Supabase Storage uploads
- Support for YouTube/Vimeo embeds
- Extensible to other video platforms

## 🧪 Testing

### Manual Testing Checklist

- [ ] Homepage loads with categories
- [ ] Category pages show correct videos
- [ ] Video player works
- [ ] Search returns results
- [ ] Login/Signup functional
- [ ] Upload requires authentication
- [ ] File uploads work correctly

## 🐛 Troubleshooting

### Common Issues

**Videos not displaying:**

- Check Supabase URL in `.env.local`
- Verify storage bucket is public
- Check RLS policies

**Authentication errors:**

- Confirm Supabase keys are correct
- Check email confirmation settings
- Review auth policies

**Upload failures:**

- Verify user is logged in
- Check file size limits
- Ensure storage policies are set

## 📝 Development Notes

### Current Status: ✅ Complete

This project is fully functional with all core features implemented.

### Migration from NestJS to Full-Stack Next.js

The project was initially designed with a separate NestJS backend but was rebuilt as a full-stack Next.js application using Supabase for:

- Simpler architecture
- Better integration
- Easier deployment
- Lower infrastructure costs

The `backend/` folder contains the legacy NestJS code and can be safely ignored or removed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

MIT License - Free to use for learning and commercial projects

## 🙏 Credits

Built with:

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Player](https://github.com/CookPete/react-player)

## 📧 Support

For questions or issues:

- Check the documentation in `frontend/README.md`
- Review Supabase documentation
- Open an issue on GitHub

---

**Ready to deploy!** This project is production-ready and can be deployed to Vercel + Supabase immediately.
