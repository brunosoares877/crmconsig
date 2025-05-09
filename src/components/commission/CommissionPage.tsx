
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useCommissionData } from "@/hooks/useCommissionData";
import CommissionTable from "@/components/commission/CommissionTable";
import CommissionFilter from "@/components/commission/CommissionFilter";
import { useAuth } from "@/contexts/AuthContext";

const CommissionPage = () => {
  const { 
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
  } = useCommissionData();
  
  const { isPrivilegedUser } = useAuth();
  const employeeTotals = calculateEmployeeTotals();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Comissões</h1>
      
      {isPrivilegedUser && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-md">
          <p className="text-green-800 font-semibold">Você tem acesso completo e vitalício a todas as funcionalidades do sistema.</p>
        </div>
      )}

      <CommissionFilter
        search={search}
        onSearchChange={setSearch}
        employeeFilter={employeeFilter}
        onEmployeeFilterChange={setEmployeeFilter}
        employees={employees}
      />

      <CommissionTable
        loading={loading}
        commissions={commissions}
        filteredCommissions={filteredCommissions}
        employeeTotals={employeeTotals}
      />
    </div>
  );
};

export default CommissionPage;
