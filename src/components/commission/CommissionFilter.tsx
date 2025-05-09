
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommissionFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (value: string) => void;
  employees: string[];
}

const CommissionFilter = ({
  search,
  onSearchChange,
  employeeFilter,
  onEmployeeFilterChange,
  employees
}: CommissionFilterProps) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="mb-4 grid gap-4 md:grid-cols-2">
      <div>
        <Input
          type="text"
          placeholder="Pesquisar comissões..."
          value={search}
          onChange={handleSearch}
        />
      </div>
      <div>
        <Select value={employeeFilter} onValueChange={onEmployeeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os funcionários</SelectItem>
            {employees.map(employee => (
              <SelectItem key={employee} value={employee || ""}>
                {employee}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CommissionFilter;
