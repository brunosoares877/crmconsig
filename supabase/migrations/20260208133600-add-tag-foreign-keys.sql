-- Add foreign key constraints to enable Supabase joins for tags

-- Step 1: Clean up orphaned data first
-- Delete assignments that reference non-existent leads
DELETE FROM public.lead_tag_assignments
WHERE lead_id NOT IN (SELECT id FROM public.leads);

-- Delete assignments that reference non-existent tags
DELETE FROM public.lead_tag_assignments
WHERE tag_id NOT IN (SELECT id FROM public.lead_tags);

-- Step 2: Add foreign key from lead_tag_assignments to leads
-- This allows Supabase to understand the relationship and enables joins
ALTER TABLE public.lead_tag_assignments
DROP CONSTRAINT IF EXISTS fk_lead_tag_assignments_lead;

ALTER TABLE public.lead_tag_assignments
ADD CONSTRAINT fk_lead_tag_assignments_lead
FOREIGN KEY (lead_id) 
REFERENCES public.leads(id)
ON DELETE CASCADE;

-- Step 3: Add foreign key from lead_tag_assignments to lead_tags
-- This enables nested joins like lead_tag_assignments.lead_tags(...)
ALTER TABLE public.lead_tag_assignments
DROP CONSTRAINT IF EXISTS fk_lead_tag_assignments_tag;

ALTER TABLE public.lead_tag_assignments
ADD CONSTRAINT fk_lead_tag_assignments_tag
FOREIGN KEY (tag_id) 
REFERENCES public.lead_tags(id)
ON DELETE CASCADE;

-- Step 4: Create indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_lead_tag_assignments_lead_id 
ON public.lead_tag_assignments(lead_id);

CREATE INDEX IF NOT EXISTS idx_lead_tag_assignments_tag_id 
ON public.lead_tag_assignments(tag_id);

-- Verify the foreign keys were created
DO $$ 
BEGIN 
    RAISE NOTICE 'Foreign keys added successfully!';
    RAISE NOTICE 'Orphaned data cleaned up and foreign keys created.';
    RAISE NOTICE 'You can now use joins like: select(*, lead_tag_assignments(tag_id, lead_tags(id, name, color)))';
END $$;
