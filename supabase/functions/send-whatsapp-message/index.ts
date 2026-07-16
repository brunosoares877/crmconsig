import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Spintax processor ────────────────────────────────────────────────────────
function processSpintax(template: string): string {
  return template.replace(/\{([^{}]+)\}/g, (_, group) => {
    const options = group.split("|");
    return options[Math.floor(Math.random() * options.length)];
  });
}

// ─── Interpola variáveis do lead na mensagem ─────────────────────────────────
function interpolate(text: string, lead: Record<string, string>): string {
  return text
    .replace(/\{\{nome\}\}/gi, lead.nome || "")
    .replace(/\{\{municipio\}\}/gi, lead.municipio || "")
    .replace(/\{\{beneficio\}\}/gi, lead.beneficio || "");
}

// ─── Envia mensagem via Evolution API ────────────────────────────────────────
async function sendViaEvolution(
  apiUrl: string,
  apiKey: string,
  instanceName: string,
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Normalizar número: remover tudo exceto dígitos, garantir DDI 55
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: normalized,
        text: message,
        delay: 1200, // digitação simulada em ms
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: err };
    }

    const data = await response.json();
    return { success: true, messageId: data?.key?.id || data?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Envia áudio (Voice Note) via Evolution API ──────────────────────────────
async function sendAudioViaEvolution(
  apiUrl: string,
  apiKey: string,
  instanceName: string,
  phone: string,
  audioUrl: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;

  try {
    const response = await fetch(`${apiUrl}/message/sendWhatsAppAudio/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: normalized,
        audio: audioUrl,
        delay: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: err };
    }

    const data = await response.json();
    return { success: true, messageId: data?.key?.id || data?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Envia Mídia via Evolution API ───────────────────────────────────────────
async function sendMediaViaEvolution(
  apiUrl: string,
  apiKey: string,
  instanceName: string,
  phone: string,
  mediaUrl: string,
  mediatype: string,
  caption: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;

  try {
    const response = await fetch(`${apiUrl}/message/sendMedia/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: normalized,
        media: mediaUrl,
        mediatype: mediatype,
        caption: caption,
        delay: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: err };
    }

    const data = await response.json();
    return { success: true, messageId: data?.key?.id || data?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Calcula delay aleatório em ms ───────────────────────────────────────────
function randomDelay(minSec: number, maxSec: number): number {
  return (Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec) * 1000;
}

// ─── Handler principal ────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let body: any = {};
    try {
      if (req.body) {
        body = await req.json();
      }
    } catch (e) {
      // Ignore
    }
    const { queue_id } = body;

    // Se queue_id informado, processa item específico
    // Caso contrário, processa próximo item pendente
    let queueItem: any;

    if (queue_id) {
      const { data, error } = await supabase
        .from("message_queue")
        .select(`
          *,
          prospecting_leads(*),
          message_campaigns(*),
          whatsapp_instances(*),
          whatsapp_funnel_steps(*)
        `)
        .eq("id", queue_id)
        .eq("status", "pendente")
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Item não encontrado na fila" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      queueItem = data;
    } else {
      // Pega próximo item agendado
      const { data, error } = await supabase
        .from("message_queue")
        .select(`
          *,
          prospecting_leads(*),
          message_campaigns(*),
          whatsapp_instances(*),
          whatsapp_funnel_steps(*)
        `)
        .eq("status", "pendente")
        .lte("agendado_para", new Date().toISOString())
        .order("agendado_para", { ascending: true })
        .limit(1)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ message: "Nenhum item na fila agora" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      queueItem = data;
    }

    const { prospecting_leads: lead, message_campaigns: campaign, whatsapp_instances: instance } = queueItem;

    // Verificar se pode enviar (limite diário)
    const { data: canSend } = await supabase.rpc("can_send_message", {
      p_instance_id: instance.id,
    });

    if (!canSend) {
      // Reagendar para amanhã às 8h
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);

      await supabase
        .from("message_queue")
        .update({ agendado_para: tomorrow.toISOString() })
        .eq("id", queueItem.id);

      return new Response(
        JSON.stringify({ message: "Limite diário atingido. Reagendado para amanhã." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar como enviando
    await supabase
      .from("message_queue")
      .update({ status: "enviando" })
      .eq("id", queueItem.id);

    // Gerar mensagem com Spintax + variáveis do lead
    let templateRaw = "";
    if (queueItem.whatsapp_funnel_steps) {
      templateRaw = queueItem.whatsapp_funnel_steps.mensagem_template;
    } else if (campaign) {
      templateRaw = queueItem.numero_sequencia === 1
        ? campaign.template_msg1
        : campaign.template_msg2 || campaign.template_msg1;
    }

    const mensagemGerada = interpolate(processSpintax(templateRaw), {
      nome: lead?.nome?.split(" ")[0] || "",
      municipio: lead?.municipio || "",
      beneficio: lead?.beneficio || "",
    });

    // Enviar via Evolution API dependendo do tipo
    let result: { success: boolean; messageId?: string; error?: string };

    if (queueItem.whatsapp_funnel_steps && queueItem.whatsapp_funnel_steps.media_url) {
      const tipoMidia = queueItem.whatsapp_funnel_steps.tipo_midia || "imagem";
      
      if (tipoMidia === "audio") {
        result = await sendAudioViaEvolution(
          instance.evolution_api_url,
          instance.api_key,
          instance.instance_name,
          queueItem.telefone,
          queueItem.whatsapp_funnel_steps.media_url
        );
      } else {
        result = await sendMediaViaEvolution(
          instance.evolution_api_url,
          instance.api_key,
          instance.instance_name,
          queueItem.telefone,
          queueItem.whatsapp_funnel_steps.media_url,
          tipoMidia === "video" ? "video" : "image",
          mensagemGerada
        );
      }
    } else {
      result = await sendViaEvolution(
        instance.evolution_api_url,
        instance.api_key,
        instance.instance_name,
        queueItem.telefone,
        mensagemGerada
      );
    }

    if (result.success) {
      // Atualizar fila
      await supabase
        .from("message_queue")
        .update({
          status: "enviado",
          enviado_em: new Date().toISOString(),
          evolution_message_id: result.messageId,
          mensagem_gerada: mensagemGerada,
        })
        .eq("id", queueItem.id);

      // Atualizar lead no Kanban se ele existir
      if (lead) {
        const leadUpdate: any = {
          kanban_status: "mensagem_enviada",
          ultima_mensagem_at: new Date().toISOString(),
          mensagens_enviadas: (lead.mensagens_enviadas || 0) + 1,
        };

        // Se for a campanha antiga, faz o agendamento automático do passo 2
        if (!queueItem.funnel_step_id && campaign) {
          leadUpdate.proxima_mensagem_at = new Date(
            Date.now() + randomDelay(campaign.delay_min_segundos, campaign.delay_max_segundos)
          ).toISOString();
        }

        await supabase
          .from("prospecting_leads")
          .update(leadUpdate)
          .eq("id", lead.id);
      }

      // Incrementar contador do chip
      await supabase.rpc("increment_messages_sent", { p_instance_id: instance.id });

      // Criar/atualizar conversa
      const { data: existingConv } = await supabase
        .from("whatsapp_conversations")
        .select("id")
        .eq("telefone", queueItem.telefone)
        .eq("instance_id", instance.id)
        .single();

      if (existingConv) {
        await supabase
          .from("whatsapp_conversations")
          .update({
            ultima_mensagem: mensagemGerada,
            ultima_mensagem_at: new Date().toISOString(),
            direcao_ultima: "enviada",
          })
          .eq("id", existingConv.id);

        await supabase.from("whatsapp_messages").insert({
          conversation_id: existingConv.id,
          evolution_message_id: result.messageId,
          direcao: "enviada",
          tipo: "texto",
          conteudo: mensagemGerada,
          status: "enviado",
          timestamp_whatsapp: new Date().toISOString(),
        });
      } else {
        const { data: newConv } = await supabase
          .from("whatsapp_conversations")
          .insert({
            user_id: lead.user_id,
            lead_id: lead.id,
            instance_id: instance.id,
            telefone: queueItem.telefone,
            nome_contato: lead.nome,
            ultima_mensagem: mensagemGerada,
            ultima_mensagem_at: new Date().toISOString(),
            direcao_ultima: "enviada",
          })
          .select()
          .single();

        if (newConv) {
          await supabase.from("whatsapp_messages").insert({
            conversation_id: newConv.id,
            evolution_message_id: result.messageId,
            direcao: "enviada",
            tipo: "texto",
            conteudo: mensagemGerada,
            status: "enviado",
            timestamp_whatsapp: new Date().toISOString(),
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, messageId: result.messageId, mensagem: mensagemGerada }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Falhou
      await supabase
        .from("message_queue")
        .update({
          status: "falhou",
          erro: result.error,
          tentativas: (queueItem.tentativas || 0) + 1,
        })
        .eq("id", queueItem.id);

      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
