
// Add the missing 'name' property to CommissionRate and CommissionTier interfaces

export interface CommissionRate {
  id: string;
  user_id: string;
  product: string;
  name: string | null; // Added missing property
  percentage: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommissionTier {
  id: string;
  user_id: string;
  product: string;
  name: string | null; // Added missing property
  min_amount: number;
  max_amount: number;
  percentage: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Add Lead interface
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
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string;
  product?: string;
  employee?: string;
  created_at?: string; // Add alias for compatibility
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

// Add Commission interface
export interface Commission {
  id: string;
  user_id: string;
  lead_id: string;
  amount: number;
  percentage: number;
  commission_value: number;
  product: string;
  payment_period?: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  payment_date?: string;
  created_at: string;
  updated_at: string;
  lead?: Partial<Lead>; // Add lead relationship with correct type
}
