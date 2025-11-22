-- =====================================================
-- UPDATED SCHEMA FOR CUSTOM AUTHENTICATION SYSTEM
-- =====================================================

-- Drop existing users policies if they exist
DROP POLICY IF EXISTS "Allow public read access on users" ON auth.users;

-- Create admins table for admin authentication
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create authorized_users table for regular user authentication
CREATE TABLE IF NOT EXISTS authorized_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  exness_account_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_authorized_users_email ON authorized_users(email);
CREATE INDEX IF NOT EXISTS idx_authorized_users_exness ON authorized_users(exness_account_id);
CREATE INDEX IF NOT EXISTS idx_authorized_users_lookup ON authorized_users(email, exness_account_id);

-- Track user activity for online state and last seen
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  exness_account_id TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'online',
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_email ON user_activity(user_email);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen_at DESC);

-- Update categories table (keep existing)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Update videos table (keep existing)
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- Posts allow admins to share written content
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  author_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_email ON posts(author_email);

-- Daily news entries authored by admins
CREATE TABLE IF NOT EXISTS daily_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT NOT NULL,
  source_url TEXT,
  author_email TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_news_published_at ON daily_news(published_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_news ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR ADMINS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage admins" ON admins;

-- Admins table policies (only service role can access for security)
CREATE POLICY "Service role can manage admins" ON admins
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES FOR AUTHORIZED USERS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read authorized_users" ON authorized_users;
DROP POLICY IF EXISTS "Authenticated users can insert authorized_users" ON authorized_users;
DROP POLICY IF EXISTS "Authenticated users can update authorized_users" ON authorized_users;
DROP POLICY IF EXISTS "Authenticated users can delete authorized_users" ON authorized_users;

-- Only authenticated users (admin via Supabase Auth) can manage authorized_users
CREATE POLICY "Authenticated users can read authorized_users" ON authorized_users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert authorized_users" ON authorized_users
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update authorized_users" ON authorized_users
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete authorized_users" ON authorized_users
  FOR DELETE TO authenticated USING (true);

-- Only service role can manage activity records to avoid user spoofing
DROP POLICY IF EXISTS "Service role can manage user_activity" ON user_activity;
CREATE POLICY "Service role can manage user_activity" ON user_activity
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- RLS POLICIES FOR CATEGORIES AND VIDEOS (Public Read)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access on videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON videos;

CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on videos" ON videos
  FOR SELECT USING (true);

-- Admin can manage categories and videos
CREATE POLICY "Authenticated users can insert categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete categories" ON categories
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert videos" ON videos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update videos" ON videos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete videos" ON videos
  FOR DELETE TO authenticated USING (true);

-- Posts policies
DROP POLICY IF EXISTS "Allow public read access on posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON posts;

CREATE POLICY "Allow public read access on posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage posts" ON posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Daily news policies
DROP POLICY IF EXISTS "Allow public read access on daily_news" ON daily_news;
DROP POLICY IF EXISTS "Authenticated users can manage daily_news" ON daily_news;

CREATE POLICY "Allow public read access on daily_news" ON daily_news
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage daily_news" ON daily_news
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default admin account
-- Password: admin123 (hashed with bcrypt, you should run this through bcrypt in Node.js)
-- For demo purposes, using a pre-hashed password: $2a$10$rqK8xQXQxQXQxQXQxQXQxuO8K9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y
-- IMPORTANT: Replace this with actual bcrypt hash after running: bcrypt.hash('admin123', 10)
INSERT INTO admins (email, password_hash, role) VALUES
  ('admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye3CJEIPLWUgQYJuQs7KJfGNvpG4xO9q2', 'admin'),
  ('zoroteam@dev.com', '$2b$10$xcJwR4lqEIeWs5K7bYToj.Jnd6u/KIscnEuPOTBpmSgqo5kr46idi', 'admin')
ON CONFLICT (email) DO NOTHING;
-- Note: The above hash is for 'admin123'. You may need to regenerate it using bcrypt.

-- Insert seed categories
INSERT INTO categories (name, description) VALUES
  ('SMC', 'Smart Money Concepts - Learn how institutional traders think and trade'),
  ('Price Action', 'Master the art of reading pure price movement without indicators'),
  ('Trendline', 'Understand how to draw and trade trendlines effectively')
ON CONFLICT (name) DO NOTHING;

-- Insert seed videos
INSERT INTO videos (title, description, category_id, video_url, thumbnail_url)
SELECT
  'Introduction to Smart Money Concepts',
  'Learn the basics of SMC and how institutional money moves in the market',
  (SELECT id FROM categories WHERE name = 'SMC'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Introduction to Smart Money Concepts');

INSERT INTO videos (title, description, category_id, video_url, thumbnail_url)
SELECT
  'Order Blocks Explained',
  'Deep dive into order blocks and how to identify them on your charts',
  (SELECT id FROM categories WHERE name = 'SMC'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Order Blocks Explained');

INSERT INTO videos (title, description, category_id, video_url, thumbnail_url)
SELECT
  'Price Action Basics',
  'Understanding candlestick patterns and market structure',
  (SELECT id FROM categories WHERE name = 'Price Action'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Price Action Basics');

INSERT INTO videos (title, description, category_id, video_url, thumbnail_url)
SELECT
  'Support and Resistance Trading',
  'How to identify and trade key support and resistance levels',
  (SELECT id FROM categories WHERE name = 'Price Action'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Support and Resistance Trading');

INSERT INTO videos (title, description, category_id, video_url, thumbnail_url)
SELECT
  'Trendline Trading Strategy',
  'Learn how to draw accurate trendlines and trade breakouts',
  (SELECT id FROM categories WHERE name = 'Trendline'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Trendline Trading Strategy');

INSERT INTO videos (title, description, category_id, video_url, thumbnail_url)
SELECT
  'Advanced Trendline Techniques',
  'Master advanced trendline concepts for professional trading',
  (SELECT id FROM categories WHERE name = 'Trendline'),
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
WHERE NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Advanced Trendline Techniques');

-- =====================================================
-- EXAMPLE: Seed some authorized users for testing
-- =====================================================
INSERT INTO authorized_users (email, exness_account_id, role) VALUES
  ('user1@example.com', 'EXN123456', 'user'),
  ('user2@example.com', 'EXN789012', 'user'),
  ('trader@example.com', 'EXN345678', 'user')
ON CONFLICT (email) DO UPDATE SET 
  exness_account_id = EXCLUDED.exness_account_id,
  role = EXCLUDED.role,
  updated_at = NOW();

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on authorized_users
DROP TRIGGER IF EXISTS update_authorized_users_updated_at ON authorized_users;
CREATE TRIGGER update_authorized_users_updated_at
    BEFORE UPDATE ON authorized_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Keep activity timestamps fresh
DROP TRIGGER IF EXISTS update_user_activity_updated_at ON user_activity;
CREATE TRIGGER update_user_activity_updated_at
    BEFORE UPDATE ON user_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES FOR DEVELOPERS
-- =====================================================
-- 1. Default Admin Credentials:
--    Email: admin@example.com
--    Password: admin123
--    (Change password after first login in production!)
--
-- 2. The admin account uses Supabase Auth for authentication
--    Regular users authenticate via custom logic (email + exness_account_id)
--
-- 3. To generate a new admin password hash:
--    const bcrypt = require('bcrypt');
--    const hash = await bcrypt.hash('your-password', 10);
--
-- 4. Sample authorized users are included for testing
--    Remove or update these before production
