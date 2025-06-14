
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAddMockLeads = () => {
  const addMockLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Verificar se já existem leads
      const { data: existingLeads } = await supabase
        .from('leads_premium')
        .select('id')
        .limit(1);

      if (existingLeads && existingLeads.length > 0) {
        toast.info("Leads mockados já existem");
        return;
      }

      const mockLeads = [
        {
          user_id: user.id,
          nome: 'João Silva',
          telefone: '11990000001',
          mensagem: 'Tenho interesse em saber mais sobre aposentadoria',
          origem: 'Facebook Ads',
          modalidade: 'Aposentado',
          status: 'Novo'
        },
        {
          user_id: user.id,
          nome: 'Maria Santos',
          telefone: '11990000002',
          mensagem: 'Preciso de ajuda com o Bolsa Família',
          origem: 'Google Ads',
          modalidade: 'Bolsa Família',
          status: 'Em atendimento'
        },
        {
          user_id: user.id,
          nome: 'Carlos Oliveira',
          telefone: '11990000003',
          mensagem: 'Quero sacar meu FGTS',
          origem: 'Facebook Ads',
          modalidade: 'FGTS',
          status: 'Novo'
        }
      ];

      const { error } = await supabase
        .from('leads_premium')
        .insert(mockLeads);

      if (error) {
        console.error('Erro ao inserir leads mockados:', error);
        toast.error("Erro ao criar leads mockados");
        return;
      }

      toast.success("Leads mockados criados com sucesso!");
    } catch (error) {
      console.error('Erro ao criar leads mockados:', error);
      toast.error("Erro ao criar leads mockados");
    }
  };

  return { addMockLeads };
};
