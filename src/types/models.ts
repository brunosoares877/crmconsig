// Add the missing 'name' property to CommissionRate and CommissionTier interfaces

export interface CommissionRate {
  id: string;
  user_id: string;
  product: string;
  name: string | null; // Ensure this property exists
  percentage: number;
  fixed_value?: number; // Valor fixo da comissão
  commission_type: 'percentage' | 'fixed'; // Tipo de comissão: percentual ou fixa
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommissionTier {
  id: string;
  user_id: string;
  product: string;
  name: string | null; // Ensure this property exists
  min_amount: number;
  max_amount: number;
  min_period?: number; // Período mínimo em parcelas
  max_period?: number; // Período máximo em parcelas
  tier_type?: 'value' | 'period'; // Tipo da faixa: por valor ou por prazo
  percentage: number;
  fixed_value?: number; // Valor fixo da comissão
  commission_type: 'percentage' | 'fixed'; // Tipo de comissão: percentual ou fixa
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Update Lead interface to ensure status is properly typed
export interface Lead {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  phone2?: string;
  phone3?: string;
  cpf?: string;
  status: 'novo' | 'contatado' | 'qualificado' | 'negociando' | 'convertido' | 'perdido';
  source?: string;
  notes?: string;
  amount?: string;
  payment_period?: number; // Número de parcelas (6 a 96)
  date?: string; // Data personalizada do lead
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string;
  product?: string;
  employee?: string;
  created_at?: string; // Add alias for compatibility
  commission_config?: any; // Configuração de comissão selecionada
}

// Add Appointment interface
export interface Appointment {
  id: string;
  lead_id: string;
  user_id: string;
  title: string;
  date: string;
  time: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Update Commission interface to include all required fields
export interface Commission {
  id: string;
  user_id: string;
  lead_id: string;
  amount: number;
  percentage?: number;
  commission_value: number;
  product: string;
  payment_period?: string;
  status: 'in_progress' | 'pending' | 'completed' | 'cancelled' | 'approved' | 'paid';
  payment_date?: string;
  created_at: string;
  updated_at: string;
  employee?: string;
  lead?: Partial<Lead>;
}
