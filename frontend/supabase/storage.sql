-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for videos bucket
CREATE POLICY "Public Access for Video Files"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload video files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Authenticated users can update their video files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can delete their video files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos');
