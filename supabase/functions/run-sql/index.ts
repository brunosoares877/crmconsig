import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as postgres from "https://deno.land/x/postgres@v0.17.0/mod.ts";

serve(async (req) => {
  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) throw new Error("No DB URL");
    const pool = new postgres.Pool(dbUrl, 3, true);
    const conn = await pool.connect();
    const body = await req.text();
    const result = await conn.queryObject(body);
    conn.release();
    return new Response(JSON.stringify({success: true, result}), {headers:{"Content-Type":"application/json"}});
  } catch (e: any) {
    return new Response(JSON.stringify({error: e.message}), {status: 500, headers:{"Content-Type":"application/json"}});
  }
});
