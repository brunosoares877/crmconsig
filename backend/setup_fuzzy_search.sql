-- Function to find lead by phone number (fuzzy match)
-- It strips non-digits from the stored phone and compares with the input (also stripped)
-- Checks if the stored phone ENDS WITH the input (or vice versa) to handle country codes/9 digit differences

create or replace function find_lead_by_phone_fuzzy(search_phone text)
returns table (id uuid, name text, status text, user_id uuid)
language plpgsql
security definer
as $$
declare
  clean_input text;
  search_8chars text;
begin
  -- Remove non-digits from input
  clean_input := regexp_replace(search_phone, '\D', '', 'g');
  
  -- Take the last 8 digits (safe bet for Brazil mobile/landline overlap)
  search_8chars := right(clean_input, 8);

  return query
  select l.id, l.name, l.status, l.user_id
  from leads l
  where 
    -- Check phone 1
    right(regexp_replace(l.phone, '\D', '', 'g'), 8) = search_8chars
    OR
    -- Check phone 2
    right(regexp_replace(l.phone2, '\D', '', 'g'), 8) = search_8chars
    OR
    -- Check phone 3
    right(regexp_replace(l.phone3, '\D', '', 'g'), 8) = search_8chars;
end;
$$;
