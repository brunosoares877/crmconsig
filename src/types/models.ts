
// Add the missing 'name' property to CommissionRate and CommissionTier interfaces

export interface CommissionRate {
  id: string;
  user_id: string;
  product: string;
  name: string | null; // Ensure this property exists
  percentage: number;
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
  percentage: number;
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

// Update Commission interface to explicitly include commission_value
export interface Commission {
  id: string;
  user_id: string;
  lead_id: string;
  amount: number;
  percentage?: number;
  commission_value: number;  // Explicitly define commission_value as required
  product: string;
  payment_period?: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  payment_date?: string;
  created_at: string;
  updated_at: string;
  employee?: string; // Add employee field
  lead?: Partial<Lead>; // Lead relationship with correct type
}
