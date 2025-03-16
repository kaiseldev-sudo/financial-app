-- Update profiles table to include avatar_url
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT; 