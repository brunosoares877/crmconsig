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
  description: string;
  date: string;
  employeeId: string;
  leadId?: string;
  completed: boolean;
}

export interface Commission {
  id: string;
  employeeId: string;
  leadId: string;
  amount: number;
  date: string;
  status: "pending" | "paid";
}
