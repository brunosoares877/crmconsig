
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
