import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const event = body?.event;
    const instance = body?.instance;
    const data = body?.data;

    console.log("Webhook recebido:", event, "instância:", instance);

    // ── Mensagem recebida ──────────────────────────────────────────────────────
    if (event === "messages.upsert" || event === "message") {
      const msg = data?.message || data;
      if (!msg) return new Response("ok", { headers: corsHeaders });

      const fromMe = msg?.key?.fromMe || false;
      if (fromMe) return new Response("ok", { headers: corsHeaders }); // Ignorar msgs enviadas

      const phone = msg?.key?.remoteJid?.replace("@s.whatsapp.net", "").replace("@g.us", "");
      if (!phone) return new Response("ok", { headers: corsHeaders });

      const text =
        msg?.message?.conversation ||
        msg?.message?.extendedTextMessage?.text ||
        msg?.message?.imageMessage?.caption ||
        "[mídia]";

      // Buscar instância pelo nome
      const { data: instanceData } = await supabase
        .from("whatsapp_instances")
        .select("id, user_id")
        .eq("instance_name", instance)
        .single();

      if (!instanceData) {
        console.warn("Instância não encontrada:", instance);
        return new Response("ok", { headers: corsHeaders });
      }

      // Buscar lead associado ao número
      const { data: lead } = await supabase
        .from("prospecting_leads")
        .select("id, nome, user_id, kanban_status")
        .eq("user_id", instanceData.user_id)
        .or(`telefone1.eq.${phone},telefone2.eq.${phone},telefone3.eq.${phone},tel_valido.eq.${phone}`)
        .single();

      // Se lead respondeu → mover para Atendimento Manual
      if (lead && lead.kanban_status === "mensagem_enviada") {
        await supabase
          .from("prospecting_leads")
          .update({
            kanban_status: "atendimento_manual",
            kanban_updated_at: new Date().toISOString(),
          })
          .eq("id", lead.id);

        console.log(`Lead ${lead.nome} movido para Atendimento Manual`);
      }

      // Buscar ou criar conversa
      let conversationId: string;
      const { data: existingConv } = await supabase
        .from("whatsapp_conversations")
        .select("id, nao_lidas")
        .eq("telefone", phone)
        .eq("instance_id", instanceData.id)
        .single();

      if (existingConv) {
        await supabase
          .from("whatsapp_conversations")
          .update({
            ultima_mensagem: text,
            ultima_mensagem_at: new Date().toISOString(),
            direcao_ultima: "recebida",
            nao_lidas: (existingConv.nao_lidas || 0) + 1,
            status: lead ? "em_atendimento" : "aberta",
          })
          .eq("id", existingConv.id);

        conversationId = existingConv.id;
      } else {
        const { data: newConv } = await supabase
          .from("whatsapp_conversations")
          .insert({
            user_id: instanceData.user_id,
            lead_id: lead?.id || null,
            instance_id: instanceData.id,
            telefone: phone,
            nome_contato: lead?.nome || phone,
            ultima_mensagem: text,
            ultima_mensagem_at: new Date().toISOString(),
            direcao_ultima: "recebida",
            nao_lidas: 1,
            status: lead ? "em_atendimento" : "aberta",
          })
          .select()
          .single();

        conversationId = newConv?.id;
      }

      // Salvar mensagem individual
      if (conversationId) {
        await supabase.from("whatsapp_messages").insert({
          conversation_id: conversationId,
          evolution_message_id: msg?.key?.id,
          direcao: "recebida",
          tipo: msg?.message?.imageMessage ? "imagem" :
                msg?.message?.audioMessage ? "audio" :
                msg?.message?.documentMessage ? "documento" : "texto",
          conteudo: text,
          status: "recebido",
          timestamp_whatsapp: new Date().toISOString(),
        });
      }
    }

    // ── Status de conexão da instância ────────────────────────────────────────
    if (event === "connection.update") {
      const status = data?.state;
      const phoneNumber = data?.phoneNumber || null;

      const newStatus =
        status === "open" ? "connected" :
        status === "close" ? "disconnected" :
        status === "connecting" ? "connecting" : "disconnected";

      const updateData: any = { status: newStatus };
      if (newStatus === "connected" && phoneNumber) {
        updateData.phone_number = phoneNumber;
        updateData.chip_connected_at = new Date().toISOString();
      }

      await supabase
        .from("whatsapp_instances")
        .update(updateData)
        .eq("instance_name", instance);

      console.log(`Instância ${instance} status: ${newStatus}`);
    }

    // ── Confirmação de envio (status da mensagem) ──────────────────────────────
    if (event === "messages.update") {
      const updates = Array.isArray(data) ? data : [data];

      for (const update of updates) {
        const messageId = update?.key?.id;
        const ackStatus = update?.update?.status;

        if (!messageId || !ackStatus) continue;

        const statusMap: Record<string, string> = {
          "0": "enviando",
          "1": "enviado",
          "2": "entregue",
          "3": "lido",
          "4": "reproduzido",
          "ERROR": "falhou",
          "PENDING": "enviando",
          "SERVER_ACK": "enviado",
          "DELIVERY_ACK": "entregue",
          "READ": "lido",
          "PLAYED": "reproduzido",
        };

        const mappedStatus = statusMap[String(ackStatus)] || "enviado";

        await supabase
          .from("whatsapp_messages")
          .update({ status: mappedStatus })
          .eq("evolution_message_id", messageId);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    // Retornar 200 sempre para a Evolution API não retentar
    return new Response(
      JSON.stringify({ received: true, error: String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
