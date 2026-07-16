import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Checa se número tem WhatsApp ativo via Evolution API ─────────────────────
async function checkWhatsApp(
  apiUrl: string,
  apiKey: string,
  instanceName: string,
  phone: string
): Promise<boolean> {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return false;

  const normalized = digits.startsWith("55") ? digits : `55${digits}`;

  try {
    const response = await fetch(
      `${apiUrl}/chat/whatsappNumbers/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({ numbers: [normalized] }),
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    // Evolution API retorna array com objeto por número
    if (Array.isArray(data)) {
      const result = data.find((item: any) =>
        item.number === normalized || item.jid?.includes(normalized)
      );
      return result?.exists === true || result?.onWhatsapp === true;
    }
    return false;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { lead_id, instance_id, batch_size = 10 } = body;

    // ── Modo: validar lead específico ─────────────────────────────────────────
    if (lead_id && instance_id) {
      const { data: lead, error: leadErr } = await supabase
        .from("prospecting_leads")
        .select("*")
        .eq("id", lead_id)
        .single();

      if (leadErr || !lead) {
        return new Response(
          JSON.stringify({ error: "Lead não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: instance, error: instErr } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("id", instance_id)
        .single();

      if (instErr || !instance) {
        return new Response(
          JSON.stringify({ error: "Instância não encontrada" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const phones = [lead.telefone1, lead.telefone2, lead.telefone3].filter(Boolean);
      let validPhone: string | null = null;

      for (const phone of phones) {
        const hasWA = await checkWhatsApp(
          instance.evolution_api_url,
          instance.api_key,
          instance.instance_name,
          phone
        );

        if (hasWA) {
          validPhone = phone;
          break;
        }
        // Pequena pausa entre checagens
        await new Promise((r) => setTimeout(r, 500));
      }

      // Atualizar lead com resultado
      await supabase
        .from("prospecting_leads")
        .update({
          tel_valido: validPhone,
          whatsapp_validado_at: new Date().toISOString(),
          kanban_status: validPhone ? "fila_disparo" : "sem_whatsapp",
        })
        .eq("id", lead_id);

      return new Response(
        JSON.stringify({
          lead_id,
          has_whatsapp: !!validPhone,
          valid_phone: validPhone,
          kanban_status: validPhone ? "fila_disparo" : "sem_whatsapp",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Modo: processar lote de leads para_validar ────────────────────────────
    if (instance_id) {
      const { data: instance } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("id", instance_id)
        .eq("status", "connected")
        .single();

      if (!instance) {
        return new Response(
          JSON.stringify({ error: "Instância desconectada ou não encontrada" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: leads } = await supabase
        .from("prospecting_leads")
        .select("*")
        .eq("kanban_status", "para_validar")
        .is("whatsapp_validado_at", null)
        .limit(batch_size);

      if (!leads || leads.length === 0) {
        return new Response(
          JSON.stringify({ message: "Nenhum lead para validar" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results = [];

      for (const lead of leads) {
        const phones = [lead.telefone1, lead.telefone2, lead.telefone3].filter(Boolean);
        let validPhone: string | null = null;

        for (const phone of phones) {
          const hasWA = await checkWhatsApp(
            instance.evolution_api_url,
            instance.api_key,
            instance.instance_name,
            phone
          );

          if (hasWA) {
            validPhone = phone;
            break;
          }
          await new Promise((r) => setTimeout(r, 800));
        }

        await supabase
          .from("prospecting_leads")
          .update({
            tel_valido: validPhone,
            whatsapp_validado_at: new Date().toISOString(),
            kanban_status: validPhone ? "fila_disparo" : "sem_whatsapp",
          })
          .eq("id", lead.id);

        results.push({
          lead_id: lead.id,
          nome: lead.nome,
          has_whatsapp: !!validPhone,
          valid_phone: validPhone,
        });

        // Pausa entre leads para não sobrecarregar
        await new Promise((r) => setTimeout(r, 1500));
      }

      const withWA = results.filter((r) => r.has_whatsapp).length;
      const withoutWA = results.length - withWA;

      return new Response(
        JSON.stringify({
          processed: results.length,
          with_whatsapp: withWA,
          without_whatsapp: withoutWA,
          results,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "instance_id é obrigatório" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
