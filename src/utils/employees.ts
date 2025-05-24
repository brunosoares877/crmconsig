
import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id: string;
  name: string;
  email?: string;
  active: boolean;
  created_at: string;
}

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    // Primeiro, buscar funcionários únicos da tabela leads
    const { data: leadsData, error: leadsError } = await supabase
      .from("leads")
      .select("employee")
      .not("employee", "is", null)
      .order("employee");

    if (leadsError) throw leadsError;

    // Criar lista única de funcionários
    const uniqueEmployees = [...new Set(leadsData?.map(item => item.employee).filter(Boolean))];
    
    // Retornar como objetos Employee
    return uniqueEmployees.map((name, index) => ({
      id: `emp_${index}`,
      name: name,
      active: true,
      created_at: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const createEmployee = async (name: string, email?: string): Promise<boolean> => {
  try {
    // Por enquanto, só validamos se o nome não existe
    const employees = await getEmployees();
    const exists = employees.some(emp => emp.name.toLowerCase() === name.toLowerCase());
    
    if (exists) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error creating employee:", error);
    return false;
  }
};
