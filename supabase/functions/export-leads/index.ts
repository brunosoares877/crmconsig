import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "Content-Disposition",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get parameters from URL query string (useful for window.open or direct links)
    const urlParams = new URL(req.url).searchParams;
    const token = urlParams.get("token");
    
    if (!token) {
      return new Response("Unauthorized: Missing token", { status: 401, headers: corsHeaders });
    }

    // Verify user identity
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response("Unauthorized: Invalid token", { status: 401, headers: corsHeaders });
    }

    // Parse filters
    const statusFilter = urlParams.get("status");
    const employeeFilter = urlParams.get("employee");
    const productFilter = urlParams.get("product");
    const bankFilter = urlParams.get("bank");
    const dateFrom = urlParams.get("dateFrom");
    const dateTo = urlParams.get("dateTo");
    const searchQuery = urlParams.get("search");
    const selectedIdsStr = urlParams.get("selectedIds");

    // Build query
    let query = supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id);

    if (selectedIdsStr) {
      const selectedIds = selectedIdsStr.split(",");
      query = query.in("id", selectedIds);
    } else {
      if (statusFilter) query = query.eq("status", statusFilter);
      if (employeeFilter) query = query.eq("employee", employeeFilter);
      if (productFilter) query = query.eq("product", productFilter);
      if (bankFilter) query = query.eq("bank", bankFilter);
      if (dateFrom) query = query.gte("date", dateFrom);
      if (dateTo) query = query.lte("date", dateTo);
    }

    const { data: leads, error: queryError } = await query.order("created_at", { ascending: false });

    if (queryError) {
      return new Response(`Database error: ${queryError.message}`, { status: 500, headers: corsHeaders });
    }

    // Apply search filter locally if needed
    let filteredLeads = leads || [];
    if (!selectedIdsStr && searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredLeads = filteredLeads.filter(
        (lead) =>
          (lead.name && lead.name.toLowerCase().includes(lowerQuery)) ||
          (lead.cpf && lead.cpf.includes(lowerQuery)) ||
          (lead.phone && lead.phone.includes(lowerQuery))
      );
    }

    // Generate CSV
    const headers = [
      "Nome",
      "CPF",
      "Telefone",
      "E-mail",
      "Status",
      "Produto",
      "Banco",
      "Valor",
      "Funcionário",
      "Observação",
      "Data de Cadastro"
    ];

    const csvRows = [
      "\uFEFF" + headers.join(";"),
      ...filteredLeads.map((lead) => {
        return [
          lead.name || "",
          lead.cpf || "",
          lead.phone || "",
          lead.email || "",
          lead.status || "novo",
          lead.product || "",
          lead.bank || "",
          lead.amount || "",
          lead.employee || "",
          (lead.obs || "").replace(/[\n\r;]/g, " "),
          lead.created_at ? new Date(lead.created_at).toLocaleDateString("pt-BR") : ""
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(";");
      })
    ];

    const csvString = csvRows.join("\n");
    const fileName = selectedIdsStr ? "leads_selecionados.csv" : "backup_leads.csv";

    return new Response(csvString, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    return new Response(`Error: ${String(err)}`, { status: 500, headers: corsHeaders });
  }
});
