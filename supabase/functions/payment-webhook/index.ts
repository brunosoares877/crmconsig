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
    const authHeader = req.headers.get("Authorization");
    const webhookKey = Deno.env.get("WEBHOOK_API_KEY");

    // Verificar segurança do webhook (se configurado)
    if (webhookKey && authHeader !== `Bearer ${webhookKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const { email, name, phone, plan_duration_days = 30 } = payload;

    if (!email || !name) {
      return new Response(JSON.stringify({ error: "Missing email or name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Gerar senha temporária
    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1@";

    // 2. Criar ou buscar usuário
    let userId;
    const { data: existingUser, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    const userMatch = existingUser?.users?.find(u => u.email === email);

    if (userMatch) {
      userId = userMatch.id;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: name, whatsapp: phone }
      });
      
      if (createError) throw createError;
      if (!newUser.user) throw new Error("Failed to create user");
      userId = newUser.user.id;

      // 3. Criar perfil
      const [firstName, ...lastNameParts] = name.split(" ");
      const lastName = lastNameParts.join(" ");

      await supabaseAdmin.from("profiles").insert({
        id: userId,
        first_name: firstName,
        last_name: lastName || "",
        whatsapp: phone || ""
      });
    }

    // 4. Criar ou atualizar Assinatura
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(plan_duration_days));

    const { error: subError } = await supabaseAdmin.from("subscriptions").insert({
      user_id: userId,
      plan_type: plan_duration_days > 30 ? (plan_duration_days >= 365 ? "annual" : "semiannual") : "monthly",
      status: "active",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });

    if (subError) throw subError;

    // TODO: Enviar email com credenciais usando resend ou supabase email templates
    console.log(`Conta criada/atualizada para ${email}. Senha temporária: ${tempPassword}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User and subscription created successfully",
        temporary_password: tempPassword // Remover em prod, enviar via email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
