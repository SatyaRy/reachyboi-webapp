-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create videos table
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

-- VPS instances (for managed VPS subscriptions)
CREATE TABLE IF NOT EXISTS vps_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'Standard VPS',
  plan_price NUMERIC(10,2) NOT NULL DEFAULT 12.00,
  plan_template TEXT,
  region TEXT,
  cpu TEXT,
  memory_gb NUMERIC(10,2),
  storage_gb NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'online',
  cpu_usage NUMERIC(10,2) DEFAULT 0,
  memory_usage NUMERIC(10,2) DEFAULT 0,
  storage_usage NUMERIC(10,2) DEFAULT 0,
  subscription_status TEXT NOT NULL DEFAULT 'active',
  next_billing_at TIMESTAMP WITH TIME ZONE DEFAULT (TIMEZONE('utc'::text, NOW()) + interval '30 days'),
  notes TEXT,
  credentials JSONB,
  mt5_status TEXT DEFAULT 'unknown',
  auto_suspend_at TIMESTAMP WITH TIME ZONE,
  suspend_reason TEXT,
  last_heartbeat_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Backfill new columns for existing deployments
ALTER TABLE vps_instances
  ADD COLUMN IF NOT EXISTS plan_template TEXT,
  ADD COLUMN IF NOT EXISTS credentials JSONB,
  ADD COLUMN IF NOT EXISTS mt5_status TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS auto_suspend_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS suspend_reason TEXT,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_vps_user_email ON vps_instances(user_email);
CREATE INDEX IF NOT EXISTS idx_vps_status ON vps_instances(status);
CREATE INDEX IF NOT EXISTS idx_vps_subscription_status ON vps_instances(subscription_status);
CREATE INDEX IF NOT EXISTS idx_vps_heartbeat ON vps_instances(last_heartbeat_at DESC);

-- VPS audit log
CREATE TABLE IF NOT EXISTS vps_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vps_id UUID REFERENCES vps_instances(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  actor_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vps_audit_logs_vps_id ON vps_audit_logs(vps_id);

-- Webapp subscriptions (PayWay)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  plan_name TEXT NOT NULL DEFAULT 'Standard',
  price NUMERIC(10,2) NOT NULL DEFAULT 12.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, failed, cancelled
  payway_transaction_id TEXT,
  payway_checkout_url TEXT,
  next_billing_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Posts table for written content
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  author_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Daily news table for quick updates
CREATE TABLE IF NOT EXISTS daily_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT NOT NULL,
  source_url TEXT,
  author_email TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_news_published_at ON daily_news(published_at DESC);

-- Track recent user activity (lightweight heartbeat)
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

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on videos" ON videos;
CREATE POLICY "Allow public read access on videos" ON videos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated read access on vps_instances" ON vps_instances;
CREATE POLICY "Allow authenticated read access on vps_instances" ON vps_instances
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update/delete
DROP POLICY IF EXISTS "Allow authenticated users to insert categories" ON categories;
CREATE POLICY "Allow authenticated users to insert categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON categories;
CREATE POLICY "Allow authenticated users to update categories" ON categories
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete categories" ON categories;
CREATE POLICY "Allow authenticated users to delete categories" ON categories
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert videos" ON videos;
CREATE POLICY "Allow authenticated users to insert videos" ON videos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update videos" ON videos;
CREATE POLICY "Allow authenticated users to update videos" ON videos
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete videos" ON videos;
CREATE POLICY "Allow authenticated users to delete videos" ON videos
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert vps_instances" ON vps_instances;
CREATE POLICY "Allow authenticated users to insert vps_instances" ON vps_instances
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update vps_instances" ON vps_instances;
CREATE POLICY "Allow authenticated users to update vps_instances" ON vps_instances
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete vps_instances" ON vps_instances;
CREATE POLICY "Allow authenticated users to delete vps_instances" ON vps_instances
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read subscriptions" ON subscriptions;
CREATE POLICY "Allow authenticated users to read subscriptions" ON subscriptions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert subscriptions" ON subscriptions;
CREATE POLICY "Allow authenticated users to insert subscriptions" ON subscriptions
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update subscriptions" ON subscriptions;
CREATE POLICY "Allow authenticated users to update subscriptions" ON subscriptions
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete subscriptions" ON subscriptions;
CREATE POLICY "Allow authenticated users to delete subscriptions" ON subscriptions
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read vps_audit_logs" ON vps_audit_logs;
CREATE POLICY "Allow authenticated users to read vps_audit_logs" ON vps_audit_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert vps_audit_logs" ON vps_audit_logs;
CREATE POLICY "Allow authenticated users to insert vps_audit_logs" ON vps_audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Content policies
DROP POLICY IF EXISTS "Allow public read access on posts" ON posts;
CREATE POLICY "Allow public read access on posts" ON posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on daily_news" ON daily_news;
CREATE POLICY "Allow public read access on daily_news" ON daily_news
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage posts" ON posts;
CREATE POLICY "Authenticated users can manage posts" ON posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage daily_news" ON daily_news;
CREATE POLICY "Authenticated users can manage daily_news" ON daily_news
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Activity policy (service role only)
DROP POLICY IF EXISTS "Service role can manage user_activity" ON user_activity;
CREATE POLICY "Service role can manage user_activity" ON user_activity
  FOR ALL USING (auth.role() = 'service_role');

-- Insert seed data for categories
INSERT INTO categories (name, description) VALUES
  ('SMC', 'Smart Money Concepts - Learn how institutional traders think and trade'),
  ('Price Action', 'Master the art of reading pure price movement without indicators'),
  ('Trendline', 'Understand how to draw and trade trendlines effectively')
ON CONFLICT (name) DO NOTHING;

-- Insert seed data for videos
-- Note: Replace the video_url and thumbnail_url with actual URLs from your Supabase storage or YouTube
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
