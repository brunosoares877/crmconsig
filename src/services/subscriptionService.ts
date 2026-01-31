import { supabase } from '@/integrations/supabase/client';

export type PlanType = 'monthly' | 'semiannual' | 'annual';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  payment_method?: string;
  payment_reference?: string;
  amount?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Serviço para gerenciar assinaturas de forma segura no backend
 * 
 * IMPORTANTE: Operações de criação/atualização devem ser feitas via service role
 * para contornar as políticas RLS que bloqueiam operações do cliente.
 */
export class SubscriptionService {
  /**
   * Busca a assinatura ativa do usuário atual
   */
  static async getActiveSubscription(userId?: string): Promise<Subscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        console.warn('Usuário não autenticado');
        return null;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Se não encontrar assinatura, não é erro
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erro ao buscar assinatura:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar assinatura ativa:', err);
      return null;
    }
  }

  /**
   * Valida se o usuário tem uma assinatura ativa
   */
  static async validateSubscription(userId?: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    
    if (!subscription) {
      return false;
    }

    // Verificar se a assinatura não expirou
    const endDate = new Date(subscription.end_date);
    const now = new Date();

    return endDate > now && subscription.status === 'active';
  }

  /**
   * Busca todas as assinaturas do usuário (histórico)
   */
  static async getUserSubscriptions(userId?: string): Promise<Subscription[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        return [];
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico de assinaturas:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  }

  /**
   * Verifica assinaturas expiradas e atualiza status
   * Esta função deve ser chamada periodicamente ou via cron job
   */
  static async checkExpiredSubscriptions(): Promise<void> {
    try {
      const { error } = await supabase.rpc('check_expired_subscriptions');
      
      if (error) {
        console.error('Erro ao verificar assinaturas expiradas:', error);
      }
    } catch (err) {
      console.error('Erro ao executar verificação de expiração:', err);
    }
  }

  /**
   * NOTA: Criação de assinaturas deve ser feita via Edge Function ou Admin API
   * 
   * Esta função está aqui como referência, mas não funcionará via client
   * devido às políticas RLS. Use-a apenas em contexto de servidor.
   * 
   * Para ativar assinatura manualmente:
   * 1. Acesse o Supabase Dashboard
   * 2. Vá em Table Editor > subscriptions
   * 3. Insira um novo registro com os dados do usuário
   * 
   * Quando implementar gateway de pagamento:
   * - Crie uma Edge Function que receba o webhook do gateway
   * - A Edge Function usa service role para criar a assinatura
   */
  static getManualActivationInstructions(): string {
    return `
Para ativar uma assinatura manualmente:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: Table Editor > subscriptions
4. Clique em "Insert row"
5. Preencha:
   - user_id: [UUID do usuário]
   - plan_type: monthly | semiannual | annual
   - status: active
   - start_date: [data atual]
   - end_date: [data de expiração]
   - amount: [valor pago]
6. Salve

SQL alternativo:
INSERT INTO subscriptions (user_id, plan_type, status, start_date, end_date, amount)
VALUES (
  '[USER_UUID]',
  'annual',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year',
  997.00
);
    `;
  }
}
