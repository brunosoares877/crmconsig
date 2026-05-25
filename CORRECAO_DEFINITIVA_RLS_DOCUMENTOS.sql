-- ====================================================================
-- LEADCONSIG - CORREÇÃO DE RLS (BANCO E STORAGE)
-- ====================================================================
-- INSTRUÇÕES: 
-- 1. LIMPE TODO O CONTEÚDO DO SQL EDITOR NO SUPABASE.
-- 2. COLE ESTE SCRIPT COMPLETO.
-- 3. CLIQUE EM 'RUN'.
-- ====================================================================

-----------------------------------------------------------------------
-- 📄 1. CORREÇÃO PARA TABELA: documents
-----------------------------------------------------------------------
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can select documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;

CREATE POLICY "Authenticated users can select documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = user_id OR (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('brunosoares877@gmail.com', 'solutioninveste@gmail.com'));

-----------------------------------------------------------------------
-- 📝 2. CORREÇÃO PARA TABELA: notes
-----------------------------------------------------------------------
ALTER TABLE IF EXISTS public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated users can select notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated users can insert notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated users can update notes" ON public.notes;
DROP POLICY IF EXISTS "Authenticated users can delete notes" ON public.notes;

CREATE POLICY "Authenticated users can select notes" ON public.notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update notes" ON public.notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete notes" ON public.notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-----------------------------------------------------------------------
-- 📌 3. CORREÇÃO PARA TABELA: sticky_notes
-----------------------------------------------------------------------
ALTER TABLE IF EXISTS public.sticky_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own sticky notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Users can create their own sticky notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Users can update their own sticky notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Users can delete their own sticky notes" ON public.sticky_notes;
DROP POLICY IF EXISTS "Authenticated users can select sticky" ON public.sticky_notes;
DROP POLICY IF EXISTS "Authenticated users can insert sticky" ON public.sticky_notes;
DROP POLICY IF EXISTS "Authenticated users can update sticky" ON public.sticky_notes;
DROP POLICY IF EXISTS "Authenticated users can delete sticky" ON public.sticky_notes;

CREATE POLICY "Authenticated users can select sticky" ON public.sticky_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert sticky" ON public.sticky_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update sticky" ON public.sticky_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete sticky" ON public.sticky_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-----------------------------------------------------------------------
-- 📦 4. CORREÇÃO PARA STORAGE: bucket 'lead-documents'
-----------------------------------------------------------------------
-- Garante que o bucket existe e é público para visualização (ou via política)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-documents', 'lead-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remover políticas antigas de storage para evitar duplicidade
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Política: Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lead-documents');

-- Política: Permitir visualização para usuários autenticados
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'lead-documents');

-- Política: Permitir exclusão apenas para o dono
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lead-documents');

-- FINALIZADO COM SUCESSO
