-- Adiciona a coluna 'date' para data customizada do lead
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS date DATE; 