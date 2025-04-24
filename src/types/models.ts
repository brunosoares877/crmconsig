
export interface Lead {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  bank: string;
  product: string;
  amount: string;
  status: "novo" | "contatado" | "qualificado" | "negociando" | "convertido" | "perdido";
  employee?: string;
  notes?: string;
  documents?: string[];
  createdAt: string;
  source?: string;
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
