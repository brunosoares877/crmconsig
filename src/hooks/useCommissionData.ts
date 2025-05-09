
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Commission } from "@/types/models";
import { toast } from "sonner";

export const useCommissionData = () => {
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [employees, setEmployees] = useState<string[]>([]);
  const [totalCommissionsPending, setTotalCommissionsPending] = useState(0);
  const [totalCommissionsApproved, setTotalCommissionsApproved] = useState(0);
  const [totalCommissionsPaid, setTotalCommissionsPaid] = useState(0);

  useEffect(() => {
    fetchCommissions();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("employee")
        .not("employee", "is", null)
        .order("employee");

      if (error) throw error;

      if (data) {
        // Get unique employee names and filter out any null or empty values
        const uniqueEmployees = [...new Set(data.map(item => item.employee).filter(Boolean))];
        setEmployees(uniqueEmployees);
      }
    } catch (error: any) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      const { data, error } = await supabase
        .from("commissions")
        .select(`
          *,
          lead:lead_id (
            id, name, product, amount, status, employee
          )
        `)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform the data to add missing properties
        const processedCommissions = data.map(item => {
          // Access amount safely with fallbacks
          const amount = typeof item.amount === 'number' ? item.amount : 0;
          
          // Calculate commission value or use default
          let commissionValue = 0;
          let percentageValue = 0;
          
          if ('commission_value' in item) {
            commissionValue = Number(item.commission_value) || 0;
          } else {
            // Use amount and percentage if available to calculate
            if ('percentage' in item) {
              percentageValue = Number(item.percentage) || 0;
              commissionValue = amount * (percentageValue / 100);
            }
          }
          
          // Transform status to match expected format for lead
          let leadData = item.lead;
          if (leadData && typeof leadData.status === 'string') {
            leadData = {
              ...leadData,
              status: leadData.status as any
            };
          }
          
          // Return properly typed commission object
          return {
            ...item,
            commission_value: commissionValue,
            percentage: percentageValue,
            lead: leadData
          } as Commission;
        });
        
        setCommissions(processedCommissions);
        
        // Calculate totals
        const pendingTotal = processedCommissions
          .filter(c => c.status === "pending")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
          
        const approvedTotal = processedCommissions
          .filter(c => c.status === "approved")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
          
        const paidTotal = processedCommissions
          .filter(c => c.status === "paid")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
        setTotalCommissionsPending(pendingTotal);
        setTotalCommissionsApproved(approvedTotal);
        setTotalCommissionsPaid(paidTotal);
      }
    } catch (error: any) {
      console.error("Error fetching commissions:", error);
      toast.error(`Erro ao carregar comissões: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommissions = commissions.filter((commission) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      commission.lead?.name?.toLowerCase().includes(searchTerm) ||
      commission.product?.toLowerCase().includes(searchTerm) ||
      commission.status?.toLowerCase().includes(searchTerm) ||
      commission.payment_period?.toLowerCase().includes(searchTerm) ||
      commission.employee?.toLowerCase().includes(searchTerm) ||
      commission.lead?.employee?.toLowerCase().includes(searchTerm) ||
      String(commission.amount).toLowerCase().includes(searchTerm) ||
      String(commission.commission_value).toLowerCase().includes(searchTerm);
    
    // Filter by employee if an employee filter is selected
    const matchesEmployee = employeeFilter === "" || employeeFilter === "all" || 
      commission.employee === employeeFilter || 
      commission.lead?.employee === employeeFilter;
    
    return matchesSearch && matchesEmployee;
  });

  const calculateEmployeeTotals = () => {
    if (employeeFilter && employeeFilter !== "all") {
      const filteredByEmployee = commissions.filter(
        commission => commission.employee === employeeFilter || commission.lead?.employee === employeeFilter
      );
      
      const pending = filteredByEmployee
        .filter(c => c.status === "pending")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
      const approved = filteredByEmployee
        .filter(c => c.status === "approved")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
      const paid = filteredByEmployee
        .filter(c => c.status === "paid")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
      
      return { pending, approved, paid };
    }
    
    return { 
      pending: totalCommissionsPending,
      approved: totalCommissionsApproved,
      paid: totalCommissionsPaid
    };
  };

  return {
    loading,
    commissions,
    search,
    setSearch,
    employeeFilter,
    setEmployeeFilter,
    employees,
    filteredCommissions,
    totalCommissionsPending,
    totalCommissionsApproved,
    totalCommissionsPaid,
    calculateEmployeeTotals
  };
};
