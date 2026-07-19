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
    if (event === "messages.upsert" || event === "message" || event === "MESSAGES_UPSERT") {
      // Evolution API pode mandar os dados diretamente no 'data', ou encapsulados dependendo da versão
      let msgPayload = data;
      // Se data é um array (Evolution V1 costumava mandar array), pegar o primeiro
      if (Array.isArray(data)) msgPayload = data[0];
      // Se veio encapsulado em message (Evolution V2 as vezes)
      if (data?.message && data?.message?.key) msgPayload = data.message;

      const key = msgPayload?.key;
      if (!key) {
        console.warn("Payload sem key:", msgPayload);
        return new Response("ok", { headers: corsHeaders });
      }

      const fromMe = key?.fromMe || false;
      const direcaoMsg = fromMe ? "enviada" : "recebida";

      const isGroup = key?.remoteJid?.includes("@g.us");
      const phone = key?.remoteJid?.replace("@s.whatsapp.net", "").replace("@g.us", "");
      if (!phone) return new Response("ok", { headers: corsHeaders });

      // O conteúdo da mensagem em si
      const msgContent = msgPayload?.message || msgPayload;
      
      const pushName = msgPayload?.pushName || data?.pushName || null;
      
      let text =
        msgContent?.conversation ||
        msgContent?.extendedTextMessage?.text ||
        msgContent?.imageMessage?.caption ||
        (msgContent?.audioMessage ? "[Áudio]" : "[mídia]");

      // Se for grupo, adicionar o nome de quem mandou na mensagem
      if (isGroup && pushName && !fromMe) {
        text = `${pushName}: ${text}`;
      }

      // Buscar instância pelo nome incluindo credenciais para baixar mídias
      const { data: instanceData } = await supabase
        .from("whatsapp_instances")
        .select("id, user_id, evolution_api_url, api_key")
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

      // 🔴 INTERRUPÇÃO DO FUNIL: Cancelar mensagens pendentes do robô se o cliente respondeu
      await supabase
        .from("message_queue")
        .update({ status: "cancelado", erro: "Interrompido automaticamente por resposta do cliente" })
        .eq("telefone", phone)
        .eq("status", "pendente")
        .not("funnel_step_id", "is", null);

      let finalContactName = lead?.nome || pushName || phone;
      if (isGroup) {
        finalContactName = lead?.nome || `Grupo ${phone.slice(0, 8)}...`;
      }

      // OTIMIZAÇÃO: Chamar a função atômica (RPC) para fazer o Upsert e incremento de não lidas de uma só vez
      const { data: conversationId, error: rpcError } = await supabase.rpc(
        "upsert_whatsapp_conversation",
        {
          p_user_id: instanceData.user_id,
          p_lead_id: lead?.id || null,
          p_instance_id: instanceData.id,
          p_telefone: phone,
          p_nome_contato: finalContactName,
          p_ultima_mensagem: text,
          p_direcao_ultima: direcaoMsg,
          p_status: lead ? "em_atendimento" : "aberta"
        }
      );

      if (rpcError) {
        console.error("Erro na execução do RPC upsert_whatsapp_conversation:", rpcError);
        return new Response("ok", { headers: corsHeaders });
      }

      // Baixar mídia e salvar no Storage se houver imagem/áudio/documento
      let mediaUrl = null;
      const isImage = !!msgContent?.imageMessage;
      const isAudio = !!msgContent?.audioMessage;
      const isDoc = !!msgContent?.documentMessage;

      if ((isImage || isAudio || isDoc) && instanceData.evolution_api_url && instanceData.api_key) {
        try {
          console.log("Mídia detectada. Baixando da Evolution API...");
          const mediaRes = await fetch(
            `${instanceData.evolution_api_url}/chat/getBase64FromMediaMessage/${instance}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": instanceData.api_key,
              },
              body: JSON.stringify({ message: msgPayload }),
            }
          );

          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            let base64Str = mediaData.base64 || mediaData;

            if (base64Str) {
              let mimeType = "application/octet-stream";
              if (base64Str.startsWith("data:")) {
                const parts = base64Str.split(";base64,");
                mimeType = parts[0].substring(5);
                base64Str = parts[1];
              }

              const mimeToExt: Record<string, string> = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/gif": "gif",
                "image/webp": "webp",
                "audio/ogg": "ogg",
                "audio/mp3": "mp3",
                "audio/mpeg": "mp3",
                "audio/amr": "amr",
                "audio/mp4": "m4a",
                "application/pdf": "pdf",
              };
              const ext = mimeToExt[mimeType] || "bin";

              // Converter base64 para binário
              const binaryString = atob(base64Str);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }

              const storagePath = `${instanceData.user_id}/whatsapp-media/${key.id}.${ext}`;

              // Salvar no bucket público 'lead-documents'
              const { error: storageError } = await supabase.storage
                .from("lead-documents")
                .upload(storagePath, bytes, {
                  contentType: mimeType,
                  upsert: true,
                });

              if (storageError) {
                console.error("Erro ao subir mídia no storage:", storageError);
              } else {
                const { data: publicData } = supabase.storage
                  .from("lead-documents")
                  .getPublicUrl(storagePath);

                if (publicData?.publicUrl) {
                  mediaUrl = publicData.publicUrl;
                  console.log("Mídia salva no Storage:", mediaUrl);
                }
              }
            }
          } else {
            console.error("Erro ao resgatar base64 da API:", mediaRes.status, await mediaRes.text());
          }
        } catch (mediaErr) {
          console.error("Falha no download/upload da mídia:", mediaErr);
        }
      }

      // Salvar mensagem individual com a URL da mídia (se houver)
      if (conversationId) {
        await supabase.from("whatsapp_messages").insert({
          conversation_id: conversationId,
          evolution_message_id: key?.id,
          direcao: direcaoMsg,
          tipo: isImage ? "imagem" : isAudio ? "audio" : isDoc ? "documento" : "texto",
          conteudo: text,
          media_url: mediaUrl,
          status: fromMe ? "enviado" : "entregue",
          timestamp_whatsapp: new Date().toISOString(),
        });
      }
    }

    // ── Status de conexão da instância ────────────────────────────────────────
    if (event === "connection.update" || event === "CONNECTION_UPDATE") {
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
    if (event === "messages.update" || event === "MESSAGES_UPDATE") {
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
