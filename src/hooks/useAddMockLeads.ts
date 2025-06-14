
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
        // Aposentados
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
          nome: 'Ana Costa',
          telefone: '11990000002',
          mensagem: 'Quero revisar meu benefício de aposentadoria',
          origem: 'Google Ads',
          modalidade: 'Aposentado',
          status: 'Em atendimento'
        },
        {
          user_id: user.id,
          nome: 'Carlos Mendes',
          telefone: '11990000003',
          mensagem: 'Preciso de orientação sobre tempo de contribuição',
          origem: 'Facebook Ads',
          modalidade: 'Aposentado',
          status: 'Fechado'
        },
        
        // Bolsa Família
        {
          user_id: user.id,
          nome: 'Maria Santos',
          telefone: '11990000004',
          mensagem: 'Preciso de ajuda com o Bolsa Família',
          origem: 'Google Ads',
          modalidade: 'Bolsa Família',
          status: 'Em atendimento'
        },
        {
          user_id: user.id,
          nome: 'Fernanda Lima',
          telefone: '11990000005',
          mensagem: 'Meu auxílio foi bloqueado, como resolver?',
          origem: 'Facebook Ads',
          modalidade: 'Bolsa Família',
          status: 'Novo'
        },
        {
          user_id: user.id,
          nome: 'José Roberto',
          telefone: '11990000006',
          mensagem: 'Quero incluir meus filhos no programa',
          origem: 'Google Ads',
          modalidade: 'Bolsa Família',
          status: 'Perdido'
        },
        
        // FGTS
        {
          user_id: user.id,
          nome: 'Carlos Oliveira',
          telefone: '11990000007',
          mensagem: 'Quero sacar meu FGTS',
          origem: 'Facebook Ads',
          modalidade: 'FGTS',
          status: 'Novo'
        },
        {
          user_id: user.id,
          nome: 'Patrícia Rocha',
          telefone: '11990000008',
          mensagem: 'Tenho direito ao saque emergencial?',
          origem: 'Google Ads',
          modalidade: 'FGTS',
          status: 'Em atendimento'
        },
        {
          user_id: user.id,
          nome: 'Ricardo Alves',
          telefone: '11990000009',
          mensagem: 'Como consultar meu saldo do FGTS?',
          origem: 'Facebook Ads',
          modalidade: 'FGTS',
          status: 'Fechado'
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

      toast.success("9 leads mockados criados com sucesso!");
    } catch (error) {
      console.error('Erro ao criar leads mockados:', error);
      toast.error("Erro ao criar leads mockados");
    }
  };

  return { addMockLeads };
};
