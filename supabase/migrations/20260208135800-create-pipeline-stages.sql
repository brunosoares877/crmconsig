-- Create pipeline_stages table for managing kanban columns

CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Enable Row Level Security
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for pipeline stages
CREATE POLICY "Users can view their own pipeline stages"
  ON public.pipeline_stages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pipeline stages"
  ON public.pipeline_stages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipeline stages"
  ON public.pipeline_stages
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipeline stages"
  ON public.pipeline_stages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_user_id 
ON public.pipeline_stages(user_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order 
ON public.pipeline_stages(user_id, order_index);

-- Function to insert default stages for new users
CREATE OR REPLACE FUNCTION create_default_pipeline_stages(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.pipeline_stages (user_id, name, slug, color, order_index)
  VALUES
    (p_user_id, 'Novo', 'novo', '#22c55e', 1),
    (p_user_id, 'Em Negociação', 'negociacao', '#3b82f6', 2),
    (p_user_id, 'Proposta Enviada', 'proposta', '#f59e0b', 3),
    (p_user_id, 'Fechado', 'fechado', '#8b5cf6', 4),
    (p_user_id, 'Perdido', 'perdido', '#ef4444', 5)
  ON CONFLICT (user_id, slug) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Verify
DO $$ 
BEGIN 
    RAISE NOTICE 'Pipeline stages table created successfully!';
    RAISE NOTICE 'Run: SELECT create_default_pipeline_stages(auth.uid()) to create default stages';
END $$;
