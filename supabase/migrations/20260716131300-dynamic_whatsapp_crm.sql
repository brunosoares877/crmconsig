-- Create Tags table
CREATE TABLE IF NOT EXISTS whatsapp_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Quick Replies table
CREATE TABLE IF NOT EXISTS whatsapp_quick_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up RLS
ALTER TABLE whatsapp_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_quick_replies ENABLE ROW LEVEL SECURITY;

-- Policies for whatsapp_tags
CREATE POLICY "Users can view their own tags" ON whatsapp_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tags" ON whatsapp_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON whatsapp_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON whatsapp_tags FOR DELETE USING (auth.uid() = user_id);

-- Policies for whatsapp_quick_replies
CREATE POLICY "Users can view their own quick replies" ON whatsapp_quick_replies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quick replies" ON whatsapp_quick_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quick replies" ON whatsapp_quick_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quick replies" ON whatsapp_quick_replies FOR DELETE USING (auth.uid() = user_id);
