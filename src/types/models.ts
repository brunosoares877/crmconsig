

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  phone2?: string | null;
  phone3?: string | null;
  bank: string | null;
  product: string | null;
  amount: string | null;
  status: string;
  employee?: string | null;
  notes?: string | null;
  documents?: string[];
  createdAt: string;
  source?: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  position: string;
  leads?: string[];
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date?: string;
  due_date: string;
  employeeId?: string;
  leadId?: string;
  lead_id?: string;
  user_id: string;
  completed?: boolean;
  is_completed?: boolean;
  status: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Commission {
  id: string;
  employeeId?: string;
  leadId?: string;
  lead_id?: string;
  user_id: string;
  amount: number;
  date?: string;
  created_at?: string;
  updated_at?: string;
  status: string;
  product: string | null;
  paymentPeriod?: string;
  payment_period?: string | null;
  percentage?: number;
  createdAt?: string;
  paidAt?: string;
  lead?: Partial<Lead>;
}

export interface Appointment {
  id: string;
  lead_id: string;
  title: string;
  date: string;
  time: string;
  notes: string | null;
  status: "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CommissionRate {
  id: string;
  product: "portabilidade" | "refinanciamento" | "crefaz" | "novo" | "clt" | "fgts";
  percentage: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string | null;
  name?: string | null;
}

export interface CommissionTier {
  id: string;
  product: "portabilidade" | "refinanciamento" | "crefaz" | "novo" | "clt" | "fgts";
  min_amount: number;
  max_amount: number | null;
  percentage: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string | null;
  name?: string | null;
}

