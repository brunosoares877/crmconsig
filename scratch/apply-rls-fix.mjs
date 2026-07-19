import fs from 'fs';

const sql = `
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can delete their own documents" 
  ON public.documents FOR DELETE TO authenticated 
  USING (auth.uid() = user_id OR auth.jwt()->>'email' IN ('brunosoares877@gmail.com', 'solutioninveste@gmail.com'));
`;

async function run() {
  console.log("Sending fixed SQL to Supabase Edge Function...");
  try {
    const res = await fetch("https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/run-sql", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: sql
    });
    
    const text = await res.text();
    console.log("Response:", res.status, text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

run();
