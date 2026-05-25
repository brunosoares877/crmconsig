import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { startOfToday, endOfToday, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

const DailyReportButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const todayStart = startOfToday().toISOString();
      const todayEnd = endOfToday().toISOString();
      const monthStart = startOfMonth(new Date()).toISOString();
      const monthEnd = endOfMonth(new Date()).toISOString();

      // 1. Leads de Hoje
      const { data: leadsHoje, error: errorLeads } = await supabase
        .from('leads')
        .select('amount')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      // 2. Comissões/Vendas Concluídas Hoje
      const { data: vendasHoje, error: errorVendas } = await supabase
        .from('commissions')
        .select('amount, commission_value')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      // 3. Pipeline Atual (Mês)
      const { data: pipeline, error: errorPipeline } = await supabase
        .from('leads')
        .select('status, amount')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .in('status', ['negociando', 'pendente', 'cancelado']);

      if (errorLeads || errorVendas || errorPipeline) throw new Error("Erro ao buscar dados");

      const qtdLeadsHoje = leadsHoje?.length || 0;
      const valorLeadsHoje = leadsHoje?.reduce((acc, curr) => {
        const val = curr.amount ? parseFloat(curr.amount.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
        return acc + (isNaN(val) ? 0 : val);
      }, 0) || 0;

      const qtdVendasHoje = vendasHoje?.length || 0;
      const valorVendasHoje = vendasHoje?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
      const comissaoHoje = vendasHoje?.reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0) || 0;

      let emAndamento = 0, valorEmAndamento = 0;
      let pendente = 0, valorPendente = 0;
      let cancelado = 0, valorCancelado = 0;

      pipeline?.forEach((lead: any) => {
        const val = lead.amount ? parseFloat(lead.amount.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
        const numVal = isNaN(val) ? 0 : val;
        
        if (lead.status === 'negociando') {
          emAndamento++;
          valorEmAndamento += numVal;
        } else if (lead.status === 'pendente') {
          pendente++;
          valorPendente += numVal;
        } else if (lead.status === 'cancelado') {
          cancelado++;
          valorCancelado += numVal;
        }
      });

      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const texto = `*FECHAMENTO DO DIA - ${dataAtual}* 📊\n\n*NOVIDADES DE HOJE*\n👤 Novos Leads: ${qtdLeadsHoje} (R$ ${valorLeadsHoje.toLocaleString('pt-BR', {minimumFractionDigits: 2})})\n✅ Concluídos (Pagos) Hoje: ${qtdVendasHoje} (R$ ${valorVendasHoje.toLocaleString('pt-BR', {minimumFractionDigits: 2})})\n💰 Comissão Gerada Hoje: R$ ${comissaoHoje.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n\n*PIPELINE ATUAL (DO MÊS)*\n⏳ Pendentes: ${pendente} (R$ ${valorPendente.toLocaleString('pt-BR', {minimumFractionDigits: 2})})\n💬 Em Andamento: ${emAndamento} (R$ ${valorEmAndamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})})\n❌ Perdidos/Cancelados: ${cancelado} (R$ ${valorCancelado.toLocaleString('pt-BR', {minimumFractionDigits: 2})})\n\n_Relatório gerado pelo CRM Consig_`;

      const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
      
      toast.success("Relatório gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateReport} 
      disabled={isGenerating}
      className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm transition-all"
      title="Enviar fechamento do dia pro WhatsApp"
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden sm:inline">{isGenerating ? "Gerando..." : "Fechamento do Dia"}</span>
      <span className="sm:hidden">{isGenerating ? "..." : "Fechamento"}</span>
    </Button>
  );
};

export default DailyReportButton;
