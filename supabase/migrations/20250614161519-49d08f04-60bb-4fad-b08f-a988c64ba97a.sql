
-- Create a table for lead tags
CREATE TABLE public.lead_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own tags
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own tags
CREATE POLICY "Users can view their own tags" 
  ON public.lead_tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own tags
CREATE POLICY "Users can create their own tags" 
  ON public.lead_tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own tags
CREATE POLICY "Users can update their own tags" 
  ON public.lead_tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own tags
CREATE POLICY "Users can delete their own tags" 
  ON public.lead_tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a table to link leads with tags (many-to-many relationship)
CREATE TABLE public.lead_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, tag_id)
);

-- Add Row Level Security (RLS) for tag assignments
ALTER TABLE public.lead_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for tag assignments
CREATE POLICY "Users can view their own tag assignments" 
  ON public.lead_tag_assignments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tag assignments" 
  ON public.lead_tag_assignments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tag assignments" 
  ON public.lead_tag_assignments 
  FOR DELETE 
  USING (auth.uid() = user_id);
